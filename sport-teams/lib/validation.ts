/**
 * Input validation and sanitization utilities.
 *
 * Rules:
 * - All user-facing strings are trimmed, control-char stripped, and length-capped.
 * - All numbers are clamped to valid ranges.
 * - URL-param data (equipes JSON) is parsed and structurally validated before use.
 * - Nothing from external sources is trusted — always validate before Supabase writes.
 */

import { Equipe, Joueur, Tirage } from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

export const LIMITS = {
  playerName:  50,
  teamName:    30,
  position:    30,
  jsonPayload: 500_000, // bytes — hard cap to avoid DoS from huge URL params
} as const

// ─── String sanitization ──────────────────────────────────────────────────────

/**
 * Sanitize any string: trim whitespace, strip ASCII control characters,
 * and enforce a maximum length.
 */
export function sanitizeString(input: unknown, maxLength = LIMITS.playerName): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    // Remove C0/C1 control characters (null, tab, newline, carriage return, etc.)
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .substring(0, maxLength)
}

/**
 * Validate and clamp a number to [min, max].
 * Returns `min` for NaN/Infinity/non-numeric input.
 */
export function validateNumber(value: unknown, min = 0, max = Infinity): number {
  const n = Number(value)
  if (!isFinite(n)) return min
  return Math.min(Math.max(n, min), max)
}

// ─── Type guards ──────────────────────────────────────────────────────────────

function isValidJoueur(obj: unknown): obj is Joueur {
  if (!obj || typeof obj !== 'object') return false
  const j = obj as Record<string, unknown>
  return (
    typeof j.id === 'string' && j.id.length > 0 &&
    typeof j.prenom === 'string' &&
    typeof j.note_moyenne === 'number' && isFinite(j.note_moyenne) &&
    j.note_moyenne >= 0 && j.note_moyenne <= 5 &&
    typeof j.couleur_avatar === 'string'
  )
}

function isValidEquipe(obj: unknown): obj is Equipe {
  if (!obj || typeof obj !== 'object') return false
  const e = obj as Record<string, unknown>
  return (
    typeof e.nom === 'string' && e.nom.trim().length > 0 &&
    typeof e.totalPoints === 'number' && isFinite(e.totalPoints) && e.totalPoints >= 0 &&
    Array.isArray(e.joueurs) && e.joueurs.length > 0 &&
    e.joueurs.every(isValidJoueur)
  )
}

/**
 * Returns true if a history entry from Supabase has the expected shape.
 * Malformed rows are filtered out instead of crashing the UI.
 */
export function isValidTirage(obj: unknown): obj is Tirage {
  if (!obj || typeof obj !== 'object') return false
  const t = obj as Record<string, unknown>
  return (
    typeof t.id === 'string' && t.id.length > 0 &&
    Array.isArray(t.equipes) && t.equipes.length >= 2 &&
    t.equipes.every(isValidEquipe) &&
    typeof t.equilibre_pct === 'number' &&
    isFinite(t.equilibre_pct) &&
    t.equilibre_pct >= 0 && t.equilibre_pct <= 100
  )
}

// ─── URL param parsers ────────────────────────────────────────────────────────

/**
 * Safely parse the `equipes` JSON URL parameter.
 * Returns [] on any parse error or structural mismatch —
 * never throws, never trusts the input.
 */
export function safeParseEquipes(json: unknown): Equipe[] {
  try {
    if (typeof json !== 'string' || json.length === 0) return []
    if (json.length > LIMITS.jsonPayload) {
      console.warn('[validation] equipes param too large, ignoring')
      return []
    }
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    const valid = parsed.filter(isValidEquipe)
    // Require at least 2 non-empty teams
    if (valid.length < 2) return []
    return valid
  } catch {
    return []
  }
}

/**
 * Safely parse the `equilibrePct` URL parameter to a 0–100 integer.
 */
export function safeParseEquilibre(value: unknown): number {
  return Math.round(validateNumber(value, 0, 100))
}

// ─── Pre-write sanitization ───────────────────────────────────────────────────

/**
 * Sanitize equipes before writing to Supabase.
 * Cleans every string field and clamps every number.
 * Call this right before any INSERT/UPDATE.
 */
export function sanitizeEquipes(equipes: Equipe[]): Equipe[] {
  return equipes.map(eq => ({
    ...eq,
    nom: sanitizeString(eq.nom, LIMITS.teamName),
    totalPoints: validateNumber(eq.totalPoints, 0),
    joueurs: eq.joueurs.map(j => ({
      ...j,
      prenom:       sanitizeString(j.prenom, LIMITS.playerName),
      nom:          sanitizeString(j.nom, LIMITS.playerName),
      poste:        j.poste ? sanitizeString(j.poste, LIMITS.position) : undefined,
      note_moyenne: validateNumber(j.note_moyenne, 0, 5),
    })),
  }))
}

// ─── Form field validators ────────────────────────────────────────────────────

/**
 * Validates a player name. Returns an error string or null if valid.
 */
export function validatePlayerName(name: string): string | null {
  const s = sanitizeString(name)
  if (s.length === 0) return 'playerNameRequired'
  if (s.length < 2) return 'playerNameTooShort'
  return null
}

/**
 * Validates a group name. Returns an error string or null if valid.
 */
export function validateGroupName(name: string): string | null {
  const s = sanitizeString(name, LIMITS.teamName)
  if (s.length === 0) return 'groupNameRequired'
  if (s.length < 2) return 'groupNameMinError'
  return null
}
