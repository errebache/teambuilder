import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  )
}