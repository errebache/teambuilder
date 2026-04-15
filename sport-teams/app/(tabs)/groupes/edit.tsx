import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { cacheInvalidate } from '../../../lib/cache'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { textAlign, arrow } from '../../../lib/rtl'

const SPORTS = ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Rugby', 'Autre']
const EMOJIS = ['⚽', '🏀', '🏐', '🎾', '🏈', '🥊', '🏊', '🎯', '🏋️', '⛷️', '🤸', '🏄']

export default function EditGroupe() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { t, isRTL } = useLanguage()
  const { colors } = useTheme()

  const [nom, setNom] = useState('')
  const [sport, setSport] = useState('')
  const [emoji, setEmoji] = useState('⚽')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    fetchGroupe()
  }, [id])

  async function fetchGroupe() {
    const { data } = await supabase
      .from('groupes')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      setNom(data.nom)
      setSport(data.sport)
      setEmoji(data.emoji || '⚽')
    }
    setFetched(true)
  }

  async function handleSave() {
    if (nom.trim().length < 2) {
      setError(t('groupNameMinError'))
      return
    }
    if (!sport) {
      setError(t('chooseSport'))
      return
    }
    setLoading(true)
    const { error: err } = await supabase
      .from('groupes')
      .update({ nom: nom.trim(), sport, emoji })
      .eq('id', id)
    setLoading(false)

    if (err) {
      if (Platform.OS === 'web') {
        window.alert(t('error') + ' : ' + err.message)
      } else {
        Alert.alert(t('error'), err.message)
      }
      return
    }

    cacheInvalidate('groupes')
    router.back()
  }

  if (!fetched) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          {t('editGroup')}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        {/* Emoji */}
        <Text style={{
          fontSize: 11, fontWeight: '700', color: colors.sectionLabel,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20,
        }}>
          {t('emoji')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setEmoji(e)}
              style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: emoji === e ? '#2563eb' : colors.card,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#0f172a', shadowOpacity: 0.06,
                shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
              }}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Nom */}
        <Text style={{
          fontSize: 11, fontWeight: '700', color: colors.sectionLabel,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20,
        }}>
          {t('groupName')}
        </Text>
        <TextInput
          value={nom}
          onChangeText={v => { setNom(v); setError('') }}
          placeholder={t('groupNamePlaceholder')}
          placeholderTextColor={colors.textPlaceholder}
          style={{
            backgroundColor: colors.inputBg, borderRadius: 12,
            padding: 14, fontSize: 14, color: colors.text,
            borderWidth: 1, borderColor: colors.borderStrong, marginBottom: 16,
            textAlign: textAlign(isRTL),
          }}
        />

        {/* Sport */}
        <Text style={{
          fontSize: 11, fontWeight: '700', color: colors.sectionLabel,
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20,
        }}>
          {t('sport')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {SPORTS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setSport(s)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: sport === s ? '#2563eb' : colors.card,
                borderWidth: 1, borderColor: sport === s ? '#2563eb' : colors.borderStrong,
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '500',
                color: sport === s ? '#fff' : colors.textSecondary,
              }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{
            backgroundColor: nom.trim().length >= 2 && sport && !loading ? '#2563eb' : colors.tag,
            borderRadius: 14, padding: 14, alignItems: 'center',
          }}
        >
          <Text style={{
            color: nom.trim().length >= 2 && sport && !loading ? '#fff' : colors.textMuted,
            fontSize: 14, fontWeight: '500',
          }}>
            {loading ? t('registering') : t('saveChanges')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}
