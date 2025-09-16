import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FilterChips } from '@/components/common/FilterChips';
import { SearchBar } from '@/components/common/SearchBar';
import { useTrades } from '@/hooks/useTrades';
import { useFilterStore } from '@/store/filterStore';
import { Trade, TradeStatus, TradeType } from '@/types';

export default function TradesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { keyword, selectedStatuses, selectedTypes, setKeyword } = useFilterStore();

  const {
    data: trades = [],
    isLoading,
    refetch,
  } = useTrades({
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    type: selectedTypes.length > 0 ? selectedTypes : undefined,
    keyword: keyword.length > 0 ? keyword : undefined,
  });

  const activeTrades = trades;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'canceled':
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: TradeStatus) => {
    switch (status) {
      case 'planned':
        return '計画中';
      case 'shipped':
        return '発送済み';
      case 'completed':
        return '完了';
      case 'canceled':
        return 'キャンセル';
    }
  };

  const renderTradeItem = ({ item }: { item: Trade }) => (
    <TouchableOpacity
      className='bg-white rounded-xl p-4 mb-3 shadow-sm'
      onPress={() => router.push(`/trade/${item.id}` as Href)}
      activeOpacity={0.7}
    >
      <View className='flex-row justify-between items-start mb-2'>
        <View className='flex-1 mr-2'>
          <Text className='text-base font-semibold text-gray-900' numberOfLines={1}>
            {item.item_name}
          </Text>
          <View className='bg-blue-50 px-2 py-0.5 rounded mt-1 self-start'>
            <Text className='text-xs font-semibold text-gray-700'>
              {item.type === TradeType.EXCHANGE && '交換'}
              {item.type === TradeType.TRANSFER && '譲渡'}
              {item.type === TradeType.PURCHASE && '買取'}
              {item.type === TradeType.SALE && '売却'}
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className='text-xs font-medium text-white'>{getStatusText(item.status)}</Text>
        </View>
      </View>
      {item.partner_name && (
        <Text className='text-sm text-gray-600 mb-1'>取引相手: {item.partner_name}</Text>
      )}
      <Text className='text-xs text-gray-400'>
        作成日: {new Date(item.created_at).toLocaleDateString('ja-JP')}
      </Text>
    </TouchableOpacity>
  );

  // 初回ロード時のみフルスクリーンローディングを表示
  if (isLoading && !trades.length) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size='large' color='#3B82F6' />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      {/* 検索・フィルタエリア */}
      <View className='bg-white px-4 py-3 border-b border-gray-100'>
        <SearchBar value={keyword} onChangeText={setKeyword} />
        <FilterChips />
      </View>

      <FlatList
        data={activeTrades}
        renderItem={renderTradeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor='#3B82F6' />
        }
        ListEmptyComponent={
          <View className='flex-1 justify-center items-center pt-24'>
            <Ionicons name='swap-horizontal-outline' size={64} color='#9CA3AF' />
            <Text className='text-lg font-semibold text-gray-600 mt-4'>取引がありません</Text>
            <Text className='text-sm text-gray-400 mt-2'>新しい取引を作成してください</Text>
          </View>
        }
      />
      <TouchableOpacity
        className='absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg'
        onPress={() => router.push('/trade/new' as Href)}
        activeOpacity={0.8}
      >
        <Ionicons name='add' size={24} color='#FFFFFF' />
      </TouchableOpacity>
    </View>
  );
}
