import { TradeStatus, TradeType } from '@/types';
import { create } from 'zustand';

export interface FilterState {
  keyword: string;
  selectedStatuses: TradeStatus[];
  selectedTypes: TradeType[];
  selectedCategoryIds: string[];
  isFilterActive: boolean;
}

export interface FilterActions {
  setKeyword: (keyword: string) => void;
  toggleStatus: (status: TradeStatus) => void;
  toggleType: (type: TradeType) => void;
  toggleCategory: (categoryId: string) => void;
  clearAllFilters: () => void;
  getActiveFiltersCount: () => number;
}

export type FilterStore = FilterState & FilterActions;

const initialState: FilterState = {
  keyword: '',
  selectedStatuses: [],
  selectedTypes: [],
  selectedCategoryIds: [],
  isFilterActive: false,
};

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialState,

  setKeyword: (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    set((state) => ({
      keyword: trimmedKeyword,
      isFilterActive:
        trimmedKeyword.length > 0 ||
        state.selectedStatuses.length > 0 ||
        state.selectedTypes.length > 0 ||
        state.selectedCategoryIds.length > 0,
    }));
  },

  toggleStatus: (status: TradeStatus) =>
    set((state) => {
      const selectedStatuses = state.selectedStatuses.includes(status)
        ? state.selectedStatuses.filter((s) => s !== status)
        : [...state.selectedStatuses, status];

      return {
        selectedStatuses,
        isFilterActive:
          state.keyword.length > 0 ||
          selectedStatuses.length > 0 ||
          state.selectedTypes.length > 0 ||
          state.selectedCategoryIds.length > 0,
      };
    }),

  toggleType: (type: TradeType) =>
    set((state) => {
      const selectedTypes = state.selectedTypes.includes(type)
        ? state.selectedTypes.filter((t) => t !== type)
        : [...state.selectedTypes, type];

      return {
        selectedTypes,
        isFilterActive:
          state.keyword.length > 0 ||
          state.selectedStatuses.length > 0 ||
          selectedTypes.length > 0 ||
          state.selectedCategoryIds.length > 0,
      };
    }),

  toggleCategory: (categoryId: string) =>
    set((state) => {
      const selectedCategoryIds = state.selectedCategoryIds.includes(categoryId)
        ? state.selectedCategoryIds.filter((id) => id !== categoryId)
        : [...state.selectedCategoryIds, categoryId];

      return {
        selectedCategoryIds,
        isFilterActive:
          state.keyword.length > 0 ||
          state.selectedStatuses.length > 0 ||
          state.selectedTypes.length > 0 ||
          selectedCategoryIds.length > 0,
      };
    }),

  clearAllFilters: () =>
    set({
      ...initialState,
    }),

  getActiveFiltersCount: () => {
    const state = get();
    return (
      (state.keyword.length > 0 ? 1 : 0) +
      state.selectedStatuses.length +
      state.selectedTypes.length +
      state.selectedCategoryIds.length
    );
  },
}));
