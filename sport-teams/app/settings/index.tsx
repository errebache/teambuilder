import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Bell, Trash2, X, Check, ChevronDown } from 'lucide-react-native'
import { useLanguage, LangCode } from '../../contexts/LanguageContext'
import { useTheme, ThemeMode } from '../../contexts/ThemeContext'

const LANGUES: { code: LangCode; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹' },
]

const THEMES: { mode: ThemeMode; label: string; emoji: string }[] = [
  { mode: 'light',  label: 'Clair',    emoji: '☀️' },
  { mode: 'dark',   label: 'Sombre',   emoji: '🌙' },
  { mode: 'system', label: 'Système',  emoji: '⚙️' },
]

type SelectOption<T extends string> = { value: T; label: string; left?: string }

function SelectRow<T extends string>({
  label,
  icon,
  iconBg,
  options,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  iconBg: string
  options: SelectOption<T>[]
  value: T
  onChange: (v: T) => void
}) {
  const [open, setOpen] = useState(false)
  const current = options.find(o => o.value === value)

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 4,
          backgroundColor: '#F1EFE8', borderRadius: 10,
          paddingHorizontal: 10, paddingVertical: 5,
        }}>
          {current?.left ? (
            <Text style={{ fontSize: 13 }}>{current.left}</Text>
          ) : null}
          <Text style={{ fontSize: 13, color: '#1a1a2e', fontWeight: '500' }}>
            {current?.label ?? '—'}
          </Text>
          <ChevronDown size={12} color="#888" />
        </View>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => { onChange(opt.value); setOpen(false) }}
                style={[
                  styles.sheetRow,
                  i < options.length - 1 && styles.sheetRowBorder,
                ]}
                activeOpacity={0.7}
              >
                {opt.left ? (
                  <Text style={{ fontSize: 18, marginRight: 10 }}>{opt.left}</Text>
                ) : null}
                <Text style={[
                  styles.sheetRowLabel,
                  opt.value === value && { color: '#185FA5', fontWeight: '600' },
                ]}>
                  {opt.label}
                </Text>
                {opt.value === value && (
                  <Check size={15} color="#185FA5" />
                )}
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
  const { lang, setLang } = useLanguage()
  const { mode, setMode } = useTheme()
  const [notifications, setNotifications] = useState(true)

  const langOptions: SelectOption<LangCode>[] = LANGUES.map(l => ({
    value: l.code, label: l.label, left: l.flag,
  }))

  const themeOptions: SelectOption<ThemeMode>[] = THEMES.map(t => ({
    value: t.mode, label: t.label, left: t.emoji,
  }))

  async function handleResetData() {
    const { error } = await supabase.auth.signOut()
    if (!error) router.replace('/onboarding/slides')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F4F0' }}>

      {/* Header */}
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>
            Paramètres
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>

        {/* ── Préférences ── */}
        <Text style={styles.sectionLabel}>Préférences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: '#E6F1FB' }]}>
              <Bell size={16} color="#185FA5" />
            </View>
            <Text style={styles.rowLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: '#1a1a2e', false: '#E0DED6' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.rowBorder} />

          <SelectRow
            label="Langue"
            icon={<Text style={{ fontSize: 15 }}>🌐</Text>}
            iconBg="#F5F4F0"
            options={langOptions}
            value={lang}
            onChange={setLang}
          />

          <View style={styles.rowBorder} />

          <SelectRow
            label="Apparence"
            icon={<Text style={{ fontSize: 15 }}>🎨</Text>}
            iconBg="#F5F4F0"
            options={themeOptions}
            value={mode}
            onChange={setMode}
          />
        </View>

        {/* ── Zone danger ── */}
        <Text style={[styles.sectionLabel, { color: '#E24B4A' }]}>Zone de danger</Text>
        <View style={styles.card}>
          <TouchableOpacity
            onPress={handleResetData}
            style={styles.row}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FDECEA' }]}>
              <Trash2 size={16} color="#E24B4A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: '#E24B4A', fontWeight: '600' }}>
                Réinitialiser l'application
              </Text>
              <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                Supprime toutes tes données locales
              </Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = {
  sectionLabel: {
    fontSize: 11, fontWeight: '600' as const, color: '#888',
    textTransform: 'uppercase' as const, letterSpacing: 0.8,
    marginBottom: 8, marginLeft: 4, marginTop: 8,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    overflow: 'hidden' as const, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  rowBorder: {
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rowLabel: {
    flex: 1, fontSize: 14, color: '#1a1a2e', fontWeight: '500' as const,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    marginRight: 12,
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%' as const,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  sheetTitle: {
    fontSize: 13, fontWeight: '600' as const, color: '#888',
    textTransform: 'uppercase' as const, letterSpacing: 0.8,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  sheetRow: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  sheetRowBorder: {
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  sheetRowLabel: {
    flex: 1, fontSize: 15, color: '#1a1a2e', fontWeight: '400' as const,
  },
}
