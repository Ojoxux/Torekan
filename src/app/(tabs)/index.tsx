import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SearchBar } from '@/components/common/SearchBar';
import { useCategories, useCategoryStatistics } from '@/hooks/useCategories';
import { GoodsCategory } from '@/types';

export default function CategoriesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const {
    data: statistics = [],
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useCategoryStatistics();

  const isLoading = categoriesLoading || statsLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchStats()]);
    setRefreshing(false);
  };

  // カテゴリに統計情報をマージ
  const categoriesWithStats = categories.map((category) => {
    const stats = statistics.find((s) => s.category_id === category.id);
    return {
      ...category,
      stats: stats || {
        goods_count: 0,
        total_trades: 0,
        active_trades: 0,
        completed_trades: 0,
        canceled_trades: 0,
      },
    };
  });

  // 検索フィルタリング
  const filteredCategories = categoriesWithStats.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      folder: 'folder-outline',
      badge: 'medal-outline',
      star: 'star-outline',
      key: 'key-outline',
      heart: 'heart-outline',
      gift: 'gift-outline',
      bookmark: 'bookmark-outline',
      tag: 'pricetag-outline',
      diamond: 'diamond-outline',
      trophy: 'trophy-outline',
    };
    return iconMap[iconName] || 'folder-outline';
  };

  const renderCategoryItem = ({
    item,
  }: {
    item: GoodsCategory & {
      stats: {
        goods_count: number;
        total_trades: number;
        active_trades: number;
        completed_trades: number;
        canceled_trades: number;
      };
    };
  }) => {
    return (
      <TouchableOpacity
        className='bg-white rounded-xl p-4 mb-3 shadow-sm'
        onPress={() => router.push(`/category/${item.id}/goods` as Href)}
        activeOpacity={0.7}
      >
        <View className='flex-row items-center'>
          {/* カテゴリアイコンと色 */}
          <View className='flex-row items-center mr-3'>
            <View
              className='w-12 h-12 rounded-full items-center justify-center mr-3'
              style={{ backgroundColor: `${item.color}20` }}
            >
              <Ionicons
                name={getCategoryIcon(item.icon) as keyof typeof Ionicons.glyphMap}
                size={24}
                color={item.color}
              />
            </View>
          </View>

          {/* カテゴリ情報 */}
          <View className='flex-1'>
            <View className='flex-row items-center justify-between'>
              <Text className='text-lg font-semibold text-gray-900' numberOfLines={1}>
                {item.name}
              </Text>
              <View className='bg-gray-100 px-2 py-1 rounded-full'>
                <Text className='text-xs font-medium text-gray-600'>
                  {item.stats.goods_count}件
                </Text>
              </View>
            </View>
          </View>

          {/* 矢印アイコン */}
          <View className='justify-center ml-2'>
            <Ionicons name='chevron-forward' size={20} color='#9CA3AF' />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // 初回ロード時のみフルスクリーンローディングを表示
  if (isLoading && !categories.length) {
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
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder='カテゴリを検索...'
        />
      </View>

      <FlatList
        data={filteredCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor='#3B82F6' />
        }
        ListEmptyComponent={
          <View className='flex-1 justify-center items-center pt-24'>
            <Ionicons name='folder-outline' size={64} color='#9CA3AF' />
            <Text className='text-lg font-semibold text-gray-600 mt-4'>
              {searchQuery ? 'カテゴリが見つかりません' : 'カテゴリがありません'}
            </Text>
            <Text className='text-sm text-gray-400 mt-2'>
              {searchQuery ? '検索条件を変更してください' : '最初のカテゴリを作成してください'}
            </Text>
          </View>
        }
      />

      {/* 新規取引作成FAB */}
      <TouchableOpacity
        className='absolute right-5 bottom-5 w-14 h-14 rounded-full bg-blue-500 justify-center items-center shadow-lg'
        onPress={() => router.push('/trade/new' as Href)}
        activeOpacity={0.8}
      >
        <Ionicons name='add' size={24} color='#FFFFFF' />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
