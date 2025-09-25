-- Migration: Update schema for TODO requirements
-- Created: 2025-09-25
-- Description: Update schema based on TODO comments in types/index.ts

-- Step 1: Update TradeStatus enum values
-- Change from complex statuses to simple ones: IN_PROGRESS, COMPLETED, CANCELED

-- First, check if quantity column already exists and add it if not
DO $$ 
BEGIN
    -- Add quantity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trades' AND column_name = 'quantity') THEN
        ALTER TABLE trades ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0);
        ALTER TABLE trades ALTER COLUMN quantity DROP DEFAULT;
    END IF;
END $$;

-- First, drop the existing constraint to avoid conflicts
ALTER TABLE trades DROP CONSTRAINT IF EXISTS trades_status_check;

-- Update existing status values to new enum in a transaction-safe way
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    -- Update all trades with invalid status values
    FOR rec IN SELECT id, status FROM trades WHERE status NOT IN ('in_progress', 'completed', 'canceled') LOOP
        UPDATE trades 
        SET status = CASE 
            WHEN rec.status IN ('planned', 'negotiating', 'confirmed', 'shipped') THEN 'in_progress'
            WHEN rec.status = 'completed' THEN 'completed'
            WHEN rec.status = 'canceled' THEN 'canceled'
            ELSE 'in_progress'
        END
        WHERE id = rec.id;
    END LOOP;
    
    -- Also update any remaining non-standard values to in_progress
    UPDATE trades 
    SET status = 'in_progress' 
    WHERE status NOT IN ('in_progress', 'completed', 'canceled');
END $$;

-- Add new constraint after data is updated
ALTER TABLE trades ADD CONSTRAINT trades_status_check 
CHECK (status IN ('in_progress', 'completed', 'canceled'));

-- Step 2: Quantity column handling is now done in Step 1

-- Step 3: Update goods_items table
-- Remove description column and add release_date column
DO $$ 
BEGIN
    -- Add release_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'goods_items' AND column_name = 'release_date') THEN
        ALTER TABLE goods_items ADD COLUMN release_date DATE;
    END IF;
    
    -- Drop description column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'goods_items' AND column_name = 'description') THEN
        ALTER TABLE goods_items DROP COLUMN description;
    END IF;
END $$;

-- Step 4: Update statistics view to reflect new schema
DROP VIEW IF EXISTS goods_statistics;
CREATE VIEW goods_statistics AS
SELECT 
  gc.id as category_id,
  gc.name as category_name,
  gc.color as category_color,
  gc.icon as category_icon,
  COUNT(DISTINCT gi.id) as goods_count,
  COUNT(t.id) as total_trades,
  COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as active_trades,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_trades,
  COUNT(CASE WHEN t.status = 'canceled' THEN 1 END) as canceled_trades
FROM goods_categories gc
LEFT JOIN goods_items gi ON gc.id = gi.category_id
LEFT JOIN trades t ON gi.id = t.goods_item_id
WHERE gc.user_id = auth.uid()
GROUP BY gc.id, gc.name, gc.color, gc.icon, gc.sort_order
ORDER BY gc.sort_order;

-- Step 5: Add comments for new columns
COMMENT ON COLUMN trades.quantity IS 'Number of items in the trade';
COMMENT ON COLUMN goods_items.release_date IS 'Release date of the goods item';

-- Step 6: Update sample data function to use new schema
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
  
  -- Create goods items with release dates
  INSERT INTO goods_items (category_id, user_id, name, release_date, sort_order)
  VALUES 
    (category_badges_id, p_user_id, '〇〇の缶バッジ', '2024-01-15', 0),
    (category_acrylic_id, p_user_id, '△△のアクスタ', '2024-02-20', 0)
  RETURNING id INTO goods_item1_id;
  
  SELECT id INTO goods_item2_id FROM goods_items 
  WHERE category_id = category_acrylic_id AND name = '△△のアクスタ';
  
  -- Create trades with quantities and new status values
  INSERT INTO trades (goods_item_id, user_id, partner_name, item_name, quantity, notes, status, type)
  VALUES 
    (goods_item1_id, p_user_id, '相手A', 'キャラA缶バッジ', 2, '新宿駅で手渡し予定', 'in_progress', 'exchange'),
    (goods_item1_id, p_user_id, '相手B', 'キャラB缶バッジ', 1, '郵送での取引', 'in_progress', 'exchange'),
    (goods_item2_id, p_user_id, '相手C', 'キャラCアクスタ', 1, 'イベント会場での交換', 'completed', 'exchange')
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
-- Changes implemented:
-- 1. Simplified TradeStatus to IN_PROGRESS, COMPLETED, CANCELED
-- 2. Added quantity field to trades table
-- 3. Replaced description with release_date in goods_items table
-- 4. Updated statistics view and sample data function
