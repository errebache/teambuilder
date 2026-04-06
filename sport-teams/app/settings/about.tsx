import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

export default function About() {
  const router = useRouter()

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: 16 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚽</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
          Sport Teams
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          Version 1.0.0
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View style={{
          backgroundColor: '#fff', borderRadius: 14,
          padding: 16, marginBottom: 12,
          borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1a1a2e', marginBottom: 8 }}>
            À propos de l'app
          </Text>
          <Text style={{ fontSize: 13, color: '#666', lineHeight: 20 }}>
            Sport Teams te permet de créer des équipes sportives équilibrées en fonction du niveau de chaque joueur. Multi-sports, notation collaborative et algorithme d'équilibrage intelligent.
          </Text>
        </View>

        <View style={{
          backgroundColor: '#fff', borderRadius: 14,
          padding: 16, marginBottom: 12,
          borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1a1a2e', marginBottom: 12 }}>
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
            <Text key={i} style={{ fontSize: 13, color: '#666', marginBottom: 6, lineHeight: 20 }}>
              {feature}
            </Text>
          ))}
        </View>

        <View style={{
          backgroundColor: '#fff', borderRadius: 14,
          padding: 16,
          borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: '#1a1a2e', marginBottom: 8 }}>
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
              borderBottomColor: 'rgba(0,0,0,0.07)',
            }}>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#1a1a2e' }}>
                {item.tech}
              </Text>
              <Text style={{ fontSize: 12, color: '#999' }}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 24 }}>
          Fait avec ❤️ · 2026
        </Text>

      </ScrollView>
    </View>
  )
}