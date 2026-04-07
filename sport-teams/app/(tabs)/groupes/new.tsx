import { useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useGroupes } from '../../../hooks/useGroupes'
import { useLanguage } from '../../../contexts/LanguageContext'
import { textAlign, arrow } from '../../../lib/rtl'

const SPORTS = ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Rugby', 'Autre']
const EMOJIS = ['⚽', '🏀', '🏐', '🎾', '🏈', '🥊', '🏊', '🎯', '🏋️', '⛷️', '🤸', '🏄']

export default function NewGroupe() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const [nom, setNom] = useState('')
  const [sport, setSport] = useState('')
  const [emoji, setEmoji] = useState('⚽')
  const [error, setError] = useState('')
  const { createGroupe } = useGroupes()


    useFocusEffect(
      useCallback(() => {
        setNom('')
        setSport('')
        setEmoji('⚽')
        setError('')
      }, [])
    )


    async function handleSubmit() {
        if (nom.length < 2) {
            setError('Le nom doit faire au moins 2 caractères')
            return
        }
        if (!sport) {
            setError('Choisis un sport')
            return
        }
        const result = await createGroupe(nom, sport, emoji)
        if (result) router.replace('/(tabs)/groupes')
    }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{
        backgroundColor: '#1e3a5f',
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: 28,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          {t('newGroupTitle')}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20 }}>
          {t('emoji')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setEmoji(e)}
              style={{
                width: 44, height: 44,
                borderRadius: 14,
                backgroundColor: emoji === e ? '#2563eb' : '#ffffff',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#0f172a',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20 }}>
          {t('groupName')}
        </Text>
        <TextInput
          value={nom}
          onChangeText={setNom}
          placeholder={t('groupNamePlaceholder')}
          placeholderTextColor="#94a3b8"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            color: '#0f172a',
            borderWidth: 1,
            borderColor: '#e2e8f0',
            marginBottom: 16,
            textAlign: textAlign(isRTL),
          }}
        />

        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20 }}>
          {t('sport')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {SPORTS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setSport(s)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: sport === s ? '#2563eb' : '#ffffff',
                borderWidth: 1,
                borderColor: sport === s ? '#2563eb' : '#e2e8f0',
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '500',
                color: sport === s ? '#fff' : '#64748b',
              }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: nom.length >= 2 && sport ? '#2563eb' : '#e2e8f0',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: nom.length >= 2 && sport ? '#fff' : '#94a3b8', fontSize: 14, fontWeight: '500' }}>
            {t('createGroupBtn')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}
