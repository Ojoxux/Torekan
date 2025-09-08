import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function TradesScreen() {
  return (
    <View className='flex-1 bg-gray-50'>
      <ScrollView className='flex-1 p-4'>
        <View className='bg-white rounded-lg p-4 mb-4 shadow-sm'>
          <Text className='text-xl font-bold text-gray-900 mb-2'>
            Torekan - グッズ交換管理アプリ
          </Text>
          <Text className='text-gray-600'>環境構築が完了しました！</Text>
        </View>

        <View className='bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200'>
          <Text className='text-blue-900 font-semibold mb-2'>✅ Phase 1 完了</Text>
          <Text className='text-blue-700 text-sm'>• NativeWind v4 設定済み</Text>
          <Text className='text-blue-700 text-sm'>• Expo Router 設定済み</Text>
          <Text className='text-blue-700 text-sm'>• Supabase クライアント準備済み</Text>
          <Text className='text-blue-700 text-sm'>• React Query 設定済み</Text>
        </View>

        <View className='bg-yellow-50 rounded-lg p-4 border border-yellow-200'>
          <Text className='text-yellow-900 font-semibold mb-2'>📝 次のステップ</Text>
          <Text className='text-yellow-700 text-sm'>1. Supabaseプロジェクトを作成</Text>
          <Text className='text-yellow-700 text-sm'>2. .envファイルに認証情報を設定</Text>
          <Text className='text-yellow-700 text-sm'>3. Phase 2: 認証・データベース設計へ</Text>
        </View>
      </ScrollView>

      <TouchableOpacity className='absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'>
        <Ionicons name='add' size={28} color='white' />
      </TouchableOpacity>
    </View>
  );
}
