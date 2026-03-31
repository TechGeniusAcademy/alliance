-- Добавляем колонки для принятия правил чата

DO $$ 
BEGIN
    -- customer_accepted_rules
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chats' 
        AND column_name = 'customer_accepted_rules'
    ) THEN
        ALTER TABLE chats ADD COLUMN customer_accepted_rules BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Колонка customer_accepted_rules добавлена в таблицу chats';
    ELSE
        RAISE NOTICE 'Колонка customer_accepted_rules уже существует в таблице chats';
    END IF;

    -- master_accepted_rules
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'chats' 
        AND column_name = 'master_accepted_rules'
    ) THEN
        ALTER TABLE chats ADD COLUMN master_accepted_rules BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Колонка master_accepted_rules добавлена в таблицу chats';
    ELSE
        RAISE NOTICE 'Колонка master_accepted_rules уже существует в таблице chats';
    END IF;
END $$;
