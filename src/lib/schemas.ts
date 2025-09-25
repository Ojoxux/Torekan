import * as v from 'valibot';
import { PaymentMethod, TradeStatus, TradeType } from '../types';

// カテゴリのバリデーションスキーマ
export const categorySchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'カテゴリ名は必須です'),
    v.maxLength(64, 'カテゴリ名は64文字以内で入力してください')
  ),
  color: v.optional(
    v.pipe(v.string(), v.regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください')),
    '#6B7280'
  ),
  icon: v.optional(v.string(), 'folder'),
  sort_order: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
});

// グッズアイテムのバリデーションスキーマ
export const goodsItemSchema = v.object({
  category_id: v.pipe(v.string(), v.minLength(1, 'カテゴリは必須です')),
  name: v.pipe(
    v.string(),
    v.minLength(1, 'グッズ名は必須です'),
    v.maxLength(128, 'グッズ名は128文字以内で入力してください')
  ),
  release_date: v.optional(v.pipe(v.string(), v.isoDate('有効な日付を入力してください'))),
  sort_order: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
});

// 取引のバリデーションスキーマ（3階層構造対応）
export const tradeSchema = v.object({
  goods_item_id: v.pipe(v.string(), v.minLength(1, 'グッズアイテムは必須です')),
  partner_name: v.pipe(
    v.string(),
    v.minLength(1, '取引相手名は必須です'),
    v.maxLength(64, '取引相手名は64文字以内で入力してください')
  ),
  item_name: v.pipe(
    v.string(),
    v.minLength(1, 'アイテム名は必須です'),
    v.maxLength(128, 'アイテム名は128文字以内で入力してください')
  ),
  quantity: v.pipe(
    v.number(),
    v.integer('整数で入力してください'),
    v.minValue(1, '個数は1以上で入力してください')
  ),
  type: v.enum(TradeType, '取引種別を選択してください'),
  status: v.optional(v.enum(TradeStatus), TradeStatus.IN_PROGRESS),
  payment_method: v.optional(v.union([v.enum(PaymentMethod), v.null()])),
  notes: v.optional(
    v.nullable(v.pipe(v.string(), v.maxLength(1000, 'メモは1000文字以内で入力してください')))
  ),
  shipping_deadline: v.optional(v.nullable(v.string())),
});

// ToDoのバリデーションスキーマ
export const todoSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, 'タスク名は必須です'),
    v.maxLength(128, 'タスク名は128文字以内で入力してください')
  ),
  is_done: v.optional(v.boolean(), false),
  sort_order: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

// 設定のバリデーションスキーマ
export const settingsSchema = v.object({
  allow_cloud_backup: v.optional(v.boolean(), false),
  is_passcode_lock_enabled: v.optional(v.boolean(), false),
});

// カテゴリ関連のスキーマとフォーム型
export const createCategorySchema = categorySchema;
export const updateCategorySchema = v.partial(categorySchema);

export type CategoryFormInput = v.InferInput<typeof categorySchema>;
export type CreateCategoryFormInput = v.InferInput<typeof createCategorySchema>;
export type UpdateCategoryFormInput = v.InferInput<typeof updateCategorySchema>;

// グッズアイテム関連のスキーマとフォーム型
export const createGoodsItemSchema = goodsItemSchema;
export const updateGoodsItemSchema = v.partial(goodsItemSchema);

export type GoodsItemFormInput = v.InferInput<typeof goodsItemSchema>;
export type CreateGoodsItemFormInput = v.InferInput<typeof createGoodsItemSchema>;
export type UpdateGoodsItemFormInput = v.InferInput<typeof updateGoodsItemSchema>;

// 取引関連のスキーマとフォーム型
export const createTradeSchema = tradeSchema;
export const updateTradeSchema = v.partial(v.omit(tradeSchema, ['goods_item_id']));

export type TradeFormInput = v.InferInput<typeof tradeSchema>;
export type CreateTradeFormInput = v.InferInput<typeof createTradeSchema>;
export type UpdateTradeFormInput = v.InferInput<typeof updateTradeSchema>;

// その他のフォーム型
export type TodoFormInput = v.InferInput<typeof todoSchema>;
export type SettingsFormInput = v.InferInput<typeof settingsSchema>;
