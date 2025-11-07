-- Миграция: добавление полей role и active в таблицу users

-- Добавление столбца role
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Добавление столбца active
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Создание индекса для role для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Создание индекса для active
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);

-- Обновление существующих пользователей (если они есть)
UPDATE users SET role = 'customer' WHERE role IS NULL;
UPDATE users SET active = true WHERE active IS NULL;
