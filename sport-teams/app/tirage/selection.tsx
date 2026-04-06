import { useState, useCallback, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { useJoueurs } from '../../hooks/useJoueurs'
import { Play } from 'lucide-react-native'
import { genererEquipes } from '../../lib/algo-equilibrage'

export default function Selection() {
  const router = useRouter()
  const { groupeId } = useLocalSearchParams()
  const { joueurs, fetchJoueurs } = useJoueurs(groupeId as string)
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
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          Générer les équipes
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {nbPresents} joueurs sélectionnés
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Nombre d'équipes
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[2, 3, 4].map(n => (
            <TouchableOpacity
              key={n}
              onPress={() => setNbEquipes(n)}
              style={{
                paddingHorizontal: 20, paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: nbEquipes === n ? '#1a1a2e' : '#fff',
                borderWidth: 0.5,
                borderColor: nbEquipes === n ? '#1a1a2e' : 'rgba(0,0,0,0.1)',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '500',
                color: nbEquipes === n ? '#fff' : '#666',
              }}>
                {n} équipes
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Joueurs
        </Text>

        {joueurs.map(joueur => (
          <TouchableOpacity
            key={joueur.id}
            onPress={() => togglePresent(joueur.id)}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              marginBottom: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: 0.5,
              borderColor: presents.has(joueur.id) ? '#1a1a2e' : 'rgba(0,0,0,0.07)',
              opacity: presents.has(joueur.id) ? 1 : 0.4,
            }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: joueur.couleur_avatar,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#185FA5' }}>
                {joueur.prenom.substring(0,2).toUpperCase()}
              </Text>
            </View>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#1a1a2e' }}>
              {joueur.prenom} {joueur.nom}
            </Text>
            <Text style={{ fontSize: 12, color: '#999' }}>
              {'★'.repeat(Math.round(joueur.note_moyenne))}
            </Text>
            <View style={{
              width: 20, height: 20, borderRadius: 10,
              backgroundColor: presents.has(joueur.id) ? '#1a1a2e' : 'transparent',
              borderWidth: 1.5,
              borderColor: presents.has(joueur.id) ? '#1a1a2e' : '#ccc',
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
            backgroundColor: nbPresents >= 4 ? '#1a1a2e' : '#ccc',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            marginTop: 16,
          }}
        >
          <Play size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
            Générer les équipes
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}