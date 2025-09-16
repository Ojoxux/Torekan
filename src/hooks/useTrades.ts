import { tradeService } from '@/services/tradeService';
import { CreateTradeInput, TradeStatus, TradeType, UpdateTradeInput } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

interface TradeFilters {
  status?: TradeStatus | TradeStatus[];
  type?: TradeType | TradeType[];
  keyword?: string;
  categoryIds?: string[];
}

export function useTrades(filters?: TradeFilters) {
  const query = useQuery({
    queryKey: ['trades'],
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
      filtered = filtered.filter((trade) => trade.item_name.toLowerCase().includes(keyword));
    }

    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      filtered = filtered.filter((trade) => {
        // カテゴリIDがある場合は一致するもの、ない場合は未分類として扱う
        return filters.categoryIds!.includes(trade.category_id || 'uncategorized');
      });
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

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trade: CreateTradeInput) => tradeService.create(trade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trade }: { id: string; trade: UpdateTradeInput }) =>
      tradeService.update(id, trade),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trades', id] });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}
