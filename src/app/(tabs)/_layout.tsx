import { AuthGuard } from '@/components/AuthGuard';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

/*
 * タブバーのレイアウト設定コンポーネント
 */
export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            height: 90,
            paddingBottom: 30,
            paddingTop: 10,
          },
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerShadowVisible: false,
          headerTintColor: '#111827',
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: '取引一覧',
            tabBarIcon: ({ color, size }) => <Ionicons name='list' size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name='archive'
          options={{
            title: 'アーカイブ',
            tabBarIcon: ({ color, size }) => <Ionicons name='archive' size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name='settings'
          options={{
            title: '設定',
            tabBarIcon: ({ color, size }) => <Ionicons name='settings' size={size} color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
