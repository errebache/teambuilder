import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { cacheGet, cacheSet } from '../../../lib/cache'

const COULEURS = ['#185FA5', '#0F6E56', '#854F0B', '#534AB7']

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff} jours`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function getEquilibreColor(pct: number): string {
  if (pct >= 90) return '#1DB954'
  if (pct >= 70) return '#185FA5'
  return '#E9A84C'
}

export default function Historique() {
  const [tirages, setTirages] = useState<any[]>(() => cacheGet<any[]>('tirages') ?? [])
  const [loading, setLoading] = useState(!cacheGet('tirages'))
  const [fetchError, setFetchError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchTirages()
    }, [])
  )

  async function fetchTirages({ force = false } = {}) {
    if (!force && cacheGet('tirages')) {
      setLoading(false)
      return
    }
    setLoading(true)
    setFetchError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setTirages([]); return }

      const [{ data: mesGroupes }, { data: memberships }] = await Promise.all([
        supabase.from('groupes').select('id').eq('user_id', user.id),
        supabase.from('membres').select('groupe_id').eq('user_id', user.id),
      ])

      const tousGroupeIds = [
        ...(mesGroupes || []).map((g: any) => g.id),
        ...(memberships || []).map((m: any) => m.groupe_id),
      ].filter((id, i, arr) => arr.indexOf(id) === i)

      if (tousGroupeIds.length === 0) { setTirages([]); return }

      const { data, error } = await supabase
        .from('tirages')
        .select('*, groupes(nom, emoji)')
        .in('groupe_id', tousGroupeIds)
        .order('created_at', { ascending: false })
      if (error) throw error
      const result = data || []
      cacheSet('tirages', result)
      setTirages(result)
    } catch (e: any) {
      setFetchError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const totalJoueurs = tirages.length > 0
    ? tirages[0].equipes.reduce((s: number, e: any) => s + e.joueurs.length, 0)
    : 0

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F4F0' }}>

      {/* Header */}
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '600', letterSpacing: -0.3 }}>
          Historique
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
          {tirages.length} match{tirages.length !== 1 ? 's' : ''} joué{tirages.length !== 1 ? 's' : ''}
        </Text>

        {/* Stats rapides */}
        {tirages.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <View style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 14, padding: 12,
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dernière partie</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                {formatDate(tirages[0].date_match)}
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 14, padding: 12,
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Meilleur équilibre</Text>
              <Text style={{ color: '#1DB954', fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                {tirages.length > 0 ? Math.max(...tirages.map((t: any) => t.equilibre_pct)) : 0}%
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

        {fetchError ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
            <Text style={{ fontSize: 14, color: '#E24B4A', textAlign: 'center' }}>{fetchError}</Text>
          </View>

        ) : tirages.length > 0 ? (
          tirages.map((tirage, index) => {
            const equilibreColor = getEquilibreColor(tirage.equilibre_pct)
            return (
              <View
                key={tirage.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 18,
                  marginBottom: 12,
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                }}
              >
                {/* Top card */}
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: '#F1EFE8',
                      alignItems: 'center', justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 20 }}>{tirage.groupes?.emoji || '⚽'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1a1a2e' }}>
                        {tirage.groupes?.nom || 'Groupe'}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#999', marginTop: 1 }}>
                        {formatDate(tirage.date_match)}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: `${equilibreColor}18`,
                      paddingHorizontal: 10, paddingVertical: 5,
                      borderRadius: 20,
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                    }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: equilibreColor }} />
                      <Text style={{ fontSize: 11, fontWeight: '600', color: equilibreColor }}>
                        {tirage.equilibre_pct}%
                      </Text>
                    </View>
                  </View>

                  {/* Barre d'équilibre */}
                  <View style={{
                    height: 3, borderRadius: 2,
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    flexDirection: 'row',
                    overflow: 'hidden',
                    marginTop: 14,
                  }}>
                    {tirage.equipes.map((eq: any, i: number) => (
                      <View key={i} style={{
                        flex: eq.totalPoints || 1,
                        backgroundColor: COULEURS[i % COULEURS.length],
                      }} />
                    ))}
                  </View>
                </View>

                {/* Équipes */}
                <View style={{
                  flexDirection: 'row',
                  borderTopWidth: 0.5,
                  borderTopColor: 'rgba(0,0,0,0.06)',
                }}>
                  {tirage.equipes.map((eq: any, i: number) => (
                    <View key={i} style={{
                      flex: 1,
                      padding: 12,
                      borderRightWidth: i < tirage.equipes.length - 1 ? 0.5 : 0,
                      borderRightColor: 'rgba(0,0,0,0.06)',
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <View style={{
                          width: 8, height: 8, borderRadius: 4,
                          backgroundColor: COULEURS[i % COULEURS.length],
                        }} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#1a1a2e' }}>
                          {eq.nom}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#bbb', marginLeft: 'auto' }}>
                          {eq.joueurs.length}
                        </Text>
                      </View>
                      {eq.joueurs.map((j: any) => (
                        <Text key={j.id} style={{
                          fontSize: 11, color: '#555', marginBottom: 2,
                        }} numberOfLines={1}>
                          {j.prenom}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            )
          })

        ) : !loading ? (
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: '#F1EFE8',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 36 }}>🏆</Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: '600', color: '#1a1a2e' }}>
              Aucun match encore
            </Text>
            <Text style={{ fontSize: 13, color: '#999', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              Lance ton premier tirage depuis{'\n'}un groupe
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  )
}
