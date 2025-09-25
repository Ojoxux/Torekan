import { Ionicons } from '@expo/vector-icons';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SearchBar } from '@/components/common/SearchBar';
import { TradeStats } from '@/components/trade/TradeStats';
import { useCategory } from '@/hooks/useCategories';
import { useDeleteGoodsItem, useGoodsItemsByCategory } from '@/hooks/useGoods';
import { goodsService } from '@/services/goodsService';
import { GoodsItemWithCategory } from '@/types';

/*
 * カテゴリ別グッズアイテム一覧画面
 */
export default function GoodsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedGoods, setSelectedGoods] = useState<GoodsItemWithCategory | null>(null);
  const router = useRouter();

  const { data: category, isLoading: categoryLoading } = useCategory(id || '');

  const {
    data: goodsItems = [],
    isLoading: goodsLoading,
    refetch,
  } = useGoodsItemsByCategory(id || '');

  const deleteGoodsItem = useDeleteGoodsItem();

  const isLoading = categoryLoading || goodsLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleGoodsMenu = useCallback((goods: GoodsItemWithCategory) => {
    setSelectedGoods(goods);
    setActionModalVisible(true);
  }, []);

  const handleDelete = async () => {
    if (!selectedGoods) return;

    try {
      // 削除影響を取得
      // memo: グッズを削除すると、関連した取引データも削除されるため
      const impact = await goodsService.getDeleteImpact(selectedGoods.id);

      let message = `「${selectedGoods.name}」を削除してもよろしいですか？`;

      if (impact.totalTrades > 0) {
        message += '\n\n削除される取引データ:';
        if (impact.activeTrades > 0) {
          message += `\n• 進行中の取引: ${impact.activeTrades}件`;
        }
        if (impact.completedTrades > 0) {
          message += `\n• 完了済み取引: ${impact.completedTrades}件`;
        }
        message += '\n\nこの操作は元に戻せません。';
      } else {
        message += '\n\nこの操作は元に戻せません。';
      }

      Alert.alert('グッズの削除', message, [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoodsItem.mutateAsync(selectedGoods.id);
              setActionModalVisible(false);
              setSelectedGoods(null);
            } catch (error) {
              console.error('Failed to delete goods item:', error);
              Alert.alert('エラー', 'グッズの削除に失敗しました。');
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to get delete impact:', error);
      // フォールバック: 基本的な削除確認
      Alert.alert(
        'グッズの削除',
        `「${selectedGoods.name}」を削除してもよろしいですか？\n\n関連する取引データも削除されます。この操作は元に戻せません。`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '削除',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteGoodsItem.mutateAsync(selectedGoods.id);
                setActionModalVisible(false);
                setSelectedGoods(null);
              } catch (error) {
                console.error('Failed to delete goods item:', error);
                Alert.alert('エラー', 'グッズの削除に失敗しました。');
              }
            },
          },
        ]
      );
    }
  };

  // 検索フィルタリング - より堅牢なフィルタリングロジック
  const filteredGoods = useMemo(() => {
    // goodsItemsが未定義または空の場合は空配列を返す
    if (!goodsItems || goodsItems.length === 0) {
      return [];
    }

    // 検索クエリが空の場合は全てのアイテムを返す
    if (!searchQuery.trim()) {
      return goodsItems;
    }

    const query = searchQuery.toLowerCase().trim();
    return goodsItems.filter((goods) => {
      const nameMatch = goods.name?.toLowerCase().includes(query) || false;
      const releaseDateMatch = goods.release_date?.toLowerCase().includes(query) || false;
      return nameMatch || releaseDateMatch;
    });
  }, [goodsItems, searchQuery]);

  const renderGoodsItem = useCallback(
    ({ item }: { item: GoodsItemWithCategory }) => {
      return (
        <View className='bg-white rounded-xl p-4 mb-3 shadow-sm relative'>
          {/* メニューボタン - 右上 */}
          <TouchableOpacity
            className='absolute top-5 right-3 p-2 z-10'
            onPress={() => handleGoodsMenu(item)}
            activeOpacity={0.7}
          >
            <Ionicons name='ellipsis-horizontal' size={20} color='#6B7280' />
          </TouchableOpacity>

          <TouchableOpacity
            className='pr-10 pb-8'
            onPress={() => router.push(`/goods/${item.id}/trades` as Href)}
            activeOpacity={0.7}
          >
            {/* グッズ情報 */}
            <View className='flex-1'>
              <Text
                className='text-lg font-semibold text-gray-900 mb-1'
                style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}
                numberOfLines={2}
              >
                {item.name}
              </Text>

              {item.release_date && (
                <Text
                  className='text-sm text-gray-600 mb-2'
                  style={{ fontSize: 14, color: '#4B5563' }}
                  numberOfLines={1}
                >
                  発売日: {new Date(item.release_date).toLocaleDateString('ja-JP')}
                </Text>
              )}

              {/* 取引統計情報 */}
              <TradeStats goodsItemId={item.id} />

              <Text
                className='text-xs text-gray-400 mt-1'
                style={{ fontSize: 12, color: '#9CA3AF' }}
              >
                作成日: {new Date(item.created_at).toLocaleDateString('ja-JP')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 矢印アイコン - 右下 */}
          <View className='absolute bottom-5 right-5'>
            <Ionicons name='chevron-forward' size={20} color='#9CA3AF' />
          </View>
        </View>
      );
    },
    [router, handleGoodsMenu]
  );

  // 初回ロード時のみフルスクリーンローディングを表示
  if (isLoading && !goodsItems.length) {
    return (
      <SafeAreaView className='flex-1 justify-center items-center bg-gray-50'>
        <ActivityIndicator size='large' color='#3B82F6' />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      {/* ヘッダー */}
      <View className='bg-white px-4 py-3 border-b border-gray-100'>
        <View className='flex-row items-center mb-3'>
          <TouchableOpacity onPress={() => router.back()} className='mr-3' activeOpacity={0.7}>
            <Ionicons name='arrow-back' size={24} color='#374151' />
          </TouchableOpacity>

          <View className='flex-1'>
            {category && (
              <View className='flex-row items-center'>
                <View
                  className='w-8 h-8 rounded-full items-center justify-center mr-2'
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Ionicons name='folder-outline' size={16} color={category.color} />
                </View>
                <Text className='text-xl font-bold text-gray-900' numberOfLines={1}>
                  {category.name}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => router.push(`/goods/new?categoryId=${id}` as Href)}
            activeOpacity={0.7}
            className='mr-2'
          >
            <Ionicons name='add' size={24} color='#3B82F6' />
          </TouchableOpacity>
        </View>

        {/* パンくずナビ */}
        <View className='flex-row items-center mb-3'>
          <Text className='text-sm text-gray-500'>ホーム</Text>
          <Ionicons name='chevron-forward' size={16} color='#9CA3AF' className='mx-1' />
          <Text className='text-sm text-blue-600' numberOfLines={1}>
            {category?.name || 'カテゴリ'}
          </Text>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='グッズを検索...'
        />
      </View>

      <FlatList
        data={filteredGoods}
        renderItem={renderGoodsItem}
        keyExtractor={(item) => `${item.id}-${searchQuery}`}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor='#3B82F6' />
        }
        // リストが空の場合は、グッズがないメッセージと取引作成ボタンを表示
        ListEmptyComponent={
          <View className='flex-1 justify-center items-center pt-24'>
            <Ionicons name='cube-outline' size={64} color='#9CA3AF' />
            <Text className='text-lg font-semibold text-gray-600 mt-4'>
              {searchQuery ? 'グッズが見つかりません' : 'グッズがありません'}
            </Text>
            <Text className='text-sm text-gray-400 mt-2'>
              {searchQuery ? '検索条件を変更してください' : '最初のグッズを追加してください'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                className='mt-4 bg-blue-500 px-6 py-2 rounded-full'
                onPress={() => router.push(`/goods/new?categoryId=${id}` as Href)}
                activeOpacity={0.8}
              >
                <Text className='text-white font-medium'>グッズを作成</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* 新規グッズ作成FAB */}
      <TouchableOpacity
        className='absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg'
        onPress={() => router.push(`/trade/new?categoryId=${id}` as Href)}
        activeOpacity={0.8}
      >
        <Ionicons name='add' size={24} color='#FFFFFF' />
      </TouchableOpacity>

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
                if (selectedGoods) {
                  router.push(`/goods/edit/${selectedGoods.id}` as Href);
                }
              }}
            >
              <Ionicons name='create-outline' size={20} color='#3B82F6' />
              <Text className='text-base text-gray-700'>編集</Text>
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
