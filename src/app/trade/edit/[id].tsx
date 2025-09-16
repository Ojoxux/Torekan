import { useTrade, useUpdateTrade } from '@/hooks/useTrades';
import { TradeType, PaymentMethod } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/*
 * 取引編集画面のページコンポーネント
 */
export default function EditTradeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: trade, isLoading } = useTrade(id || '');
  const updateTrade = useUpdateTrade();

  const [formData, setFormData] = useState({
    item_name: '',
    type: TradeType.TRANSFER,
    partner_name: '',
    payment_method: undefined as PaymentMethod | undefined,
    notes: '',
  });

  useEffect(() => {
    if (trade) {
      setFormData({
        item_name: trade.item_name || '',
        type: trade.type,
        partner_name: trade.partner_name || '',
        payment_method: trade.payment_method,
        notes: trade.notes || '',
      });
    }
  }, [trade]);

  const handleSubmit = async () => {
    if (!formData.item_name.trim()) {
      Alert.alert('エラー', 'アイテム名を入力してください。');
      return;
    }
    if (!formData.partner_name.trim()) {
      Alert.alert('エラー', '取引相手名を入力してください。');
      return;
    }

    try {
      const tradeData = {
        item_name: formData.item_name.trim(),
        partner_name: formData.partner_name.trim(),
        type: formData.type,
        payment_method: formData.payment_method,
        notes: formData.notes.trim() || undefined,
      };

      await updateTrade.mutateAsync({
        id: id || '',
        trade: tradeData,
      });
      router.back();
    } catch (error) {
      console.error('Failed to update trade:', error);
      Alert.alert('エラー', '取引の更新に失敗しました。');
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    options: {
      placeholder?: string;
      multiline?: boolean;
      keyboardType?: 'default' | 'numeric';
      required?: boolean;
    } = {}
  ) => (
    <View className='mb-5'>
      <Text className='text-base font-medium text-gray-700 mb-2'>
        {label}
        {options.required && <Text className='text-red-500'>*</Text>}
      </Text>
      <TextInput
        className={`bg-white rounded-lg px-3 py-3 text-base text-gray-900 border border-gray-300 ${
          options.multiline ? 'h-20' : ''
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={options.placeholder}
        multiline={options.multiline}
        keyboardType={options.keyboardType}
        placeholderTextColor='#9CA3AF'
        textAlignVertical={options.multiline ? 'top' : 'center'}
      />
    </View>
  );

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
      <KeyboardAvoidingView
        className='flex-1'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className='flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
          <TouchableOpacity className='p-2' onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='#111827' />
          </TouchableOpacity>
          <Text className='text-lg font-semibold text-gray-900'>取引を編集</Text>
          <TouchableOpacity
            className='px-4 py-2 bg-blue-500 rounded-lg'
            onPress={handleSubmit}
            disabled={updateTrade.isPending}
          >
            <Text className='text-white text-base font-medium'>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className='flex-1 p-4' showsVerticalScrollIndicator={false}>
          {renderInputField(
            'アイテム名',
            formData.item_name,
            (text) => setFormData({ ...formData, item_name: text }),
            { placeholder: '例: アクリルスタンド A', required: true }
          )}

          <View className='mb-5'>
            <Text className='text-base font-medium text-gray-700 mb-2'>取引種別</Text>
            <View className='flex-row flex-wrap gap-3'>
              {[
                { value: TradeType.EXCHANGE, label: '交換' },
                { value: TradeType.TRANSFER, label: '譲渡' },
                { value: TradeType.PURCHASE, label: '買取' },
                { value: TradeType.SALE, label: '売却' },
              ].map((option) => (
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

          {renderInputField(
            '取引相手',
            formData.partner_name,
            (text) => setFormData({ ...formData, partner_name: text }),
            { placeholder: '@username または 名前', required: true }
          )}

          <View className='mb-5'>
            <Text className='text-base font-medium text-gray-700 mb-2'>支払い方法</Text>
            <View className='flex-row flex-wrap gap-2'>
              {[
                { value: PaymentMethod.CASH, label: '現金' },
                { value: PaymentMethod.BANK_TRANSFER, label: '銀行振込' },
                { value: PaymentMethod.CREDIT_CARD, label: 'クレジットカード' },
                { value: PaymentMethod.DIGITAL_PAYMENT, label: 'デジタル決済' },
                { value: PaymentMethod.OTHER, label: 'その他' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`py-2 px-3 rounded-lg border ${
                    formData.payment_method === option.value
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                  onPress={() => 
                    setFormData({ 
                      ...formData, 
                      payment_method: formData.payment_method === option.value ? undefined : option.value 
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

          {renderInputField(
            'メモ',
            formData.notes,
            (text) => setFormData({ ...formData, notes: text }),
            {
              placeholder: '連絡先、交換場所、注意事項など',
              multiline: true,
            }
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
