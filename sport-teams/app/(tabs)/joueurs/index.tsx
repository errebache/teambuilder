import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { Joueur } from '../../../types'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { textAlign } from '../../../lib/rtl'

type JoueurAvecGroupe = Joueur & {
  groupes: { nom: string; emoji: string } | null
}

export default function Joueurs() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const { colors } = useTheme()
  const [joueurs, setJoueurs] = useState<JoueurAvecGroupe[]>([])
  const [loading, setLoading] = useState(false)
  const [recherche, setRecherche] = useState('')

  useFocusEffect(
    useCallback(() => {
      fetchTousJoueurs()
    }, [])
  )

  async function fetchTousJoueurs() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setJoueurs([]); return }

      const [{ data: mesGroupes }, { data: memberships }] = await Promise.all([
        supabase.from('groupes').select('id').eq('user_id', user.id),
        supabase.from('membres').select('groupe_id').eq('user_id', user.id),
      ])

      const tousGroupeIds = [
        ...(mesGroupes || []).map((g: any) => g.id),
        ...(memberships || []).map((m: any) => m.groupe_id),
      ].filter((id, i, arr) => arr.indexOf(id) === i)

      if (tousGroupeIds.length === 0) { setJoueurs([]); return }

      const { data } = await supabase
        .from('joueurs')
        .select('*, groupes(nom, emoji)')
        .in('groupe_id', tousGroupeIds)
        .order('note_moyenne', { ascending: false })

      setJoueurs((data as JoueurAvecGroupe[]) || [])
    } finally {
      setLoading(false)
    }
  }

  const filtrés = recherche.trim()
    ? joueurs.filter(j =>
        `${j.prenom} ${j.nom}`.toLowerCase().includes(recherche.toLowerCase())
      )
    : joueurs

  const top3 = joueurs.slice(0, 3)
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3
  const podiumPos = top3.length === 3 ? [2, 1, 3] : [1, 2, 3]

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
          {t('players')}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>
          {joueurs.length} {t('playersTotal')}
        </Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.12)',
          borderRadius: 12, paddingHorizontal: 12, marginTop: 14,
        }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', marginRight: 8 }}>🔍</Text>
          <TextInput
            value={recherche}
            onChangeText={setRecherche}
            placeholder={t('searchPlayer')}
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={{ flex: 1, color: '#fff', fontSize: 14, paddingVertical: 10, textAlign: textAlign(isRTL) }}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {joueurs.length > 0 ? (
          <>
            {/* TOP 3 podium */}
            {!recherche && top3.length >= 2 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sectionLabel, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 20 }}>
                  🏆 TOP
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12 }}>
                  {podiumOrder.map((j, idx) => {
                    const pos = podiumPos[idx]
                    const medals = ['🥇', '🥈', '🥉']
                    return (
                      <TouchableOpacity
                        key={j.id}
                        onPress={() => router.push(`/(tabs)/joueurs/${j.id}`)}
                        style={{ alignItems: 'center', width: 80 }}
                      >
                        <Text style={{ fontSize: 20, marginBottom: 4 }}>{medals[pos - 1]}</Text>
                        <View style={{
                          width: 48, height: 48, borderRadius: 24,
                          backgroundColor: j.couleur_avatar,
                          alignItems: 'center', justifyContent: 'center',
                          marginBottom: 6,
                        }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>
                            {j.prenom.substring(0,2).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, fontWeight: '500', color: colors.text, textAlign: 'center' }} numberOfLines={1}>
                          {j.prenom}
                        </Text>
                        <Text style={{ fontSize: 10, color: '#f59e0b' }}>
                          {'★'.repeat(Math.round(j.note_moyenne))}{'☆'.repeat(5 - Math.round(j.note_moyenne))} {j.note_moyenne.toFixed(1)}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            )}

            {/* Liste complète */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sectionLabel, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>
              {filtrés.length} {t('playersCountLabel')}
            </Text>

            {filtrés.map(joueur => (
              <TouchableOpacity
                key={joueur.id}
                onPress={() => router.push(`/(tabs)/joueurs/${joueur.id}`)}
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
                }}
              >
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: joueur.couleur_avatar,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#2563eb' }}>
                    {joueur.prenom.substring(0,2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                    {joueur.prenom} {joueur.nom}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>{joueur.poste || t('playerDefaultRole')}</Text>
                    {joueur.groupes && (
                      <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                        · {joueur.groupes.emoji} {joueur.groupes.nom}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={{ fontSize: 12, color: '#f59e0b' }}>
                  {'★'.repeat(Math.round(joueur.note_moyenne))}{'☆'.repeat(5 - Math.round(joueur.note_moyenne))}
                </Text>
                <Text style={{ fontSize: 18, color: colors.textMuted }}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        ) : !loading ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>👤</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
              {t('noPlayers')}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
              {t('addPlayersFromGroup')}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}
