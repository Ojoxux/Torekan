import { useTrades } from '@/hooks/useTrades';
import { Trade, TradeStatus } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';

export default function TradesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  const { data: trades = [], isLoading, refetch } = useTrades({
    status: undefined,
    type: undefined,
    keyword: undefined,
  });

  const activeTrades = trades.filter((trade: Trade) => !trade.is_archived);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-500';
      case 'waiting_payment':
        return 'bg-amber-500';
      case 'payment_sent':
        return 'bg-purple-500';
      case 'payment_received':
        return 'bg-emerald-500';
      case 'shipping_sent':
        return 'bg-cyan-500';
      case 'shipping_received':
        return 'bg-pink-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: TradeStatus) => {
    switch (status) {
      case 'planning':
        return '計画中';
      case 'waiting_payment':
        return '入金待ち';
      case 'payment_sent':
        return '入金済み';
      case 'payment_received':
        return '入金確認済み';
      case 'shipping_sent':
        return '発送済み';
      case 'shipping_received':
        return '受取済み';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  const renderTradeItem = ({ item }: { item: Trade }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm"
      onPress={() => router.push(`/trade/${item.id}` as Href)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {item.title}
          </Text>
          {item.type === 'sell' && (
            <View className="bg-red-50 px-2 py-0.5 rounded mt-1 self-start">
              <Text className="text-xs font-semibold text-gray-700">譲渡</Text>
            </View>
          )}
          {item.type === 'buy' && (
            <View className="bg-blue-50 px-2 py-0.5 rounded mt-1 self-start">
              <Text className="text-xs font-semibold text-gray-700">求</Text>
            </View>
          )}
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-medium text-white">{getStatusText(item.status)}</Text>
        </View>
      </View>
      {item.partner && (
        <Text className="text-sm text-gray-600 mb-1">取引相手: {item.partner}</Text>
      )}
      {item.event_date && (
        <Text className="text-sm text-gray-600 mb-1">
          イベント日: {new Date(item.event_date).toLocaleDateString('ja-JP')}
        </Text>
      )}
      <Text className="text-xs text-gray-400">
        作成日: {new Date(item.created_at).toLocaleDateString('ja-JP')}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={activeTrades}
        renderItem={renderTradeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center pt-24">
            <Ionicons name="swap-horizontal-outline" size={64} color="#9CA3AF" />
            <Text className="text-lg font-semibold text-gray-600 mt-4">取引がありません</Text>
            <Text className="text-sm text-gray-400 mt-2">
              新しい取引を作成してください
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg"
        onPress={() => router.push('/trade/new' as Href)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}