import { supabase } from '@/lib/supabase';
import type {
  CreateTradeInput,
  Trade,
  TradeStatus,
  TradeType,
  TradeWithGoods,
  UpdateTradeInput,
} from '@/types';

export const tradeService = {
  // 全取引取得（グッズ・カテゴリ情報付き）
  async getAll(): Promise<TradeWithGoods[]> {
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        goods_item:goods_items(
          *,
          category:goods_categories(*)
        )
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 取引詳細取得（グッズ・カテゴリ情報付き）
  async getById(id: string): Promise<TradeWithGoods | null> {
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        goods_item:goods_items(
          *,
          category:goods_categories(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // グッズアイテム別取引取得
  async getByGoodsItem(goodsItemId: string): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('goods_item_id', goodsItemId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // 取引作成
  async create(trade: CreateTradeInput): Promise<Trade> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trades')
      .insert({
        ...trade,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 取引更新
  async update(id: string, updates: UpdateTradeInput): Promise<Trade> {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 取引削除
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('trades').delete().eq('id', id);

    if (error) throw error;
  },

  // ステータス更新
  async updateStatus(id: string, status: TradeStatus): Promise<Trade> {
    return this.update(id, { status });
  },

  // 複数取引のステータス一括更新
  async batchUpdateStatus(tradeIds: string[], status: TradeStatus): Promise<void> {
    const { error } = await supabase.from('trades').update({ status }).in('id', tradeIds);

    if (error) throw error;
  },

  // 検索・フィルタ機能（3階層対応）
  async search(
    query: string,
    filters?: {
      status?: TradeStatus;
      type?: TradeType;
      categoryId?: string;
      goodsItemId?: string;
    }
  ): Promise<TradeWithGoods[]> {
    let supabaseQuery = supabase.from('trades').select(`
        *,
        goods_item:goods_items(
          *,
          category:goods_categories(*)
        )
      `);

    if (query) {
      supabaseQuery = supabaseQuery.or(
        `partner_name.ilike.%${query}%,notes.ilike.%${query}%,goods_item.name.ilike.%${query}%`
      );
    }

    if (filters?.status) {
      supabaseQuery = supabaseQuery.eq('status', filters.status);
    }

    if (filters?.type) {
      supabaseQuery = supabaseQuery.eq('type', filters.type);
    }

    if (filters?.goodsItemId) {
      supabaseQuery = supabaseQuery.eq('goods_item_id', filters.goodsItemId);
    }

    if (filters?.categoryId) {
      supabaseQuery = supabaseQuery.eq('goods_item.category_id', filters.categoryId);
    }

    const { data, error } = await supabaseQuery.order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // カテゴリ別取引統計
  async getCategoryStats(categoryId: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('status, goods_item!inner(category_id)')
      .eq('goods_item.category_id', categoryId);

    if (error) throw error;

    const stats = {
      total: data.length,
      planned: 0,
      negotiating: 0,
      confirmed: 0,
      shipped: 0,
      completed: 0,
      canceled: 0,
    };

    data.forEach((trade) => {
      if (trade.status in stats) {
        stats[trade.status as keyof typeof stats]++;
      }
    });

    return stats;
  },

  // 期限切れ取引取得
  async getOverdueTrades(): Promise<TradeWithGoods[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        goods_item:goods_items(
          *,
          category:goods_categories(*)
        )
      `)
      .lt('shipping_deadline', today)
      .in('status', ['planned', 'negotiating', 'confirmed']);

    if (error) throw error;
    return data || [];
  },

  // 最近の取引取得
  async getRecentTrades(limit: number = 10): Promise<TradeWithGoods[]> {
    const { data, error } = await supabase
      .from('trades')
      .select(`
        *,
        goods_item:goods_items(
          *,
          category:goods_categories(*)
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // グッズアイテム別取引統計
  async getGoodsItemStats(goodsItemId: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('status')
      .eq('goods_item_id', goodsItemId);

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter((trade) => !['completed', 'canceled'].includes(trade.status)).length,
      completed: data.filter((trade) => trade.status === 'completed').length,
      canceled: data.filter((trade) => trade.status === 'canceled').length,
    };

    return stats;
  },
};
