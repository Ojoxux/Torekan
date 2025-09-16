import { useArchiveTrade, useDeleteTrade, useTrade, useUpdateTrade } from '@/hooks/useTrades';
import { TradeStatus } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/*
 * 取引詳細画面のページコンポーネント
 */
export default function TradeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const { data: trade, isLoading } = useTrade(id || '');
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();
  const archiveTrade = useArchiveTrade();

  const statusOptions: { value: TradeStatus; label: string; color: string }[] = [
    { value: 'planning', label: '計画中', color: '#3B82F6' },
    { value: 'waiting_payment', label: '入金待ち', color: '#F59E0B' },
    { value: 'payment_sent', label: '入金済み', color: '#8B5CF6' },
    { value: 'payment_received', label: '入金確認済み', color: '#10B981' },
    { value: 'shipping_sent', label: '発送済み', color: '#06B6D4' },
    { value: 'shipping_received', label: '受取済み', color: '#EC4899' },
    { value: 'completed', label: '完了', color: '#6B7280' },
  ];

  const handleStatusChange = async (newStatus: TradeStatus) => {
    try {
      await updateTrade.mutateAsync({
        id: id || '',
        trade: { status: newStatus },
      });
      setStatusModalVisible(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('エラー', 'ステータスの更新に失敗しました。');
    }
  };

  const handleDelete = () => {
    Alert.alert('取引の削除', 'この取引を削除してもよろしいですか？この操作は元に戻せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrade.mutateAsync(id || '');
            router.back();
          } catch (error) {
            console.error('Failed to delete trade:', error);
            Alert.alert('エラー', '取引の削除に失敗しました。');
          }
        },
      },
    ]);
  };

  const handleArchive = async () => {
    try {
      await archiveTrade.mutateAsync(id || '');
      setActionModalVisible(false);
      router.back();
    } catch (error) {
      console.error('Failed to archive trade:', error);
      Alert.alert('エラー', 'アーカイブに失敗しました。');
    }
  };

  const getCurrentStatus = () => {
    return statusOptions.find((option) => option.value === trade?.status);
  };

  if (isLoading) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size='large' color='#3B82F6' />
      </View>
    );
  }

  if (!trade) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50 px-5'>
        <Text className='text-lg text-gray-600 mb-5'>取引が見つかりません</Text>
        <TouchableOpacity
          className='px-6 py-3 bg-blue-500 rounded-lg'
          onPress={() => router.back()}
        >
          <Text className='text-white text-base font-medium'>戻る</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentStatus = getCurrentStatus();

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
        <TouchableOpacity className='p-2' onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={24} color='#111827' />
        </TouchableOpacity>
        <Text className='text-lg font-semibold text-gray-900'>取引詳細</Text>
        <TouchableOpacity className='p-2' onPress={() => setActionModalVisible(true)}>
          <Ionicons name='ellipsis-horizontal' size={24} color='#111827' />
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1 p-4'>
        <View className='bg-white rounded-xl p-4 mb-4'>
          <View className='flex-row justify-between items-start mb-3'>
            <Text className='text-xl font-semibold text-gray-900 flex-1 mr-3'>{trade.title}</Text>
            <View className='bg-blue-50 px-3 py-1 rounded-full'>
              <Text className='text-xs font-medium text-blue-600'>
                {trade.type === 'sell' ? '譲渡' : '求'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className='flex-row items-center justify-between'
            onPress={() => setStatusModalVisible(true)}
          >
            <View
              className='px-3 py-1.5 rounded-full'
              style={{ backgroundColor: currentStatus?.color }}
            >
              <Text className='text-sm font-medium text-white'>{currentStatus?.label}</Text>
            </View>
            <Ionicons name='chevron-down' size={16} color='#6B7280' />
          </TouchableOpacity>
        </View>

        {trade.partner && (
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-600 mb-2'>取引相手</Text>
            <Text className='text-base text-gray-900'>{trade.partner}</Text>
          </View>
        )}

        {trade.my_items && (
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-600 mb-2'>自分の提供物</Text>
            <Text className='text-base text-gray-900'>{trade.my_items}</Text>
          </View>
        )}

        {trade.partner_items && (
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-600 mb-2'>相手の提供物</Text>
            <Text className='text-base text-gray-900'>{trade.partner_items}</Text>
          </View>
        )}

        {trade.price && (
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-600 mb-2'>金額</Text>
            <Text className='text-base text-gray-900'>¥{trade.price.toLocaleString()}</Text>
          </View>
        )}

        {trade.event_date && (
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-600 mb-2'>イベント日</Text>
            <Text className='text-base text-gray-900'>
              {new Date(trade.event_date).toLocaleDateString('ja-JP')}
            </Text>
          </View>
        )}

        {trade.notes && (
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-600 mb-2'>メモ</Text>
            <Text className='text-base text-gray-900 leading-6'>{trade.notes}</Text>
          </View>
        )}

        <View className='bg-white rounded-xl p-4 mb-4'>
          <Text className='text-sm font-medium text-gray-600 mb-2'>作成日</Text>
          <Text className='text-base text-gray-900'>
            {new Date(trade.created_at).toLocaleDateString('ja-JP')}{' '}
            {new Date(trade.created_at).toLocaleTimeString('ja-JP')}
          </Text>
        </View>
      </ScrollView>

      {/* Status Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View className='flex-1 bg-black/50 justify-center items-center'>
          <View className='bg-white rounded-xl p-5 m-5 max-h-4/5 w-11/12'>
            <View className='flex-row justify-between items-center mb-5'>
              <Text className='text-lg font-semibold text-gray-900'>ステータスを変更</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name='close' size={24} color='#6B7280' />
              </TouchableOpacity>
            </View>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-row items-center justify-between py-3 border-b border-gray-100 ${
                  trade.status === option.value ? 'bg-blue-50' : ''
                }`}
                onPress={() => handleStatusChange(option.value)}
              >
                <View
                  className='px-3 py-1.5 rounded-full'
                  style={{ backgroundColor: option.color }}
                >
                  <Text className='text-sm font-medium text-white'>{option.label}</Text>
                </View>
                {trade.status === option.value && (
                  <Ionicons name='checkmark' size={20} color='#3B82F6' />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={actionModalVisible}
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View className='flex-1 bg-black/50 justify-center items-center'>
          <View className='bg-white rounded-xl p-2 m-5 min-w-[200px]'>
            <TouchableOpacity
              className='flex-row items-center py-4 px-4 gap-3'
              onPress={() => {
                setActionModalVisible(false);
                router.push(`/trade/edit/${id}`);
              }}
            >
              <Ionicons name='create-outline' size={20} color='#3B82F6' />
              <Text className='text-base text-gray-700'>編集</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className='flex-row items-center py-4 px-4 gap-3'
              onPress={handleArchive}
            >
              <Ionicons name='archive-outline' size={20} color='#6B7280' />
              <Text className='text-base text-gray-700'>アーカイブ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className='flex-row items-center py-4 px-4 gap-3 border-t border-gray-200'
              onPress={handleDelete}
            >
              <Ionicons name='trash-outline' size={20} color='#EF4444' />
              <Text className='text-base text-red-500'>削除</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className='py-4 px-4 mt-2 border-t border-gray-200'
              onPress={() => setActionModalVisible(false)}
            >
              <Text className='text-base text-gray-600 text-center'>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
