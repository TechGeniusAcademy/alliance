-- Создание таблицы профилей мастеров
CREATE TABLE IF NOT EXISTS master_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Статистика
  completed_orders INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  
  -- Финансы
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  commission_balance DECIMAL(10,2) DEFAULT 0.00,
  total_commission_paid DECIMAL(10,2) DEFAULT 0.00,
  
  -- Комиссии первого месяца
  first_month_orders INTEGER DEFAULT 0,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Дополнительная информация
  specialization VARCHAR(100),
  experience_years INTEGER DEFAULT 0,
  bio TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы транзакций комиссий
CREATE TABLE IF NOT EXISTS commission_transactions (
  id SERIAL PRIMARY KEY,
  master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id INTEGER,
  
  order_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_type VARCHAR(20) NOT NULL, -- 'first_month' или 'percentage'
  commission_rate DECIMAL(5,2), -- процент (если применимо)
  
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
  paid_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы транзакций кошелька
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'commission_payment', 'order_payment'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  
  order_id INTEGER,
  payment_intent_id VARCHAR(255),
  
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_master_profiles_user_id ON master_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_master_id ON commission_transactions(master_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_status ON commission_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_master_id ON wallet_transactions(master_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);

-- Автоматически создаём профиль мастера при регистрации пользователя с ролью master
CREATE OR REPLACE FUNCTION create_master_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'master' THEN
    INSERT INTO master_profiles (user_id, registered_at)
    VALUES (NEW.id, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера (удаляем старый, если существует)
DROP TRIGGER IF EXISTS trigger_create_master_profile ON users;

CREATE TRIGGER trigger_create_master_profile
AFTER INSERT OR UPDATE OF role ON users
FOR EACH ROW
EXECUTE FUNCTION create_master_profile();
