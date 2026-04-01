import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { Plus, Play, Trash2 } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import { useJoueurs } from '../../../hooks/useJoueurs'
import { supabase } from '../../../lib/supabase'
import { Groupe } from '../../../types'

export default function DetailGroupe() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const { joueurs, fetchJoueurs } = useJoueurs(id as string)
  const [groupe, setGroupe] = useState<Groupe | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchJoueurs()
      fetchGroupe()
    }, [id])
  )

  // async function handleSupprimer() {
  //   console.log('test')
  //   Alert.alert(
  //     'Supprimer le groupe',
  //     'Tu vas supprimer ce groupe et tous ses joueurs. Cette action est irréversible.',
  //     [
  //       { text: 'Annuler', style: 'cancel' },
  //       {
  //         text: 'Supprimer',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             // Supprimer d'abord les joueurs
  //             await supabase
  //               .from('joueurs')
  //               .delete()
  //               .eq('groupe_id', id)

  //             // Puis supprimer le groupe
  //             const { error } = await supabase
  //               .from('groupes')
  //               .delete()
  //               .eq('id', id)

  //             if (error) {
  //               console.log('Erreur suppression:', error)
  //               Alert.alert('Erreur', error.message)
  //               return
  //             }

  //             router.replace('/(tabs)/groupes')
  //           } catch (e: any) {
  //             console.log('Erreur:', e)
  //             Alert.alert('Erreur', e.message)
  //           }
  //         },
  //       },
  //     ]
  //   )
  // }

async function handleSupprimer() {
  console.log("web")
  const confirmer = (callback: () => void) => {
    if (Platform.OS === 'web') {
      const ok = window.confirm('Supprimer ce groupe et tous ses joueurs ?')
      if (ok) callback()
    } else {
      Alert.alert(
        'Supprimer le groupe',
        'Tu vas supprimer ce groupe et tous ses joueurs. Cette action est irréversible.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: callback },
        ]
      )
    }
  }

  confirmer(async () => {
    await supabase.from('joueurs').delete().eq('groupe_id', id)
    const { error } = await supabase.from('groupes').delete().eq('id', id)
    if (!error) router.replace('/(tabs)/groupes')
  })
}

  async function fetchGroupe() {
    const { data } = await supabase
      .from('groupes')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setGroupe(data)
  }

  // async function handleSupprimer() {
  //   Alert.alert(
  //     'Supprimer le groupe',
  //     'Tu vas supprimer ce groupe et tous ses joueurs. Cette action est irréversible.',
  //     [
  //       { text: 'Annuler', style: 'cancel' },
  //       {
  //         text: 'Supprimer',
  //         style: 'destructive',
  //         onPress: async () => {
  //           await supabase.from('groupes').delete().eq('id', id)
  //           router.replace('/(tabs)/groupes')
  //         },
  //       },
  //     ]
  //   )
  // }

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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/groupes')}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleSupprimer}>
            <Trash2 size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          {groupe ? `${groupe.emoji} ${groupe.nom}` : '...'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {joueurs.length} joueurs · {groupe?.sport || ''}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
        }}>
          Joueurs
        </Text>

        {joueurs.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
            <Text style={{ fontSize: 13, color: '#999' }}>
              Aucun joueur — ajoute le premier !
            </Text>
          </View>
        ) : (
          joueurs.map(joueur => (
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
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#1a1a2e' }}>
                  {joueur.prenom} {joueur.nom}
                </Text>
                <Text style={{ fontSize: 11, color: '#999', marginTop: 1 }}>
                  {joueur.poste || 'Joueur'}
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: '#999' }}>
                {'★'.repeat(Math.round(joueur.note_moyenne))}
              </Text>
            </TouchableOpacity>
          ))
        )}

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
          disabled={joueurs.length < 4}
          style={{
            backgroundColor: joueurs.length >= 4 ? '#fff' : '#f5f5f5',
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
            opacity: joueurs.length >= 4 ? 1 : 0.5,
          }}
        >
          <Play size={16} color="#1a1a2e" />
          <Text style={{ color: '#1a1a2e', fontSize: 13, fontWeight: '500' }}>
            {joueurs.length < 4
              ? `Encore ${4 - joueurs.length} joueur(s)`
              : 'Générer les équipes'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}