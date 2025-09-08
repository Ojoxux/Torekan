// 取引の種別
export type TradeType = '交換' | '譲渡' | '買取';

// 取引のステータス
export type TradeStatus = '連絡待ち' | '住所交換済み' | '発送待ち' | '発送済み' | '完了';

// 取引データ
export interface Trade {
  id: string;
  user_id: string;
  title: string;
  partner_name?: string;
  item_memo?: string;
  status: TradeStatus;
  trade_type: TradeType;
  shipping_deadline?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

// ToDoデータ
export interface Todo {
  id: string;
  trade_id: string;
  title: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
}

// 設定データ
export interface Settings {
  user_id: string;
  auto_archive_on_complete: boolean;
  allow_cloud_backup: boolean;
  is_passcode_lock_enabled: boolean;
  updated_at: string;
}

// フォーム用の型（IDなし）
export type TradeFormData = Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type TodoFormData = Omit<Todo, 'id' | 'trade_id' | 'created_at'>;

// Supabaseのレスポンス型
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}
