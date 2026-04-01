import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { Joueur, Avis } from '../../../types'
import { Trash2, Pencil } from 'lucide-react-native'

export default function ProfilJoueur() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [avis, setAvis] = useState<Avis[]>([])
  const [nbMatchs, setNbMatchs] = useState(0)

  useFocusEffect(
    useCallback(() => {
      fetchJoueur()
      fetchAvis()
      fetchMatchs()
    }, [id])
  )

  async function fetchJoueur() {
    const { data } = await supabase
      .from('joueurs')
      .select('*')
      .eq('id', id)
      .single()
    if (data) setJoueur(data)
  }

  async function fetchAvis() {
    const { data } = await supabase
      .from('avis')
      .select('*')
      .eq('joueur_id', id)
      .order('created_at', { ascending: false })
    if (data) setAvis(data)
  }

  async function fetchMatchs() {
    const { data } = await supabase
      .from('tirages')
      .select('equipes')
    if (!data) return
    let matchs = 0
    data.forEach(tirage => {
      tirage.equipes.forEach((eq: any) => {
        const estDedans = eq.joueurs.some((j: any) => j.id === id)
        if (estDedans) matchs++
      })
    })
    setNbMatchs(matchs)
  }

  async function handleSupprimer() {
    const confirmer = (callback: () => void) => {
      if (Platform.OS === 'web') {
        const ok = window.confirm('Supprimer ce joueur ?')
        if (ok) callback()
      } else {
        Alert.alert(
          'Supprimer le joueur',
          'Cette action est irréversible.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Supprimer', style: 'destructive', onPress: callback },
          ]
        )
      }
    }

    confirmer(async () => {
      const { error } = await supabase
        .from('joueurs')
        .delete()
        .eq('id', id)
      if (!error) router.back()
    })
  }

  if (!joueur) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF9' }}>
      <Text style={{ color: '#999' }}>Chargement...</Text>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>

      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        alignItems: 'center',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/joueurs/edit?id=${id}`)}
            style={{ marginRight: 16 }}
          >
            <Pencil size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSupprimer}>
            <Trash2 size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: joueur.couleur_avatar,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 22, fontWeight: '500', color: '#185FA5' }}>
            {joueur.prenom[0]}{joueur.nom[0]}
          </Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          {joueur.prenom} {joueur.nom}
        </Text>

        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {joueur.poste || 'Joueur'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20,
          }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
              {nbMatchs} matchs
            </Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20,
          }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
              ★ {joueur.note_moyenne.toFixed(1)}
            </Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            paddingHorizontal: 14, paddingVertical: 5,
            borderRadius: 20,
          }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
              {avis.length} avis
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Matchs joués', value: nbMatchs },
            { label: 'Note moyenne', value: joueur.note_moyenne.toFixed(1) },
            { label: 'Avis reçus', value: avis.length },
          ].map((stat, i) => (
            <View key={i} style={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              alignItems: 'center',
              borderWidth: 0.5,
              borderColor: 'rgba(0,0,0,0.07)',
            }}>
              <Text style={{ fontSize: 22, fontWeight: '500', color: '#1a1a2e' }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 10, color: '#999', marginTop: 3, textAlign: 'center' }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
        }}>
          Avis des coéquipiers ({avis.length})
        </Text>

        {avis.length === 0 ? (
          <View style={{
            backgroundColor: '#fff', borderRadius: 12,
            padding: 24, alignItems: 'center',
            borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
          }}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>💬</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#1a1a2e' }}>
              Aucun avis pour l'instant
            </Text>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              Partage le lien de notation à tes coéquipiers
            </Text>
          </View>
        ) : (
          avis.map(a => (
            <View key={a.id} style={{
              backgroundColor: '#fff', borderRadius: 12,
              padding: 12, marginBottom: 8,
              borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: '#F1EFE8',
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 8,
                }}>
                  <Text style={{ fontSize: 12 }}>👤</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#1a1a2e' }}>
                  {a.auteur_id ? 'Coéquipier' : 'Anonyme'}
                </Text>
                <Text style={{ fontSize: 13, color: '#1a1a2e' }}>
                  {'★'.repeat(a.note)}
                  <Text style={{ color: '#E0DED6' }}>{'★'.repeat(5 - a.note)}</Text>
                </Text>
              </View>

              {a.tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                  {a.tags.map((tag, i) => (
                    <View key={i} style={{
                      backgroundColor: '#E6F1FB',
                      paddingHorizontal: 8, paddingVertical: 2,
                      borderRadius: 20,
                    }}>
                      <Text style={{ fontSize: 10, color: '#185FA5', fontWeight: '500' }}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {a.commentaire ? (
                <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic', lineHeight: 18 }}>
                  "{a.commentaire}"
                </Text>
              ) : null}

              <Text style={{ fontSize: 10, color: '#bbb', marginTop: 6 }}>
                {new Date(a.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long'
                })}
              </Text>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  )
}