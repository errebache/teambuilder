import { useState, useCallback, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useJoueurs } from '../../hooks/useJoueurs'
import { Play } from 'lucide-react-native'
import { genererEquipes } from '../../lib/algo-equilibrage'
import { useLanguage } from '../../contexts/LanguageContext'

export default function Selection() {
  const router = useRouter()
  const { groupeId } = useLocalSearchParams()
  const { joueurs, fetchJoueurs } = useJoueurs(groupeId as string)
  const { t } = useLanguage()
  const [presents, setPresents] = useState<Set<string>>(new Set())
  const [nbEquipes, setNbEquipes] = useState(2)

  useFocusEffect(
    useCallback(() => {
      fetchJoueurs()
    }, [groupeId])
  )

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
    router.push({
      pathname: '/tirage/resultat',
      params: {
        equipes: JSON.stringify(equipes),
        equilibrePct: equilibrePct.toString(),
        groupeId: groupeId as string,
      }
    })
  }

  const nbPresents = presents.size

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{
        backgroundColor: '#1e3a5f',
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

        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>
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
                backgroundColor: nbEquipes === n ? '#2563eb' : '#ffffff',
                borderWidth: 1,
                borderColor: nbEquipes === n ? '#2563eb' : '#e2e8f0',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '500',
                color: nbEquipes === n ? '#fff' : '#64748b',
              }}>
                {n} {t('teamsLabel')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>
          {t('selectionPlayersLabel')}
        </Text>

        {joueurs.map(joueur => (
          <TouchableOpacity
            key={joueur.id}
            onPress={() => togglePresent(joueur.id)}
            style={{
              backgroundColor: '#ffffff',
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
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#0f172a' }}>
              {joueur.prenom} {joueur.nom}
            </Text>
            <Text style={{ fontSize: 12, color: '#f59e0b' }}>
              {'★'.repeat(Math.round(joueur.note_moyenne))}
            </Text>
            <View style={{
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: presents.has(joueur.id) ? '#2563eb' : '#ffffff',
              borderWidth: 1.5,
              borderColor: presents.has(joueur.id) ? '#2563eb' : '#e2e8f0',
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
            backgroundColor: nbPresents >= 4 ? '#22c55e' : '#e2e8f0',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            marginTop: 16,
          }}
        >
          <Play size={16} color={nbPresents >= 4 ? '#fff' : '#94a3b8'} />
          <Text style={{ color: nbPresents >= 4 ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: '500' }}>
            {t('generateTeams')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}
