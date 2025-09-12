import { supabase } from '@/lib/supabase';
import type { Settings } from '@/types';

export const settingsService = {
  async get() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No settings found, create default settings
      return this.createDefault();
    }

    if (error) throw error;
    return data as Settings;
  },

  async createDefault() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const defaultSettings = {
      user_id: user.id,
      auto_archive: true,
      default_sort_order: 'created_at' as const,
    };

    const { data, error } = await supabase
      .from('settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) throw error;
    return data as Settings;
  },

  async update(updates: Partial<Pick<Settings, 'auto_archive' | 'default_sort_order'>>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as Settings;
  },

  async ensureExists() {
    try {
      return await this.get();
    } catch (error) {
      // If settings don't exist, they will be created automatically
      return null;
    }
  },
};