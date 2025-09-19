import { categoryService } from '@/services/categoryService';
import type { CreateCategoryInput, UpdateCategoryInput } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CreateCategoryInput) => categoryService.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateCategoryInput }) =>
      categoryService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', data.id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
    },
  });
}

export function useUpdateCategorySortOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categories: { id: string; sort_order: number }[]) =>
      categoryService.updateSortOrder(categories),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useCategoryUsageCount(categoryId: string) {
  return useQuery({
    queryKey: ['categories', categoryId, 'usage'],
    queryFn: () => categoryService.getUsageCount(categoryId),
    enabled: !!categoryId,
  });
}