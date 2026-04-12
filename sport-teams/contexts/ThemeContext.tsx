import { createContext, useContext, useState, useEffect } from 'react'
import { Platform, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LIGHT_COLORS, DARK_COLORS } from '../lib/theme-colors'

export type { ThemeColors } from '../lib/theme-colors'
export { LIGHT_COLORS, DARK_COLORS } from '../lib/theme-colors'

export type ThemeMode = 'light' | 'dark' | 'system'

type Colors = typeof LIGHT_COLORS

interface ThemeContextType {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  colors: Colors
  setMode: (mode: ThemeMode) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  resolved: 'light',
  colors: LIGHT_COLORS,
  setMode: async () => {},
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
