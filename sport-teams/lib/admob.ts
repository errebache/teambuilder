import { Platform } from 'react-native'
import {
  TestIds,
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  AdsConsent,
  AdsConsentStatus,
  AdsConsentDebugGeography,
} from 'react-native-google-mobile-ads'

// ─── IDs de production ────────────────────────────────────────────────────────
// Android : configurés dans la console AdMob
// iOS     : remplace XXXXXXXXXX par tes vrais IDs après création dans AdMob
const PRODUCTION_IDS = {
  android: {
    banner:       'ca-app-pub-2895233972104667/1232136902',
    interstitial: 'ca-app-pub-2895233972104667/4234433713',
  },
  ios: {
    // ⚠️ À compléter une fois l'app iOS créée dans AdMob console
    banner:       'ca-app-pub-2895233972104667/XXXXXXXXXX' as string,
    interstitial: 'ca-app-pub-2895233972104667/XXXXXXXXXX' as string,
  },
}

const IS_DEV = __DEV__

function resolveId(type: 'banner' | 'interstitial'): string {
  if (IS_DEV) {
    return type === 'banner' ? TestIds.ADAPTIVE_BANNER : TestIds.INTERSTITIAL
  }
  if (Platform.OS === 'ios') {
    const id = PRODUCTION_IDS.ios[type]
    if (id.includes('XXXXXXXXXX')) {
      console.warn(`[AdMob] iOS ${type} ID not configured — using test ID`)
      return type === 'banner' ? TestIds.ADAPTIVE_BANNER : TestIds.INTERSTITIAL
    }
    return id
  }
  return PRODUCTION_IDS.android[type]
}

export const AD_UNIT_IDS = {
  banner:       resolveId('banner'),
  interstitial: resolveId('interstitial'),
}

// ─── GDPR / Consentement UMP ──────────────────────────────────────────────────
// Appeler au démarrage dans app/_layout.tsx
export async function initAdConsent(): Promise<void> {
  try {
    const consentInfo = await AdsConsent.requestInfoUpdate({
      ...(IS_DEV ? {
        debugSettings: {
          testDeviceIdentifiers: ['EMULATOR'],
          geography: AdsConsentDebugGeography.EEA,
        },
      } : {}),
    })

    if (
      consentInfo.isConsentFormAvailable &&
      consentInfo.status === AdsConsentStatus.REQUIRED
    ) {
      await AdsConsent.showForm()
    }
  } catch (e) {
    console.warn('[AdMob] Consent error:', e)
  }
}

// Retourne les options de requête selon le statut de consentement
export async function getAdRequestOptions() {
  try {
    const info = await AdsConsent.getConsentInfo()
    const personalized =
      info.status === AdsConsentStatus.OBTAINED ||
      info.status === AdsConsentStatus.NOT_REQUIRED
    return { requestNonPersonalizedAdsOnly: !personalized }
  } catch {
    return { requestNonPersonalizedAdsOnly: true }
  }
}

// ─── Interstitiel pré-chargé ──────────────────────────────────────────────────
export async function createInterstitial() {
  const options = await getAdRequestOptions()
  const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, options)
  return ad
}

export { AdEventType, InterstitialAd, RewardedAd, RewardedAdEventType, AdsConsent, AdsConsentStatus }
