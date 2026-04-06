import { Stack } from 'expo-router'

export default function TirageLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="selection" />
      <Stack.Screen name="resultat" />
      <Stack.Screen name="partage" />
    </Stack>
  )
}