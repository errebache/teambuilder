import { useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useGroupes } from '../../../hooks/useGroupes'

const SPORTS = ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Rugby', 'Autre']
const EMOJIS = ['⚽', '🏀', '🏐', '🎾', '🏈', '🥊', '🏊', '🎯', '🏋️', '⛷️', '🤸', '🏄']

export default function NewGroupe() {
  const router = useRouter()
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
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          Nouveau groupe
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Emoji
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              onPress={() => setEmoji(e)}
              style={{
                width: 44, height: 44,
                borderRadius: 12,
                backgroundColor: emoji === e ? '#1a1a2e' : '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 0.5,
                borderColor: emoji === e ? '#1a1a2e' : 'rgba(0,0,0,0.1)',
              }}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Nom du groupe
        </Text>
        <TextInput
          value={nom}
          onChangeText={setNom}
          placeholder="Ex: Foot du mercredi"
          placeholderTextColor="#ccc"
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 14,
            fontSize: 14,
            color: '#1a1a2e',
            borderWidth: 0.5,
            borderColor: 'rgba(0,0,0,0.1)',
            marginBottom: 16,
          }}
        />

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Sport
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
                backgroundColor: sport === s ? '#1a1a2e' : '#fff',
                borderWidth: 0.5,
                borderColor: sport === s ? '#1a1a2e' : 'rgba(0,0,0,0.1)',
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '500',
                color: sport === s ? '#fff' : '#666',
              }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <Text style={{ color: '#E24B4A', fontSize: 12, marginBottom: 12 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: nom.length >= 2 && sport ? '#1a1a2e' : '#ccc',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
            Créer le groupe
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}