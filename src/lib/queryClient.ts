import { QueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

// SecureStoreストレージアダプター
const clientStorage = {
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  },
  getItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('Failed to read from cache:', error);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Failed to remove from cache:', error);
    }
  },
};

// QueryClient設定
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 60 * 24, // 24時間（旧cacheTime）
      retry: (failureCount, error: unknown) => {
        // ネットワークエラーの場合はリトライしない
        if (error instanceof Error && error.message?.includes('Network')) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 3,
      networkMode: 'offlineFirst',
    },
  },
});

// キャッシュの永続化設定
export const persistOptions = {
  persister: {
    persistClient: async (client: unknown) => {
      const data = JSON.stringify(client);
      await clientStorage.setItem('tanstack-query-cache', data);
    },
    restoreClient: async () => {
      const data = await clientStorage.getItem('tanstack-query-cache');
      return data ? JSON.parse(data) : undefined;
    },
    removeClient: async () => {
      await clientStorage.removeItem('tanstack-query-cache');
    },
  },
  maxAge: 1000 * 60 * 60 * 24, // 24時間
};
