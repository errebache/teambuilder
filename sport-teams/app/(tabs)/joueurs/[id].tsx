import { useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { Joueur, Avis, Qualites } from '../../../types'
import { Trash2, Pencil } from 'lucide-react-native'
import { getPlayerInitials } from '../../../lib/supabase'

const TAGS_DEF = [
  { key: 'Rapide',      emoji: '⚡' },
  { key: 'Technique',   emoji: '🎯' },
  { key: 'Défenseur',   emoji: '🛡️' },
  { key: 'Attaquant',   emoji: '🔥' },
  { key: 'Passeur',     emoji: '🤝' },
  { key: 'Buteur',      emoji: '⚽' },
  { key: 'Leader',      emoji: '👑' },
  { key: 'Régulier',    emoji: '📈' },
  { key: 'Combatif',    emoji: '💪' },
  { key: 'Fair-play',   emoji: '🤲' },
]

const QUALITES_DEF: { key: keyof Qualites; label: string; emoji: string }[] = [
  { key: 'vitesse',   label: 'Vitesse',        emoji: '⚡' },
  { key: 'precision', label: 'Précision',       emoji: '🎯' },
  { key: 'physique',  label: 'Physique',        emoji: '💪' },
  { key: 'vision',    label: 'Vision de jeu',   emoji: '🧠' },
  { key: 'defense',   label: 'Défense',         emoji: '🛡️' },
  { key: 'technique', label: 'Technique',       emoji: '⚽' },
]

export default function ProfilJoueur() {
  const router = useRouter()
  const { id, from, groupeId } = useLocalSearchParams()
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
    const { data } = await supabase.from('tirages').select('equipes')
    if (!data) return
    let matchs = 0
    data.forEach(tirage => {
      tirage.equipes.forEach((eq: any) => {
        if (eq.joueurs.some((j: any) => j.id === id)) matchs++
      })
    })
    setNbMatchs(matchs)
  }

  async function handleSupprimer() {
    const confirmer = (callback: () => void) => {
      if (Platform.OS === 'web') {
        if (window.confirm('Supprimer ce joueur ?')) callback()
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
      const { error } = await supabase.from('joueurs').delete().eq('id', id)
      if (!error) {
        if (from === 'groupe' && groupeId) {
          router.replace(`/(tabs)/groupes/${groupeId}`)
        } else {
          router.replace('/(tabs)/joueurs')
        }
      }
    })
  }

  if (!joueur) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF9' }}>
      <Text style={{ color: '#999' }}>Chargement...</Text>
    </View>
  )

  const moyenneAvis = avis.length > 0
    ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
    : joueur.note_moyenne
  const moyenneArrondie = Math.round(moyenneAvis * 10) / 10

  const initiales = getPlayerInitials(joueur.prenom, joueur.nom)
  const qualites = joueur.qualites

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>

      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        alignItems: 'center',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => {
            if (from === 'groupe' && groupeId) {
              router.replace(`/(tabs)/groupes/${groupeId}`)
            } else {
              router.replace('/(tabs)/joueurs')
            }
          }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/joueurs/edit?id=${id}${from === 'groupe' && groupeId ? `&from=groupe&groupeId=${groupeId}` : ''}`)}
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
            {initiales}
          </Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
          {joueur.prenom}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
          {joueur.poste || 'Joueur'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>{nbMatchs} matchs</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
              {'★'.repeat(Math.round(moyenneArrondie))} {moyenneArrondie.toFixed(1)}
            </Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>{avis.length} avis</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Matchs joués', value: nbMatchs },
            { label: 'Note moyenne', value: `${'★'.repeat(Math.round(moyenneArrondie))} ${moyenneArrondie.toFixed(1)}` },
            { label: 'Avis reçus', value: avis.length },
          ].map((stat, i) => (
            <View key={i} style={{
              flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12,
              alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
            }}>
              <Text style={{ fontSize: i === 1 ? 14 : 22, fontWeight: '500', color: i === 1 ? '#c8a400' : '#1a1a2e' }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 10, color: '#999', marginTop: 3, textAlign: 'center' }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Qualités */}
        {qualites && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Qualités
              </Text>
              <View style={{ backgroundColor: '#E6F1FB', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#185FA5' }}>
                  Moy. {joueur.note_moyenne.toFixed(1)} / 5
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)' }}>
              {QUALITES_DEF.map((q, idx) => (
                <View key={q.key} style={{ marginBottom: idx < QUALITES_DEF.length - 1 ? 14 : 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>{q.emoji}</Text>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#1a1a2e' }}>{q.label}</Text>
                    <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>{qualites[q.key]} / 5</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <View
                        key={n}
                        style={{
                          flex: 1, height: 6, borderRadius: 3,
                          backgroundColor: n <= qualites[q.key] ? '#1a1a2e' : '#E0DED6',
                        }}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Bouton laisser un avis */}
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/joueurs/avis?joueurId=${id}`)}
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 12, padding: 14,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>⭐ Laisser un avis</Text>
        </TouchableOpacity>

        {/* Liste des avis */}
        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
        }}>
          Avis des coéquipiers ({avis.length})
        </Text>

        {avis.length === 0 ? (
          <View style={{
            backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center',
            borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
          }}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>💬</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#1a1a2e' }}>Aucun avis pour l'instant</Text>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Sois le premier à noter ce joueur</Text>
          </View>
        ) : (
          avis.map(a => (
            <View key={a.id} style={{
              backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8,
              borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: '#F1EFE8', alignItems: 'center', justifyContent: 'center', marginRight: 8,
                }}>
                  <Text style={{ fontSize: 12 }}>👤</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 12, fontWeight: '500', color: '#1a1a2e' }}>
                  {a.auteur_id ? 'Coéquipier' : 'Anonyme'}
                </Text>
                <Text style={{ fontSize: 13 }}>
                  <Text style={{ color: '#c8a400' }}>{'★'.repeat(a.note)}</Text>
                  <Text style={{ color: '#E0DED6' }}>{'★'.repeat(5 - a.note)}</Text>
                </Text>
              </View>

              {a.tags && a.tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {a.tags.map((tag, i) => {
                    const def = TAGS_DEF.find(t => t.key === tag)
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E6F1FB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                        {def && <Text style={{ fontSize: 12 }}>{def.emoji}</Text>}
                        <Text style={{ fontSize: 11, color: '#185FA5', fontWeight: '500' }}>{tag}</Text>
                      </View>
                    )
                  })}
                </View>
              )}

              {a.commentaire ? (
                <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic', lineHeight: 18 }}>
                  "{a.commentaire}"
                </Text>
              ) : null}

              <Text style={{ fontSize: 10, color: '#bbb', marginTop: 6 }}>
                {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </Text>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  )
}
