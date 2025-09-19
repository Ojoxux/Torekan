import { supabase } from '@/lib/supabase';
import type { CreateCategoryInput, GoodsCategory, UpdateCategoryInput } from '@/types';

export const categoryService = {
  async getAll(): Promise<GoodsCategory[]> {
    const { data, error } = await supabase
      .from('goods_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<GoodsCategory> {
    const { data, error } = await supabase
      .from('goods_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(category: CreateCategoryInput): Promise<GoodsCategory> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 新しいカテゴリの表示順を設定（最後に追加）
    const sortOrder =
      category.sort_order ??
      (await (async () => {
        const { data: lastCategory } = await supabase
          .from('goods_categories')
          .select('sort_order')
          .eq('user_id', user.id)
          .order('sort_order', { ascending: false })
          .limit(1)
          .single();

        return (lastCategory?.sort_order ?? -1) + 1;
      })());

    const { data, error } = await supabase
      .from('goods_categories')
      .insert({
        ...category,
        user_id: user.id,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: UpdateCategoryInput): Promise<GoodsCategory> {
    const { data, error } = await supabase
      .from('goods_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    // カテゴリが使用されている取引があるかチェック
    const { data: relatedTrades, error: tradesError } = await supabase
      .from('trades')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (tradesError) throw tradesError;

    const { error } = await supabase.from('goods_categories').delete().eq('id', id);

    if (error) throw error;

    return {
      success: true,
      hasRelatedTrades: (relatedTrades?.length ?? 0) > 0,
    };
  },

  async updateSortOrder(
    categories: { id: string; sort_order: number }[]
  ): Promise<GoodsCategory[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // バッチ更新処理
    const updates = categories.map(({ id, sort_order }) => ({
      id,
      sort_order,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('goods_categories')
      .upsert(updates, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return data;
  },

  async getUsageCount(categoryId: string): Promise<number> {
    const { data, error } = await supabase
      .from('trades')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId);

    if (error) throw error;
    return data?.length ?? 0;
  },

  // プリセットカラー一覧
  getPresetColors() {
    return [
      '#EF4444', // Red
      '#F97316', // Orange
      '#EAB308', // Yellow
      '#22C55E', // Green
      '#06B6D4', // Cyan
      '#3B82F6', // Blue
      '#8B5CF6', // Violet
      '#EC4899', // Pink
      '#6B7280', // Gray (default)
      '#374151', // Dark Gray
    ];
  },
};
