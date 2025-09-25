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
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name='index'
          options={{
            title: 'カテゴリ一覧',
            tabBarIcon: ({ color, size }) => <Ionicons name='list' size={size} color={color} />,
            headerShown: true,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerShadowVisible: false,
            headerTintColor: '#111827',
          }}
        />
        <Tabs.Screen
          name='settings'
          options={{
            title: '設定',
            tabBarIcon: ({ color, size }) => <Ionicons name='settings' size={size} color={color} />,
            headerShown: true,
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerShadowVisible: false,
            headerTintColor: '#111827',
          }}
        />
        {/* 非タブ画面はタブバーに表示しない */}
        {/* TODO: デバッグ用でパスを出すようにしている */}
        <Tabs.Screen name='trade/new' options={{ href: null, headerShown: false }} />
        <Tabs.Screen name='trade/[id]' options={{ href: null, headerShown: false }} />
        <Tabs.Screen name='trade/edit/[id]' options={{ href: null, headerShown: false }} />
        <Tabs.Screen name='goods/new' options={{ href: null, headerShown: false }} />
        <Tabs.Screen name='goods/edit/[id]' options={{ href: null, headerShown: false }} />
        <Tabs.Screen name='goods/[id]/trades' options={{ href: null, headerShown: false }} />
        <Tabs.Screen name='category/[id]/goods' options={{ href: null, headerShown: false }} />
        <Tabs.Screen name='settings/categories' options={{ href: null, headerShown: false }} />
      </Tabs>
    </AuthGuard>
  );
}
