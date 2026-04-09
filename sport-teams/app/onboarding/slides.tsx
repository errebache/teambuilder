import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLanguage } from '../../contexts/LanguageContext'

export default function Slides() {
  const router = useRouter()
  const { t } = useLanguage()

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
        {t('onboardingTagline')}
      </Text>
      <TouchableOpacity
        onPress={handleStart}
        style={{ backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}
      >
        <Text style={{ color: '#1a1a2e', fontWeight: '500', fontSize: 16 }}>
          {t('onboardingStart')}
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
          {t('onboardingJoin')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
