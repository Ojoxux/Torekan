import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useGoodsItemWithTrades } from '@/hooks/useGoods';
import { useTradesByGoodsItem } from '@/hooks/useTrades';
import { Trade, TradeStatus } from '@/types';

/*
 * グッズ別取引一覧画面
 */
export default function TradesListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TradeStatus | 'all'>('all');
  const router = useRouter();

  const { data: goodsItem, isLoading: goodsLoading } = useGoodsItemWithTrades(id || '');

  const { data: trades = [], isLoading: tradesLoading, refetch } = useTradesByGoodsItem(id || '');

  const isLoading = goodsLoading || tradesLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // ステータスフィルタリング
  const filteredTrades = trades.filter(
    (trade) => selectedStatus === 'all' || trade.status === selectedStatus
  );

  // ステータス別にグループ化
  const groupedTrades = {
    active: filteredTrades.filter((t) =>
      ['planned', 'negotiating', 'confirmed', 'shipped'].includes(t.status)
    ),
    completed: filteredTrades.filter((t) => t.status === 'completed'),
    canceled: filteredTrades.filter((t) => t.status === 'canceled'),
  };

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case 'planned':
        return 'bg-gray-500';
      case 'negotiating':
        return 'bg-orange-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'completed':
        return 'bg-green-500';
      case 'canceled':
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: TradeStatus) => {
    switch (status) {
      case 'planned':
        return '計画中';
      case 'negotiating':
        return '交渉中';
      case 'confirmed':
        return '確定済み';
      case 'shipped':
        return '発送済み';
      case 'completed':
        return '完了';
      case 'canceled':
        return 'キャンセル';
    }
  };

  const getStatusIcon = (status: TradeStatus) => {
    switch (status) {
      case 'planned':
        return 'time-outline';
      case 'negotiating':
        return 'chatbubble-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'shipped':
        return 'airplane-outline';
      case 'completed':
        return 'checkmark-done-outline';
      case 'canceled':
        return 'close-circle-outline';
    }
  };

  const renderTradeItem = ({ item }: { item: Trade }) => {
    return (
      <TouchableOpacity
        className='bg-white rounded-xl p-4 mb-3 shadow-sm'
        onPress={() => router.push(`/trade/${item.id}`)}
        activeOpacity={0.7}
      >
        <View className='flex-row items-start justify-between'>
          {/* 取引情報 */}
          <View className='flex-1 mr-3'>
            <View className='flex-row items-center mb-2'>
              <Ionicons
                name={getStatusIcon(item.status)}
                size={16}
                color={getStatusColor(item.status)?.replace('bg-', '').replace('-500', '')}
                className='mr-2'
              />
              <View className='flex-1'>
                <Text className='text-lg font-semibold text-gray-900' numberOfLines={1}>
                  {item.item_name}
                </Text>
                <View className='flex-row items-center mt-1'>
                  <Ionicons name='person-outline' size={14} color='#9CA3AF' className='mr-1' />
                  <Text className='text-sm text-gray-600' numberOfLines={1}>
                    {item.partner_name}
                  </Text>
                </View>
              </View>
            </View>

            <View className='flex-row items-center mb-2'>
              <View className='bg-blue-50 px-2 py-0.5 rounded mr-2'>
                <Text className='text-xs font-medium text-blue-700'>
                  {item.type === 'exchange' && '交換'}
                  {item.type === 'transfer' && '譲渡'}
                  {item.type === 'purchase' && '購入'}
                </Text>
              </View>

              <View className={`px-2 py-0.5 rounded ${getStatusColor(item.status)}`}>
                <Text className='text-xs font-medium text-white'>{getStatusText(item.status)}</Text>
              </View>
            </View>

            {item.notes && (
              <Text className='text-sm text-gray-600 mb-2' numberOfLines={2}>
                {item.notes}
              </Text>
            )}

            <Text className='text-xs text-gray-400'>
              更新日: {new Date(item.updated_at).toLocaleDateString('ja-JP')}
            </Text>
          </View>

          {/* 矢印アイコン */}
          <View className='justify-center'>
            <Ionicons name='chevron-forward' size={20} color='#9CA3AF' />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, data: Trade[], icon: string) => {
    if (data.length === 0) return null;

    return (
      <View className='mb-4'>
        <View className='flex-row items-center mb-3 px-2'>
          <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={18} color='#6B7280' />
          <Text className='text-base font-semibold text-gray-700 ml-2'>
            {title} ({data.length})
          </Text>
        </View>
        {data.map((item) => (
          <View key={item.id}>{renderTradeItem({ item })}</View>
        ))}
      </View>
    );
  };

  // 初回ロード時のみフルスクリーンローディングを表示
  if (isLoading && !trades.length) {
    return (
      <SafeAreaView className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size='large' color='#3B82F6' />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* ヘッダー */}
      <View className='bg-white px-4 py-3 border-b border-gray-100'>
        <View className='flex-row items-center mb-3'>
          <TouchableOpacity
            onPress={() => router.push(`/category/${goodsItem?.category_id}/goods`)}
            className='mr-3'
            activeOpacity={0.7}
          >
            <Ionicons name='arrow-back' size={24} color='#374151' />
          </TouchableOpacity>

          <View className='flex-1'>
            <Text className='text-xl font-bold text-gray-900' numberOfLines={1}>
              {goodsItem?.name || 'グッズ'}
            </Text>
            {goodsItem?.description && (
              <Text className='text-sm text-gray-600' numberOfLines={1}>
                {goodsItem.description}
              </Text>
            )}
          </View>
        </View>

        {/* パンくずナビ */}
        <View className='flex-row items-center mb-3'>
          <Text className='text-sm text-gray-500'>ホーム</Text>
          <Ionicons name='chevron-forward' size={16} color='#9CA3AF' className='mx-1' />
          <Text className='text-sm text-gray-500' numberOfLines={1}>
            {goodsItem?.category.name || 'カテゴリ'}
          </Text>
          <Ionicons name='chevron-forward' size={16} color='#9CA3AF' className='mx-1' />
          <Text className='text-sm text-blue-600' numberOfLines={1}>
            {goodsItem?.name || 'グッズ'}
          </Text>
        </View>

        {/* ステータスフィルタ */}
        <View className='flex-row space-x-2'>
          {[
            { key: 'all', label: '全て' },
            { key: 'planned', label: '計画中' },
            { key: 'negotiating', label: '交渉中' },
            { key: 'confirmed', label: '確定' },
            { key: 'completed', label: '完了' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              className={`px-3 py-1 rounded-full ${
                selectedStatus === filter.key ? 'bg-blue-500' : 'bg-gray-100'
              }`}
              onPress={() => setSelectedStatus(filter.key as TradeStatus | 'all')}
              activeOpacity={0.7}
            >
              <Text
                className={`text-xs font-medium ${
                  selectedStatus === filter.key ? 'text-white' : 'text-gray-600'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={[]} // セクション形式なので空配列
        renderItem={() => null}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor='#3B82F6' />
        }
        ListHeaderComponent={
          <View>
            {selectedStatus === 'all' ? (
              <>
                {renderSection('進行中の取引', groupedTrades.active, 'time-outline')}
                {renderSection('完了した取引', groupedTrades.completed, 'checkmark-done-outline')}
                {renderSection(
                  'キャンセルした取引',
                  groupedTrades.canceled,
                  'close-circle-outline'
                )}
              </>
            ) : (
              <View>
                {filteredTrades.map((item) => (
                  <View key={item.id}>{renderTradeItem({ item })}</View>
                ))}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          filteredTrades.length === 0 ? (
            <View className='flex-1 justify-center items-center pt-24'>
              <Ionicons name='swap-horizontal-outline' size={64} color='#9CA3AF' />
              <Text className='text-lg font-semibold text-gray-600 mt-4'>取引がありません</Text>
              <Text className='text-sm text-gray-400 mt-2'>最初の取引を作成してください</Text>
              <TouchableOpacity
                className='mt-4 bg-blue-500 px-6 py-2 rounded-full'
                onPress={() => router.push(`/trade/new?goodsItemId=${id}` as Href)}
                activeOpacity={0.8}
              >
                <Text className='text-white font-medium'>取引を作成</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* 新規取引作成FAB */}
      <TouchableOpacity
        className='absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg'
        onPress={() => router.push(`/trade/new?goodsItemId=${id}` as Href)}
        activeOpacity={0.8}
      >
        <Ionicons name='add' size={24} color='#FFFFFF' />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
