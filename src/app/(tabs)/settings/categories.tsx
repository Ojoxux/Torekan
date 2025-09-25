import { CategoryModal } from '@/components/ui/CategoryModal';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useCategories';
import { categoryService } from '@/services/categoryService';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function CategoriesScreen() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  // TODO: カテゴリー編集の型あっても良さそう
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);

  /*
   * エラーを処理する関数
   */
  const handleError = (error: unknown) => {
    const errorMessage =
      error && typeof error === 'object' && 'code' in error && error.code === '23505'
        ? '同じ名前のカテゴリが既に存在します'
        : 'カテゴリの作成に失敗しました';

    Alert.alert('エラー', errorMessage);
  };

  /*
   * カテゴリを作成する関数
   */
  const handleCreateCategory = async (name: string, color: string) => {
    try {
      await createMutation.mutateAsync({ name: name.trim(), color });
    } catch (error) {
      console.error('Category creation error:', error);
      handleError(error);
    }
  };

  /*
   * カテゴリを更新する関数
   */
  const handleUpdateCategory = async (id: string, name: string, color: string) => {
    try {
      await updateMutation.mutateAsync({ id, updates: { name, color } });
    } catch (error) {
      console.error('Category update error:', error);
      handleError(error);
    }
  };

  /*
   * カテゴリを削除する関数（関連データ数表示付き）
   */
  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      // 削除影響を取得
      const impact = await categoryService.getDeleteImpact(id);

      let message = `「${name}」を削除してもよろしいですか？`;

      if (impact.goodsCount > 0 || impact.tradesCount > 0) {
        message += '\n\n削除されるデータ:';
        if (impact.goodsCount > 0) {
          message += `\n• グッズ: ${impact.goodsCount}件`;
        }
        if (impact.tradesCount > 0) {
          message += `\n• 取引: ${impact.tradesCount}件`;
        }
        message += '\n\nこの操作は元に戻せません。';
      } else {
        message += '\n\nこの操作は元に戻せません。';
      }

      Alert.alert('カテゴリを削除', message, [
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
      ]);
    } catch (error) {
      console.error('Failed to get delete impact:', error);
      // フォールバック: 基本的な削除確認
      Alert.alert(
        'カテゴリを削除',
        `「${name}」を削除してもよろしいですか？\n\nこの操作は元に戻せません。`,
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
    }
  };

  // TODO: Suspense使って読み込み状態を表現したい
  // MEMO: ErrorBoundaryパターンとか
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
        {/* ホーム画面(取引管理一覧)に戻る */}
        <Link href='/' asChild>
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
