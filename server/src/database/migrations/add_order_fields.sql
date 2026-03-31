-- Добавление новых столбцов в таблицу orders для расширенной информации о заказе
DO $$ 
BEGIN
    -- Добавляем furniture_type если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'furniture_type'
    ) THEN
        ALTER TABLE orders ADD COLUMN furniture_type VARCHAR(100);
        RAISE NOTICE 'Column furniture_type added';
    END IF;

    -- Добавляем style если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'style'
    ) THEN
        ALTER TABLE orders ADD COLUMN style VARCHAR(100);
        RAISE NOTICE 'Column style added';
    END IF;

    -- Добавляем materials если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'materials'
    ) THEN
        ALTER TABLE orders ADD COLUMN materials JSONB;
        RAISE NOTICE 'Column materials added';
    END IF;

    -- Добавляем dimensions если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'dimensions'
    ) THEN
        ALTER TABLE orders ADD COLUMN dimensions JSONB;
        RAISE NOTICE 'Column dimensions added';
    END IF;

    -- Добавляем budget_min если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'budget_min'
    ) THEN
        ALTER TABLE orders ADD COLUMN budget_min INTEGER;
        RAISE NOTICE 'Column budget_min added';
    END IF;

    -- Добавляем budget_max если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'budget_max'
    ) THEN
        ALTER TABLE orders ADD COLUMN budget_max INTEGER;
        RAISE NOTICE 'Column budget_max added';
    END IF;

    -- Добавляем delivery_address если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivery_address'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_address TEXT;
        RAISE NOTICE 'Column delivery_address added';
    END IF;

    -- Добавляем delivery_required если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'delivery_required'
    ) THEN
        ALTER TABLE orders ADD COLUMN delivery_required BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column delivery_required added';
    END IF;

    -- Добавляем assembly_required если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'assembly_required'
    ) THEN
        ALTER TABLE orders ADD COLUMN assembly_required BOOLEAN DEFAULT false;
        RAISE NOTICE 'Column assembly_required added';
    END IF;

    -- Добавляем photos если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'photos'
    ) THEN
        ALTER TABLE orders ADD COLUMN photos JSONB;
        RAISE NOTICE 'Column photos added';
    END IF;

    -- Добавляем furniture_config если не существует
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'furniture_config'
    ) THEN
        ALTER TABLE orders ADD COLUMN furniture_config JSONB;
        RAISE NOTICE 'Column furniture_config added';
    END IF;

END $$;
