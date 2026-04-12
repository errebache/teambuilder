import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { cacheGet, cacheSet } from '../../../lib/cache'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTheme } from '../../../contexts/ThemeContext'
import AdBanner from '../../../components/AdBanner'

const COULEURS = ['#2563eb', '#22c55e', '#f59e0b', '#8b5cf6']

function formatDate(dateStr: string, t: (key: string) => string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return t('today')
  if (diff === 1) return t('yesterday')
  if (diff < 7) return t('daysAgo').replace('{n}', String(diff))
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

function getEquilibreColor(pct: number): string {
  if (pct >= 90) return '#22c55e'
  if (pct >= 70) return '#2563eb'
  return '#f59e0b'
}

export default function Historique() {
  const { t } = useLanguage()
  const { colors } = useTheme()
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '600', letterSpacing: -0.3 }}>
          {t('history')}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }}>
          {tirages.length} {tirages.length !== 1 ? t('matchesPlayedCountPlural') : t('matchesPlayedCount')}
        </Text>

        {/* Stats rapides */}
        {tirages.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <View style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 14, padding: 12,
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('lastMatch')}</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                {formatDate(tirages[0].date_match, t)}
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 14, padding: 12,
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('bestBalance')}</Text>
              <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: '600', marginTop: 4 }}>
                {tirages.length > 0 ? Math.max(...tirages.map((t: any) => t.equilibre_pct)) : 0}%
              </Text>
            </View>
          </View>
        )}
      </View>

      <AdBanner backgroundColor={colors.background} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

        {fetchError ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>⚠️</Text>
            <Text style={{ fontSize: 14, color: colors.danger, textAlign: 'center' }}>{fetchError}</Text>
          </View>

        ) : tirages.length > 0 ? (
          tirages.map((tirage, index) => {
            const equilibreColor = getEquilibreColor(tirage.equilibre_pct)
            return (
              <View
                key={tirage.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  marginBottom: 12,
                  overflow: 'hidden',
                  shadowColor: '#0f172a',
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {/* Top card */}
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: colors.tag,
                      alignItems: 'center', justifyContent: 'center',
                      marginRight: 12,
                    }}>
                      <Text style={{ fontSize: 20 }}>{tirage.groupes?.emoji || '⚽'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                        {tirage.groupes?.nom || t('groupFallback')}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                        {formatDate(tirage.date_match, t)}
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
                    backgroundColor: colors.borderStrong,
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
                  borderTopWidth: 1,
                  borderTopColor: colors.borderStrong,
                }}>
                  {tirage.equipes.map((eq: any, i: number) => (
                    <View key={i} style={{
                      flex: 1,
                      padding: 12,
                      borderRightWidth: i < tirage.equipes.length - 1 ? 1 : 0,
                      borderRightColor: colors.borderStrong,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                        <View style={{
                          width: 8, height: 8, borderRadius: 4,
                          backgroundColor: COULEURS[i % COULEURS.length],
                        }} />
                        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text }}>
                          {eq.nom}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted, marginLeft: 'auto' }}>
                          {eq.joueurs.length}
                        </Text>
                      </View>
                      {eq.joueurs.map((j: any) => (
                        <Text key={j.id} style={{
                          fontSize: 11, color: colors.textSecondary, marginBottom: 2,
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
              backgroundColor: colors.tag,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 36 }}>🏆</Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>
              {t('noMatchYet')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              {t('startFirst')}
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  )
}
