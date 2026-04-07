import { useEffect, useRef } from 'react'
import { View, Image, Animated } from 'react-native'

export default function LoadingScreen() {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#1a1a2e',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Image
          source={require('../assets/icon.png')}
          style={{ width: 110, height: 110, borderRadius: 26 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  )
}
