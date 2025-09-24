-- Migration: Add item_name column to trades table
-- Created: 2025-09-22
-- Description: Add item_name field to allow specific item identification within goods

-- Add item_name column to trades table as required field
ALTER TABLE trades 
ADD COLUMN item_name TEXT NOT NULL DEFAULT '' CHECK (char_length(item_name) <= 128);

-- Remove default after adding the column
ALTER TABLE trades ALTER COLUMN item_name DROP DEFAULT;

-- Add comment for documentation
COMMENT ON COLUMN trades.item_name IS 'Specific item name within the goods (e.g., character name, variant name)';
