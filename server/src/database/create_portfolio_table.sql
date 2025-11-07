-- Таблица для портфолио мастеров
CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  images TEXT[], -- массив URL изображений
  completion_date DATE,
  client_name VARCHAR(255),
  price DECIMAL(10, 2),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по master_id
CREATE INDEX IF NOT EXISTS idx_portfolio_master_id ON portfolio(master_id);

-- Индекс для поиска по категории
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);

-- Индекс для публичных работ
CREATE INDEX IF NOT EXISTS idx_portfolio_public ON portfolio(is_public);
