import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // ユーザーがログインしていない場合はログイン画面へ
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  // ログイン済みの場合はタブ画面へ
  return <Redirect href="/(tabs)" />;
}