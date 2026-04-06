import { Platform } from 'react-native'
import {
  TestIds,
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads'

// ─── IDs de production ───────────────────────────────────────────────────────
// TODO C3: Remplacer les IDs iOS par tes vrais IDs AdMob iOS
const PRODUCTION_IDS = {
  android: {
    banner:        'ca-app-pub-2895233972104667/1232136902',
    interstitial:  'ca-app-pub-2895233972104667/4234433713',
  },
  ios: {
    // iOS IDs not yet configured — falls back to test IDs to avoid crashes
    banner:        null as string | null,
    interstitial:  null as string | null,
  },
}

const IS_DEV = __DEV__ // pubs de test en dev, vraies pubs en production

// C3: If iOS production IDs are null (not configured), use test IDs as fallback
export const AD_UNIT_IDS = {
  banner: IS_DEV || (Platform.OS === 'ios' && !PRODUCTION_IDS.ios.banner)
    ? TestIds.ADAPTIVE_BANNER
    : Platform.OS === 'ios'
      ? PRODUCTION_IDS.ios.banner!
      : PRODUCTION_IDS.android.banner,

  interstitial: IS_DEV || (Platform.OS === 'ios' && !PRODUCTION_IDS.ios.interstitial)
    ? TestIds.INTERSTITIAL
    : Platform.OS === 'ios'
      ? PRODUCTION_IDS.ios.interstitial!
      : PRODUCTION_IDS.android.interstitial,
}

// ─── Interstitiel pré-chargé (à appeler au montage de l'écran) ───────────────
export function createInterstitial() {
  const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
    requestNonPersonalizedAdsOnly: true,
  })
  return ad
}

export { AdEventType, InterstitialAd, RewardedAd, RewardedAdEventType }
