import { useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { Settings, Plus } from 'lucide-react-native'
import { useGroupes } from '../../../hooks/useGroupes'

export default function Groupes() {
  const router = useRouter()
  const { groupes, loading, fetchGroupes } = useGroupes()

  useFocusEffect(
    useCallback(() => {
      fetchGroupes()
    }, [])
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF9' }}>
      <View style={{
        backgroundColor: '#1a1a2e',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '500' }}>
              Bonjour 👋
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>
              {groupes.length} groupes actifs
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>

        <Text style={{
          fontSize: 11, fontWeight: '500', color: '#888',
          textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
        }}>
          Mes groupes
        </Text>

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#999', fontSize: 13 }}>Chargement...</Text>
          </View>
        ) : groupes.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>⚽</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#1a1a2e' }}>
              Aucun groupe encore
            </Text>
            <Text style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
              Crée ton premier groupe !
            </Text>
          </View>
        ) : (
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
                  Actif
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/groupes/new')}
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 8,
            alignSelf: 'center',
          }}
        >
          <Plus size={16} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>
            Nouveau groupe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/groupes/rejoindre')}
          style={{
            borderRadius: 20,
            paddingVertical: 12,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 6,
            alignSelf: 'center',
            borderWidth: 0.5,
            borderColor: 'rgba(0,0,0,0.15)',
          }}
        >
          <Text style={{ color: '#1a1a2e', fontSize: 13, fontWeight: '500' }}>
            Rejoindre avec un code
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}