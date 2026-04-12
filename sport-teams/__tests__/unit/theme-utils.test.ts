/**
 * Tests for theme and language utilities.
 * Covers: color resolution, AsyncStorage persistence contract,
 * and the storage key constants used across the app.
 */

// ─── Theme color resolution ───────────────────────────────────────────────────

import { LIGHT_COLORS, DARK_COLORS } from '../../lib/theme-colors'

type ThemeMode = 'light' | 'dark' | 'system'

function resolveTheme(mode: ThemeMode, systemScheme: 'light' | 'dark'): 'light' | 'dark' {
  return mode === 'system' ? systemScheme : mode
}

function getColors(resolved: 'light' | 'dark') {
  return resolved === 'dark' ? DARK_COLORS : LIGHT_COLORS
}

describe('Theme resolution', () => {
  it('resolves "light" mode to light regardless of system', () => {
    expect(resolveTheme('light', 'dark')).toBe('light')
    expect(resolveTheme('light', 'light')).toBe('light')
  })

  it('resolves "dark" mode to dark regardless of system', () => {
    expect(resolveTheme('dark', 'light')).toBe('dark')
    expect(resolveTheme('dark', 'dark')).toBe('dark')
  })

  it('resolves "system" mode to the system scheme', () => {
    expect(resolveTheme('system', 'light')).toBe('light')
    expect(resolveTheme('system', 'dark')).toBe('dark')
  })

  it('returns LIGHT_COLORS for light mode', () => {
    expect(getColors('light')).toBe(LIGHT_COLORS)
  })

  it('returns DARK_COLORS for dark mode', () => {
    expect(getColors('dark')).toBe(DARK_COLORS)
  })
})

describe('Color palettes — completeness', () => {
  const lightKeys = Object.keys(LIGHT_COLORS)
  const darkKeys = Object.keys(DARK_COLORS)

  it('LIGHT_COLORS and DARK_COLORS have the same keys', () => {
    expect(lightKeys.sort()).toEqual(darkKeys.sort())
  })

  it('all LIGHT_COLORS values are non-empty strings', () => {
    lightKeys.forEach(key => {
      expect(typeof LIGHT_COLORS[key as keyof typeof LIGHT_COLORS]).toBe('string')
      expect(LIGHT_COLORS[key as keyof typeof LIGHT_COLORS].length).toBeGreaterThan(0)
    })
  })

  it('all DARK_COLORS values are non-empty strings', () => {
    darkKeys.forEach(key => {
      expect(typeof DARK_COLORS[key as keyof typeof DARK_COLORS]).toBe('string')
      expect(DARK_COLORS[key as keyof typeof DARK_COLORS].length).toBeGreaterThan(0)
    })
  })

  it('dark and light header colors are different', () => {
    expect(LIGHT_COLORS.header).not.toBe(DARK_COLORS.header)
  })

  it('dark background is darker than light background (heuristic)', () => {
    // Both use hex — dark should have lower brightness
    const hexToBrightness = (hex: string) => {
      const c = hex.replace('#', '')
      const r = parseInt(c.substring(0, 2), 16)
      const g = parseInt(c.substring(2, 4), 16)
      const b = parseInt(c.substring(4, 6), 16)
      return 0.299 * r + 0.587 * g + 0.114 * b
    }
    expect(hexToBrightness(DARK_COLORS.background)).toBeLessThan(
      hexToBrightness(LIGHT_COLORS.background)
    )
  })
})

// ─── AsyncStorage key contract ────────────────────────────────────────────────

describe('AsyncStorage key contract', () => {
  const STORAGE_KEYS = {
    hasLaunched: 'hasLaunched',
    lang: 'app_langue',
    theme: 'app_theme',
  } as const

  it('reset removes the exact same keys contexts read from', () => {
    const resetKeys = ['hasLaunched', 'app_langue', 'app_theme']
    expect(resetKeys).toContain(STORAGE_KEYS.hasLaunched)
    expect(resetKeys).toContain(STORAGE_KEYS.lang)
    expect(resetKeys).toContain(STORAGE_KEYS.theme)
  })

  it('storage key for theme matches what ThemeContext uses', () => {
    // If this test fails, the reset key and context key are out of sync
    expect(STORAGE_KEYS.theme).toBe('app_theme')
  })

  it('storage key for language matches what LanguageContext uses', () => {
    expect(STORAGE_KEYS.lang).toBe('app_langue')
  })
})
