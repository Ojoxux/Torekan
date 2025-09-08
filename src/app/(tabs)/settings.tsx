import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [autoArchive, setAutoArchive] = useState(true);
  const [cloudBackup, setCloudBackup] = useState(false);

  return (
    <ScrollView className='flex-1 bg-gray-50'>
      <View className='p-4'>
        <View className='bg-white rounded-lg shadow-sm'>
          <View className='p-4 border-b border-gray-200'>
            <View className='flex-row justify-between items-center'>
              <View className='flex-1'>
                <Text className='text-gray-900 font-medium'>自動アーカイブ</Text>
                <Text className='text-gray-500 text-sm mt-1'>完了した取引を自動的にアーカイブ</Text>
              </View>
              <Switch
                value={autoArchive}
                onValueChange={setAutoArchive}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={autoArchive ? '#3b82f6' : '#f3f4f6'}
              />
            </View>
          </View>

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
      </View>
    </ScrollView>
  );
}
