-- Migration: Create Three-Tier Structure (Categories -> Goods -> Trades)
-- Created: 2025-09-20
-- Description: Replace existing single-tier structure with three-tier hierarchy

-- Step 1: Drop existing tables (test data only)
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS goods_categories CASCADE;

-- Step 2: Create new three-tier structure

-- 1. Goods Categories Table
CREATE TABLE goods_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 64),
  color TEXT DEFAULT '#6B7280' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  icon TEXT DEFAULT 'folder',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  UNIQUE(user_id, name)
);

-- 2. Goods Items Table
CREATE TABLE goods_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES goods_categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 128),
  description TEXT CHECK (char_length(description) <= 500),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  UNIQUE(category_id, name)
);

-- 3. Trades Table (New Structure)
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goods_item_id UUID REFERENCES goods_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL CHECK (char_length(partner_name) <= 64),
  notes TEXT CHECK (char_length(notes) <= 1000),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (
    status IN ('planned', 'negotiating', 'confirmed', 'shipped', 'completed', 'canceled')
  ),
  type TEXT NOT NULL DEFAULT 'exchange' CHECK (
    type IN ('exchange', 'transfer', 'purchase')
  ),
  payment_method TEXT CHECK (
    payment_method IN ('cash', 'bank_transfer', 'credit_card', 'digital_payment', 'other')
  ),
  shipping_deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Todos Table (Updated to reference new trades)
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 128),
  is_done BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Settings Table (Enhanced)
CREATE TABLE IF NOT EXISTS settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_cloud_backup BOOLEAN DEFAULT false,
  is_passcode_lock_enabled BOOLEAN DEFAULT true,
  default_sort_order TEXT DEFAULT 'updated_at_desc' CHECK (
    default_sort_order IN ('updated_at_desc', 'updated_at_asc', 'name_asc', 'name_desc')
  ),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Create Indexes for Performance
CREATE INDEX idx_goods_categories_user_sort ON goods_categories(user_id, sort_order);
CREATE INDEX idx_goods_items_category_sort ON goods_items(category_id, sort_order);
CREATE INDEX idx_goods_items_user ON goods_items(user_id);
CREATE INDEX idx_trades_goods_item ON trades(goods_item_id);
CREATE INDEX idx_trades_user_status ON trades(user_id, status);
CREATE INDEX idx_trades_updated ON trades(goods_item_id, updated_at DESC);
CREATE INDEX idx_todos_trade_sort ON todos(trade_id, sort_order);

-- Step 4: Enable Row Level Security
ALTER TABLE goods_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies

-- Categories: Users can only manage their own categories
CREATE POLICY "Users can manage own categories" ON goods_categories
  FOR ALL USING (auth.uid() = user_id);

-- Goods Items: Users can only manage their own goods items
CREATE POLICY "Users can manage own goods items" ON goods_items
  FOR ALL USING (auth.uid() = user_id);

-- Trades: Users can only manage their own trades
CREATE POLICY "Users can manage own trades" ON trades
  FOR ALL USING (auth.uid() = user_id);

-- Todos: Users can only manage todos for their own trades
CREATE POLICY "Users can manage todos for own trades" ON todos
  FOR ALL USING (
    trade_id IN (SELECT id FROM trades WHERE user_id = auth.uid())
  );

-- Settings: Users can only manage their own settings
CREATE POLICY "Users can manage own settings" ON settings
  FOR ALL USING (auth.uid() = user_id);

-- Step 6: Create Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goods_categories_updated_at 
  BEFORE UPDATE ON goods_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goods_items_updated_at 
  BEFORE UPDATE ON goods_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at 
  BEFORE UPDATE ON trades 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Create Statistics View
CREATE VIEW goods_statistics AS
SELECT 
  gc.id as category_id,
  gc.name as category_name,
  gc.color as category_color,
  gc.icon as category_icon,
  COUNT(DISTINCT gi.id) as goods_count,
  COUNT(t.id) as total_trades,
  COUNT(CASE WHEN t.status NOT IN ('completed', 'canceled') THEN 1 END) as active_trades,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_trades,
  COUNT(CASE WHEN t.status = 'canceled' THEN 1 END) as canceled_trades
FROM goods_categories gc
LEFT JOIN goods_items gi ON gc.id = gi.category_id
LEFT JOIN trades t ON gi.id = t.goods_item_id
WHERE gc.user_id = auth.uid()
GROUP BY gc.id, gc.name, gc.color, gc.icon, gc.sort_order
ORDER BY gc.sort_order;

-- Step 8: Create helper functions

-- Function to create default category for new users
CREATE OR REPLACE FUNCTION create_default_category(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  category_id UUID;
BEGIN
  INSERT INTO goods_categories (user_id, name, color, icon, sort_order)
  VALUES (p_user_id, '未分類', '#9CA3AF', 'folder', 0)
  RETURNING id INTO category_id;
  
  RETURN category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create sample data for testing
CREATE OR REPLACE FUNCTION create_sample_data(p_user_id UUID)
RETURNS void AS $$
DECLARE
  category_badges_id UUID;
  category_acrylic_id UUID;
  goods_item1_id UUID;
  goods_item2_id UUID;
  trade1_id UUID;
  trade2_id UUID;
BEGIN
  -- Create categories
  INSERT INTO goods_categories (user_id, name, color, icon, sort_order)
  VALUES 
    (p_user_id, '缶バッジ', '#3B82F6', 'badge', 0),
    (p_user_id, 'アクスタ', '#10B981', 'star', 1)
  RETURNING id INTO category_badges_id;
  
  SELECT id INTO category_acrylic_id FROM goods_categories 
  WHERE user_id = p_user_id AND name = 'アクスタ';
  
  -- Create goods items
  INSERT INTO goods_items (category_id, user_id, name, description, sort_order)
  VALUES 
    (category_badges_id, p_user_id, '〇〇の缶バッジ', '推しキャラの缶バッジです', 0),
    (category_acrylic_id, p_user_id, '△△のアクスタ', 'アクリルスタンド', 0)
  RETURNING id INTO goods_item1_id;
  
  SELECT id INTO goods_item2_id FROM goods_items 
  WHERE category_id = category_acrylic_id AND name = '△△のアクスタ';
  
  -- Create trades
  INSERT INTO trades (goods_item_id, user_id, partner_name, notes, status, type)
  VALUES 
    (goods_item1_id, p_user_id, '相手A', '新宿駅で手渡し予定', 'planned', 'exchange'),
    (goods_item1_id, p_user_id, '相手B', '郵送での取引', 'confirmed', 'exchange'),
    (goods_item2_id, p_user_id, '相手C', 'イベント会場での交換', 'completed', 'exchange')
  RETURNING id INTO trade1_id;
  
  SELECT id INTO trade2_id FROM trades 
  WHERE goods_item_id = goods_item1_id AND partner_name = '相手B';
  
  -- Create sample todos
  INSERT INTO todos (trade_id, title, is_done, sort_order)
  VALUES 
    (trade1_id, '在庫確認', true, 0),
    (trade1_id, '梱包材準備', false, 1),
    (trade1_id, '発送手配', false, 2),
    (trade2_id, '相手に連絡', true, 0),
    (trade2_id, '発送準備', false, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migration completed successfully
-- To create sample data for a user, run: SELECT create_sample_data('user-uuid-here');
