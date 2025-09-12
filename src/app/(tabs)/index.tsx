import { tradeService } from '@/services/tradeService';
import type { Trade } from '@/types';
import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function TradesScreen() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrades = useCallback(async () => {
    try {
      const data = await tradeService.getAll();
      setTrades(data);
    } catch (error) {
      console.error('Failed to load trades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrades();
  };

  const getStatusColor = (status: Trade['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'waiting':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Trade['status']) => {
    switch (status) {
      case 'new':
        return '新規';
      case 'in_progress':
        return '進行中';
      case 'waiting':
        return '待機中';
      case 'completed':
        return '完了';
      case 'canceled':
        return 'キャンセル';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size='large' color='#3B82F6' />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-50'>
      <ScrollView
        className='flex-1'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {trades.length === 0 ? (
          <View className='flex-1 justify-center items-center p-8'>
            <Ionicons name='folder-open-outline' size={64} color='#9CA3AF' />
            <Text className='text-gray-500 text-lg mt-4'>取引がありません</Text>
            <Text className='text-gray-400 text-sm mt-2'>右下の＋ボタンから追加してください</Text>
          </View>
        ) : (
          <View className='p-4'>
            {trades.map((trade) => (
              <TouchableOpacity
                key={trade.id}
                className='bg-white rounded-lg p-4 mb-3 shadow-sm'
                // TODO: 詳細画面へのナビゲーションを追加
                // onPress={() => router.push(`/trade/${trade.id}`)}
              >
                <View className='flex-row justify-between items-start mb-2'>
                  <View className='flex-1'>
                    <Text className='text-lg font-semibold text-gray-900'>
                      {trade.my_character}
                    </Text>
                    <Text className='text-sm text-gray-500 mt-1'>↔ {trade.partner_character}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${getStatusColor(trade.status)}`}>
                    <Text className='text-xs font-medium'>{getStatusText(trade.status)}</Text>
                  </View>
                </View>
                {trade.event_date && (
                  <Text className='text-sm text-gray-500'>
                    イベント: {new Date(trade.event_date).toLocaleDateString('ja-JP')}
                  </Text>
                )}
                <View className='flex-row items-center mt-2'>
                  <Ionicons
                    name={trade.trade_type === 'mail' ? 'mail-outline' : 'people-outline'}
                    size={16}
                    color='#6B7280'
                  />
                  <Text className='text-sm text-gray-500 ml-1'>
                    {trade.trade_type === 'mail' ? '郵送' : '手渡し'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        className='absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg'
        // TODO: 新規作成画面へのナビゲーションを追加
        // onPress={() => router.push('/trade/new')}
      >
        <Ionicons name='add' size={28} color='white' />
      </TouchableOpacity>
    </View>
  );
}
