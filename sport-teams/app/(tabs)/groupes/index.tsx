import { useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { useGroupes } from '../../../hooks/useGroupes'
import { useLanguage } from '../../../contexts/LanguageContext'
export default function Groupes() {
  const router = useRouter()
  const { groupes, loading, fetchGroupes } = useGroupes()
  const { t } = useLanguage()

  useFocusEffect(
    useCallback(() => {
      fetchGroupes()
    }, [])
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{
        backgroundColor: '#1e3a5f',
        paddingTop: 48,
        paddingHorizontal: 20,
        paddingBottom: 28,
      }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '700' }}>
            {t('hello')}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            {groupes.length} {t('activeGroups')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/groupes/new')}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.25)',
              borderRadius: 14, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Plus size={15} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{t('newGroup')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/groupes/rejoindre')}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.25)',
              borderRadius: 14, paddingVertical: 14,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{t('joinWithCode')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        <Text style={{
          fontSize: 11, fontWeight: '700', color: '#94a3b8',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20,
        }}>
          {t('myGroups')}
        </Text>

        {groupes.length > 0 ? (
          groupes.map(groupe => (
            <TouchableOpacity
              key={groupe.id}
              onPress={() => router.push(`/(tabs)/groupes/${groupe.id}`)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                shadowColor: '#0f172a',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <View style={{
                width: 42, height: 42,
                borderRadius: 14,
                backgroundColor: '#eff6ff',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 22 }}>{groupe.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
                  {groupe.nom}
                </Text>
                <Text style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {groupe.sport}
                </Text>
              </View>
              <View style={{
                backgroundColor: '#dcfce7',
                paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 20,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '500', color: '#16a34a' }}>
                  {t('active')}
                </Text>
              </View>
              <Text style={{ color: '#94a3b8', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))
        ) : !loading ? (
          <View style={{
            backgroundColor: '#ffffff', borderRadius: 16, padding: 40,
            alignItems: 'center', marginTop: 8,
            shadowColor: '#0f172a',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
            <Text style={{ fontSize: 64, marginBottom: 12 }}>⚽</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#0f172a' }}>
              {t('noGroups')}
            </Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {t('createFirst')}
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  )
}
