import { useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { getRandomAvatarColor } from '../../../lib/supabase'
import { supabase } from '../../../lib/supabase'
import { cacheInvalidate } from '../../../lib/cache'
import { Qualites } from '../../../types'
import { useLanguage } from '../../../contexts/LanguageContext'
import { textAlign, arrow } from '../../../lib/rtl'

const POSTES: Record<string, string[]> = {
  Football: ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'],
  Basketball: ['Meneur', 'Ailier', 'Pivot', 'Arrière'],
  Volleyball: ['Passeur', 'Libéro', 'Attaquant', 'Défenseur'],
  Tennis: ['Joueur'],
  Rugby: ['Avant', 'Demi', 'Trois-quarts', 'Arrière'],
  Autre: ['Titulaire', 'Remplaçant'],
}

const SPORTS = Object.keys(POSTES)

const QUALITES_DEF: { key: keyof Qualites; label: string; emoji: string }[] = [
  { key: 'vitesse',   label: 'Vitesse',        emoji: '⚡' },
  { key: 'precision', label: 'Précision',       emoji: '🎯' },
  { key: 'physique',  label: 'Physique',        emoji: '💪' },
  { key: 'vision',    label: 'Vision de jeu',   emoji: '🧠' },
  { key: 'defense',   label: 'Défense',         emoji: '🛡️' },
  { key: 'technique', label: 'Technique',       emoji: '⚽' },
]

const DEFAULT_QUALITES: Qualites = { vitesse: 3, precision: 3, physique: 3, vision: 3, defense: 3, technique: 3 }

function moyenne(q: Qualites): number {
  const vals = Object.values(q)
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export default function NewJoueur() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const { groupeId } = useLocalSearchParams()
  const [username, setUsername] = useState('')
  const [sport, setSport] = useState('Football')
  const [poste, setPoste] = useState('')
  const [qualites, setQualites] = useState<Qualites>({ ...DEFAULT_QUALITES })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setUsername('')
      setSport('Football')
      setPoste('')
      setQualites({ ...DEFAULT_QUALITES })
      setError('')
    }, [])
  )

  function setQ(key: keyof Qualites, val: number) {
    setQualites(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    if (!username.trim()) { setError('Nom du joueur requis'); return }
    if (!poste) { setError('Choisis un poste'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('joueurs').insert({
        prenom: username.trim(),
        nom: '',
        note_moyenne: moyenne(qualites),
        poste,
        couleur_avatar: getRandomAvatarColor(),
        groupe_id: groupeId,
        qualites,
      })
      if (error) throw error
      cacheInvalidate(`joueurs:${groupeId}`)
      router.replace(`/(tabs)/groupes/${groupeId}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const initiales = username.trim().substring(0, 2).toUpperCase()

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{
        backgroundColor: '#1e3a5f',
        paddingTop: 48, paddingHorizontal: 20, paddingBottom: 28,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500', textAlign: textAlign(isRTL) }}>{t('addPlayer')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Avatar preview */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 32,
            backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: '#bfdbfe', borderStyle: 'dashed',
          }}>
            <Text style={{ fontSize: 20, fontWeight: '500', color: '#2563eb' }}>{initiales || '+'}</Text>
          </View>
        </View>

        {/* Nom */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20, textAlign: textAlign(isRTL) }}>
          {t('firstName')}
        </Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder={t('firstName')}
          placeholderTextColor="#94a3b8"
          style={{
            backgroundColor: '#ffffff', borderRadius: 12,
            padding: 12, fontSize: 14, color: '#0f172a',
            borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20,
            textAlign: textAlign(isRTL),
          }}
        />

        {/* Qualités */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            Qualités
          </Text>
          <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#2563eb' }}>
              Moy. {moyenne(qualites).toFixed(1)} / 5
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 20,
          shadowColor: '#0f172a', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        }}>
          {QUALITES_DEF.map((q, idx) => (
            <View key={q.key} style={{ marginBottom: idx < QUALITES_DEF.length - 1 ? 16 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 15, marginRight: 6 }}>{q.emoji}</Text>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#0f172a' }}>{q.label}</Text>
                <Text style={{ fontSize: 12, color: '#64748b' }}>{qualites[q.key]} / 5</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setQ(q.key, n)}
                    style={{
                      flex: 1, height: 8, borderRadius: 4,
                      backgroundColor: n <= qualites[q.key] ? '#2563eb' : '#e2e8f0',
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Sport */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20 }}>
          {t('sport')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SPORTS.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => { setSport(s); setPoste('') }}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: sport === s ? '#2563eb' : '#ffffff',
                borderWidth: 1, borderColor: sport === s ? '#2563eb' : '#e2e8f0',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: sport === s ? '#fff' : '#64748b' }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Poste */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20 }}>
          {t('position')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {(POSTES[sport] || POSTES.Autre).map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => setPoste(p)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                backgroundColor: poste === p ? '#2563eb' : '#ffffff',
                borderWidth: 1, borderColor: poste === p ? '#2563eb' : '#e2e8f0',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: poste === p ? '#fff' : '#64748b' }}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{ backgroundColor: '#2563eb', borderRadius: 14, padding: 14, alignItems: 'center', opacity: loading ? 0.6 : 1 }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
            {loading ? t('addPlayerLoading') : t('addPlayer')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
