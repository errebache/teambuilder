import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../../lib/supabase'

export default function Historique() {
  const [tirages, setTirages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchTirages()
    }, [])
  )

  async function fetchTirages() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('tirages')
        .select('*, groupes(nom, emoji)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setTirages(data || [])
    } finally {
      setLoading(false)
    }
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
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
          Historique
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {tirages.length} matchs joués
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {tirages.length === 0 && !loading ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🏆</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#1a1a2e' }}>
              Aucun match encore
            </Text>
            <Text style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
              Lance ton premier tirage !
            </Text>
          </View>
        ) : (
          tirages.map((tirage, i) => (
            <View
              key={tirage.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                borderWidth: 0.5,
                borderColor: 'rgba(0,0,0,0.07)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 20 }}>{tirage.groupes?.emoji || '⚽'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#1a1a2e' }}>
                    {tirage.groupes?.nom || 'Groupe'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                    {new Date(tirage.date_match).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#E6F1FB',
                  paddingHorizontal: 8, paddingVertical: 3,
                  borderRadius: 20,
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '500', color: '#185FA5' }}>
                    {tirage.equilibre_pct}% équilibre
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                {tirage.equipes.map((eq: any, j: number) => (
                  <View
                    key={j}
                    style={{
                      flex: 1,
                      backgroundColor: '#F1EFE8',
                      borderRadius: 8,
                      padding: 8,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '500', color: '#1a1a2e', marginBottom: 4 }}>
                      {eq.nom}
                    </Text>
                    {eq.joueurs.slice(0, 3).map((j: any) => (
                      <Text key={j.id} style={{ fontSize: 10, color: '#666' }}>
                        · {j.prenom} {j.nom}
                      </Text>
                    ))}
                    {eq.joueurs.length > 3 && (
                      <Text style={{ fontSize: 10, color: '#999' }}>
                        +{eq.joueurs.length - 3} autres
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}