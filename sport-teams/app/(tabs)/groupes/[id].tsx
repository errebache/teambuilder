import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Share } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { Plus, Play, Trash2, Copy } from 'lucide-react-native'
import { useCallback, useState, useEffect } from 'react'
import { useJoueurs } from '../../../hooks/useJoueurs'
import { supabase } from '../../../lib/supabase'
import { Groupe } from '../../../types'

export default function DetailGroupe() {
  const router = useRouter()
  const { id, nouveauMembre } = useLocalSearchParams()
  const { joueurs, hasFetched, fetchJoueurs } = useJoueurs(id as string)
  const [groupe, setGroupe] = useState<Groupe | null>(null)

  useFocusEffect(
    useCallback(() => {
      fetchJoueurs()
      fetchGroupe()
    }, [id])
  )

  // Attendre que le fetch soit terminé avant de montrer le dialog
  useEffect(() => {
    if (nouveauMembre !== 'true') return
    if (!hasFetched) return
    const message = joueurs.length === 0
      ? 'Ce groupe n\'a pas encore de joueurs. Ajoute-toi le premier !'
      : 'Bienvenue ! Veux-tu t\'ajouter comme joueur ?'
    if (Platform.OS === 'web') {
      const ok = window.confirm(message + '\n\nT\'ajouter maintenant ?')
      if (ok) router.push(`/(tabs)/joueurs/new?groupeId=${id}`)
    } else {
      Alert.alert(
        'Bienvenue ! 🎉',
        message,
        [
          { text: 'Plus tard', style: 'cancel' },
          {
            text: 'M\'ajouter',
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

  async function handlePartagerCode() {
    if (!groupe?.code) return
    if (Platform.OS === 'web') {
      window.navigator.clipboard.writeText(groupe.code)
      window.alert('Code copié : ' + groupe.code)
    } else {
      await Share.share({
        message: `Rejoins mon groupe "${groupe.nom}" sur Sport Teams !\n\nCode d'invitation : ${groupe.code}`,
      })
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9', paddingBottom: 80 }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
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

        {groupe?.code && (
          <TouchableOpacity
            onPress={handlePartagerCode}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(255,255,255,0.15)',
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
              onPress={() => router.push(`/(tabs)/joueurs/${joueur.id}?from=groupe&groupeId=${id}`)}
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
                  {joueur.prenom.substring(0,2).toUpperCase()}
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

      </ScrollView>

      {/* Boutons fixes en bas */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', gap: 10,
        padding: 16, backgroundColor: '#FAFAF9',
        borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.07)',
      }}>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/joueurs/new?groupeId=${id}`)}
          style={{
            flex: 1, backgroundColor: '#1a1a2e',
            borderRadius: 14, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Plus size={15} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>Ajouter un joueur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/tirage/selection?groupeId=${id}`)}
          disabled={joueurs.length < 4}
          style={{
            flex: 1, backgroundColor: joueurs.length >= 4 ? '#1DB954' : '#ccc',
            borderRadius: 14, paddingVertical: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <Play size={15} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
            {joueurs.length < 4 ? `Encore ${4 - joueurs.length}` : 'Générer les équipes'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}