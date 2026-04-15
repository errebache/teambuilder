/**
 * Tests for lib/validation.ts
 *
 * Covers: string sanitization, number clamping, equipes parsing,
 * tirage validation, and pre-write sanitization.
 */

import {
  sanitizeString,
  validateNumber,
  safeParseEquipes,
  safeParseEquilibre,
  sanitizeEquipes,
  isValidTirage,
  validatePlayerName,
  validateGroupName,
  LIMITS,
} from '../../lib/validation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeJoueur = (overrides = {}) => ({
  id: 'j1',
  groupe_id: 'g1',
  prenom: 'Alice',
  nom: 'Dupont',
  note_moyenne: 4,
  couleur_avatar: '#E6F1FB',
  created_at: new Date().toISOString(),
  ...overrides,
})

const makeEquipe = (overrides = {}) => ({
  nom: 'Équipe A',
  totalPoints: 12,
  joueurs: [makeJoueur()],
  ...overrides,
})

const makeTirage = (overrides = {}) => ({
  id: 'tirage-1',
  groupe_id: 'g1',
  equipes: [makeEquipe(), makeEquipe({ nom: 'Équipe B' })],
  equilibre_pct: 85,
  date_match: '2026-01-01',
  created_at: new Date().toISOString(),
  ...overrides,
})

// ─── sanitizeString ───────────────────────────────────────────────────────────

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  Alice  ')).toBe('Alice')
  })

  it('removes ASCII control characters', () => {
    expect(sanitizeString('Ali\x00ce')).toBe('Alice')
    expect(sanitizeString('Na\x1Fme')).toBe('Name')
    expect(sanitizeString('Test\x7FValue')).toBe('TestValue')
  })

  it('enforces max length', () => {
    const long = 'A'.repeat(200)
    expect(sanitizeString(long)).toHaveLength(LIMITS.playerName)
    expect(sanitizeString(long, 10)).toHaveLength(10)
  })

  it('returns empty string for non-string inputs', () => {
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
    expect(sanitizeString(42)).toBe('')
    expect(sanitizeString({})).toBe('')
  })

  it('preserves normal unicode (accents, emojis)', () => {
    expect(sanitizeString('Élodie')).toBe('Élodie')
    expect(sanitizeString('⚽ Football')).toBe('⚽ Football')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeString('   ')).toBe('')
  })
})

// ─── validateNumber ───────────────────────────────────────────────────────────

describe('validateNumber', () => {
  it('clamps to min when below range', () => {
    expect(validateNumber(-10, 0, 100)).toBe(0)
  })

  it('clamps to max when above range', () => {
    expect(validateNumber(150, 0, 100)).toBe(100)
  })

  it('returns value when within range', () => {
    expect(validateNumber(75, 0, 100)).toBe(75)
  })

  it('returns min for NaN', () => {
    expect(validateNumber(NaN, 0, 100)).toBe(0)
    expect(validateNumber('abc', 0, 100)).toBe(0)
  })

  it('returns min for Infinity', () => {
    expect(validateNumber(Infinity, 0, 100)).toBe(0)
    expect(validateNumber(-Infinity, 0, 100)).toBe(0)
  })

  it('returns min for null/undefined', () => {
    expect(validateNumber(null, 5, 100)).toBe(5)
    expect(validateNumber(undefined, 5, 100)).toBe(5)
  })

  it('parses numeric strings', () => {
    expect(validateNumber('42', 0, 100)).toBe(42)
    expect(validateNumber('99.5', 0, 100)).toBe(99.5)
  })
})

// ─── safeParseEquipes ─────────────────────────────────────────────────────────

describe('safeParseEquipes', () => {
  it('parses valid equipes JSON', () => {
    const equipes = [makeEquipe(), makeEquipe({ nom: 'B' })]
    const json = JSON.stringify(equipes)
    const result = safeParseEquipes(json)
    expect(result).toHaveLength(2)
    expect(result[0].nom).toBe('Équipe A')
  })

  it('returns [] for invalid JSON', () => {
    expect(safeParseEquipes('not-json')).toEqual([])
    expect(safeParseEquipes('{broken')).toEqual([])
  })

  it('returns [] for non-string input', () => {
    expect(safeParseEquipes(null)).toEqual([])
    expect(safeParseEquipes(undefined)).toEqual([])
    expect(safeParseEquipes(42)).toEqual([])
  })

  it('returns [] for empty string', () => {
    expect(safeParseEquipes('')).toEqual([])
  })

  it('returns [] for non-array JSON', () => {
    expect(safeParseEquipes(JSON.stringify({ equipes: [] }))).toEqual([])
    expect(safeParseEquipes(JSON.stringify('hello'))).toEqual([])
  })

  it('returns [] if fewer than 2 valid teams', () => {
    const oneTeam = [makeEquipe()]
    expect(safeParseEquipes(JSON.stringify(oneTeam))).toEqual([])
  })

  it('filters out malformed equipe entries', () => {
    const mixed = [
      makeEquipe(),
      makeEquipe({ nom: 'B' }),
      { nom: 'bad', totalPoints: NaN, joueurs: [] }, // invalid
      { joueurs: null },                               // invalid
    ]
    const result = safeParseEquipes(JSON.stringify(mixed))
    expect(result).toHaveLength(2) // only the 2 valid ones
  })

  it('returns [] for payload exceeding size limit', () => {
    const huge = 'X'.repeat(500_001)
    expect(safeParseEquipes(huge)).toEqual([])
  })

  it('rejects equipes with empty joueurs array', () => {
    const equipes = [
      makeEquipe({ joueurs: [] }),
      makeEquipe({ nom: 'B', joueurs: [] }),
    ]
    expect(safeParseEquipes(JSON.stringify(equipes))).toEqual([])
  })

  it('rejects joueurs with invalid note_moyenne', () => {
    const badJoueur = makeJoueur({ note_moyenne: NaN })
    const equipes = [
      makeEquipe({ joueurs: [badJoueur] }),
      makeEquipe({ nom: 'B' }),
    ]
    // The first equipe is invalid → only 1 valid → returns []
    expect(safeParseEquipes(JSON.stringify(equipes))).toEqual([])
  })
})

