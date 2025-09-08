import { Text, View } from 'react-native';

export default function ArchiveScreen() {
  return (
    <View className='flex-1 bg-gray-50 items-center justify-center p-4'>
      <View className='bg-white rounded-lg p-6 shadow-sm'>
        <Text className='text-2xl font-bold text-gray-900 text-center mb-2'>アーカイブ</Text>
        <Text className='text-gray-600 text-center'>完了した取引がここに表示されます</Text>
      </View>
    </View>
  );
}
