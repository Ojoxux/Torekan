export enum TradeType {
  EXCHANGE = 'exchange',
  TRANSFER = 'transfer',
  PURCHASE = 'purchase',
}

export enum TradeStatus {
  PLANNED = 'planned',
  NEGOTIATING = 'negotiating',
  CONFIRMED = 'confirmed',
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
  goods_item_id: string;
  user_id: string;
  partner_name: string;
  item_name: string;
  type: TradeType;
  status: TradeStatus;
  payment_method?: PaymentMethod;
  notes?: string | null;
  shipping_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GoodsCategory {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GoodsItem {
  id: string;
  category_id: string;
  user_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  trade_id: string;
  title: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
}

export interface Settings {
  user_id: string;
  allow_cloud_backup: boolean;
  is_passcode_lock_enabled: boolean;
  default_sort_order: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface CreateTradeInput {
  goods_item_id: string;
  partner_name: string;
  item_name: string;
  type: TradeType;
  status?: TradeStatus;
  payment_method?: PaymentMethod | null;
  notes?: string | null;
  shipping_deadline?: string | null;
}

export interface UpdateTradeInput {
  goods_item_id?: string;
  partner_name?: string;
  item_name?: string;
  type?: TradeType;
  status?: TradeStatus;
  payment_method?: PaymentMethod | null;
  notes?: string | null;
  shipping_deadline?: string | null;
}

export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

export interface CreateGoodsItemInput {
  category_id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

export interface UpdateGoodsItemInput {
  category_id?: string;
  name?: string;
  description?: string;
  sort_order?: number;
}

export interface CreateTodoInput {
  trade_id: string;
  title: string;
  sort_order?: number;
}

export interface UpdateTodoInput {
  title?: string;
  is_done?: boolean;
  sort_order?: number;
}

export interface UpdateSettingsInput {
  allow_cloud_backup?: boolean;
  is_passcode_lock_enabled?: boolean;
  default_sort_order?: string;
}

// 統計情報用の型
export interface GoodsStatistics {
  category_id: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  goods_count: number;
  total_trades: number;
  active_trades: number;
  completed_trades: number;
  canceled_trades: number;
}

// 3階層の関連データを含む拡張型
export interface TradeWithGoods extends Trade {
  goods_item: GoodsItemWithCategory;
}

export interface GoodsItemWithCategory extends GoodsItem {
  category: GoodsCategory;
}

export interface GoodsItemWithTrades extends GoodsItem {
  trades: Trade[];
  category: GoodsCategory;
}
