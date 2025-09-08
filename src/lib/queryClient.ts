import { QueryClient } from '@tanstack/react-query';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'torekan-cache',
});

// MMKVストレージアダプター
const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => {
    storage.delete(key);
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
      clientStorage.setItem('tanstack-query-cache', data);
    },
    restoreClient: async () => {
      const data = clientStorage.getItem('tanstack-query-cache');
      return data ? JSON.parse(data) : undefined;
    },
    removeClient: async () => {
      clientStorage.removeItem('tanstack-query-cache');
    },
  },
  maxAge: 1000 * 60 * 60 * 24, // 24時間
};
