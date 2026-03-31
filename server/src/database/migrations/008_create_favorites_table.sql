-- Создание таблицы избранного
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, order_id)
);

-- Индексы для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_order_id ON favorites(order_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Комментарии
COMMENT ON TABLE favorites IS 'Избранные заказы пользователей';
COMMENT ON COLUMN favorites.user_id IS 'ID пользователя (клиента или мастера)';
COMMENT ON COLUMN favorites.order_id IS 'ID заказа';
COMMENT ON COLUMN favorites.created_at IS 'Дата добавления в избранное';
