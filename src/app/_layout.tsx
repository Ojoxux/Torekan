import { queryClient } from '@lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import '../../src/global.css';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
