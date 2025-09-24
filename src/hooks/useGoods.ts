import { goodsService } from '@/services/goodsService';
import type { CreateGoodsItemInput, UpdateGoodsItemInput } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// カテゴリ別グッズアイテム取得
export function useGoodsItemsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['goods-items', 'category', categoryId],
    queryFn: () => goodsService.getGoodsItemsByCategory(categoryId),
    enabled: !!categoryId,
  });
}

// グッズアイテム単体取得
export function useGoodsItemById(goodsItemId: string) {
  return useQuery({
    queryKey: ['goods-items', goodsItemId],
    queryFn: () => goodsService.getGoodsItemById(goodsItemId),
    enabled: !!goodsItemId,
  });
}

// グッズアイテム詳細取得（取引情報付き）
export function useGoodsItemWithTrades(goodsItemId: string) {
  return useQuery({
    queryKey: ['goods-items', goodsItemId, 'with-trades'],
    queryFn: () => goodsService.getGoodsItemWithTrades(goodsItemId),
    enabled: !!goodsItemId,
  });
}

// 全グッズアイテム取得
export function useAllGoodsItems() {
  return useQuery({
    queryKey: ['goods-items', 'all'],
    queryFn: () => goodsService.getAllGoodsItems(),
  });
}

// グッズアイテム検索
export function useSearchGoodsItems(query: string, categoryId?: string) {
  return useQuery({
    queryKey: ['goods-items', 'search', query, categoryId],
    queryFn: () => goodsService.searchGoodsItems(query, categoryId),
    enabled: !!query.trim(),
  });
}

// グッズアイテム統計
export function useGoodsItemStats(goodsItemId: string) {
  return useQuery({
    queryKey: ['goods-items', goodsItemId, 'stats'],
    queryFn: () => goodsService.getGoodsItemStats(goodsItemId),
    enabled: !!goodsItemId,
  });
}

// グッズアイテム作成
export function useCreateGoodsItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGoodsItemInput) => goodsService.createGoodsItem(input),
    onSuccess: (data) => {
      // 関連するカテゴリのグッズリストを無効化
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'category', data.category_id] });
      // 全グッズリストと検索結果のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // 統計更新のため
    },
  });
}

// グッズアイテム更新
export function useUpdateGoodsItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
      originalCategoryId,
    }: {
      id: string;
      input: UpdateGoodsItemInput;
      originalCategoryId?: string;
    }) => goodsService.updateGoodsItem(id, input),
    onSuccess: (data, { input, originalCategoryId }) => {
      // 特定のグッズアイテムのキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['goods-items', data.id] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', data.id, 'with-trades'] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', data.id, 'stats'] });

      // 現在のカテゴリのグッズリストを無効化
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'category', data.category_id] });

      // カテゴリ変更の場合は元のカテゴリも無効化
      if (input.category_id && originalCategoryId && input.category_id !== originalCategoryId) {
        queryClient.invalidateQueries({
          queryKey: ['goods-items', 'category', originalCategoryId],
        });
      }

      // 全グッズリストと検索結果のキャッシュを無効化（統計更新のため）
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] }); // 統計更新のため
    },
  });
}

// グッズアイテム削除影響確認
export function useGoodsItemDeleteImpact(id: string) {
  return useQuery({
    queryKey: ['goods-item-delete-impact', id],
    queryFn: () => goodsService.getDeleteImpact(id),
    enabled: !!id,
  });
}

// グッズアイテム削除
export function useDeleteGoodsItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsService.deleteGoodsItem(id),
    onSuccess: (_, deletedId) => {
      // 削除されたアイテム関連のキャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['goods-items', deletedId] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', deletedId, 'with-trades'] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', deletedId, 'stats'] });

      // 全グッズリストと検索結果、カテゴリ別リストを無効化
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['goods-items', 'category'] });

      queryClient.invalidateQueries({ queryKey: ['categories'] }); // 統計更新のため
      queryClient.invalidateQueries({ queryKey: ['trades'] }); // 関連取引更新のため
    },
  });
}
