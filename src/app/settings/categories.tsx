import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories';
import { categoryService } from '@/services/categoryService';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
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

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (name: string, color: string) => void;
  initialName?: string;
  initialColor?: string;
}

function CategoryModal({
  visible,
  onClose,
  title,
  onSubmit,
  initialName = '',
  initialColor = '#6B7280',
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const presetColors = categoryService.getPresetColors();

  // モーダルが開かれたときに初期値をセット
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(initialColor);
    }
  }, [visible, initialName, initialColor]);

  return (
    <Modal visible={visible} animationType='slide' transparent>
      <View className='flex-1 bg-black/50 justify-center p-4'>
        <View className='bg-white rounded-lg p-6'>
          <Text className='text-xl font-bold mb-4'>{title}</Text>

          <Text className='text-gray-700 font-medium mb-2'>カテゴリ名</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder='カテゴリ名を入力'
            className='border border-gray-300 rounded-lg p-3 mb-4'
          />

          <Text className='text-gray-700 font-medium mb-2'>カラー</Text>
          <View className='flex-row flex-wrap gap-2 mb-6'>
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

          <View className='flex-row gap-3'>
            <Pressable onPress={onClose} className='flex-1 bg-gray-200 rounded-lg p-3'>
              <Text className='text-gray-800 text-center font-medium'>キャンセル</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const trimmedName = name.trim();
                if (trimmedName.length === 0) {
                  Alert.alert('エラー', 'カテゴリ名を入力してください');
                  return;
                }
                if (trimmedName.length > 32) {
                  Alert.alert('エラー', 'カテゴリ名は32文字以内で入力してください');
                  return;
                }
                onSubmit(trimmedName, color);
                setName('');
                setColor('#6B7280');
              }}
              className='flex-1 bg-blue-500 rounded-lg p-3'
            >
              <Text className='text-white text-center font-medium'>保存</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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

  const handleCreateCategory = async (name: string, color: string) => {
    try {
      await createMutation.mutateAsync({ name: name.trim(), color });
      setIsAddModalVisible(false);
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

  if (isLoading) {
    return (
      <SafeAreaView className='flex-1 bg-gray-50'>
        <View className='flex-1 justify-center items-center'>
          <Text className='text-gray-500'>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className='px-4 py-2 bg-white border-b border-gray-200 flex-row items-center justify-between'>
        <Link href='/settings' asChild>
          <Pressable className='p-2'>
            <Text className='text-blue-500 text-lg'>← 戻る</Text>
          </Pressable>
        </Link>
        <Text className='text-lg font-bold'>グッズカテゴリ管理</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView className='flex-1 p-4'>
        <View className='bg-white rounded-lg shadow-sm'>
          {categories?.length === 0 ? (
            <View className='p-8 items-center'>
              <Text className='text-gray-500 text-center mb-4'>
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
                  className='w-4 h-4 rounded-full mr-3'
                  style={{ backgroundColor: category.color }}
                />
                <Text className='flex-1 text-gray-900 font-medium'>{category.name}</Text>

                <View className='flex-row gap-2'>
                  <Pressable
                    onPress={() =>
                      setEditingCategory({
                        id: category.id,
                        name: category.name,
                        color: category.color,
                      })
                    }
                    className='bg-blue-50 rounded-lg px-3 py-2'
                  >
                    <Text className='text-blue-600 text-sm'>編集</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteCategory(category.id, category.name)}
                    className='bg-red-50 rounded-lg px-3 py-2'
                  >
                    <Text className='text-red-600 text-sm'>削除</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <Pressable
          onPress={() => setIsAddModalVisible(true)}
          className='bg-blue-500 rounded-lg p-4 mt-4 active:bg-blue-600'
          disabled={createMutation.isPending}
        >
          <Text className='text-white text-center font-medium'>
            {createMutation.isPending ? '追加中...' : '+ カテゴリを追加'}
          </Text>
        </Pressable>
      </ScrollView>

      <CategoryModal
        visible={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
        }}
        title='新しいカテゴリ'
        onSubmit={handleCreateCategory}
      />

      {editingCategory && (
        <CategoryModal
          visible={!!editingCategory}
          onClose={() => {
            setEditingCategory(null);
          }}
          title='カテゴリを編集'
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
