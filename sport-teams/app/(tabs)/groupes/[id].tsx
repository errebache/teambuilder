import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { Plus, Play, Trash2, Copy, Pencil } from 'lucide-react-native'
import { useCallback, useState, useEffect } from 'react'
import { useJoueurs } from '../../../hooks/useJoueurs'
import { supabase } from '../../../lib/supabase'
import { cacheGet, cacheInvalidate } from '../../../lib/cache'
import { Groupe } from '../../../types'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTheme } from '../../../contexts/ThemeContext'

export default function DetailGroupe() {
  const { t } = useLanguage()
  const { colors } = useTheme()
  const router = useRouter()
  const { id, nouveauMembre } = useLocalSearchParams()

  const { joueurs, hasFetched, fetchJoueurs } = useJoueurs(id as string)
  const [groupe, setGroupe] = useState<Groupe | null>(() => {
    const list = cacheGet<Groupe[]>('groupes')
    return list?.find(g => g.id === id) ?? null
  })

  useFocusEffect(
    useCallback(() => {
      fetchJoueurs()
      fetchGroupe()
    }, [id])
  )

  useEffect(() => {
    if (nouveauMembre !== 'true') return
    if (!hasFetched) return
    const message = joueurs.length === 0
      ? t('noPlayersFirstMsg')
      : t('welcomeNewMemberMsg')
    if (Platform.OS === 'web') {
      const ok = window.confirm(message + '\n\n' + t('addMeBtn') + ' ?')
      if (ok) router.push(`/(tabs)/joueurs/new?groupeId=${id}`)
    } else {
      Alert.alert(
        t('welcomeTitle'),
        message,
        [
          { text: t('laterBtn'), style: 'cancel' },
          {
            text: t('addMeBtn'),
            onPress: () => router.push(`/(tabs)/joueurs/new?groupeId=${id}`)
          },
        ]
      )
    }
  }, [nouveauMembre, hasFetched])

  async function fetchGroupe() {
    const { data } = await supabase
      .from('groupes')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setGroupe(data)
  }

  async function handleSupprimer() {
    const confirmer = (callback: () => void) => {
      if (Platform.OS === 'web') {
        const ok = window.confirm(t('deleteGroupConfirm'))
        if (ok) callback()
      } else {
        Alert.alert(
          t('deleteGroupTitle'),
          t('deleteGroupDesc'),
          [
            { text: t('cancel'), style: 'cancel' },
            { text: t('delete'), style: 'destructive', onPress: callback },
          ]
        )
      }
    }

    confirmer(async () => {
      await supabase.from('joueurs').delete().eq('groupe_id', id)
      const { error } = await supabase.from('groupes').delete().eq('id', id)
      if (!error) {
        cacheInvalidate('groupes')
        cacheInvalidate('joueurs:')
        cacheInvalidate('tirages')
        router.replace('/(tabs)/groupes')
      }
    })
  }

  async function handlePartagerCode() {
    if (!groupe?.code) return
    if (Platform.OS === 'web') {
      window.navigator.clipboard.writeText(groupe.code)
      window.alert(t('codeCopied') + groupe.code)
    } else {
      await Share.share({
        message: t('inviteMessage').replace('{name}', groupe.nom).replace('{code}', groupe.code),
      })
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: 80 }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/groupes')}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/groupes/edit?id=${id}`)}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 8,
            }}
          >
            <Pencil size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSupprimer}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          {groupe ? `${groupe.emoji} ${groupe.nom}` : '...'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {joueurs.length} {t('playersCount')} · {groupe?.sport || ''}
        </Text>

        {groupe?.code && (
          <TouchableOpacity
            onPress={handlePartagerCode}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255,255,255,0.18)',
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
              marginTop: 12,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500', letterSpacing: 2 }}>
              {groupe.code}
            </Text>
            <Copy size={13} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{
          fontSize: 11, fontWeight: '700', color: colors.sectionLabel,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20,
        }}>
          {t('players')}
        </Text>

        {joueurs.length > 0 ? (
          joueurs.map(joueur => (
            <TouchableOpacity
              key={joueur.id}
              onPress={() => router.push(`/(tabs)/joueurs/${joueur.id}?from=groupe&groupeId=${id}`)}
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
                width: 36, height: 36,
                borderRadius: 18,
                backgroundColor: joueur.couleur_avatar,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '500', color: '#2563eb' }}>
                  {joueur.prenom.substring(0,2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.text }}>
                  {joueur.prenom} {joueur.nom}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>
                  {joueur.poste || t('playerDefaultRole')}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#f59e0b' }}>
                {'★'.repeat(Math.round(joueur.note_moyenne))}
              </Text>
            </TouchableOpacity>
          ))
        ) : hasFetched ? (
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {t('noPlayersYet')}
            </Text>
          </View>
        ) : null}

      </ScrollView>

      {/* Boutons fixes en bas */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 10,
        padding: 16, backgroundColor: colors.background,
        borderTopWidth: 1, borderTopColor: colors.borderStrong,
      }}>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/joueurs/new?groupeId=${id}`)}
          style={{
            flex: 1, backgroundColor: '#2563eb',
            borderRadius: 14, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Plus size={15} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{t('addPlayer')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/tirage/selection?groupeId=${id}`)}
          disabled={joueurs.length < 4}
          style={{
            flex: 1, backgroundColor: joueurs.length >= 4 ? '#22c55e' : colors.tag,
            borderRadius: 14, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Play size={15} color={joueurs.length >= 4 ? '#fff' : colors.textMuted} />
          <Text style={{ color: joueurs.length >= 4 ? '#fff' : colors.textMuted, fontSize: 13, fontWeight: '500' }}>
            {joueurs.length < 4 ? `${4 - joueurs.length} ${t('generateTeamsMin')}` : t('generateTeams')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
