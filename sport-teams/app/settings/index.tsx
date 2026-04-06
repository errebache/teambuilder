import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Parametres() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)

  async function handleResetData() {
    // Vider les données locales
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.replace('/onboarding/slides')
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
          Paramètres
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
        }}>
          Préférences
        </Text>

        <View style={{
          backgroundColor: '#fff', borderRadius: 14,
          borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
          marginBottom: 16, overflow: 'hidden',
        }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            padding: 14, borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(0,0,0,0.07)',
          }}>
            <Text style={{ flex: 1, fontSize: 14, color: '#1a1a2e' }}>
              Notifications
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: '#1a1a2e', false: '#E0DED6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
        }}>
          Application
        </Text>

        <View style={{
          backgroundColor: '#fff', borderRadius: 14,
          borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
          marginBottom: 16, overflow: 'hidden',
        }}>
          <TouchableOpacity
            onPress={() => router.push('/settings/about')}
            style={{
              flexDirection: 'row', alignItems: 'center',
              padding: 14, borderBottomWidth: 0.5,
              borderBottomColor: 'rgba(0,0,0,0.07)',
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: '#1a1a2e' }}>
              À propos
            </Text>
            <Text style={{ color: '#999', fontSize: 16 }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row', alignItems: 'center',
              padding: 14, borderBottomWidth: 0.5,
              borderBottomColor: 'rgba(0,0,0,0.07)',
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: '#1a1a2e' }}>
              Version
            </Text>
            <Text style={{ color: '#999', fontSize: 13 }}>1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row', alignItems: 'center',
              padding: 14,
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: '#1a1a2e' }}>
              Politique de confidentialité
            </Text>
            <Text style={{ color: '#999', fontSize: 16 }}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
        }}>
          Danger
        </Text>

        <View style={{
          backgroundColor: '#fff', borderRadius: 14,
          borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
          overflow: 'hidden',
        }}>
          <TouchableOpacity
            onPress={handleResetData}
            style={{ padding: 14 }}
          >
            <Text style={{ fontSize: 14, color: '#E24B4A', fontWeight: '500' }}>
              Réinitialiser l'application
            </Text>
            <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
              Supprime toutes tes données locales
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}