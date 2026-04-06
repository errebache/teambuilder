import { Platform } from 'react-native'

// Padding top du header — 0 sur web (pas de status bar), 52 sur mobile
export const HEADER_TOP = Platform.OS === 'web' ? 16 : 52
