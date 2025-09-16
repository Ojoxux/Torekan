export enum TradeType {
  EXCHANGE = 'exchange',
  TRANSFER = 'transfer',
  PURCHASE = 'purchase',
  SALE = 'sale',
}

export enum TradeStatus {
  PLANNED = 'planned',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DIGITAL_PAYMENT = 'digital_payment',
  OTHER = 'other',
}

export type SortOrder = 'created_at' | 'updated_at' | 'status';

export interface Trade {
  id: string;
  user_id: string;
  item_name: string;
  partner_name: string;
  type: TradeType;
  status: TradeStatus;
  payment_method?: PaymentMethod;
  item_id?: string;
  partner_id?: string;
  notes?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GoodsCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  sort_order: number;
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
  item_name: string;
  partner_name: string;
  type: TradeType;
  status?: TradeStatus;
  payment_method?: PaymentMethod;
  item_id?: string;
  partner_id?: string;
  notes?: string;
  category_id?: string;
}

export interface UpdateTradeInput {
  item_name?: string;
  partner_name?: string;
  type?: TradeType;
  status?: TradeStatus;
  payment_method?: PaymentMethod;
  item_id?: string;
  partner_id?: string;
  notes?: string;
  category_id?: string;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  sort_order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  sort_order?: number;
}

export interface CreateTodoInput {
  content: string;
  display_order: number;
}

export interface UpdateSettingsInput {
  default_sort_order?: SortOrder;
}
