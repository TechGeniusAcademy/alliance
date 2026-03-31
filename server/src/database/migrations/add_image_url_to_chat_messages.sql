-- Добавление поддержки изображений в сообщениях чата
-- Этот скрипт добавляет колонку image_url в таблицу chat_messages

-- Проверяем, существует ли колонка, и добавляем её если нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chat_messages' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE chat_messages 
        ADD COLUMN image_url TEXT;
        
        RAISE NOTICE 'Column image_url added to chat_messages table';
    ELSE
        RAISE NOTICE 'Column image_url already exists in chat_messages table';
    END IF;
END $$;
