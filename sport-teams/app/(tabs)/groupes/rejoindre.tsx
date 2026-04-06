import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../../lib/supabase'

export default function RejoindreGroupe() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

    async function handleRejoindre() {
    if (code.length < 4) {
        setError('Entre un code valide')
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
        setError('Code invalide — vérifie et réessaie')
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
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 32,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: 20 }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 40, marginBottom: 12 }}>🔑</Text>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
          Rejoindre un groupe
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
          Entre le code partagé par l'admin du groupe
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
          placeholderTextColor="#ccc"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={9}
          style={{
            backgroundColor: '#fff',
            borderRadius: 14,
            padding: 16,
            fontSize: 22,
            fontWeight: '500',
            color: '#1a1a2e',
            borderWidth: 0.5,
            borderColor: 'rgba(0,0,0,0.1)',
            textAlign: 'center',
            letterSpacing: 4,
            marginBottom: 12,
          }}
        />

        {error ? (
          <Text style={{ color: '#E24B4A', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleRejoindre}
          disabled={loading || code.length < 4}
          style={{
            backgroundColor: code.length >= 4 ? '#1a1a2e' : '#ccc',
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>
            {loading ? 'Recherche...' : 'Rejoindre'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}