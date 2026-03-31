-- Добавляем недостающие колонки в таблицу wallet_transactions
DO $$ 
BEGIN
    -- order_id
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions' 
        AND column_name = 'order_id'
    ) THEN
        ALTER TABLE wallet_transactions ADD COLUMN order_id INTEGER;
        RAISE NOTICE 'Колонка order_id добавлена в таблицу wallet_transactions';
    ELSE
        RAISE NOTICE 'Колонка order_id уже существует в таблице wallet_transactions';
    END IF;

    -- payment_intent_id
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions' 
        AND column_name = 'payment_intent_id'
    ) THEN
        ALTER TABLE wallet_transactions ADD COLUMN payment_intent_id VARCHAR(255);
        RAISE NOTICE 'Колонка payment_intent_id добавлена в таблицу wallet_transactions';
    ELSE
        RAISE NOTICE 'Колонка payment_intent_id уже существует в таблице wallet_transactions';
    END IF;

    -- description
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE wallet_transactions ADD COLUMN description TEXT;
        RAISE NOTICE 'Колонка description добавлена в таблицу wallet_transactions';
    ELSE
        RAISE NOTICE 'Колонка description уже существует в таблице wallet_transactions';
    END IF;

    -- created_at
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE wallet_transactions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Колонка created_at добавлена в таблицу wallet_transactions';
    ELSE
        RAISE NOTICE 'Колонка created_at уже существует в таблице wallet_transactions';
    END IF;

    -- updated_at
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE wallet_transactions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Колонка updated_at добавлена в таблицу wallet_transactions';
    ELSE
        RAISE NOTICE 'Колонка updated_at уже существует в таблице wallet_transactions';
    END IF;
END $$;

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_payment_intent ON wallet_transactions(payment_intent_id);

-- Добавляем внешний ключ на orders если его нет
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_wallet_transactions_order'
    ) THEN
        ALTER TABLE wallet_transactions 
        ADD CONSTRAINT fk_wallet_transactions_order 
        FOREIGN KEY (order_id) 
        REFERENCES orders(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Внешний ключ fk_wallet_transactions_order добавлен';
    ELSE
        RAISE NOTICE 'Внешний ключ fk_wallet_transactions_order уже существует';
    END IF;
END $$;
