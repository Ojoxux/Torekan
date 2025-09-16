import * as v from 'valibot';
import { PaymentMethod, TradeStatus, TradeType } from '../types';

// 取引のバリデーションスキーマ
export const tradeSchema = v.object({
  item_name: v.pipe(
    v.string(),
    v.minLength(1, 'アイテム名は必須です'),
    v.maxLength(128, 'アイテム名は128文字以内で入力してください')
  ),
  partner_name: v.pipe(
    v.string(),
    v.minLength(1, '取引相手名は必須です'),
    v.maxLength(64, '取引相手名は64文字以内で入力してください')
  ),
  type: v.enum(TradeType, '取引種別を選択してください'),
  status: v.optional(v.enum(TradeStatus), TradeStatus.PLANNED),
  payment_method: v.optional(v.nullable(v.enum(PaymentMethod))),
  item_id: v.optional(v.nullable(v.string())),
  partner_id: v.optional(v.nullable(v.string())),
  notes: v.optional(
    v.nullable(v.pipe(v.string(), v.maxLength(1000, 'メモは1000文字以内で入力してください')))
  ),
  category_id: v.optional(v.nullable(v.string())),
});

// カテゴリのバリデーションスキーマ
export const categorySchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, 'カテゴリ名は必須です'),
    v.maxLength(32, 'カテゴリ名は32文字以内で入力してください')
  ),
  color: v.optional(
    v.pipe(
      v.string(),
      v.regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください')
    ),
    '#6B7280'
  ),
  sort_order: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
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

// フォーム用の型エクスポート
export type TradeFormInput = v.InferInput<typeof tradeSchema>;

// 取引作成用のスキーマ
export const createTradeSchema = tradeSchema;
export type CreateTradeFormInput = v.InferInput<typeof createTradeSchema>;

// 取引更新用のスキーマ（全フィールドをオプショナルに）
export const updateTradeSchema = v.partial(tradeSchema);
export type UpdateTradeFormInput = v.InferInput<typeof updateTradeSchema>;
export type TodoFormInput = v.InferInput<typeof todoSchema>;
export type SettingsFormInput = v.InferInput<typeof settingsSchema>;

// カテゴリ作成用のスキーマ
export const createCategorySchema = categorySchema;
export type CreateCategoryFormInput = v.InferInput<typeof createCategorySchema>;

// カテゴリ更新用のスキーマ
export const updateCategorySchema = v.partial(categorySchema);
export type UpdateCategoryFormInput = v.InferInput<typeof updateCategorySchema>;
