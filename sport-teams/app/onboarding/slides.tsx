import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Slides() {
  const router = useRouter()

  async function handleStart() {
    await AsyncStorage.setItem('hasLaunched', 'true')
    router.replace('/(tabs)/groupes')
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '500', marginBottom: 12 }}>
        Squadra
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 48 }}>
        Créez des équipes équilibrées
      </Text>
      <TouchableOpacity
        onPress={handleStart}
        style={{ backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}
      >
        <Text style={{ color: '#1a1a2e', fontWeight: '500', fontSize: 16 }}>
          Commencer
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/(tabs)/groupes/rejoindre')}
        style={{
          marginTop: 12,
          paddingVertical: 12,
          paddingHorizontal: 32,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
          Rejoindre avec un code →
        </Text>
      </TouchableOpacity>
    </View>
  )
}
