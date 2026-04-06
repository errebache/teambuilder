import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { LangCode } from '../../contexts/LanguageContext'
import { row, textAlign, alignSelf, arrow } from '../../lib/rtl'

const LANGUES = [
  { code: 'fr' as LangCode, label: 'Français', flag: '🇫🇷' },
  { code: 'en' as LangCode, label: 'English', flag: '🇬🇧' },
  { code: 'es' as LangCode, label: 'Español', flag: '🇪🇸' },
  { code: 'ar' as LangCode, label: 'العربية', flag: '🇲🇦' },
  { code: 'de' as LangCode, label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt' as LangCode, label: 'Português', flag: '🇵🇹' },
]

export default function Langue() {
  const router = useRouter()
  const { lang, setLang, t, isRTL } = useLanguage()
  const { colors, resolved } = useTheme()

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
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500', textAlign: textAlign(isRTL) }}>{t('language')}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, textAlign: textAlign(isRTL) }}>
          {t('chooseLanguage')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{
          backgroundColor: colors.card, borderRadius: 14,
          borderWidth: 0.5, borderColor: colors.border, overflow: 'hidden',
        }}>
          {LANGUES.map((langue, i) => {
            const active = lang === langue.code
            return (
              <TouchableOpacity
                key={langue.code}
                onPress={() => setLang(langue.code)}
                style={{
                  flexDirection: row(isRTL), alignItems: 'center', padding: 14,
                  borderBottomWidth: i < LANGUES.length - 1 ? 0.5 : 0,
                  borderBottomColor: colors.border,
                  backgroundColor: active ? (resolved === 'dark' ? '#2c2c2e' : '#F1EFE8') : colors.card,
                }}
              >
                <Text style={{ fontSize: 22, marginEnd: 12 }}>{langue.flag}</Text>
                <Text style={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: active ? '600' : '400', textAlign: textAlign(isRTL) }}>
                  {langue.label}
                </Text>
                {active && <Text style={{ fontSize: 16, color: colors.text }}>✓</Text>}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}
