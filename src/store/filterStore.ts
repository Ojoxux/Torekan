import { TradeStatus, TradeType } from '@/types';
import { create } from 'zustand';

export interface FilterState {
  keyword: string;
  selectedStatuses: TradeStatus[];
  selectedType: TradeType | null;
  selectedCategoryIds: string[];
  isFilterActive: boolean;
}

export interface FilterActions {
  setKeyword: (keyword: string) => void;
  toggleStatus: (status: TradeStatus) => void;
  setType: (type: TradeType | null) => void;
  toggleCategory: (categoryId: string) => void;
  clearAllFilters: () => void;
  getActiveFiltersCount: () => number;
}

export type FilterStore = FilterState & FilterActions;

const initialState: FilterState = {
  keyword: '',
  selectedStatuses: [],
  selectedType: null,
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
        state.selectedType !== null ||
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
          state.selectedType !== null ||
          state.selectedCategoryIds.length > 0,
      };
    }),

  setType: (type: TradeType | null) =>
    set((state) => ({
      selectedType: type,
      isFilterActive:
        state.keyword.length > 0 ||
        state.selectedStatuses.length > 0 ||
        type !== null ||
        state.selectedCategoryIds.length > 0,
    })),

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
          state.selectedType !== null ||
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
      (state.selectedType !== null ? 1 : 0) +
      state.selectedCategoryIds.length
    );
  },
}));
