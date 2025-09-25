import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useCategories } from '@/hooks/useCategories';
import { useFilterStore } from '@/store/filterStore';
import { TradeType } from '@/types';

/*
 * フィルター選択用のコンポーネント
 * 取引種類（交換、譲渡、買取）でフィルタリング
 */
export function FilterChips() {
  const {
    keyword,
    selectedType,
    selectedCategoryIds,
    toggleCategory,
    setType,
  } = useFilterStore();
  const { data: categories } = useCategories();


  /*
   * enumから取引タイプテキストを取得する
   */
  const getTypeText = (type: TradeType) => {
    switch (type) {
      case TradeType.EXCHANGE:
        return '交換';
      case TradeType.TRANSFER:
        return '譲渡';
      case TradeType.PURCHASE:
        return '買取';
    }
  };

  return (
    <View className='mt-2'>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='flex-row'>
        {/* 取引タイプ選択ボタン */}
        {[TradeType.EXCHANGE, TradeType.TRANSFER, TradeType.PURCHASE].map((type) => {
          const isSelected = selectedType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setType(isSelected ? null : type)}
              className={`px-3 py-1 rounded-full mr-2 flex-row items-center ${
                isSelected ? 'bg-blue-100' : 'bg-gray-100'
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name='swap-horizontal-outline'
                size={12}
                color={isSelected ? '#3B82F6' : '#6B7280'}
              />
              <Text
                className={`text-xs font-medium ml-1 ${
                  isSelected ? 'text-blue-700' : 'text-gray-700'
                }`}
              >
                {getTypeText(type)}
              </Text>
              {isSelected && (
                <Ionicons name='close' size={12} color='#3B82F6' style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          );
        })}

        {keyword.length > 0 && (
          <View className='bg-blue-100 px-3 py-1 rounded-full mr-2 flex-row items-center'>
            <Ionicons name='search-outline' size={12} color='#6B7280' />
            <Text className='text-xs font-medium text-blue-700 ml-1' numberOfLines={1}>
              "{keyword}"
            </Text>
          </View>
        )}

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
