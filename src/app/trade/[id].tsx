import { useArchiveTrade, useDeleteTrade, useTrade, useUpdateTrade } from '@/hooks/useTrades';
import { TradeStatus, TradeType } from '@/types';
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
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const { data: trade, isLoading } = useTrade(id || '');
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();
  const archiveTrade = useArchiveTrade();

  const statusOptions: { value: TradeStatus; label: string; color: string }[] = [
    { value: TradeStatus.PLANNED, label: '計画中', color: '#3B82F6' },
    { value: TradeStatus.SHIPPED, label: '発送済み', color: '#06B6D4' },
    { value: TradeStatus.COMPLETED, label: '完了', color: '#6B7280' },
    { value: TradeStatus.CANCELED, label: 'キャンセル', color: '#EF4444' },
  ];

  const handleStatusChange = async (newStatus: TradeStatus) => {
    try {
      await updateTrade.mutateAsync({
        id: id || '',
        trade: { status: newStatus },
      });
      setStatusDropdownVisible(false);
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
            <Text className='text-xl font-semibold text-gray-900 flex-1 mr-3'>
              {trade.item_name}
            </Text>
            <View className='bg-blue-50 px-3 py-1 rounded-full'>
              <Text className='text-xs font-medium text-blue-600'>
                {trade.type === TradeType.EXCHANGE && '交換'}
                {trade.type === TradeType.TRANSFER && '譲渡'}
                {trade.type === TradeType.PURCHASE && '買取'}
                {trade.type === TradeType.SALE && '売却'}
              </Text>
            </View>
          </View>

          <View>
            <TouchableOpacity
              className='flex-row items-center justify-between'
              onPress={() => setStatusDropdownVisible(!statusDropdownVisible)}
              activeOpacity={1.0}
            >
              <View
                className='px-3 py-1.5 rounded-full'
                style={{ backgroundColor: currentStatus?.color }}
              >
                <Text className='text-sm font-medium text-white'>{currentStatus?.label}</Text>
              </View>
              <Ionicons
                name={statusDropdownVisible ? 'chevron-up' : 'chevron-down'}
                size={16}
                color='#6B7280'
              />
            </TouchableOpacity>

            {statusDropdownVisible && (
              <View className='absolute top-10 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10'>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    activeOpacity={1.0}
                    className={`flex-row items-center justify-between py-3 px-3 ${
                      option.value !== statusOptions[statusOptions.length - 1].value
                        ? 'border-b border-gray-100'
                        : ''
                    } ${trade.status === option.value ? 'bg-blue-50' : ''}`}
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
            )}
          </View>
        </View>

        <View className='bg-white rounded-xl p-4 mb-4'>
          <Text className='text-sm font-medium text-gray-600 mb-2'>取引相手</Text>
          <Text className='text-base text-gray-900'>{trade.partner_name}</Text>
        </View>

        {trade.payment_method && (
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-600 mb-2'>支払い方法</Text>
            <Text className='text-base text-gray-900'>
              {trade.payment_method === 'cash' && '現金'}
              {trade.payment_method === 'bank_transfer' && '銀行振込'}
              {trade.payment_method === 'credit_card' && 'クレジットカード'}
              {trade.payment_method === 'digital_payment' && 'デジタル決済'}
              {trade.payment_method === 'other' && 'その他'}
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
              activeOpacity={1.0}
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
