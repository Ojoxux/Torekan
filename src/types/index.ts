/*
 * 取引タイプ
 * TODO: 購入じゃなくて、買取にしたい
 */
export enum TradeType {
  EXCHANGE = 'exchange', // 交換
  TRANSFER = 'transfer', // 譲渡
  PURCHASE = 'purchase', // 購入
}

/*
 * 取引ステータス
 * TODO: ステータスは進行中、完了、キャンセルにしたい
 * あと、その他にするとかだけでいい
 */
export enum TradeStatus {
  PLANNED = 'planned', // 計画中
  NEGOTIATING = 'negotiating', // 交渉中
  CONFIRMED = 'confirmed', // 確定済み
  SHIPPED = 'shipped', // 発送済み
  COMPLETED = 'completed', // 完了
  CANCELED = 'canceled', // キャンセル
}

/*
 * 支払い方法
 */
export enum PaymentMethod {
  CASH = 'cash', // 現金
  BANK_TRANSFER = 'bank_transfer', // 銀行振込
  CREDIT_CARD = 'credit_card', // クレジットカード
  DIGITAL_PAYMENT = 'digital_payment', // デジタル決済
  OTHER = 'other', // その他
}

/*
 * プリセットカラー
 */
export enum PresetColor {
  RED = '#EF4444', // 赤
  ORANGE = '#F97316', // オレンジ
  YELLOW = '#EAB308', // 黄色
  GREEN = '#22C55E', // 緑
  CYAN = '#06B6D4', // シアン
  BLUE = '#3B82F6', // 青
  VIOLET = '#8B5CF6', // 紫
  PINK = '#EC4899', // ピンク
  GRAY = '#6B7280', // グレー
  DARK_GRAY = '#374151', // ダークグレー
}

/*
 * プリセットアイコン
 */
export enum PresetIcon {
  FOLDER = 'folder', // フォルダ
  BADGE = 'badge', // 缶バッジ
  STAR = 'star', // アクスタ
  KEY = 'key', // キーホルダー
  HEART = 'heart', // グッズ一般
  GIFT = 'gift', // プレゼント
  BOOKMARK = 'bookmark', // ブックマーク
  TAG = 'tag', // タグ
  DIAMOND = 'diamond', // 特別アイテム
  TROPHY = 'trophy', // コレクション
}

/*
 * 並び順
 * created_at: 作成日時
 * updated_at: 更新日時
 * status: ステータス
 */
export type SortOrder = 'created_at' | 'updated_at' | 'status';

/*
 * 取引データの型
 */
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

/*
 * グッズカテゴリデータの型
 */
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

/*
 * グッズアイテムデータの型
 */
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

/*
 * ToDoデータの型
 */
export interface Todo {
  id: string;
  trade_id: string;
  title: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
}

/*
 * 設定データの型
 */
export interface Settings {
  user_id: string;
  allow_cloud_backup: boolean;
  is_passcode_lock_enabled: boolean;
  default_sort_order: string;
  updated_at: string;
}

/*
 * ユーザーデータの型
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
}

/*
 * 取引作成用の入力データの型
 */
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

/*
 * 取引更新用の入力データの型
 */
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

/*
 * グッズカテゴリ作成用の入力データの型
 */
export interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

/*
 * グッズカテゴリ更新用の入力データの型
 */
export interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
  sort_order?: number;
}

/*
 * グッズアイテム作成用の入力データの型
 */
export interface CreateGoodsItemInput {
  category_id: string;
  name: string;
  description?: string;
  sort_order?: number;
}

/*
 * グッズアイテム更新用の入力データの型
 */
export interface UpdateGoodsItemInput {
  category_id?: string;
  name?: string;
  description?: string;
  sort_order?: number;
}

/*
 * ToDo作成用の入力データの型
 */
export interface CreateTodoInput {
  trade_id: string;
  title: string;
  sort_order?: number;
}

/*
 * ToDo更新用の入力データの型
 */
export interface UpdateTodoInput {
  title?: string;
  is_done?: boolean;
  sort_order?: number;
}

/*
 * 設定更新用の入力データの型
 */
export interface UpdateSettingsInput {
  allow_cloud_backup?: boolean;
  is_passcode_lock_enabled?: boolean;
  default_sort_order?: string;
}

/*
 * 統計情報用の型
 */
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

/*
 * 3階層の関連データを含む拡張型
 */
export interface TradeWithGoods extends Trade {
  goods_item: GoodsItemWithCategory;
}

/*
 * グッズアイテムとカテゴリを含む拡張型
 */
export interface GoodsItemWithCategory extends GoodsItem {
  category: GoodsCategory;
}

/*
 * グッズアイテムと取引を含む拡張型
 */
export interface GoodsItemWithTrades extends GoodsItem {
  trades: Trade[];
  category: GoodsCategory;
}
