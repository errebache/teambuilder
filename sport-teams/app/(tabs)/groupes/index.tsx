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
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
            {t('hello')}
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>
            {groupes.length} {t('activeGroups')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/groupes/new')}
            style={{
              flex: 1, backgroundColor: '#185FA5',
              borderRadius: 12, paddingVertical: 11,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Plus size={15} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{t('newGroup')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/groupes/rejoindre')}
            style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 12, paddingVertical: 11,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{t('joinWithCode')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
        }}>
          {t('myGroups')}
        </Text>

        {groupes.length > 0 ? (
          groupes.map(groupe => (
            <TouchableOpacity
              key={groupe.id}
              onPress={() => router.push(`/(tabs)/groupes/${groupe.id}`)}
              style={{
                backgroundColor: '#fff',
                borderRadius: 14,
                padding: 14,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 0.5,
                borderColor: 'rgba(0,0,0,0.07)',
              }}
            >
              <View style={{
                width: 42, height: 42,
                borderRadius: 12,
                backgroundColor: '#E6F1FB',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 22 }}>{groupe.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#1a1a2e' }}>
                  {groupe.nom}
                </Text>
                <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                  {groupe.sport}
                </Text>
              </View>
              <View style={{
                backgroundColor: '#E6F1FB',
                paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 20,
              }}>
                <Text style={{ fontSize: 10, fontWeight: '500', color: '#185FA5' }}>
                  {t('active')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : !loading ? (
          <View style={{
            backgroundColor: '#fff', borderRadius: 16, padding: 40,
            alignItems: 'center', marginTop: 8,
            borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.07)',
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>⚽</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#1a1a2e' }}>
              {t('noGroups')}
            </Text>
            <Text style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
              {t('createFirst')}
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  )
}