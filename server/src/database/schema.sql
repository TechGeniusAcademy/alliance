-- Создание базы данных (выполните это вручную в PostgreSQL)
-- CREATE DATABASE auth_db;

-- Подключитесь к базе данных auth_db и выполните следующие команды:

-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  profile_photo VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для email для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
