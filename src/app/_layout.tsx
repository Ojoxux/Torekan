import { AuthProvider } from '@/contexts/AuthContext';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { queryClient } from '@lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../../src/global.css';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BottomSheetModalProvider>
            <Stack>
              <Stack.Screen name='index' options={{ headerShown: false }} />
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
              <Stack.Screen name='auth/login' options={{ title: 'ログイン', headerShown: false }} />
              <Stack.Screen
                name='auth/signup'
                options={{ title: 'アカウント作成', headerShown: false }}
              />
            </Stack>
          </BottomSheetModalProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
