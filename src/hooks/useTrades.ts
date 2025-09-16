import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeService } from '@/services/tradeService';
import { TradeStatus, TradeType, CreateTradeInput, UpdateTradeInput } from '@/types';

interface TradeFilters {
  status?: TradeStatus;
  type?: TradeType;
  keyword?: string;
}

export function useTrades(filters?: TradeFilters) {
  return useQuery({
    queryKey: ['trades', filters],
    queryFn: () => tradeService.getAll(),
    select: (data) => {
      let filtered = data;

      if (filters?.status) {
        filtered = filtered.filter((trade) => trade.status === filters.status);
      }

      if (filters?.type) {
        filtered = filtered.filter((trade) => trade.type === filters.type);
      }

      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filtered = filtered.filter(
          (trade) =>
            trade.item_name.toLowerCase().includes(keyword) ||
            trade.partner_name.toLowerCase().includes(keyword) ||
            trade.notes?.toLowerCase().includes(keyword)
        );
      }

      return filtered;
    },
  });
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

export function useArchiveTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tradeService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}