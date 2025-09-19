import { CategoryModal } from '@/components/ui/CategoryModal';
import {
   useCategories,
   useCreateCategory,
   useDeleteCategory,
   useUpdateCategory,
} from '@/hooks/useCategories';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

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
      // HACK: キーボードアニメーションと同期するため遅延してからモーダルを閉じる
      setTimeout(() => {
        setIsAddModalVisible(false);
      }, 200);
    } catch (error) {
      console.error('Category creation error:', error);
      
      // エラーの種類に応じてメッセージを変更
      const errorMessage = error && typeof error === 'object' && 'code' in error && error.code === '23505'
        ? '同じ名前のカテゴリが既に存在します'
        : 'カテゴリの作成に失敗しました';
      
      Alert.alert('エラー', errorMessage);
      
      // HACK: エラー時もキーボードアニメーションと同期してモーダルを閉じる
      setTimeout(() => {
        setIsAddModalVisible(false);
      }, 200);
    }
  };

  const handleUpdateCategory = async (id: string, name: string, color: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { name, color } });
      // HACK: キーボードアニメーションと同期するため遅延してからモーダルを閉じる
      setTimeout(() => {
        setEditingCategory(null);
      }, 200);
    } catch (error) {
      console.error('Category update error:', error);
      
      // エラーの種類に応じてメッセージを変更
      const errorMessage = error && typeof error === 'object' && 'code' in error && error.code === '23505'
        ? '同じ名前のカテゴリが既に存在します'
        : 'カテゴリの更新に失敗しました';
      
      Alert.alert('エラー', errorMessage);
      
      // HACK: エラー時もキーボードアニメーションと同期してモーダルを閉じる
      setTimeout(() => {
        setEditingCategory(null);
      }, 200);
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
        <Link href='/(tabs)/settings' asChild>
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
