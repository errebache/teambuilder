/**
 * Pure color constants — no JSX, no React Native imports.
 * Importable in both the ThemeContext (React Native) and unit tests (Node).
 */

export const LIGHT_COLORS = {
  background:       '#F5F5F7',
  card:             '#ffffff',
  header:           '#1e3a5f',
  headerText:       '#fff',
  text:             '#0f172a',
  textSecondary:    '#555',
  textMuted:        '#94a3b8',
  textPlaceholder:  '#cbd5e1',
  border:           'rgba(0,0,0,0.06)',
  borderStrong:     'rgba(0,0,0,0.12)',
  inputBg:          '#fff',
  tag:              '#f1f5f9',
  tagText:          '#0f172a',
  danger:           '#ef4444',
  sectionLabel:     '#94a3b8',
  switchTrackFalse: '#cbd5e1',
}

export const DARK_COLORS = {
  background:       '#0a0a0f',
  card:             '#13131a',
  header:           '#0d1117',
  headerText:       '#fff',
  text:             '#f1f5f9',
  textSecondary:    '#94a3b8',
  textMuted:        '#475569',
  textPlaceholder:  '#334155',
  border:           'rgba(255,255,255,0.07)',
  borderStrong:     'rgba(255,255,255,0.13)',
  inputBg:          '#1e1e2a',
  tag:              '#1e1e2a',
  tagText:          '#f1f5f9',
  danger:           '#f87171',
  sectionLabel:     '#475569',
  switchTrackFalse: '#334155',
}

export type ThemeColors = typeof LIGHT_COLORS
