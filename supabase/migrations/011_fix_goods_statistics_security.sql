-- Migration to fix goods_statistics view security definer issue
-- Drop and recreate the view without SECURITY DEFINER property

DROP VIEW IF EXISTS goods_statistics;

-- Recreate the view with explicit security invoker (default behavior)
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

-- Add explicit comment to clarify security model
COMMENT ON VIEW goods_statistics IS 'Statistics view that uses row-level security via auth.uid() filter';