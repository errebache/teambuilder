import { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useJoueurs } from '../../hooks/useJoueurs'
import { Play } from 'lucide-react-native'
import { genererEquipes } from '../../lib/algo-equilibrage'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import { createInterstitial, AdEventType } from '../../lib/admob'

export default function Selection() {
  const router = useRouter()
  const { groupeId } = useLocalSearchParams()
  const { joueurs, fetchJoueurs } = useJoueurs(groupeId as string)
  const { t } = useLanguage()
  const { colors } = useTheme()
  const [presents, setPresents] = useState<Set<string>>(new Set())
  const [nbEquipes, setNbEquipes] = useState(2)
  const interstitialRef = useRef<any>(null)
  const adLoadedRef = useRef(false)
  const pendingNavRef = useRef<(() => void) | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchJoueurs()
    }, [groupeId])
  )

  // Pré-charger l'interstitiel au montage
  useEffect(() => {
    let unsubLoaded: (() => void) | undefined
    let unsubClosed: (() => void) | undefined
    let unsubError: (() => void) | undefined

    createInterstitial().then(ad => {
      if (!ad) return
      interstitialRef.current = ad

      unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        adLoadedRef.current = true
      })
      unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        adLoadedRef.current = false
        // Naviguer après fermeture de la pub
        if (pendingNavRef.current) {
          pendingNavRef.current()
          pendingNavRef.current = null
        }
        // Recharger pour la prochaine fois
        ad.load()
      })
      unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
        adLoadedRef.current = false
        // En cas d'erreur, naviguer quand même
        if (pendingNavRef.current) {
          pendingNavRef.current()
          pendingNavRef.current = null
        }
      })

      ad.load()
    })

    return () => {
      unsubLoaded?.()
      unsubClosed?.()
      unsubError?.()
    }
  }, [])

  // Par défaut tous présents — useEffect pour réagir au chargement async
  useEffect(() => {
    setPresents(new Set(joueurs.map(j => j.id)))
  }, [joueurs])

  function togglePresent(id: string) {
    setPresents(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleGenerer() {
    const joueursPresents = joueurs.filter(j => presents.has(j.id))
    const { equipes, equilibrePct } = genererEquipes({
      joueurs: joueursPresents,
      nbEquipes,
    })

    const navigate = () => router.push({
      pathname: '/tirage/resultat',
      params: {
        equipes: JSON.stringify(equipes),
        equilibrePct: equilibrePct.toString(),
        groupeId: groupeId as string,
      }
    })

    // Montrer l'interstitiel si prêt, sinon naviguer directement
    if (adLoadedRef.current && interstitialRef.current) {
      pendingNavRef.current = navigate
      interstitialRef.current.show()
    } else {
      navigate()
    }
  }

  const nbPresents = presents.size

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{t('back')}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          {t('generateTeamsTitle')}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {nbPresents} {t('playersSelected')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sectionLabel, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>
          {t('numberOfTeams')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[2, 3, 4].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setNbEquipes(n)}
              style={{
                paddingHorizontal: 20, paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: nbEquipes === n ? '#2563eb' : colors.card,
                borderWidth: 1,
                borderColor: nbEquipes === n ? '#2563eb' : colors.borderStrong,
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '500',
                color: nbEquipes === n ? '#fff' : colors.textSecondary,
              }}>
                {n} {t('teamsLabel')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sectionLabel, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>
          {t('selectionPlayersLabel')}
        </Text>

        {joueurs.map(joueur => (
          <TouchableOpacity
            key={joueur.id}
            onPress={() => togglePresent(joueur.id)}
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 12,
              marginBottom: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              shadowColor: '#0f172a',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
              opacity: presents.has(joueur.id) ? 1 : 0.4,
            }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: joueur.couleur_avatar,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#2563eb' }}>
                {joueur.prenom.substring(0,2).toUpperCase()}
              </Text>
            </View>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: colors.text }}>
              {joueur.prenom} {joueur.nom}
            </Text>
            <Text style={{ fontSize: 12, color: '#f59e0b' }}>
              {'★'.repeat(Math.round(joueur.note_moyenne))}
            </Text>
            <View style={{
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: presents.has(joueur.id) ? '#2563eb' : colors.card,
              borderWidth: 1.5,
              borderColor: presents.has(joueur.id) ? '#2563eb' : colors.borderStrong,
              alignItems: 'center', justifyContent: 'center',
            }}>
              {presents.has(joueur.id) && (
                <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={handleGenerer}
          disabled={nbPresents < 4}
          style={{
            backgroundColor: nbPresents >= 4 ? '#22c55e' : colors.tag,
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            marginTop: 16,
          }}
        >
          <Play size={16} color={nbPresents >= 4 ? '#fff' : colors.textMuted} />
          <Text style={{ color: nbPresents >= 4 ? '#fff' : colors.textMuted, fontSize: 14, fontWeight: '500' }}>
            {t('generateTeams')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}
