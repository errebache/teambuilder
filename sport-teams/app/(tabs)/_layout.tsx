import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { LayoutGrid, Users, Clock, Settings2 } from 'lucide-react-native'
import { useTheme } from '../../contexts/ThemeContext'

export default function TabsLayout() {
  const { colors } = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.borderStrong,
          height: 64,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="groupes"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <LayoutGrid size={20} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563eb' }} />
              )}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault()
            navigation.navigate('groupes', { screen: 'index' })
          },
        })}
      />
      <Tabs.Screen
        name="joueurs"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <Users size={20} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563eb' }} />
              )}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault()
            navigation.navigate('joueurs', { screen: 'index' })
          },
        })}
      />
      <Tabs.Screen
        name="historique"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <Clock size={20} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563eb' }} />
              )}
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault()
            navigation.navigate('historique', { screen: 'index' })
          },
        })}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <Settings2 size={20} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#2563eb' }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  )
}
