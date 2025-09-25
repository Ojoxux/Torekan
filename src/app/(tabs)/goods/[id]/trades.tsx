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

import { FilterChips } from '@/components/common/FilterChips';
import { useGoodsItemWithTrades } from '@/hooks/useGoods';
import { useTradesByGoodsItem } from '@/hooks/useTrades';
import { useFilterStore } from '@/store/filterStore';
import { Trade, TradeStatus } from '@/types';

/*
 * グッズ別取引一覧画面
 */
export default function TradesListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { selectedType } = useFilterStore();

  const { data: goodsItem, isLoading: goodsLoading } = useGoodsItemWithTrades(id || '');

  const { data: trades = [], isLoading: tradesLoading, refetch } = useTradesByGoodsItem(id || '');

  const isLoading = goodsLoading || tradesLoading;

  /*
   * リフレッシュ処理
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  /*
   * タイプフィルタリング
   */
  const filteredTrades = trades.filter(
    (trade) => selectedType === null || trade.type === selectedType
  );

  /*
   * ステータス別にグループ化
   */
  const groupedTrades = {
    active: filteredTrades.filter((t) => t.status === 'in_progress'),
    completed: filteredTrades.filter((t) => t.status === 'completed'),
    canceled: filteredTrades.filter((t) => t.status === 'canceled'),
  };

  /*
   * ステータス別にカラーを取得
   */
  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.IN_PROGRESS:
        return 'bg-blue-500';
      case TradeStatus.COMPLETED:
        return 'bg-green-500';
      case TradeStatus.CANCELED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  /*
   * ステータス別にテキストを取得
   */
  const getStatusText = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.IN_PROGRESS:
        return '進行中';
      case TradeStatus.COMPLETED:
        return '完了';
      case TradeStatus.CANCELED:
        return 'キャンセル';
      default:
        return '不明';
    }
  };

  /*
   * ステータス別にアイコンを取得
   */
  const getStatusIcon = (status: TradeStatus) => {
    switch (status) {
      case TradeStatus.IN_PROGRESS:
        return 'time-outline';
      case TradeStatus.COMPLETED:
        return 'checkmark-done-outline';
      case TradeStatus.CANCELED:
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  /*
   * 取引アイテムをレンダリング
   */
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
                  <Text className='text-sm text-gray-600 ml-2'>• {item.quantity}個</Text>
                </View>
              </View>
            </View>

            <View className='flex-row items-center mb-2'>
              <View className='bg-blue-50 px-2 py-0.5 rounded mr-2'>
                <Text className='text-xs font-medium text-blue-700'>
                  {item.type === 'exchange' && '交換'}
                  {item.type === 'transfer' && '譲渡'}
                  {item.type === 'purchase' && '買取'}
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

  /*
   * セクションをレンダリング
   */
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

  /*
   * 初回ロード時のみフルスクリーンローディングを表示
   */
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
            {goodsItem?.release_date && (
              <Text className='text-sm text-gray-600' numberOfLines={1}>
                {goodsItem.release_date}
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

        {/* フィルタチップ */}
        <FilterChips />
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
            {selectedType === null ? (
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
