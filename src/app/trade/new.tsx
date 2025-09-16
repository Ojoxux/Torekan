import { useCreateTrade } from '@/hooks/useTrades';
import { TradeStatus, TradeType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
 * 取引情報追加画面のページコンポーネント
 */
export default function NewTradeScreen() {
  const router = useRouter();
  const createTrade = useCreateTrade();

  const [formData, setFormData] = useState({
    title: '',
    type: 'sell' as TradeType,
    partner: '',
    myItems: '',
    partnerItems: '',
    price: '',
    eventDate: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください。');
      return;
    }

    try {
      const tradeData = {
        title: formData.title.trim(),
        type: formData.type,
        status: 'planning' as TradeStatus,
        partner: formData.partner.trim() || undefined,
        my_items: formData.myItems.trim() || undefined,
        partner_items: formData.partnerItems.trim() || undefined,
        price: formData.price ? parseInt(formData.price, 10) : undefined,
        event_date: formData.eventDate || undefined,
        notes: formData.notes.trim() || undefined,
      };

      await createTrade.mutateAsync(tradeData);
      router.back();
    } catch (error) {
      console.error('Failed to create trade:', error);
      Alert.alert('エラー', '取引の作成に失敗しました。');
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
          <Text className='text-lg font-semibold text-gray-900'>新しい取引</Text>
          <TouchableOpacity
            className='px-4 py-2 bg-blue-500 rounded-lg'
            onPress={handleSubmit}
            disabled={createTrade.isPending}
          >
            <Text className='text-white text-base font-medium'>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className='flex-1 p-4' showsVerticalScrollIndicator={false}>
          {renderInputField(
            'タイトル',
            formData.title,
            (text) => setFormData({ ...formData, title: text }),
            { placeholder: '例: コミケ100 グッズ交換', required: true }
          )}

          <View className='mb-5'>
            <Text className='text-base font-medium text-gray-700 mb-2'>取引種別</Text>
            <View className='flex-row gap-3'>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg border items-center ${
                  formData.type === 'sell'
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => setFormData({ ...formData, type: 'sell' })}
              >
                <Text
                  className={`text-base font-medium ${
                    formData.type === 'sell' ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  譲渡
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-lg border items-center ${
                  formData.type === 'buy'
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => setFormData({ ...formData, type: 'buy' })}
              >
                <Text
                  className={`text-base font-medium ${
                    formData.type === 'buy' ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  求
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderInputField(
            '取引相手',
            formData.partner,
            (text) => setFormData({ ...formData, partner: text }),
            { placeholder: '@username または 名前' }
          )}

          {renderInputField(
            '自分の提供物',
            formData.myItems,
            (text) => setFormData({ ...formData, myItems: text }),
            {
              placeholder: '例: アクリルスタンド A, ポストカード B',
              multiline: true,
            }
          )}

          {renderInputField(
            '相手の提供物',
            formData.partnerItems,
            (text) => setFormData({ ...formData, partnerItems: text }),
            {
              placeholder: '例: 缶バッジ C, クリアファイル D',
              multiline: true,
            }
          )}

          {renderInputField(
            '金額',
            formData.price,
            (text) => setFormData({ ...formData, price: text }),
            { placeholder: '円', keyboardType: 'numeric' }
          )}

          {renderInputField(
            'イベント日',
            formData.eventDate,
            (text) => setFormData({ ...formData, eventDate: text }),
            { placeholder: 'YYYY-MM-DD' }
          )}

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
