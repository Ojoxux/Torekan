import { useAuth } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [cloudBackup, setCloudBackup] = useState(false);
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      {
        text: 'キャンセル',
        style: 'cancel',
      },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            queryClient.clear();

            await signOut();

            router.replace('/auth/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('エラー', 'ログアウト中にエラーが発生しました');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView className='flex-1 bg-gray-50'>
      <View className='p-4'>
        <View className='bg-white rounded-lg shadow-sm'>
          <View className='p-4'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-1'>
                <Text className='text-gray-900 font-medium'>クラウドバックアップ</Text>
                <Text className='text-gray-500 text-sm mt-1'>
                  データをクラウドに自動バックアップ
                </Text>
              </View>
              <Switch
                value={cloudBackup}
                onValueChange={setCloudBackup}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={cloudBackup ? '#3b82f6' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        <View className='bg-white rounded-lg shadow-sm mt-4 p-4'>
          <Text className='text-gray-900 font-medium mb-2'>バージョン情報</Text>
          <Text className='text-gray-500 text-sm'>Torekan v1.0.0</Text>
          <Text className='text-gray-500 text-sm'>環境: 開発</Text>
        </View>

        {user && (
          <View className='bg-white rounded-lg shadow-sm mt-4 p-4'>
            <Text className='text-gray-900 font-medium mb-2'>アカウント</Text>
            <Text className='text-gray-500 text-sm mb-4'>{user.email}</Text>
            <Pressable
              onPress={handleLogout}
              className='bg-red-500 rounded-lg p-3 active:bg-red-600'
            >
              <Text className='text-white text-center font-medium'>ログアウト</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
