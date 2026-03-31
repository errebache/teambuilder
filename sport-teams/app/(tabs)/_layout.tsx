import { Tabs } from 'expo-router'
import { View } from 'react-native'
import { LayoutGrid, Users, Clock } from 'lucide-react-native'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0,0,0,0.07)',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#1a1a2e',
        tabBarInactiveTintColor: '#bbb',
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
                <View style={{
                  width: 4, height: 4,
                  borderRadius: 2,
                  backgroundColor: '#1a1a2e'
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="joueurs"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <Users size={20} color={color} />
              {focused && (
                <View style={{
                  width: 4, height: 4,
                  borderRadius: 2,
                  backgroundColor: '#1a1a2e'
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', gap: 3 }}>
              <Clock size={20} color={color} />
              {focused && (
                <View style={{
                  width: 4, height: 4,
                  borderRadius: 2,
                  backgroundColor: '#1a1a2e'
                }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  )
}