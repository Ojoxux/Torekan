import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useCategories } from '@/hooks/useCategories';
import { useFilterStore } from '@/store/filterStore';
import { TradeStatus, TradeType } from '@/types';

export function FilterChips() {
  const {
    keyword,
    selectedStatuses,
    selectedTypes,
    selectedCategoryIds,
    isFilterActive,
    clearAllFilters,
    toggleCategory,
  } = useFilterStore();
  const { data: categories } = useCategories();

  const getStatusText = (status: TradeStatus) => {
    switch (status) {
      case 'planned':
        return '計画中';
      case 'shipped':
        return '発送済み';
      case 'completed':
        return '完了';
      case 'canceled':
        return 'キャンセル';
    }
  };

  const getTypeText = (type: TradeType) => {
    switch (type) {
      case TradeType.EXCHANGE:
        return '交換';
      case TradeType.TRANSFER:
        return '譲渡';
      case TradeType.PURCHASE:
        return '購入';
    }
  };

  if (!isFilterActive) {
    return null;
  }

  const totalFilters =
    (keyword.length > 0 ? 1 : 0) +
    selectedStatuses.length +
    selectedTypes.length +
    selectedCategoryIds.length;

  return (
    <View className='mt-2'>
      <View className='flex-row items-center justify-between mb-2'>
        <Text className='text-sm font-medium text-gray-700'>フィルタ ({totalFilters})</Text>
        <TouchableOpacity onPress={clearAllFilters} activeOpacity={0.7}>
          <Text className='text-sm text-blue-500'>すべてクリア</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-row'>
        {keyword.length > 0 && (
          <View className='bg-blue-100 px-3 py-1 rounded-full mr-2 flex-row items-center'>
            <Ionicons name='search-outline' size={12} color='#3B82F6' />
            <Text className='text-xs font-medium text-blue-700 ml-1' numberOfLines={1}>
              "{keyword}"
            </Text>
          </View>
        )}

        {selectedStatuses.map((status) => (
          <View
            key={status}
            className='bg-green-100 px-3 py-1 rounded-full mr-2 flex-row items-center'
          >
            <Ionicons name='checkmark-circle-outline' size={12} color='#10B981' />
            <Text className='text-xs font-medium text-green-700 ml-1'>{getStatusText(status)}</Text>
          </View>
        ))}

        {selectedTypes.map((type) => (
          <View
            key={type}
            className='bg-purple-100 px-3 py-1 rounded-full mr-2 flex-row items-center'
          >
            <Ionicons name='swap-horizontal-outline' size={12} color='#8B5CF6' />
            <Text className='text-xs font-medium text-purple-700 ml-1'>{getTypeText(type)}</Text>
          </View>
        ))}

        {selectedCategoryIds.map((categoryId) => {
          if (categoryId === 'uncategorized') {
            return (
              <TouchableOpacity
                key={categoryId}
                onPress={() => toggleCategory(categoryId)}
                className='bg-gray-100 px-3 py-1 rounded-full mr-2 flex-row items-center'
                activeOpacity={0.7}
              >
                <Text className='text-xs font-medium text-gray-700'>未分類</Text>
                <Ionicons name='close' size={12} color='#6B7280' style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            );
          }

          const category = categories?.find((c) => c.id === categoryId);
          if (!category) return null;

          return (
            <TouchableOpacity
              key={categoryId}
              onPress={() => toggleCategory(categoryId)}
              className='px-3 py-1 rounded-full mr-2 flex-row items-center'
              style={{ backgroundColor: category.color + '20' }}
              activeOpacity={0.7}
            >
              <View
                className='w-2 h-2 rounded-full mr-1'
                style={{ backgroundColor: category.color }}
              />
              <Text className='text-xs font-medium' style={{ color: category.color }}>
                {category.name}
              </Text>
              <Ionicons name='close' size={12} color={category.color} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
