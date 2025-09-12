-- Create indexes for trades table
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_is_archived ON trades(is_archived);
CREATE INDEX idx_trades_event_date ON trades(event_date);
CREATE INDEX idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX idx_trades_updated_at ON trades(updated_at DESC);

-- Create indexes for todos table
CREATE INDEX idx_todos_trade_id ON todos(trade_id);
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_is_completed ON todos(is_completed);
CREATE INDEX idx_todos_display_order ON todos(trade_id, display_order);

-- Create indexes for settings table
CREATE INDEX idx_settings_user_id ON settings(user_id);