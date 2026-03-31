import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Plus, Play } from 'lucide-react-native'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { useJoueurs } from '../../../hooks/useJoueurs'


export default function DetailGroupe() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { joueurs, fetchJoueurs } = useJoueurs(id as string)

  useFocusEffect(
    useCallback(() => {
        fetchJoueurs()
    }, [id])
 )

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
        <TouchableOpacity onPress={() => router.replace('/(tabs)/groupes')} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          ⚽ Foot du mercredi
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {joueurs.length} joueurs · Football
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
          Joueurs
        </Text>

        {joueurs.map(joueur => (
          <TouchableOpacity
            key={joueur.id}
            onPress={() => router.push(`/(tabs)/joueurs/${joueur.id}`)}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              marginBottom: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              borderWidth: 0.5,
              borderColor: 'rgba(0,0,0,0.07)',
            }}
          >
            <View style={{
              width: 36, height: 36,
              borderRadius: 18,
              backgroundColor: joueur.couleur_avatar,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#185FA5' }}>
                {joueur.prenom[0]}{joueur.nom[0]}
              </Text>
            </View>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#1a1a2e' }}>
              {joueur.prenom} {joueur.nom}
            </Text>
            <Text style={{ fontSize: 12, color: '#999' }}>
              {'★'.repeat(joueur.note_moyenne)}{'☆'.repeat(5 - joueur.note_moyenne)}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/joueurs/new?groupeId=${id}`)}
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 8,
            alignSelf: 'center',
          }}
        >
          <Plus size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
            Ajouter un joueur
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/tirage/selection?groupeId=${id}`)}
          style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 8,
            alignSelf: 'center',
            borderWidth: 0.5,
            borderColor: 'rgba(0,0,0,0.1)',
          }}
        >
          <Play size={16} color="#1a1a2e" />
          <Text style={{ color: '#1a1a2e', fontSize: 13, fontWeight: '500' }}>
            Générer les équipes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}