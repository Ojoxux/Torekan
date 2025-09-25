-- Migration: Remove 'sale' from TradeType enum
-- Created: 2025-09-22
-- Description: Update existing 'sale' trades to 'transfer' and remove 'sale' from CHECK constraint

-- Step 1: Update existing 'sale' trades to 'transfer'
-- (Since 'sale' functionality is now included in 'transfer')
UPDATE trades 
SET type = 'transfer' 
WHERE type = 'sale';

-- Step 2: Update CHECK constraint to remove 'sale' option
ALTER TABLE trades 
DROP CONSTRAINT IF EXISTS trades_type_check;

ALTER TABLE trades 
ADD CONSTRAINT trades_type_check 
CHECK (type IN ('exchange', 'transfer', 'purchase'));

-- Step 3: Verify the changes
-- This query should return 0 rows if migration was successful
-- SELECT COUNT(*) FROM trades WHERE type = 'sale';

-- Migration completed successfully
