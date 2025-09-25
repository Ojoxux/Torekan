import { useAllGoodsItems } from '@/hooks/useGoods';
import { useTrade, useUpdateTrade } from '@/hooks/useTrades';
import { updateTradeSchema } from '@/lib/schemas';
import { PaymentMethod, TradeType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as v from 'valibot';

/*
 * 取引編集画面のページコンポーネント
 */
export default function EditTradeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: trade, isLoading } = useTrade(id || '');
  const { data: goodsItems = [] } = useAllGoodsItems();
  const updateTrade = useUpdateTrade();

  const [formData, setFormData] = useState({
    goods_item_id: '',
    type: TradeType.TRANSFER,
    partner_name: '',
    item_name: '',
    quantity: 1,
    payment_method: undefined as PaymentMethod | undefined,
    notes: '',
    shipping_deadline: undefined as string | undefined,
  });

  const [showGoodsModal, setShowGoodsModal] = useState(false);

  const selectedGoodsItem = goodsItems.find((item) => item.id === formData.goods_item_id);

  useEffect(() => {
    if (trade) {
      setFormData({
        goods_item_id: trade.goods_item_id || '',
        type: trade.type,
        partner_name: trade.partner_name || '',
        item_name: trade.item_name || '',
        quantity: trade.quantity || 1,
        payment_method: trade.payment_method,
        notes: trade.notes || '',
        shipping_deadline: trade.shipping_deadline || undefined,
      });
    }
  }, [trade]);

  const handleSubmit = async () => {
    // Valibotバリデーション
    const tradeData = {
      partner_name: formData.partner_name.trim(),
      item_name: formData.item_name.trim(),
      quantity: formData.quantity,
      type: formData.type,
      payment_method: formData.payment_method,
      notes: formData.notes.trim() || undefined,
      shipping_deadline: formData.shipping_deadline || undefined,
    };

    const result = v.safeParse(updateTradeSchema, tradeData);

    if (!result.success) {
      const firstError = result.issues[0];
      Alert.alert('入力エラー', firstError.message);
      return;
    }

    try {
      await updateTrade.mutateAsync({
        id: id || '',
        trade: result.output,
      });
      router.push(`/trade/${id}`);
      // サブミットが終わったらフォームをリセットする
      setFormData({
        goods_item_id: formData.goods_item_id,
        type: formData.type,
        partner_name: formData.partner_name,
        item_name: formData.item_name,
        quantity: formData.quantity,
        payment_method: formData.payment_method,
        notes: formData.notes,
        shipping_deadline: formData.shipping_deadline,
      });
    } catch (error) {
      console.error('Failed to update trade:', error);
      Alert.alert('エラー', '取引の更新に失敗しました。');
    }
  };

  const handleCancel = () => {
    router.push(`/trade/${id}`);
  };

  const tradeTypeOptions = [
    { value: TradeType.EXCHANGE, label: '交換' },
    { value: TradeType.TRANSFER, label: '譲渡' },
    { value: TradeType.PURCHASE, label: '買取' },
  ];

  const paymentMethodOptions = [
    { value: PaymentMethod.CASH, label: '現金' },
    { value: PaymentMethod.BANK_TRANSFER, label: '銀行振込' },
    { value: PaymentMethod.CREDIT_CARD, label: 'クレジットカード' },
    { value: PaymentMethod.DIGITAL_PAYMENT, label: 'デジタル決済' },
    { value: PaymentMethod.OTHER, label: 'その他' },
  ];

  const isValid = formData.goods_item_id && formData.partner_name.trim();

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

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* ヘッダー */}
      <View className='flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
        <TouchableOpacity className='p-2' onPress={handleCancel}>
          <Text className='text-blue-600 text-base font-medium'>キャンセル</Text>
        </TouchableOpacity>
        <Text className='text-lg font-semibold text-gray-900'>取引を編集</Text>
        <TouchableOpacity
          className={`p-2 ${!isValid ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={!isValid || updateTrade.isPending}
        >
          <Text className='text-blue-600 text-base font-medium'>保存</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView className='flex-1 p-4'>
          {/* グッズ選択 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>
              グッズ <Text className='text-red-500'>*</Text>
            </Text>

            <TouchableOpacity
              className='border border-gray-300 rounded-lg p-3 flex-row items-center justify-between'
              onPress={() => setShowGoodsModal(true)}
            >
              {selectedGoodsItem ? (
                <View className='flex-row items-center flex-1'>
                  <View
                    className='w-8 h-8 rounded-full items-center justify-center mr-3'
                    style={{ backgroundColor: `${selectedGoodsItem.category.color}20` }}
                  >
                    <Ionicons
                      name='cube-outline'
                      size={16}
                      color={selectedGoodsItem.category.color}
                    />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-base font-medium text-gray-900'>
                      {selectedGoodsItem.name}
                    </Text>
                    <Text className='text-sm text-gray-600'>{selectedGoodsItem.category.name}</Text>
                  </View>
                </View>
              ) : (
                <Text className='text-gray-500'>グッズを選択してください</Text>
              )}
              <Ionicons name='chevron-down' size={20} color='#9CA3AF' />
            </TouchableOpacity>
          </View>

          {/* アイテム名 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>
              アイテム名 <Text className='text-red-500'>*</Text>
            </Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='具体的なアイテム名（例：田中太郎のバッジ）'
              value={formData.item_name}
              onChangeText={(text) => setFormData({ ...formData, item_name: text })}
              maxLength={128}
            />
          </View>

          {/* 個数 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>
              個数 <Text className='text-red-500'>*</Text>
            </Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='1'
              value={formData.quantity.toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10) || 1;
                setFormData({ ...formData, quantity: Math.max(1, num) });
              }}
              keyboardType='number-pad'
              maxLength={3}
            />
          </View>

          {/* 取引相手名 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>
              取引相手名 <Text className='text-red-500'>*</Text>
            </Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='@twitter_id'
              value={formData.partner_name}
              onChangeText={(text) => setFormData({ ...formData, partner_name: text })}
              maxLength={100}
            />
          </View>

          {/* 取引タイプ */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-3'>取引タイプ</Text>
            <View className='flex-row flex-wrap gap-2'>
              {tradeTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`flex-1 py-3 px-4 rounded-lg border items-center ${
                    formData.type === option.value
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => setFormData({ ...formData, type: option.value })}
                >
                  <Text
                    className={`text-base font-medium ${
                      formData.type === option.value ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 支払い方法 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-3'>支払い方法</Text>
            <View className='flex-row flex-wrap gap-2'>
              {paymentMethodOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`px-3 py-2 rounded-full border ${
                    formData.payment_method === option.value
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      payment_method:
                        formData.payment_method === option.value ? undefined : option.value,
                    })
                  }
                >
                  <Text
                    className={`text-sm font-medium ${
                      formData.payment_method === option.value ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* メモ */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>メモ</Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='取引に関するメモ（任意）'
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              textAlignVertical='top'
              maxLength={500}
            />
            <Text className='text-xs text-gray-500 mt-1'>{formData.notes.length}/500文字</Text>
          </View>

          {/* 発送期限 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>発送期限</Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='YYYY-MM-DD'
              value={formData.shipping_deadline || ''}
              onChangeText={(text) => setFormData({ ...formData, shipping_deadline: text })}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* グッズ選択モーダル */}
      <Modal visible={showGoodsModal} animationType='slide' transparent>
        <View className='flex-1 bg-black/50 justify-end'>
          <View className='bg-white rounded-t-xl p-4 max-h-96'>
            <View className='flex-row items-center justify-between mb-4'>
              <Text className='text-xl font-bold'>グッズを選択</Text>
              <Pressable onPress={() => setShowGoodsModal(false)}>
                <Ionicons name='close' size={24} color='#6B7280' />
              </Pressable>
            </View>

            <ScrollView>
              {goodsItems.map((goods) => (
                <TouchableOpacity
                  key={goods.id}
                  className={`flex-row items-center p-3 rounded-lg mb-2 ${
                    formData.goods_item_id === goods.id ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                  onPress={() => {
                    setFormData({ ...formData, goods_item_id: goods.id });
                    setShowGoodsModal(false);
                  }}
                >
                  <View
                    className='w-8 h-8 rounded-full items-center justify-center mr-3'
                    style={{ backgroundColor: `${goods.category.color}20` }}
                  >
                    <Ionicons name='cube-outline' size={16} color={goods.category.color} />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-base font-medium text-gray-900'>{goods.name}</Text>
                    <Text className='text-sm text-gray-600'>{goods.category.name}</Text>
                  </View>
                  {formData.goods_item_id === goods.id && (
                    <Ionicons name='checkmark' size={20} color='#3B82F6' />
                  )}
                </TouchableOpacity>
              ))}

              {goodsItems.length === 0 && (
                <View className='p-8 items-center'>
                  <Text className='text-gray-500 text-center mb-4'>
                    グッズがまだ作成されていません
                  </Text>
                  <Text className='text-sm text-gray-400 text-center'>
                    先にグッズを作成してください
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
