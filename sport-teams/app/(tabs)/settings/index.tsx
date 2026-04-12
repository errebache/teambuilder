import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Pressable, Alert, Platform } from 'react-native'
import { useState } from 'react'
import { Bell, Check, ChevronDown, Trash2 } from 'lucide-react-native'
import { useLanguage, LangCode } from '../../../contexts/LanguageContext'
import { useTheme, ThemeMode } from '../../../contexts/ThemeContext'
import { supabase } from '../../../lib/supabase'
import { cacheClear } from '../../../lib/cache'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { row, textAlign } from '../../../lib/rtl'

const LANGUES: { code: LangCode; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',   flag: '🇸🇦' },
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
]

const THEME_EMOJIS: Record<ThemeMode, string> = {
  light: '☀️',
  dark: '🌙',
  system: '⚙️',
}

type SelectOption<T extends string> = { value: T; label: string; left?: string }

function SelectRow<T extends string>({
  label,
  icon,
  iconBg,
  options,
  value,
  onChange,
  isRTL,
}: {
  label: string
  icon: React.ReactNode
  iconBg: string
  options: SelectOption<T>[]
  value: T
  onChange: (v: T) => void
  isRTL: boolean
}) {
  const [open, setOpen] = useState(false)
  const { colors } = useTheme()
  const current = options.find(o => o.value === value)

  return (
    <>
      <TouchableOpacity
        style={{ flexDirection: row(isRTL), alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 }}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <View style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: iconBg,
          alignItems: 'center', justifyContent: 'center',
          marginEnd: 12,
        }}>
          {icon}
        </View>
        <Text style={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: '500', textAlign: textAlign(isRTL) }}>
          {label}
        </Text>
        <View style={{
          flexDirection: row(isRTL), alignItems: 'center', gap: 4,
          backgroundColor: colors.tag, borderRadius: 10,
          paddingHorizontal: 10, paddingVertical: 5,
        }}>
          {current?.left ? <Text style={{ fontSize: 13 }}>{current.left}</Text> : null}
          <Text style={{ fontSize: 13, color: colors.text, fontWeight: '500' }}>
            {current?.label ?? '—'}
          </Text>
          <ChevronDown size={12} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }} onPress={() => setOpen(false)}>
          <Pressable style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            width: '100%',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }} onPress={e => e.stopPropagation()}>
            <Text style={{
              fontSize: 13, fontWeight: '600', color: colors.sectionLabel,
              textTransform: 'uppercase', letterSpacing: 0.8,
              paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
              borderBottomWidth: 1, borderBottomColor: colors.borderStrong,
              textAlign: textAlign(isRTL),
            }}>{label}</Text>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => { onChange(opt.value); setOpen(false) }}
                style={[
                  { flexDirection: row(isRTL), alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
                  i < options.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.borderStrong } : {},
                ]}
                activeOpacity={0.7}
              >
                {opt.left ? (
                  <Text style={{ fontSize: 18, marginEnd: 10 }}>{opt.left}</Text>
                ) : null}
                <Text style={[
                  { flex: 1, fontSize: 15, color: colors.text, fontWeight: '400', textAlign: textAlign(isRTL) },
                  opt.value === value ? { color: '#2563eb', fontWeight: '600' } : {},
                ]}>
                  {opt.label}
                </Text>
                {opt.value === value && <Check size={15} color="#2563eb" />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

export default function Parametres() {
  const router = useRouter()
  const { lang, setLang, t, isRTL } = useLanguage()
  const { mode, setMode, colors } = useTheme()
  const [notifications, setNotifications] = useState(true)

  const langOptions: SelectOption<LangCode>[] = LANGUES.map(l => ({
    value: l.code, label: l.label, left: l.flag,
  }))
  const themeOptions: SelectOption<ThemeMode>[] = [
    { value: 'light',  label: t('themeLight'),  left: THEME_EMOJIS.light },
    { value: 'dark',   label: t('themeDark'),   left: THEME_EMOJIS.dark },
    { value: 'system', label: t('themeSystem'), left: THEME_EMOJIS.system },
  ]

  async function handleResetData() {
    const doReset = async () => {
      cacheClear()
      if (Platform.OS === 'web') {
        localStorage.clear()
      } else {
        await AsyncStorage.multiRemove(['hasLaunched', 'app_langue', 'app_theme'])
      }
      await supabase.auth.signOut()
      router.replace('/onboarding/slides')
    }

    if (Platform.OS === 'web') {
      const ok = window.confirm(t('resetApp') + ' ?')
      if (ok) await doReset()
    } else {
      Alert.alert(
        t('resetApp'),
        t('resetDesc'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: doReset },
        ]
      )
    }
  }

  const sectionLabelStyle = {
    fontSize: 11, fontWeight: '700' as const, color: colors.sectionLabel,
    textTransform: 'uppercase' as const, letterSpacing: 1,
    marginBottom: 10, marginTop: 20,
  }

  const cardStyle = {
    backgroundColor: colors.card, borderRadius: 16,
    overflow: 'hidden' as const, marginBottom: 16,
    shadowColor: '#0f172a', shadowOpacity: 0.06,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={{
        backgroundColor: colors.header,
        paddingTop: 28,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '600', textAlign: textAlign(isRTL) }}>
          {t('settings')}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, textAlign: textAlign(isRTL) }}>
          {t('preferences')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>

        {/* ── Préférences ── */}
        <Text style={[sectionLabelStyle, { textAlign: textAlign(isRTL), marginStart: 4, marginEnd: 0 }]}>
          {t('preferences')}
        </Text>
        <View style={cardStyle}>

          {/* Notifications row */}
          <View style={{ flexDirection: row(isRTL), alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginEnd: 12 }}>
              <Bell size={16} color="#2563eb" />
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: colors.text, fontWeight: '500', textAlign: textAlign(isRTL) }}>
              {t('notifications')}
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: '#2563eb', false: colors.switchTrackFalse }}
              thumbColor="#fff"
            />
          </View>

          <View style={{ height: 1, backgroundColor: colors.borderStrong, marginStart: 60 }} />

          <SelectRow
            label={t('language')}
            icon={<Text style={{ fontSize: 15 }}>🌐</Text>}
            iconBg={colors.tag}
            options={langOptions}
            value={lang}
            onChange={setLang}
            isRTL={isRTL}
          />

          <View style={{ height: 1, backgroundColor: colors.borderStrong, marginStart: 60 }} />

          <SelectRow
            label={t('appearance')}
            icon={<Text style={{ fontSize: 15 }}>🎨</Text>}
            iconBg={colors.tag}
            options={themeOptions}
            value={mode}
            onChange={setMode}
            isRTL={isRTL}
          />
        </View>

        {/* ── Zone danger ── */}
        <Text style={[sectionLabelStyle, { color: colors.danger, textAlign: textAlign(isRTL), marginStart: 4, marginEnd: 0 }]}>
          {t('danger')}
        </Text>
        <View style={cardStyle}>
          <TouchableOpacity
            onPress={handleResetData}
            style={{ flexDirection: row(isRTL), alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 16 }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={16} color="#ef4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: colors.danger, fontWeight: '600', textAlign: textAlign(isRTL) }}>
                {t('resetApp')}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: textAlign(isRTL) }}>
                {t('resetDesc')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}
