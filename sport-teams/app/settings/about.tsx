import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { alignSelf, arrow } from '../../lib/rtl'

export default function About() {
  const router = useRouter()
  const { colors } = useTheme()
  const { t, isRTL } = useLanguage()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignSelf: alignSelf(isRTL), marginBottom: 16 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚽</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
          Squadra
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {t('version')} 1.0.0
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View style={{
          backgroundColor: colors.card, borderRadius: 14,
          padding: 16, marginBottom: 12,
          borderWidth: 0.5, borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 }}>
            {t('about')}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 20 }}>
            Squadra te permet de créer des équipes sportives équilibrées en fonction du niveau de chaque joueur. Multi-sports, notation collaborative et algorithme d'équilibrage intelligent.
          </Text>
        </View>

        <View style={{
          backgroundColor: colors.card, borderRadius: 14,
          padding: 16, marginBottom: 12,
          borderWidth: 0.5, borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 12 }}>
            Fonctionnalités
          </Text>
          {[
            '⚽ Multi-sports (football, basket, volley...)',
            '👥 Gestion des joueurs et niveaux',
            '⭐ Notation collaborative par les coéquipiers',
            '🎯 Algorithme d\'équilibrage intelligent',
            '📊 Historique des matchs',
            '📤 Partage des équipes via WhatsApp',
          ].map((feature, i) => (
            <Text key={i} style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 6, lineHeight: 20 }}>
              {feature}
            </Text>
          ))}
        </View>

        <View style={{
          backgroundColor: colors.card, borderRadius: 14,
          padding: 16,
          borderWidth: 0.5, borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 }}>
            Développé avec
          </Text>
          {[
            { tech: 'React Native + Expo', desc: 'Framework mobile' },
            { tech: 'Supabase', desc: 'Base de données' },
            { tech: 'TypeScript', desc: 'Langage' },
          ].map((item, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 6,
              borderBottomWidth: i < 2 ? 0.5 : 0,
              borderBottomColor: colors.border,
            }}>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: colors.text }}>
                {item.tech}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 24 }}>
          Fait avec ❤️ · 2026
        </Text>

      </ScrollView>
    </View>
  )
}
