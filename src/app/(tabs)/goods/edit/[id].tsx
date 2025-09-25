import { useCategories } from '@/hooks/useCategories';
import { useGoodsItemById, useUpdateGoodsItem } from '@/hooks/useGoods';
import { updateGoodsItemSchema } from '@/lib/schemas';
import { GoodsCategory } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
 * グッズアイテム編集画面
 */
export default function EditGoodsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: goodsItem, isLoading } = useGoodsItemById(id || '');
  const { data: categories = [] } = useCategories();
  const updateGoodsItem = useUpdateGoodsItem();

  const [formData, setFormData] = useState({
    name: '',
    release_date: null as Date | null,
    category_id: '',
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const selectedCategory = categories.find((cat: GoodsCategory) => cat.id === formData.category_id);

  useEffect(() => {
    if (goodsItem) {
      setFormData({
        name: goodsItem.name,
        release_date: goodsItem.release_date ? new Date(goodsItem.release_date) : null,
        category_id: goodsItem.category_id,
      });
    }
  }, [goodsItem]);

  /*
   * 保存するボタン押下時にグッズを更新
   */
  const handleSubmit = async () => {
    const submitData = {
      name: formData.name.trim(),
      release_date: formData.release_date ? formData.release_date.toISOString().split('T')[0] : undefined,
      category_id: formData.category_id,
    };

    const result = v.safeParse(updateGoodsItemSchema, submitData);

    if (!result.success) {
      const firstError = result.issues[0];
      Alert.alert('入力エラー', firstError.message);
      return;
    }

    try {
      await updateGoodsItem.mutateAsync({
        id: id || '',
        input: result.output,
        originalCategoryId: goodsItem?.category_id, // 元のカテゴリIDを渡す
      });
      router.push(`/category/${formData.category_id}/goods`);
    } catch (error) {
      console.error('Failed to update goods item:', error);
      Alert.alert('エラー', 'グッズの更新に失敗しました。');
    }
  };

  /*
   * キャンセルボタン押下時にグッズの編集画面を閉じる
   */
  const handleCancel = () => {
    router.push(`/category/${goodsItem?.category_id}/goods`);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDateConfirm = () => {
    setFormData({ ...formData, release_date: tempDate });
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(formData.release_date || new Date());
    setShowDatePicker(false);
  };

  const handleDatePickerOpen = () => {
    setTempDate(formData.release_date || new Date());
    setShowDatePicker(true);
  };

  const isValid = formData.name.trim() && formData.category_id;

  if (isLoading) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size='large' color='#3B82F6' />
      </View>
    );
  }

  if (!goodsItem) {
    return (
      <View className='flex-1 justify-center items-center bg-gray-50 px-5'>
        <Text className='text-lg text-gray-600 mb-5'>グッズが見つかりません</Text>
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
        <Text className='text-lg font-semibold text-gray-900'>グッズを編集</Text>
        <TouchableOpacity
          className={`p-2 ${!isValid || updateGoodsItem.isPending ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={!isValid || updateGoodsItem.isPending}
        >
          <Text className='text-blue-600 text-base font-medium'>保存</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView className='flex-1 p-4'>
          {/* カテゴリ選択 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>
              カテゴリ <Text className='text-red-500'>*</Text>
            </Text>

            <TouchableOpacity
              className='border border-gray-300 rounded-lg p-3 flex-row items-center justify-between'
              onPress={() => setShowCategoryModal(true)}
            >
              {selectedCategory ? (
                <View className='flex-row items-center flex-1'>
                  <View
                    className='w-8 h-8 rounded-full items-center justify-center mr-3'
                    style={{ backgroundColor: `${selectedCategory.color}20` }}
                  >
                    <Ionicons name='folder-outline' size={16} color={selectedCategory.color} />
                  </View>
                  <Text className='text-base font-medium text-gray-900'>
                    {selectedCategory.name}
                  </Text>
                </View>
              ) : (
                <Text className='text-gray-500'>カテゴリを選択してください</Text>
              )}
              <Ionicons name='chevron-down' size={20} color='#9CA3AF' />
            </TouchableOpacity>
          </View>

          {/* グッズ名 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>
              グッズ名 <Text className='text-red-500'>*</Text>
            </Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='例: 〇〇の缶バッジ'
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              maxLength={128}
            />
            <Text className='text-xs text-gray-500 mt-1'>{formData.name.length}/128文字</Text>
          </View>

          {/* 発売日 */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            <Text className='text-sm font-medium text-gray-700 mb-2'>発売日</Text>
            <TouchableOpacity
              className='border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-between'
              onPress={handleDatePickerOpen}
            >
              <Text className={`text-base ${formData.release_date ? 'text-gray-900' : 'text-gray-500'}`}>
                {formData.release_date 
                  ? formData.release_date.toLocaleDateString('ja-JP') 
                  : '発売日を選択してください（任意）'
                }
              </Text>
              <Ionicons name='calendar-outline' size={20} color='#9CA3AF' />
            </TouchableOpacity>
            {formData.release_date && (
              <TouchableOpacity
                className='mt-2'
                onPress={() => setFormData({ ...formData, release_date: null })}
              >
                <Text className='text-sm text-red-500'>発売日をクリア</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ヘルプテキスト */}
          <View className='bg-blue-50 rounded-xl p-4'>
            <View className='flex-row items-start'>
              <Ionicons
                name='information-circle'
                size={20}
                color='#3B82F6'
                className='mt-0.5 mr-2'
              />
              <View className='flex-1'>
                <Text className='text-sm font-medium text-blue-900 mb-1'>グッズ編集について</Text>
                <Text className='text-sm text-blue-800'>
                  • グッズ名とカテゴリは必須項目です{'\n'}•
                  カテゴリを変更すると、グッズが別のカテゴリに移動します{'\n'}•
                  関連する取引データは保持されます
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* カテゴリ選択モーダル */}
      <Modal visible={showCategoryModal} animationType='slide' transparent>
        <View className='flex-1 bg-black/50 justify-end'>
          <View className='bg-white rounded-t-xl p-4 max-h-96'>
            <View className='flex-row items-center justify-between mb-4'>
              <Text className='text-xl font-bold'>カテゴリを選択</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Ionicons name='close' size={24} color='#6B7280' />
              </Pressable>
            </View>

            <ScrollView>
              {categories.map((category: GoodsCategory) => (
                <TouchableOpacity
                  key={category.id}
                  className={`flex-row items-center p-3 rounded-lg mb-2 ${
                    formData.category_id === category.id ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                  onPress={() => {
                    setFormData({ ...formData, category_id: category.id });
                    setShowCategoryModal(false);
                  }}
                >
                  <View
                    className='w-8 h-8 rounded-full items-center justify-center mr-3'
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <Ionicons name='folder-outline' size={16} color={category.color} />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-base font-medium text-gray-900'>{category.name}</Text>
                  </View>
                  {formData.category_id === category.id && (
                    <Ionicons name='checkmark' size={20} color='#3B82F6' />
                  )}
                </TouchableOpacity>
              ))}

              {categories.length === 0 && (
                <View className='p-8 items-center'>
                  <Text className='text-gray-500 text-center mb-4'>
                    カテゴリがまだ作成されていません
                  </Text>
                  <Text className='text-sm text-gray-400 text-center'>
                    先にカテゴリを作成してください
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={handleDateCancel}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={handleDateCancel}
        >
          <Pressable onPress={() => {}}>
            <View className="bg-white rounded-xl p-4 mx-6 w-120">
              <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
                発売日を選択
              </Text>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                style={{ alignSelf: 'center' }}
              />
              <View className="flex-row justify-end mt-4 space-x-3">
                <TouchableOpacity
                  className="px-4 py-2 rounded-lg"
                  onPress={handleDateCancel}
                >
                  <Text className="text-gray-600 font-medium">キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-4 py-2 bg-blue-500 rounded-lg"
                  onPress={handleDateConfirm}
                >
                  <Text className="text-white font-medium">決定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
