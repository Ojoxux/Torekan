import { tradeService } from '@/services/tradeService';
import { CreateTradeInput, TradeStatus, TradeType, UpdateTradeInput } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

interface TradeFilters {
  status?: TradeStatus | TradeStatus[];
  type?: TradeType | TradeType[];
  keyword?: string;
  categoryId?: string;
  goodsItemId?: string;
}

export function useTrades(filters?: TradeFilters) {
  const query = useQuery({
    queryKey: ['trades', filters],
    queryFn: () => tradeService.getAll(),
  });

  const filteredData = useMemo(() => {
    let filtered = query.data ?? [];

    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter((trade) => statuses.includes(trade.status));
    }

    if (filters?.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      filtered = filtered.filter((trade) => types.includes(trade.type));
    }

    const keyword = filters?.keyword?.trim().toLowerCase() ?? '';
    if (keyword.length > 0) {
      filtered = filtered.filter(
        (trade) =>
          trade.partner_name.toLowerCase().includes(keyword) ||
          trade.notes?.toLowerCase().includes(keyword) ||
          trade.goods_item.name.toLowerCase().includes(keyword)
      );
    }

    if (filters?.categoryId) {
      filtered = filtered.filter((trade) => trade.goods_item.category_id === filters.categoryId);
    }

    if (filters?.goodsItemId) {
      filtered = filtered.filter((trade) => trade.goods_item_id === filters.goodsItemId);
    }

    return filtered;
  }, [query.data, filters]);

  return { ...query, data: filteredData };
}

export function useTrade(id: string) {
  return useQuery({
    queryKey: ['trades', id],
    queryFn: () => tradeService.getById(id),
    enabled: !!id,
  });
}

// グッズアイテム別取引取得
export function useTradesByGoodsItem(goodsItemId: string) {
  return useQuery({
    queryKey: ['trades', 'goods-item', goodsItemId],
    queryFn: () => tradeService.getByGoodsItem(goodsItemId),
    enabled: !!goodsItemId,
  });
}

// 検索機能
export function useSearchTrades(
  query: string,
  filters?: {
    status?: TradeStatus;
    type?: TradeType;
    categoryId?: string;
    goodsItemId?: string;
  }
) {
  return useQuery({
    queryKey: ['trades', 'search', query, filters],
    queryFn: () => tradeService.search(query, filters),
    enabled: !!query.trim(),
  });
}

// 期限切れ取引取得
export function useOverdueTrades() {
  return useQuery({
    queryKey: ['trades', 'overdue'],
    queryFn: () => tradeService.getOverdueTrades(),
  });
}

// 最近の取引取得
export function useRecentTrades(limit?: number) {
  return useQuery({
    queryKey: ['trades', 'recent', limit],
    queryFn: () => tradeService.getRecentTrades(limit),
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trade: CreateTradeInput) => tradeService.create(trade),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades', 'goods-item', data.goods_item_id] });
      queryClient.invalidateQueries({ queryKey: ['goods-items'] });
      queryClient.invalidateQueries({ queryKey: ['goodsItemStats', data.goods_item_id] });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trade }: { id: string; trade: UpdateTradeInput }) =>
      tradeService.update(id, trade),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades', id] });
      queryClient.invalidateQueries({ queryKey: ['trades', 'goods-item', data.goods_item_id] });
      queryClient.invalidateQueries({ queryKey: ['goodsItemStats', data.goods_item_id] });
    },
  });
}

export function useUpdateTradeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TradeStatus }) =>
      tradeService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades', data.id] });
      queryClient.invalidateQueries({ queryKey: ['trades', 'goods-item', data.goods_item_id] });
      queryClient.invalidateQueries({ queryKey: ['goodsItemStats', data.goods_item_id] });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['goods-items'] });
      queryClient.invalidateQueries({ queryKey: ['goodsItemStats'] });
    },
  });
}

// グッズアイテム別取引統計
export function useGoodsItemStats(goodsItemId: string) {
  return useQuery({
    queryKey: ['goodsItemStats', goodsItemId],
    queryFn: () => tradeService.getGoodsItemStats(goodsItemId),
    enabled: !!goodsItemId,
  });
}
