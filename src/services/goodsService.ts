import { supabase } from '../lib/supabase';
import type {
  CreateGoodsItemInput,
  GoodsItem,
  GoodsItemWithCategory,
  GoodsItemWithTrades,
  UpdateGoodsItemInput,
} from '../types';

export class GoodsService {
  // グッズアイテムの作成
  async createGoodsItem(input: CreateGoodsItemInput): Promise<GoodsItem> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('認証が必要です');

    const { data, error } = await supabase
      .from('goods_items')
      .insert({
        ...input,
        user_id: user.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // カテゴリ別グッズアイテム一覧取得
  async getGoodsItemsByCategory(categoryId: string): Promise<GoodsItemWithCategory[]> {
    const { data, error } = await supabase
      .from('goods_items')
      .select(`
        *,
        category:goods_categories(*)
      `)
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // グッズアイテム単体取得
  async getGoodsItemById(goodsItemId: string): Promise<GoodsItemWithCategory | null> {
    const { data, error } = await supabase
      .from('goods_items')
      .select(`
        *,
        category:goods_categories(*)
      `)
      .eq('id', goodsItemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // グッズアイテムの詳細取得（取引情報付き）
  async getGoodsItemWithTrades(goodsItemId: string): Promise<GoodsItemWithTrades | null> {
    const { data, error } = await supabase
      .from('goods_items')
      .select(`
        *,
        category:goods_categories(*),
        trades(*)
      `)
      .eq('id', goodsItemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  // グッズアイテムの更新
  async updateGoodsItem(id: string, input: UpdateGoodsItemInput): Promise<GoodsItem> {
    const { data, error } = await supabase
      .from('goods_items')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // グッズアイテム削除の影響を取得
  async getDeleteImpact(id: string) {
    // 関連する取引数を取得
    const { data: trades, error } = await supabase
      .from('trades')
      .select('id, status')
      .eq('goods_item_id', id);

    if (error) throw error;

    const activeTrades =
      trades?.filter((t) => ['planned', 'negotiating', 'confirmed', 'shipped'].includes(t.status))
        .length || 0;

    const completedTrades = trades?.filter((t) => t.status === 'completed').length || 0;

    return {
      totalTrades: trades?.length || 0,
      activeTrades,
      completedTrades,
    };
  }

  // グッズアイテムの削除
  async deleteGoodsItem(id: string): Promise<void> {
    const { error } = await supabase.from('goods_items').delete().eq('id', id);

    if (error) throw error;
  }

  // グッズアイテムの並び順更新
  async updateGoodsItemsOrder(items: { id: string; sort_order: number }[]): Promise<void> {
    const { error } = await supabase.from('goods_items').upsert(
      items.map((item) => ({
        id: item.id,
        sort_order: item.sort_order,
      })),
      { onConflict: 'id' }
    );

    if (error) throw error;
  }

  // グッズアイテムの検索
  async searchGoodsItems(query: string, categoryId?: string): Promise<GoodsItemWithCategory[]> {
    let queryBuilder = supabase
      .from('goods_items')
      .select(`
        *,
        category:goods_categories(*)
      `)
      .ilike('name', `%${query}%`);

    if (categoryId) {
      queryBuilder = queryBuilder.eq('category_id', categoryId);
    }

    const { data, error } = await queryBuilder.order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // カテゴリ間でのグッズアイテム移動
  async moveGoodsItemToCategory(goodsItemId: string, newCategoryId: string): Promise<GoodsItem> {
    // 移動先カテゴリの最後の順序を取得
    const { data: lastItem } = await supabase
      .from('goods_items')
      .select('sort_order')
      .eq('category_id', newCategoryId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const newSortOrder = lastItem ? lastItem.sort_order + 1 : 0;

    const { data, error } = await supabase
      .from('goods_items')
      .update({
        category_id: newCategoryId,
        sort_order: newSortOrder,
      })
      .eq('id', goodsItemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // グッズアイテムの取引統計取得
  async getGoodsItemStats(goodsItemId: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('status')
      .eq('goods_item_id', goodsItemId);

    if (error) throw error;

    const stats = {
      total: data.length,
      planned: 0,
      negotiating: 0,
      confirmed: 0,
      shipped: 0,
      completed: 0,
      canceled: 0,
      active: 0, // 進行中の取引数
    };

    data.forEach((trade) => {
      if (trade.status in stats) {
        stats[trade.status as keyof typeof stats]++;
      }
    });

    // 進行中の取引数を計算
    stats.active = stats.planned + stats.negotiating + stats.confirmed + stats.shipped;

    return stats;
  }

  // ユーザーの全グッズアイテム取得
  async getAllGoodsItems(): Promise<GoodsItemWithCategory[]> {
    const { data, error } = await supabase
      .from('goods_items')
      .select(`
        *,
        category:goods_categories(*)
      `)
      .order('category_id')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const goodsService = new GoodsService();
