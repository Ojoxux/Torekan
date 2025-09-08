import * as v from 'valibot';

// 取引のバリデーションスキーマ
export const tradeSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, '取引名は必須です'),
    v.maxLength(128, '取引名は128文字以内で入力してください')
  ),
  partner_name: v.optional(
    v.nullable(v.pipe(v.string(), v.maxLength(64, '取引相手名は64文字以内で入力してください')))
  ),
  item_memo: v.optional(
    v.nullable(v.pipe(v.string(), v.maxLength(1000, 'メモは1000文字以内で入力してください')))
  ),
  status: v.picklist(['連絡待ち', '住所交換済み', '発送待ち', '発送済み', '完了']),
  trade_type: v.picklist(['交換', '譲渡', '買取']),
  shipping_deadline: v.optional(v.nullable(v.string())),
  is_archived: v.optional(v.boolean(), false),
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
  auto_archive_on_complete: v.optional(v.boolean(), true),
  allow_cloud_backup: v.optional(v.boolean(), false),
  is_passcode_lock_enabled: v.optional(v.boolean(), false),
});

// フォーム用の型エクスポート
export type TradeFormInput = v.InferInput<typeof tradeSchema>;
export type TodoFormInput = v.InferInput<typeof todoSchema>;
export type SettingsFormInput = v.InferInput<typeof settingsSchema>;
