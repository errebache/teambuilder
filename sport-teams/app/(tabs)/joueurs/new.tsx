import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useLocalSearchParams } from 'expo-router'
import { getPlayerInitials, getRandomAvatarColor } from "../../../lib/supabase"
import { supabase } from '../../../lib/supabase'

const SPORTS = ['Football', 'Basketball', 'Volleyball', 'Tennis', 'Rugby', 'Autre']

const POSTES: Record<string, string[]> = {
  Football: ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'],
  Basketball: ['Meneur', 'Ailier', 'Pivot', 'Arrière'],
  Volleyball: ['Passeur', 'Libéro', 'Attaquant', 'Défenseur'],
  Tennis: ['Joueur'],
  Rugby: ['Avant', 'Demi', 'Trois-quarts', 'Arrière'],
  Autre: ['Titulaire', 'Remplaçant'],
}

const NOTES = [1, 2, 3, 4, 5]

export default function NewJoueur() {
  const router = useRouter()
  const { groupeId } = useLocalSearchParams()
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [sport, setSport] = useState('Football')
  const [poste, setPoste] = useState('')
  const [note, setNote] = useState(3)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!prenom || !nom) {
      setError('Prénom et nom requis')
      return
    }
    if (!poste) {
      setError('Choisis un poste')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('joueurs').insert({
        prenom,
        nom,
        note_moyenne: note,
        poste,
        couleur_avatar: getRandomAvatarColor(),
        groupe_id: groupeId,
      })
      if (error) throw error
      router.replace(`/(tabs)/groupes/${groupeId}`)
    } catch (e: any) {
      setError(e.message)
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
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          Ajouter un joueur
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: '#E6F1FB',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: '#B5D4F4', borderStyle: 'dashed',
          }}>
            <Text style={{ fontSize: 20, fontWeight: '500', color: '#185FA5' }}>
              {prenom && nom ? getPlayerInitials(prenom, nom) : '+'}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Prénom et nom
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <TextInput
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Prénom"
            placeholderTextColor="#ccc"
            style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 12,
              padding: 12, fontSize: 14, color: '#1a1a2e',
              borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)',
            }}
          />
          <TextInput
            value={nom}
            onChangeText={setNom}
            placeholder="Nom"
            placeholderTextColor="#ccc"
            style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 12,
              padding: 12, fontSize: 14, color: '#1a1a2e',
              borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)',
            }}
          />
        </View>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Note initiale
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          {NOTES.map(n => (
            <TouchableOpacity key={n} onPress={() => setNote(n)}>
              <Text style={{ fontSize: 28, color: n <= note ? '#1a1a2e' : '#E0DED6' }}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Sport
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SPORTS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => { setSport(s); setPoste('') }}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: sport === s ? '#1a1a2e' : '#fff',
                borderWidth: 0.5,
                borderColor: sport === s ? '#1a1a2e' : 'rgba(0,0,0,0.1)',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: sport === s ? '#fff' : '#666' }}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Poste
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {(POSTES[sport] || POSTES.Autre).map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => setPoste(p)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: poste === p ? '#1a1a2e' : '#fff',
                borderWidth: 0.5,
                borderColor: poste === p ? '#1a1a2e' : 'rgba(0,0,0,0.1)',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: poste === p ? '#fff' : '#666' }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? (
          <Text style={{ color: '#E24B4A', fontSize: 12, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 14, padding: 14,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
            {loading ? 'Ajout en cours...' : 'Ajouter le joueur'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}