// ─── safeParseEquilibre ───────────────────────────────────────────────────────

describe('safeParseEquilibre', () => {
  it('returns 0–100 integer for valid values', () => {
    expect(safeParseEquilibre('85')).toBe(85)
    expect(safeParseEquilibre(92.7)).toBe(93) // rounded
    expect(safeParseEquilibre(0)).toBe(0)
    expect(safeParseEquilibre(100)).toBe(100)
  })

  it('clamps values outside range', () => {
    expect(safeParseEquilibre(-10)).toBe(0)
    expect(safeParseEquilibre(150)).toBe(100)
  })

  it('returns 0 for invalid input', () => {
    expect(safeParseEquilibre('abc')).toBe(0)
    expect(safeParseEquilibre(null)).toBe(0)
    expect(safeParseEquilibre(undefined)).toBe(0)
  })
})

// ─── sanitizeEquipes ──────────────────────────────────────────────────────────

describe('sanitizeEquipes', () => {
  it('sanitizes player names', () => {
    const dirty = [makeEquipe({
      joueurs: [makeJoueur({ prenom: '  Ali\x00ce  ' })],
    }), makeEquipe({ nom: 'B' })]
    const result = sanitizeEquipes(dirty)
    expect(result[0].joueurs[0].prenom).toBe('Alice')
  })

  it('clamps note_moyenne to 0–5', () => {
    const dirty = [makeEquipe({
      joueurs: [makeJoueur({ note_moyenne: 9 })],
    }), makeEquipe({ nom: 'B' })]
    const result = sanitizeEquipes(dirty)
    expect(result[0].joueurs[0].note_moyenne).toBe(5)
  })

  it('clamps totalPoints to >= 0', () => {
    const dirty = [makeEquipe({ totalPoints: -5 }), makeEquipe({ nom: 'B' })]
    const result = sanitizeEquipes(dirty)
    expect(result[0].totalPoints).toBe(0)
  })

  it('sanitizes team names', () => {
    const dirty = [
      makeEquipe({ nom: '  Team\x1FA  ' }),
      makeEquipe({ nom: 'B' }),
    ]
    const result = sanitizeEquipes(dirty)
    expect(result[0].nom).toBe('TeamA')
  })
})

// ─── isValidTirage ────────────────────────────────────────────────────────────

describe('isValidTirage', () => {
  it('returns true for a well-formed tirage', () => {
    expect(isValidTirage(makeTirage())).toBe(true)
  })

  it('returns false for null/undefined', () => {
    expect(isValidTirage(null)).toBe(false)
    expect(isValidTirage(undefined)).toBe(false)
  })

  it('returns false for missing id', () => {
    expect(isValidTirage(makeTirage({ id: '' }))).toBe(false)
    expect(isValidTirage(makeTirage({ id: undefined }))).toBe(false)
  })

  it('returns false for fewer than 2 equipes', () => {
    expect(isValidTirage(makeTirage({ equipes: [makeEquipe()] }))).toBe(false)
    expect(isValidTirage(makeTirage({ equipes: [] }))).toBe(false)
  })

  it('returns false for invalid equilibre_pct', () => {
    expect(isValidTirage(makeTirage({ equilibre_pct: NaN }))).toBe(false)
    expect(isValidTirage(makeTirage({ equilibre_pct: -1 }))).toBe(false)
    expect(isValidTirage(makeTirage({ equilibre_pct: 101 }))).toBe(false)
  })

  it('returns false if equipes contain invalid entries', () => {
    const badEquipes = [
      { nom: 'A', totalPoints: 10, joueurs: [] }, // empty joueurs
      makeEquipe(),
    ]
    expect(isValidTirage(makeTirage({ equipes: badEquipes }))).toBe(false)
  })
})

// ─── validatePlayerName ───────────────────────────────────────────────────────

describe('validatePlayerName', () => {
  it('returns null for valid names', () => {
    expect(validatePlayerName('Alice')).toBeNull()
    expect(validatePlayerName('Élodie Dupont')).toBeNull()
    expect(validatePlayerName('AB')).toBeNull()
  })

  it('returns error key for empty name', () => {
    expect(validatePlayerName('')).toBe('playerNameRequired')
    expect(validatePlayerName('   ')).toBe('playerNameRequired')
  })

  it('returns error key for too-short name', () => {
    expect(validatePlayerName('A')).toBe('playerNameTooShort')
  })
})

// ─── validateGroupName ────────────────────────────────────────────────────────

describe('validateGroupName', () => {
  it('returns null for valid names', () => {
    expect(validateGroupName('Foot du mardi')).toBeNull()
  })

  it('returns error for empty name', () => {
    expect(validateGroupName('')).toBe('groupNameRequired')
    expect(validateGroupName('   ')).toBe('groupNameRequired')
  })

  it('returns error for too-short name', () => {
    expect(validateGroupName('A')).toBe('groupNameMinError')
  })
})
