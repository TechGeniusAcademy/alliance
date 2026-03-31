-- Создание таблицы для хранения сгенерированных AI изображений
CREATE TABLE IF NOT EXISTS ai_generated_images (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индекс для быстрого поиска по пользователю
CREATE INDEX IF NOT EXISTS idx_ai_images_user_id ON ai_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_images_created_at ON ai_generated_images(created_at DESC);
