import { useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { cacheInvalidate } from '../../../lib/cache'
import { Qualites } from '../../../types'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { textAlign, arrow } from '../../../lib/rtl'

const POSTES: Record<string, string[]> = {
  Football:   ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'],
  Basketball: ['Meneur', 'Ailier', 'Pivot', 'Arrière'],
  Volleyball: ['Passeur', 'Libéro', 'Attaquant', 'Défenseur'],
  Tennis:     ['Joueur'],
  Rugby:      ['Avant', 'Demi', 'Trois-quarts', 'Arrière'],
  Autre:      ['Titulaire', 'Remplaçant'],
}

const SPORT_EMOJI: Record<string, string> = {
  Football:   '⚽',
  Basketball: '🏀',
  Volleyball: '🏐',
  Tennis:     '🎾',
  Rugby:      '🏉',
  Autre:      '🏟️',
}

const QUALITES_KEYS: { key: keyof Qualites; tKey: string; emoji: string }[] = [
  { key: 'vitesse',   tKey: 'qualityVitesse',   emoji: '⚡' },
  { key: 'precision', tKey: 'qualityPrecision', emoji: '🎯' },
  { key: 'physique',  tKey: 'qualityPhysique',  emoji: '💪' },
  { key: 'vision',    tKey: 'qualityVision',    emoji: '🧠' },
  { key: 'defense',   tKey: 'qualityDefense',   emoji: '🛡️' },
  { key: 'technique', tKey: 'qualityTechnique', emoji: '⚽' },
]

const DEFAULT_QUALITES: Qualites = { vitesse: 3, precision: 3, physique: 3, vision: 3, defense: 3, technique: 3 }

function moyenne(q: Qualites): number {
  const vals = Object.values(q)
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
}

export default function EditJoueur() {
  const router = useRouter()
  const { id, from, groupeId } = useLocalSearchParams()
  const { t, isRTL } = useLanguage()
  const { colors } = useTheme()

  const [username, setUsername] = useState('')
  const [sport, setSport] = useState('Football')
  const [poste, setPoste] = useState('')
  const [qualites, setQualites] = useState<Qualites>({ ...DEFAULT_QUALITES })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchJoueur()
    }, [id])
  )

  async function fetchJoueur() {
    const { data } = await supabase
      .from('joueurs')
      .select('*, groupes(sport)')
      .eq('id', id)
      .single()

    if (data) {
      setUsername(data.prenom)
      setPoste(data.poste || '')

      // Sport hérité du groupe
      if (data.groupes?.sport) setSport(data.groupes.sport)

      if (data.qualites) {
        setQualites({ ...DEFAULT_QUALITES, ...data.qualites })
      } else {
        const rounded = Math.round(data.note_moyenne) || 3
        setQualites({ vitesse: rounded, precision: rounded, physique: rounded, vision: rounded, defense: rounded, technique: rounded })
      }
    }
  }

  function setQ(key: keyof Qualites, val: number) {
    setQualites(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!username.trim()) {
      setError(t('fieldRequired'))
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase
        .from('joueurs')
        .update({
          prenom: username.trim(),
          nom: '',
          poste,
          qualites,
          note_moyenne: moyenne(qualites),
        })
        .eq('id', id)
      if (error) throw error
      cacheInvalidate('joueurs:')
      router.replace(`/(tabs)/joueurs/${id}${from === 'groupe' && groupeId ? `?from=groupe&groupeId=${groupeId}` : ''}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const postes = POSTES[sport] || POSTES.Autre

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500', textAlign: textAlign(isRTL) }}>
          {t('editPlayer')}
        </Text>
        {/* Sport badge — hérité du groupe */}
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6 }}>
          {SPORT_EMOJI[sport] ?? '🏟️'} {sport}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* Nom */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sectionLabel, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20, textAlign: textAlign(isRTL) }}>
          {t('firstName')}
        </Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder={t('firstName')}
          placeholderTextColor={colors.textPlaceholder}
          style={{
            backgroundColor: colors.inputBg, borderRadius: 12,
            padding: 12, fontSize: 14, color: colors.text,
            borderWidth: 1, borderColor: colors.borderStrong,
            marginBottom: 20,
            textAlign: textAlign(isRTL),
          }}
        />

        {/* Poste — basé sur le sport du groupe */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sectionLabel, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 20 }}>
          {t('position')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {postes.map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => setPoste(p)}
              style={{
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                backgroundColor: poste === p ? '#2563eb' : colors.card,
                borderWidth: 1,
                borderColor: poste === p ? '#2563eb' : colors.borderStrong,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '500', color: poste === p ? '#fff' : colors.textSecondary }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Qualités */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: colors.sectionLabel, textTransform: 'uppercase', letterSpacing: 1 }}>
            {t('qualities')}
          </Text>
          <View style={{ backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#2563eb' }}>
              {t('avgLabel')} {moyenne(qualites).toFixed(1)} / 5
            </Text>
          </View>
        </View>

        <View style={{
          backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 24,
          shadowColor: '#0f172a', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
        }}>
          {QUALITES_KEYS.map((q, idx) => (
            <View key={q.key} style={{ marginBottom: idx < QUALITES_KEYS.length - 1 ? 16 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 15, marginRight: 6 }}>{q.emoji}</Text>
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: colors.text }}>{t(q.tKey)}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>{qualites[q.key]} / 5</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setQ(q.key, n)}
                    style={{
                      flex: 1, height: 8, borderRadius: 4,
                      backgroundColor: n <= qualites[q.key] ? '#2563eb' : colors.borderStrong,
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {error ? (
          <Text style={{ color: colors.danger, fontSize: 12, marginBottom: 12 }}>{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={{
            backgroundColor: '#2563eb',
            borderRadius: 14, padding: 14,
            alignItems: 'center',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
            {loading ? t('saving') : t('save')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}
