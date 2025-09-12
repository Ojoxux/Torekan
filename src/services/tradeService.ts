import { supabase } from '@/lib/supabase';
import type { Trade } from '@/types';

export const tradeService = {
  async getAll(includeArchived = false) {
    let query = supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Trade[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Trade;
  },

  async create(trade: Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
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
    return data as Trade;
  },

  async update(id: string, updates: Partial<Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('trades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Trade;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async archive(id: string) {
    return this.update(id, { is_archived: true });
  },

  async unarchive(id: string) {
    return this.update(id, { is_archived: false });
  },

  async search(query: string, filters?: { status?: Trade['status']; trade_type?: Trade['trade_type'] }) {
    let supabaseQuery = supabase
      .from('trades')
      .select('*');

    if (query) {
      supabaseQuery = supabaseQuery.or(`my_character.ilike.%${query}%,partner_character.ilike.%${query}%,notes.ilike.%${query}%`);
    }

    if (filters?.status) {
      supabaseQuery = supabaseQuery.eq('status', filters.status);
    }

    if (filters?.trade_type) {
      supabaseQuery = supabaseQuery.eq('trade_type', filters.trade_type);
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Trade[];
  },
};