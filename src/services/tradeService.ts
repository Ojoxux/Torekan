import { supabase } from '@/lib/supabase';
import type { CreateTradeInput, UpdateTradeInput, TradeStatus, TradeType } from '@/types';

export const tradeService = {
  async getAll(includeArchived = false) {
    let query = supabase.from('trades').select('*').order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('trades').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  async create(trade: CreateTradeInput) {
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

  async update(id: string, updates: UpdateTradeInput) {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('trades').delete().eq('id', id);

    if (error) throw error;
  },

  async archive(id: string) {
    return this.update(id, { is_archived: true });
  },

  async unarchive(id: string) {
    return this.update(id, { is_archived: false });
  },

  async search(query: string, filters?: { status?: TradeStatus; type?: TradeType }) {
    let supabaseQuery = supabase.from('trades').select('*');

    if (query) {
      supabaseQuery = supabaseQuery.or(
        `item_name.ilike.%${query}%,partner_name.ilike.%${query}%,notes.ilike.%${query}%`
      );
    }

    if (filters?.status) {
      supabaseQuery = supabaseQuery.eq('status', filters.status);
    }

    if (filters?.type) {
      supabaseQuery = supabaseQuery.eq('type', filters.type);
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};