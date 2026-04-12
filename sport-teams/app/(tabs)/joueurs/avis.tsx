import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { Joueur } from '../../../types'
import { row, textAlign, alignSelf, arrow } from '../../../lib/rtl'

export default function LaisserAvis() {
  const router = useRouter()
  const { joueurId } = useLocalSearchParams()
  const { t, isRTL } = useLanguage()

  const TAGS_DISPONIBLES = [
    { key: 'Rapide',      emoji: '⚡', label: t('tagRapide') },
    { key: 'Technique',   emoji: '🎯', label: t('tagTechnique') },
    { key: 'Défenseur',   emoji: '🛡️', label: t('tagDefenseur') },
    { key: 'Attaquant',   emoji: '🔥', label: t('tagAttaquant') },
    { key: 'Passeur',     emoji: '🤝', label: t('tagPasseur') },
    { key: 'Buteur',      emoji: '⚽', label: t('tagButeur') },
    { key: 'Leader',      emoji: '👑', label: t('tagLeader') },
    { key: 'Régulier',    emoji: '📈', label: t('tagRegulier') },
    { key: 'Combatif',    emoji: '💪', label: t('tagAgressif') },
    { key: 'Fair-play',   emoji: '🤲', label: t('tagFairPlay') },
  ]
  const { colors } = useTheme()

  const [joueur, setJoueur] = useState<Joueur | null>(null)
  const [note, setNote] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [commentaire, setCommentaire] = useState('')
  const [loading, setLoading] = useState(false)
  const [dejaNote, setDejaNote] = useState(false)

  useEffect(() => {
    fetchJoueur()
    verifierDejaNote()
  }, [joueurId])

  async function fetchJoueur() {
    const { data } = await supabase
      .from('joueurs')
      .select('*')
      .eq('id', joueurId)
      .single()
    if (data) setJoueur(data)
  }

  async function verifierDejaNote() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('avis')
      .select('id')
      .eq('joueur_id', joueurId)
      .eq('auteur_id', user.id)
      .single()
    if (data) setDejaNote(true)
  }

  function toggleTag(tag: string) {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSoumettre() {
    if (note === 0) {
      const msg = t('ratingRequired')
      if (Platform.OS === 'web') window.alert(msg)
      else Alert.alert(t('rating'), msg)
      return
    }

    setLoading(true)
    try {
      let { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const { data } = await supabase.auth.signInAnonymously()
        user = data.user
      }

      const { error } = await supabase.from('avis').insert({
        joueur_id: joueurId,
        auteur_id: user?.id,
        note,
        tags,
        commentaire: commentaire.trim() || null,
      })

      if (error) throw error

      const { data: tousAvis } = await supabase
        .from('avis')
        .select('note')
        .eq('joueur_id', joueurId)

      if (tousAvis && tousAvis.length > 0) {
        const moyenne = tousAvis.reduce((sum, a) => sum + a.note, 0) / tousAvis.length
        await supabase
          .from('joueurs')
          .update({ note_moyenne: Math.round(moyenne * 10) / 10 })
          .eq('id', joueurId)
      }

      const msg = t('reviewSaved')
      if (Platform.OS === 'web') {
        window.alert(msg)
        router.back()
      } else {
        Alert.alert(t('thankYouTitle'), msg, [{ text: 'OK', onPress: () => router.back() }])
      }
    } catch (e: any) {
      const msg = e.message || t('error')
      if (Platform.OS === 'web') window.alert(msg)
      else Alert.alert(t('error'), msg)
    } finally {
      setLoading(false)
    }
  }

  if (!joueur) return <View style={{ flex: 1, backgroundColor: colors.header }} />

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignSelf: alignSelf(isRTL), marginBottom: 16 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>

        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: joueur.couleur_avatar,
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
          marginBottom: 10,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#2563eb' }}>
            {joueur.prenom.substring(0, 2).toUpperCase() || '?'}
          </Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>
          {joueur.prenom}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
          {t('leaveReviewSubtitle')}
        </Text>
      </View>

      {dejaNote ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>✅</Text>
          <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text, textAlign: 'center' }}>
            {t('alreadyReviewed')}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
            {t('oneReviewOnly')}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 24,
              backgroundColor: colors.header,
              borderRadius: 14, paddingVertical: 12,
              paddingHorizontal: 32,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>{t('backBtn')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>

          {/* ── Note ── */}
          <Text style={{
            fontSize: 11, fontWeight: '500', color: colors.sectionLabel,
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
            textAlign: textAlign(isRTL),
          }}>
            {t('overallRating')}
          </Text>
          <View style={{ flexDirection: row(isRTL), justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setNote(n)}>
                <Text style={{ fontSize: 36, opacity: n <= note ? 1 : 0.25 }}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Tags ── */}
          <Text style={{
            fontSize: 11, fontWeight: '500', color: colors.sectionLabel,
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
            textAlign: textAlign(isRTL),
          }}>
            {t('qualitiesOptional')}
          </Text>
          <View style={{ flexDirection: row(isRTL), flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {TAGS_DISPONIBLES.map(tag => {
              const selectionne = tags.includes(tag.key)
              return (
                <TouchableOpacity
                  key={tag.key}
                  onPress={() => toggleTag(tag.key)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: selectionne ? colors.header : colors.card,
                    borderWidth: 0.5,
                    borderColor: selectionne ? colors.header : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14 }}>{tag.emoji}</Text>
                  <Text style={{
                    fontSize: 13, fontWeight: '500',
                    color: selectionne ? '#fff' : colors.textSecondary,
                  }}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* ── Commentaire ── */}
          <Text style={{
            fontSize: 11, fontWeight: '500', color: colors.sectionLabel,
            textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
            textAlign: textAlign(isRTL),
          }}>
            {t('commentOptional')}
          </Text>
          <TextInput
            value={commentaire}
            onChangeText={setCommentaire}
            placeholder={t('commentPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={300}
            style={{
              backgroundColor: colors.card,
              borderRadius: 14,
              padding: 14,
              fontSize: 14,
              color: colors.text,
              borderWidth: 0.5,
              borderColor: colors.border,
              minHeight: 100,
              textAlignVertical: 'top',
              marginBottom: 8,
              textAlign: textAlign(isRTL),
            }}
          />
          <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: isRTL ? 'left' : 'right', marginBottom: 24 }}>
            {commentaire.length}/300
          </Text>

          {/* ── Bouton soumettre ── */}
          <TouchableOpacity
            onPress={handleSoumettre}
            disabled={loading || note === 0}
            style={{
              backgroundColor: note > 0 ? colors.header : colors.border,
              borderRadius: 14, padding: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>
              {loading ? t('sending') : t('sendReview')}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      )}
    </View>
  )
}
