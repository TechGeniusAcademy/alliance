-- Скрипт для создания тестовых пользователей
-- ВАЖНО: Запустите этот скрипт после того, как база данных будет создана

-- Удаляем существующих тестовых пользователей (опционально)
-- DELETE FROM users WHERE email IN ('admin@test.com', 'customer@test.com', 'master@test.com');

-- Создаем тестовых пользователей с хешированными паролями (bcrypt)
-- Все пароли: test123

-- 1. Администратор
INSERT INTO users (name, email, password, phone, address, role, active, created_at)
VALUES (
  'Администратор',
  'admin@test.com',
  '$2a$10$rKZvYxZLPzYVhL/v0xV0KeKdLLQOxL5fhKjLEQgL5YxDm5KJxPZYu', -- test123
  '+7 (777) 123-45-67',
  'г. Алматы, ул. Абая 1',
  'admin',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- 2. Заказчик (Клиент)
INSERT INTO users (name, email, password, phone, address, role, active, created_at)
VALUES (
  'Иван Иванов',
  'customer@test.com',
  '$2a$10$rKZvYxZLPzYVhL/v0xV0KeKdLLQOxL5fhKjLEQgL5YxDm5KJxPZYu', -- test123
  '+7 (777) 234-56-78',
  'г. Алматы, пр. Достык 123',
  'customer',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- 3. Мебельщик (Мастер)
INSERT INTO users (name, email, password, phone, address, role, active, created_at)
VALUES (
  'Петр Петров',
  'master@test.com',
  '$2a$10$rKZvYxZLPzYVhL/v0xV0KeKdLLQOxL5fhKjLEQgL5YxDm5KJxPZYu', -- test123
  '+7 (777) 345-67-89',
  'г. Алматы, ул. Сатпаева 45',
  'master',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- Проверяем созданных пользователей
SELECT id, name, email, role, active, created_at 
FROM users 
WHERE email IN ('admin@test.com', 'customer@test.com', 'master@test.com')
ORDER BY role;
