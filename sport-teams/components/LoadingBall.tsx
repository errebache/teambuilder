import { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

interface LoadingBallProps {
  color?: string
}

export default function LoadingBall({ color = 'rgba(24,95,165,0.35)' }: LoadingBallProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const shadowAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -28,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ])
    )

    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 840,
        useNativeDriver: true,
      })
    )

    const shadow = Animated.loop(
      Animated.sequence([
        Animated.timing(shadowAnim, {
          toValue: 0.45,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ])
    )

    bounce.start()
    rotate.start()
    shadow.start()

    return () => {
      bounce.stop()
      rotate.stop()
      shadow.stop()
    }
  }, [])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const shadowScaleX = shadowAnim.interpolate({
    inputRange: [0.45, 1],
    outputRange: [0.45, 1],
  })

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: 100 }}>
      <Animated.Text
        style={{
          fontSize: 40,
          transform: [
            { translateY: bounceAnim },
            { rotate: spin },
          ],
        }}
      >
        ⚽
      </Animated.Text>
      <Animated.View
        style={{
          width: 36,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          marginTop: 4,
          opacity: shadowAnim,
          transform: [{ scaleX: shadowScaleX }],
        }}
      />
    </View>
  )
}
