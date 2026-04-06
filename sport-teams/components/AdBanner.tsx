import React, { useState, Component } from 'react'
import { Platform, View, Text } from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { AD_UNIT_IDS } from '../lib/admob'

// ─── Error Boundary ──────────────────────────────────────────────────────────
// Attrape les crashes natifs de BannerAd sans planter l'écran entier
class AdErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return null // Pub qui crash → on cache discrètement
    return this.props.children
  }
}

// ─── Banner interne ──────────────────────────────────────────────────────────
function BannerInner({ backgroundColor }: { backgroundColor: string }) {
  const [error, setError] = useState<string | null>(null)

  return (
    <View style={{ backgroundColor, alignItems: 'center' }}>
      <BannerAd
        unitId={AD_UNIT_IDS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setError(null)}
        onAdFailedToLoad={(err) => setError(err.message)}
      />
    </View>
  )
}

// ─── Export principal ────────────────────────────────────────────────────────
interface AdBannerProps {
  backgroundColor?: string
}

export default function AdBanner({ backgroundColor = '#fff' }: AdBannerProps) {
  if (Platform.OS === 'web') return null

  return (
    <AdErrorBoundary>
      <BannerInner backgroundColor={backgroundColor} />
    </AdErrorBoundary>
  )
}
