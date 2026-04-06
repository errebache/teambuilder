import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { alignSelf, arrow, textAlign, row, me } from '../../lib/rtl'
import { ThemeMode } from '../../contexts/ThemeContext'

const THEMES = [
  { code: 'system' as ThemeMode, labelKey: 'Automatique', descKey: 'Suit les réglages du système', icon: '⚙️' },
  { code: 'light' as ThemeMode, labelKey: 'Clair', descKey: 'Interface lumineuse', icon: '☀️' },
  { code: 'dark' as ThemeMode, labelKey: 'Sombre', descKey: 'Interface sombre', icon: '🌙' },
]

export default function Apparence() {
  const router = useRouter()
  const { mode, setMode, colors, resolved } = useTheme()
  const { t, isRTL } = useLanguage()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 44, paddingHorizontal: 20,
        paddingBottom: 24, borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: alignSelf(isRTL), marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500', textAlign: textAlign(isRTL) }}>{t('appearance')}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, textAlign: textAlign(isRTL) }}>
          {t('chooseTheme')}
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* Aperçu */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 14, padding: 20, marginBottom: 16,
          borderWidth: 0.5, borderColor: colors.border,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>
            {THEMES.find(th => th.code === mode)?.icon}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
            {THEMES.find(th => th.code === mode)?.labelKey}
          </Text>
          <Text style={{ fontSize: 12, marginTop: 4, color: colors.textMuted }}>
            {resolved === 'dark' ? t('darkModeActive') : t('lightModeActive')}
          </Text>
        </View>

        {/* Sélection */}
        <View style={{
          backgroundColor: colors.card, borderRadius: 14,
          borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden',
        }}>
          {THEMES.map((theme, i) => {
            const active = mode === theme.code
            return (
              <TouchableOpacity
                key={theme.code}
                onPress={() => setMode(theme.code)}
                style={{
                  flexDirection: row(isRTL), alignItems: 'center', padding: 14,
                  borderBottomWidth: i < THEMES.length - 1 ? 0.5 : 0,
                  borderBottomColor: colors.border,
                  backgroundColor: active ? (resolved === 'dark' ? '#2c2c2e' : '#F1EFE8') : colors.card,
                }}
              >
                <Text style={{ fontSize: 20, ...me(12) }}>{theme.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.text, fontWeight: active ? '600' : '400', textAlign: textAlign(isRTL) }}>
                    {theme.labelKey}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1, textAlign: textAlign(isRTL) }}>
                    {theme.descKey}
                  </Text>
                </View>
                {active && <Text style={{ fontSize: 16, color: colors.text }}>✓</Text>}
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )
}
