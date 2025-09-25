import { goodsService } from '@/services/goodsService';
import type { CreateGoodsItemInput, UpdateGoodsItemInput } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// カテゴリ別グッズアイテム取得
export function useGoodsItemsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['goods-items', 'category', categoryId],
    queryFn: () => goodsService.getGoodsItemsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 0, // 常に最新データを取得
    gcTime: 5 * 60 * 1000, // 5分間キャッシュ保持
    refetchOnMount: true, // マウント時に必ずリフェッチ
    refetchOnWindowFocus: true, // フォーカス時にリフェッチ
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
      // すべての関連キャッシュを完全にクリア
      queryClient.removeQueries({ queryKey: ['goods-items'] });
      queryClient.removeQueries({ queryKey: ['categories'] });

      // 少し待ってからリフェッチ
      setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: ['goods-items', 'category', data.category_id],
        });
        queryClient.refetchQueries({ queryKey: ['categories'] });
      }, 200);
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
      originalCategoryId, // onSuccessコールバックで使われてるので、unusedエラーは気にしない
    }: {
      id: string;
      input: UpdateGoodsItemInput;
      originalCategoryId?: string;
    }) => goodsService.updateGoodsItem(id, input),
    onSuccess: (data, { input, originalCategoryId }) => {
      // すべての関連キャッシュを完全にクリア
      queryClient.removeQueries({ queryKey: ['goods-items'] });
      queryClient.removeQueries({ queryKey: ['categories'] });

      // 少し待ってからリフェッチ
      setTimeout(() => {
        // 現在表示中のカテゴリのデータを再取得
        queryClient.refetchQueries({
          queryKey: ['goods-items', 'category', data.category_id],
        });

        // カテゴリが変更された場合は元のカテゴリも再取得
        if (input.category_id && originalCategoryId && input.category_id !== originalCategoryId) {
          queryClient.refetchQueries({
            queryKey: ['goods-items', 'category', originalCategoryId],
          });
        }

        // カテゴリ統計も再取得
        queryClient.refetchQueries({ queryKey: ['categories'] });
      }, 200);
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
    onSuccess: (_, _deletedId) => {
      // すべての関連キャッシュを完全にクリア
      queryClient.removeQueries({ queryKey: ['goods-items'] });
      queryClient.removeQueries({ queryKey: ['categories'] });
      queryClient.removeQueries({ queryKey: ['trades'] });

      // 少し待ってからリフェッチ
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['goods-items', 'category'] });
        queryClient.refetchQueries({ queryKey: ['categories'] });
      }, 200);
    },
  });
}
