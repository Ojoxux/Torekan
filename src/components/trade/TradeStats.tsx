import { Text, View } from 'react-native';

import { useGoodsItemStats } from '@/hooks/useGoods';

interface TradeStatsProps {
  goodsItemId: string;
}

export const TradeStats = ({ goodsItemId }: TradeStatsProps) => {
  const { data: stats, isLoading, error } = useGoodsItemStats(goodsItemId);

  if (error) {
    console.error('TradeStats error:', error);
    return (
      <View className='flex-row items-center'>
        <Text className='text-xs text-red-500'>統計取得エラー</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className='flex-row items-center'>
        <Text className='text-xs text-gray-400'>統計読み込み中...</Text>
      </View>
    );
  }

  return (
    <View
      className='flex-row items-center space-x-4'
      style={{ flexDirection: 'row', alignItems: 'center' }}
    >
      <View
        className='flex-row items-center'
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        <View
          className='w-2 h-2 rounded-full bg-blue-500 mr-1'
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#3B82F6',
            marginRight: 4,
          }}
        />
        <Text className='text-xs text-gray-600' style={{ fontSize: 12, color: '#4B5563' }}>
          進行中: {stats?.active || 0}件
        </Text>
      </View>
      <View
        className='flex-row items-center'
        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}
      >
        <View
          className='w-2 h-2 rounded-full bg-green-500 mr-1'
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#10B981',
            marginRight: 4,
          }}
        />
        <Text className='text-xs text-gray-600' style={{ fontSize: 12, color: '#4B5563' }}>
          完了: {stats?.completed || 0}件
        </Text>
      </View>
    </View>
  );
};
