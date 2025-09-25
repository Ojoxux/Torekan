import { supabase } from '@/lib/supabase';
import type {
   CreateCategoryInput,
   GoodsCategory,
   GoodsStatistics,
   TradeStatus,
   UpdateCategoryInput,
} from '@/types';
import { PresetColor, PresetIcon } from '@/types';

// Supabaseクエリ結果の型定義
// NOTE: 将来的にSupabaseのスキーマで型を作って、それを使いたい
type GoodsItemWithTradeStatus = {
  id: string;
  name: string;
  trades: { status: TradeStatus }[];
};

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

  async getDeleteImpact(id: string) {
    // カテゴリに関連するグッズアイテム数を取得
    const { data: goodsItems, error: goodsError } = await supabase
      .from('goods_items')
      .select('id')
      .eq('category_id', id);

    if (goodsError) throw goodsError;

    // 関連する取引数を取得
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('id, goods_item!inner(category_id)')
      .eq('goods_item.category_id', id);

    if (tradesError) throw tradesError;

    return {
      goodsCount: goodsItems?.length || 0,
      tradesCount: trades?.length || 0,
    };
  },

  async delete(id: string) {
    const { error } = await supabase.from('goods_categories').delete().eq('id', id);

    if (error) throw error;

    return {
      success: true,
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
      .from('goods_items')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId);

    if (error) throw error;
    return data?.length ?? 0;
  },

  // 統計情報取得
  async getStatistics(): Promise<GoodsStatistics[]> {
    const { data, error } = await supabase.from('goods_statistics').select('*');

    if (error) throw error;
    return data || [];
  },

  // カテゴリ詳細統計取得
  async getCategoryStats(categoryId: string) {
    const { data: goodsItems, error: goodsError } = await supabase
      .from('goods_items')
      .select(`
        id,
        name,
        trades(status)
      `)
      .eq('category_id', categoryId);

    if (goodsError) throw goodsError;

    const typedGoodsItems = goodsItems as GoodsItemWithTradeStatus[];

    const stats = {
      totalGoods: typedGoodsItems.length,
      totalTrades: 0,
      activeTradesCount: 0,
      completedTradesCount: 0,
      goodsWithTrades: 0,
    };

    const goodsStats = typedGoodsItems.map((goods) => {
      const trades = goods.trades || [];
      return {
        tradesCount: trades.length,
        hasTrades: trades.length > 0,
        activeTradesCount: trades.filter((trade) => trade.status === 'in_progress').length,
        completedTradesCount: trades.filter((trade) => trade.status === 'completed').length,
      };
    });

    stats.totalTrades = goodsStats.reduce((sum, item) => sum + item.tradesCount, 0);
    stats.goodsWithTrades = goodsStats.filter((item) => item.hasTrades).length;
    stats.activeTradesCount = goodsStats.reduce((sum, item) => sum + item.activeTradesCount, 0);
    stats.completedTradesCount = goodsStats.reduce(
      (sum, item) => sum + item.completedTradesCount,
      0
    );

    return stats;
  },

  // プリセットカラー一覧
  getPresetColors() {
    return Object.values(PresetColor);
  },

  // プリセットアイコン一覧
  getPresetIcons() {
    return Object.values(PresetIcon);
  },
};
