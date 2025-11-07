-- Миграция: Добавление новых полей в таблицу users
-- Выполните это если таблица users уже существует

-- Добавляем новые колонки, если их еще нет
DO $$ 
BEGIN
    -- Проверяем и добавляем phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;

    -- Проверяем и добавляем address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;

    -- Проверяем и добавляем profile_photo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='profile_photo') THEN
        ALTER TABLE users ADD COLUMN profile_photo TEXT;
    END IF;

    -- Проверяем и добавляем updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Обновляем существующие записи
UPDATE users SET updated_at = created_at WHERE updated_at IS NULL;
