/**
 * 
 * SecureStore (src/lib/supabase.ts):
 * - 認証トークン、セッション情報
 * - APIキー、機密データ
 * - 暗号化されて保存、容量制限: 2048バイト
 * 
 * AsyncStorage (このファイル):
 * - APIレスポンスキャッシュ
 * - ユーザー設定、アプリ設定
 * - 大きなデータ、非機密データ
 * - 平文で保存、容量制限なし
 * 
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';

// AsyncStorageアダプター（非機密データ用）
const asyncStorageAdapter = {
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to save to AsyncStorage:', error);
    }
  },
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error('Failed to read from AsyncStorage:', error);
      return null;
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from AsyncStorage:', error);
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

// キャッシュの永続化設定（AsyncStorage使用）
// 非機密データ（APIレスポンスキャッシュなど）をAsyncStorageに保存
export const persistOptions = {
  persister: {
    persistClient: async (client: unknown) => {
      const data = JSON.stringify(client);
      await asyncStorageAdapter.setItem('tanstack-query-cache', data);
    },
    restoreClient: async () => {
      const data = await asyncStorageAdapter.getItem('tanstack-query-cache');
      return data ? JSON.parse(data) : undefined;
    },
    removeClient: async () => {
      await asyncStorageAdapter.removeItem('tanstack-query-cache');
    },
  },
  maxAge: 1000 * 60 * 60 * 24, // 24時間
};
