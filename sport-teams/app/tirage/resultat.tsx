import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { genererEquipes } from '../../lib/algo-equilibrage'
import { Equipe } from '../../types'
import { useState } from 'react'

const COULEURS_EQUIPES = ['#185FA5', '#0F6E56', '#854F0B', '#534AB7']

export default function Resultat() {
  const router = useRouter()
  const { equipes: equipesParam, equilibrePct, groupeId } = useLocalSearchParams()
  
  const [equipes, setEquipes] = useState<Equipe[]>(
    JSON.parse(equipesParam as string)
  )
  const [equilibre, setEquilibre] = useState(Number(equilibrePct))

  function handleRelancer() {
    const tousJoueurs = equipes.flatMap(e => e.joueurs)
    const { equipes: newEquipes, equilibrePct: newEquilibre } = genererEquipes({
      joueurs: tousJoueurs,
      nbEquipes: equipes.length,
      shuffle: true,
    })
    setEquipes(newEquipes)
    setEquilibre(newEquilibre)
  }

  async function handlePartager() {
    const texte = equipes.map(eq => {
      const joueurs = eq.joueurs.map(j => 
        `${j.prenom} ${j.nom} (${j.poste || 'N/A'} · ${'★'.repeat(Math.round(j.note_moyenne))})`
      ).join(', ')
      return `${eq.nom} : ${joueurs}`
    }).join('\n\n')

    await Share.share({
      message: `⚽ Équipes générées !\n\n${texte}\n\nÉquilibre : ${equilibre}%`,
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          Équipes générées
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          Équilibre {equilibre}%
        </Text>

        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            {equipes.map((eq, i) => (
              <Text key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                {eq.nom} · {eq.totalPoints.toFixed(1)}pts
              </Text>
            ))}
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', overflow: 'hidden' }}>
            {equipes.map((eq, i) => (
              <View
                key={i}
                style={{
                  flex: eq.totalPoints,
                  backgroundColor: i === 0 ? '#378ADD' : i === 1 ? '#34d399' : i === 2 ? '#EF9F27' : '#AFA9EC',
                }}
              />
            ))}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {equipes.map((eq, i) => (
          <View
            key={i}
            style={{
              backgroundColor: '#fff',
              borderRadius: 14,
              marginBottom: 10,
              overflow: 'hidden',
              borderWidth: 0.5,
              borderColor: 'rgba(0,0,0,0.07)',
            }}
          >
            <View style={{
              backgroundColor: `${COULEURS_EQUIPES[i]}20`,
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: COULEURS_EQUIPES[i] }}>
                {eq.nom}
              </Text>
              <Text style={{ fontSize: 11, color: '#999' }}>
                {eq.totalPoints.toFixed(1)} pts
              </Text>
            </View>
            <View style={{ padding: 10 }}>
              {eq.joueurs.map(j => (
                <View key={j.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }}>
                  <View style={{
                    width: 24, height: 24, borderRadius: 12,
                    backgroundColor: j.couleur_avatar,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '500', color: '#185FA5' }}>
                      {j.prenom[0]}{j.nom[0]}
                    </Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 12, color: '#1a1a2e' }}>
                    {j.prenom} {j.nom}
                  </Text>
                  <Text style={{ 
                    fontSize: 10, fontWeight: '500', 
                    color: '#888',
                    backgroundColor: '#F1EFE8',
                    paddingHorizontal: 6, paddingVertical: 2,
                    borderRadius: 8,
                    textAlign: 'center'
                  }}>
                    {j.poste || 'N/A'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#999' }}>
                    {'★'.repeat(Math.round(j.note_moyenne))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleRelancer}
            style={{
              flex: 1, backgroundColor: '#F1EFE8',
              borderRadius: 14, padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#1a1a2e', fontSize: 14, fontWeight: '500' }}>
              Relancer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePartager}
            style={{
              flex: 1, backgroundColor: '#1a1a2e',
              borderRadius: 14, padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
              Partager
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}