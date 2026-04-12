import { createContext, useContext, useState, useEffect } from 'react'
import { Platform, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemeMode = 'light' | 'dark' | 'system'

export const LIGHT_COLORS = {
  background: '#F5F5F7',
  card: '#ffffff',
  header: '#1e3a5f',
  headerText: '#fff',
  text: '#0f172a',
  textSecondary: '#555',
  textMuted: '#94a3b8',
  textPlaceholder: '#cbd5e1',
  border: 'rgba(0,0,0,0.06)',
  borderStrong: 'rgba(0,0,0,0.12)',
  inputBg: '#fff',
  tag: '#f1f5f9',
  tagText: '#0f172a',
  danger: '#ef4444',
  sectionLabel: '#94a3b8',
  switchTrackFalse: '#cbd5e1',
}

export const DARK_COLORS = {
  background: '#0a0a0f',
  card: '#13131a',
  header: '#0d1117',
  headerText: '#fff',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  textPlaceholder: '#334155',
  border: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.13)',
  inputBg: '#1e1e2a',
  tag: '#1e1e2a',
  tagText: '#f1f5f9',
  danger: '#f87171',
  sectionLabel: '#475569',
  switchTrackFalse: '#334155',
}

type Colors = typeof LIGHT_COLORS

interface ThemeContextType {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  colors: Colors
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  resolved: 'light',
  colors: LIGHT_COLORS,
  setMode: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')

  useEffect(() => {
    async function load() {
      const saved = Platform.OS === 'web'
        ? localStorage.getItem('app_theme')
        : await AsyncStorage.getItem('app_theme')
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved)
      }
    }
    load()
  }, [])

  async function setMode(newMode: ThemeMode) {
    setModeState(newMode)
    if (Platform.OS === 'web') {
      localStorage.setItem('app_theme', newMode)
    } else {
      await AsyncStorage.setItem('app_theme', newMode)
    }
  }

  const resolved: 'light' | 'dark' =
    mode === 'system' ? (systemScheme ?? 'light') : mode

  const colors = resolved === 'dark' ? DARK_COLORS : LIGHT_COLORS

  return (
    <ThemeContext.Provider value={{ mode, resolved, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
