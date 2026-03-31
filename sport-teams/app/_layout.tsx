import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

export default function RootLayout() {
  const router = useRouter()

  useEffect(() => {
    checkFirstLaunch()
  }, [])

  async function checkFirstLaunch() {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched')
      if (!hasLaunched) {
        router.replace('/onboarding/slides')
      } else {
        router.replace('/(tabs)/groupes')
      }
    } catch (error) {
      router.replace('/(tabs)/groupes')
    }
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="tirage"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </>
  )
}