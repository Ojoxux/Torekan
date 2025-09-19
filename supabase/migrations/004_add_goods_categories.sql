-- グッズカテゴリ機能のためのマイグレーション

-- 1. goods_categoriesテーブルの作成
CREATE TABLE IF NOT EXISTS public.goods_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- ユーザーごとにカテゴリ名は重複不可
  CONSTRAINT unique_user_category_name UNIQUE(user_id, name)
);

-- 2. tradesテーブルにカテゴリのカラムを追加
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.goods_categories(id) ON DELETE SET NULL;

-- 3. goods_categoriesテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_goods_categories_user_id ON public.goods_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_goods_categories_sort_order ON public.goods_categories(sort_order);

-- 4. tradesテーブルの新規カラムに対するインデックス
CREATE INDEX IF NOT EXISTS idx_trades_category_id ON public.trades(category_id);

-- 5. goods_categoriesテーブルのRLSポリシー
ALTER TABLE public.goods_categories ENABLE ROW LEVEL SECURITY;

-- SELECT: ユーザーは自分のカテゴリのみ参照可能
CREATE POLICY "Users can view their own categories" 
ON public.goods_categories 
FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: ユーザーは自分のカテゴリのみ作成可能
CREATE POLICY "Users can create their own categories" 
ON public.goods_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: ユーザーは自分のカテゴリのみ更新可能
CREATE POLICY "Users can update their own categories" 
ON public.goods_categories 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: ユーザーは自分のカテゴリのみ削除可能
CREATE POLICY "Users can delete their own categories" 
ON public.goods_categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. goods_categoriesテーブルのupdated_atトリガー
CREATE TRIGGER update_goods_categories_updated_at 
BEFORE UPDATE ON public.goods_categories
FOR EACH ROW 
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. コメントの追加（ドキュメント化）
COMMENT ON TABLE public.goods_categories IS 'グッズカテゴリを管理するテーブル';
COMMENT ON COLUMN public.goods_categories.id IS 'カテゴリID（UUID）';
COMMENT ON COLUMN public.goods_categories.user_id IS 'カテゴリを作成したユーザーID';
COMMENT ON COLUMN public.goods_categories.name IS 'カテゴリ名';
COMMENT ON COLUMN public.goods_categories.color IS 'カテゴリの表示色（HEXコード）';
COMMENT ON COLUMN public.goods_categories.sort_order IS '表示順序';
COMMENT ON COLUMN public.goods_categories.created_at IS 'カテゴリ作成日時';
COMMENT ON COLUMN public.goods_categories.updated_at IS 'カテゴリ更新日時';

COMMENT ON COLUMN public.trades.category_id IS 'グッズカテゴリID（外部キー）';