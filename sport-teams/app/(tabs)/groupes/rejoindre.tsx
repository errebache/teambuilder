import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../../lib/supabase'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTheme } from '../../../contexts/ThemeContext'
import { textAlign, arrow } from '../../../lib/rtl'

export default function RejoindreGroupe() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const { colors } = useTheme()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

    async function handleRejoindre() {
    if (code.length < 4) {
        setError(t('validCode'))
        return
    }

    setLoading(true)
    setError('')

    try {
        const { data, error } = await supabase
        .from('groupes')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .single()

        if (error || !data) {
        setError(t('invalidCode'))
        return
        }

        // ✅ AJOUTE ICI
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('membres').upsert({
        groupe_id: data.id,
        user_id: user?.id,
        })

        // Redirection
        router.replace(`/(tabs)/groupes/${data.id}?nouveauMembre=true`)

    } catch (e: any) {
        setError(e.message)
    } finally {
        setLoading(false)
    }
    }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: 20 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔑</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
          {t('joinGroup')}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
          {t('enterCode')}
        </Text>
      </View>

      <View style={{ padding: 24 }}>
        <TextInput
          value={code}
          onChangeText={text => {
            setCode(text.toUpperCase())
            setError('')
          }}
          placeholder="Ex: ABCD-EFGH"
          placeholderTextColor={colors.textPlaceholder}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={9}
          style={{
            backgroundColor: colors.inputBg,
            borderRadius: 14,
            padding: 16,
            fontSize: 24,
            fontWeight: '500',
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            textAlign: 'center',
            letterSpacing: 6,
            marginBottom: 12,
          }}
        />

        {error ? (
          <Text style={{ color: colors.danger, fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleRejoindre}
          disabled={loading || code.length < 4}
          style={{
            backgroundColor: code.length >= 4 ? '#2563eb' : colors.tag,
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: code.length >= 4 ? '#fff' : colors.textMuted, fontSize: 15, fontWeight: '500' }}>
            {loading ? t('searching') : t('join')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
