import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Platform, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { alignSelf, arrow, textAlign, row } from '../../lib/rtl'

const CLE_PRENOM = 'profil_prenom'
const CLE_NOM = 'profil_nom'

export default function Profil() {
  const router = useRouter()
  const { t, isRTL } = useLanguage()
  const { colors } = useTheme()
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [sauvegarde, setSauvegarde] = useState(false)

  useEffect(() => {
    chargerProfil()
  }, [])

  async function chargerProfil() {
    if (Platform.OS === 'web') {
      setPrenom(localStorage.getItem(CLE_PRENOM) || '')
      setNom(localStorage.getItem(CLE_NOM) || '')
    } else {
      setPrenom((await AsyncStorage.getItem(CLE_PRENOM)) || '')
      setNom((await AsyncStorage.getItem(CLE_NOM)) || '')
    }
  }

  async function handleSauvegarder() {
    if (!prenom.trim() && !nom.trim()) {
      const msg = t('enterNameMsg')
      if (Platform.OS === 'web') window.alert(msg)
      else Alert.alert(t('fieldRequired'), msg)
      return
    }

    setLoading(true)
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(CLE_PRENOM, prenom.trim())
        localStorage.setItem(CLE_NOM, nom.trim())
      } else {
        await AsyncStorage.setItem(CLE_PRENOM, prenom.trim())
        await AsyncStorage.setItem(CLE_NOM, nom.trim())
      }
      setSauvegarde(true)
      setTimeout(() => setSauvegarde(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?'

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 44, paddingHorizontal: 20,
        paddingBottom: 32, borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22, alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: alignSelf(isRTL), marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 22 }}>{arrow(isRTL)}</Text>
        </TouchableOpacity>

        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
          marginBottom: 12,
        }}>
          <Text style={{ fontSize: 22, fontWeight: '600', color: '#fff' }}>
            {initiales}
          </Text>
        </View>

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>
          {prenom || nom ? `${prenom} ${nom}`.trim() : t('yourProfileTitle')}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
          {t('yourProfile')}
        </Text>
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{
          fontSize: 11, fontWeight: '500', color: colors.sectionLabel,
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
          textAlign: textAlign(isRTL),
        }}>
          {t('personalInfo')}
        </Text>

        <View style={{ flexDirection: row(isRTL), gap: 10, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6, textAlign: textAlign(isRTL) }}>{t('firstName')}</Text>
            <TextInput
              value={prenom}
              onChangeText={setPrenom}
              placeholder={t('yourFirstName')}
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.card, borderRadius: 12,
                padding: 13, fontSize: 14, color: colors.text,
                borderWidth: 0.5, borderColor: colors.border,
                textAlign: textAlign(isRTL),
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6, textAlign: textAlign(isRTL) }}>{t('lastName')}</Text>
            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder={t('yourLastName')}
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: colors.card, borderRadius: 12,
                padding: 13, fontSize: 14, color: colors.text,
                borderWidth: 0.5, borderColor: colors.border,
                textAlign: textAlign(isRTL),
              }}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSauvegarder}
          disabled={loading}
          style={{
            backgroundColor: sauvegarde ? '#2d8a4e' : colors.header,
            borderRadius: 14, padding: 14, alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
            {sauvegarde ? t('saved') : loading ? t('saving') : t('saveProfile')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
