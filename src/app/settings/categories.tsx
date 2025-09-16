import { categoryService } from '@/services/categoryService';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useUpdateCategorySortOrder,
} from '@/hooks/useCategories';
import { createCategorySchema } from '@/lib/schemas';
import type { CreateCategoryFormInput } from '@/lib/schemas';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function CategoriesScreen() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);

  const presetColors = categoryService.getPresetColors();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateCategoryFormInput>({
    resolver: valibotResolver(createCategorySchema),
    defaultValues: {
      name: '',
      color: '#6B7280',
    },
  });

  const selectedColor = watch('color');

  const handleCreateCategory = async (data: CreateCategoryFormInput) => {
    try {
      await createMutation.mutateAsync(data);
      setIsAddModalVisible(false);
      reset();
    } catch (error) {
      console.error('Category creation error:', error);
      Alert.alert('エラー', 'カテゴリの作成に失敗しました');
    }
  };

  const handleUpdateCategory = async (id: string, name: string, color: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { name, color } });
      setEditingCategory(null);
    } catch (error) {
      console.error('Category update error:', error);
      Alert.alert('エラー', 'カテゴリの更新に失敗しました');
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    Alert.alert(
      'カテゴリを削除',
      `「${name}」を削除しますか？\n\n使用中の取引がある場合、カテゴリの関連付けは解除されますが、取引データは保持されます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id);
            } catch (error) {
              console.error('Category deletion error:', error);
              Alert.alert('エラー', 'カテゴリの削除に失敗しました');
            }
          },
        },
      ]
    );
  };

  const CategoryModal = ({
    visible,
    onClose,
    title,
    onSubmit,
    initialName = '',
    initialColor = '#6B7280',
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    onSubmit: (name: string, color: string) => void;
    initialName?: string;
    initialColor?: string;
  }) => {
    const [name, setName] = useState(initialName);
    const [color, setColor] = useState(initialColor);

    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center p-4">
          <View className="bg-white rounded-lg p-6">
            <Text className="text-xl font-bold mb-4">{title}</Text>
            
            <Text className="text-gray-700 font-medium mb-2">カテゴリ名</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="カテゴリ名を入力"
              className="border border-gray-300 rounded-lg p-3 mb-4"
            />

            <Text className="text-gray-700 font-medium mb-2">カラー</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {presetColors.map((presetColor) => (
                <Pressable
                  key={presetColor}
                  onPress={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === presetColor ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={onClose}
                className="flex-1 bg-gray-200 rounded-lg p-3"
              >
                <Text className="text-gray-800 text-center font-medium">キャンセル</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (name.trim()) {
                    onSubmit(name.trim(), color);
                    setName('');
                    setColor('#6B7280');
                  }
                }}
                className="flex-1 bg-blue-500 rounded-lg p-3"
              >
                <Text className="text-white text-center font-medium">保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-2 bg-white border-b border-gray-200 flex-row items-center justify-between">
        <Link href="/settings" asChild>
          <Pressable className="p-2">
            <Text className="text-blue-500 text-lg">← 戻る</Text>
          </Pressable>
        </Link>
        <Text className="text-lg font-bold">グッズカテゴリ管理</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className="flex-1 p-4">
        <View className="bg-white rounded-lg shadow-sm">
          {categories?.length === 0 ? (
            <View className="p-8 items-center">
              <Text className="text-gray-500 text-center mb-4">
                まだカテゴリが作成されていません
              </Text>
            </View>
          ) : (
            categories?.map((category, index) => (
              <View
                key={category.id}
                className={`flex-row items-center p-4 ${
                  index < categories.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <View
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                />
                <Text className="flex-1 text-gray-900 font-medium">{category.name}</Text>
                
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() =>
                      setEditingCategory({
                        id: category.id,
                        name: category.name,
                        color: category.color,
                      })
                    }
                    className="bg-blue-50 rounded-lg px-3 py-2"
                  >
                    <Text className="text-blue-600 text-sm">編集</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteCategory(category.id, category.name)}
                    className="bg-red-50 rounded-lg px-3 py-2"
                  >
                    <Text className="text-red-600 text-sm">削除</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <Pressable
          onPress={() => setIsAddModalVisible(true)}
          className="bg-blue-500 rounded-lg p-4 mt-4 active:bg-blue-600"
        >
          <Text className="text-white text-center font-medium">+ カテゴリを追加</Text>
        </Pressable>
      </ScrollView>

      <CategoryModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        title="新しいカテゴリ"
        onSubmit={(name, color) => {
          handleCreateCategory({ name, color });
        }}
      />

      {editingCategory && (
        <CategoryModal
          visible={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          title="カテゴリを編集"
          initialName={editingCategory.name}
          initialColor={editingCategory.color}
          onSubmit={(name, color) => {
            handleUpdateCategory(editingCategory.id, name, color);
          }}
        />
      )}
    </SafeAreaView>
  );
}