import { AuthProvider } from '@/contexts/AuthContext';
import { queryClient } from '@lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import '../../src/global.css';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
          <Stack.Screen name='auth/login' options={{ title: 'ログイン', headerShown: false }} />
          <Stack.Screen name='auth/signup' options={{ title: 'アカウント作成', headerShown: false }} />
          <Stack.Screen name='trade/new' options={{ headerShown: false }} />
          <Stack.Screen name='trade/[id]' options={{ headerShown: false }} />
          <Stack.Screen name='trade/edit/[id]' options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
