import { useCategory } from '@/hooks/useCategories';
import { useCreateGoodsItem } from '@/hooks/useGoods';
import { createGoodsItemSchema } from '@/lib/schemas';
import { CreateGoodsItemInput } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
import * as v from 'valibot';

/*
 * グッズアイテム新規作成画面
 */
export default function NewGoodsScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: category } = useCategory(categoryId || '');
  const createGoodsItem = useCreateGoodsItem();

  const handleSubmit = async () => {
    if (!categoryId) {
      Alert.alert('エラー', 'カテゴリが選択されていません。');
      return;
    }

    const formData = {
      category_id: categoryId,
      name: name.trim(),
      description: description.trim() || undefined,
    };

    const result = v.safeParse(createGoodsItemSchema, formData);

    if (!result.success) {
      const firstError = result.issues[0];
      Alert.alert('入力エラー', firstError.message);
      return;
    }

    try {
      await createGoodsItem.mutateAsync(result.output as CreateGoodsItemInput);
      router.push(`/category/${categoryId}/goods`);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create goods item:', error);
      Alert.alert('エラー', 'グッズの作成に失敗しました。');
    }
  };

  const handleCancel = () => {
    if (name.trim() || description.trim()) {
      Alert.alert('確認', '入力した内容が失われますが、よろしいですか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '破棄',
          style: 'destructive',
          onPress: () => router.push(`/category/${categoryId}/goods`),
        },
      ]);
    } else {
      router.push(`/category/${categoryId}/goods`);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* ヘッダー */}
      <View className='flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
        <TouchableOpacity className='p-2' onPress={handleCancel}>
          <Text className='text-blue-600 text-base font-medium'>キャンセル</Text>
        </TouchableOpacity>
        <Text className='text-lg font-semibold text-gray-900'>新しいグッズ</Text>
        <TouchableOpacity
          className={`p-2 ${createGoodsItem.isPending ? 'opacity-50' : ''}`}
          onPress={handleSubmit}
          disabled={createGoodsItem.isPending}
        >
          {createGoodsItem.isPending ? (
            <ActivityIndicator size='small' color='#3B82F6' />
          ) : (
            <Text className='text-blue-600 text-base font-medium'>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
      >
        <ScrollView className='flex-1 p-4'>
          {/* カテゴリ情報 */}
          {category && (
            <View className='bg-white rounded-xl p-4 mb-4'>
              <Text className='text-sm font-medium text-gray-500 mb-2'>追加先カテゴリ</Text>
              <View className='flex-row items-center'>
                <View
                  className='w-8 h-8 rounded-full items-center justify-center mr-3'
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Ionicons name='folder-outline' size={16} color={category.color} />
                </View>
                <Text className='text-lg font-semibold text-gray-900'>{category.name}</Text>
              </View>
            </View>
          )}

          {/* フォーム */}
          <View className='bg-white rounded-xl p-4 mb-4'>
            {/* グッズ名 */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-gray-700 mb-2'>
                グッズ名 <Text className='text-red-500'>*</Text>
              </Text>
              <TextInput
                className='border border-gray-300 rounded-lg px-3 py-2 text-base'
                placeholder='例: 〇〇の缶バッジ'
                value={name}
                onChangeText={setName}
                maxLength={128}
                autoFocus
              />
              <Text className='text-xs text-gray-500 mt-1'>{name.length}/128文字</Text>
            </View>

            {/* 説明 */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-gray-700 mb-2'>説明</Text>
              <TextInput
                className='border border-gray-300 rounded-lg px-3 py-2 text-base'
                placeholder='グッズの詳細説明（任意）'
                value={description}
                onChangeText={setDescription}
                maxLength={500}
                multiline
                numberOfLines={4}
                textAlignVertical='top'
              />
              <Text className='text-xs text-gray-500 mt-1'>{description.length}/500文字</Text>
            </View>
          </View>

          {/* ヘルプテキスト */}
          <View className='bg-blue-50 rounded-xl p-4'>
            <View className='flex-row items-start'>
              <Ionicons name='information-circle-outline' size={20} color='#3B82F6' />
              <View className='flex-1 ml-3'>
                <Text className='text-sm font-medium text-blue-900 mb-1'>グッズについて</Text>
                <Text className='text-sm text-blue-800'>
                  同じグッズに対して複数の取引相手との取引を管理できます。
                  作成後、このグッズに関連する取引を追加することができます。
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
