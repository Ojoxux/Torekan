export type TradeType = 'mail' | 'direct';
export type TradeStatus = 'new' | 'in_progress' | 'waiting' | 'completed' | 'canceled';
export type SortOrder = 'created_at' | 'updated_at' | 'event_date' | 'status';

export interface Trade {
  id: string;
  user_id: string;
  my_character: string;
  partner_character: string;
  trade_type: TradeType;
  status: TradeStatus;
  event_date?: string;
  notes?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  trade_id: string;
  user_id: string;
  content: string;
  is_completed: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  auto_archive: boolean;
  default_sort_order: SortOrder;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CreateTradeInput {
  my_character: string;
  partner_character: string;
  trade_type: TradeType;
  status?: TradeStatus;
  event_date?: string;
  notes?: string;
}

export interface UpdateTradeInput {
  my_character?: string;
  partner_character?: string;
  trade_type?: TradeType;
  status?: TradeStatus;
  event_date?: string;
  notes?: string;
  is_archived?: boolean;
}

export interface CreateTodoInput {
  content: string;
  display_order: number;
}

export interface UpdateSettingsInput {
  auto_archive?: boolean;
  default_sort_order?: SortOrder;
}
