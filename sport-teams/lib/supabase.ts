import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Utilitaires
export function getPlayerInitials(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
}

export function getRandomAvatarColor(): string {
  const colors = [
    '#E6F1FB', '#EAF3DE', '#FAEEDA',
    '#EEEDFE', '#FAECE7', '#E1F5EE',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}