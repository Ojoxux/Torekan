import { supabase } from '@/lib/supabase';
import type { Todo } from '@/types';

export const todoService = {
  async getByTradeId(tradeId: string) {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('trade_id', tradeId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data as Todo[];
  },

  async create(todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todo,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Todo;
  },

  async createBatch(tradeId: string, todos: Array<{ content: string; display_order: number }>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const todosToInsert = todos.map(todo => ({
      ...todo,
      trade_id: tradeId,
      user_id: user.id,
      is_completed: false,
    }));

    const { data, error } = await supabase
      .from('todos')
      .insert(todosToInsert)
      .select();

    if (error) throw error;
    return data as Todo[];
  },

  async update(id: string, updates: Partial<Omit<Todo, 'id' | 'trade_id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Todo;
  },

  async toggleComplete(id: string) {
    const { data: todo, error: fetchError } = await supabase
      .from('todos')
      .select('is_completed')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('todos')
      .update({ is_completed: !todo.is_completed })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Todo;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteByTradeId(tradeId: string) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('trade_id', tradeId);

    if (error) throw error;
  },

  async reorder(tradeId: string, todos: Array<{ id: string; display_order: number }>) {
    const updates = todos.map(todo => 
      supabase
        .from('todos')
        .update({ display_order: todo.display_order })
        .eq('id', todo.id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      throw errors[0].error;
    }
  },
};