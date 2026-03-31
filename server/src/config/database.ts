import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Подключение к PostgreSQL без указания конкретной базы данных
const createDatabasePool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'postgres', // Подключаемся к стандартной базе postgres
});

// Подключение к нашей базе данных
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const initializeDatabase = async () => {
  try {
    console.log('🔍 Проверка и создание базы данных...');

    // Проверяем существование базы данных
    const dbCheckResult = await createDatabasePool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME]
    );

    // Если база данных не существует, создаем её
    if (dbCheckResult.rows.length === 0) {
      console.log(`📦 База данных ${process.env.DB_NAME} не найдена. Создаю...`);
      await createDatabasePool.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`✓ База данных ${process.env.DB_NAME} успешно создана`);
    } else {
      console.log(`✓ База данных ${process.env.DB_NAME} уже существует`);
    }

    // Закрываем соединение с postgres
    await createDatabasePool.end();

    // Создаем таблицы в нашей базе данных
    console.log('🔨 Проверка и создание таблиц...');

    const createUsersTable = `
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
    `;

    const createEmailIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    await pool.query(createUsersTable);
    console.log('✓ Таблица users создана/проверена');

    await pool.query(createEmailIndex);
    console.log('✓ Индекс для email создан/проверен');

    // Миграция: добавляем поле name если его нет
    const addNameField = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='name') THEN
              ALTER TABLE users ADD COLUMN name VARCHAR(100);
              -- Заполняем name из email для существующих пользователей
              UPDATE users SET name = split_part(email, '@', 1) WHERE name IS NULL;
              -- Делаем поле обязательным после заполнения
              ALTER TABLE users ALTER COLUMN name SET NOT NULL;
          END IF;
      END $$;
    `;
    await pool.query(addNameField);
    console.log('✓ Поле name добавлено/проверено в users');

    // Миграция: переименовываем password в password_hash если нужно, или удаляем дубликаты
    const fixPasswordField = `
      DO $$ 
      BEGIN
          -- Если есть оба поля, копируем данные из password в password_hash и удаляем password
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password')
             AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
              -- Копируем данные из password в password_hash где password_hash пустой
              UPDATE users SET password_hash = password WHERE password_hash IS NULL AND password IS NOT NULL;
              -- Удаляем поле password
              ALTER TABLE users DROP COLUMN password;
          -- Если есть только password, переименовываем его в password_hash
          ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password')
             AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
              ALTER TABLE users RENAME COLUMN password TO password_hash;
          -- Если есть только password_hash - ничего не делаем
          ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
              -- Если нет ни того ни другого, создаем password_hash
              ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$10$defaulthash';
          END IF;
      END $$;
    `;
    await pool.query(fixPasswordField);
    console.log('✓ Поле password_hash настроено корректно');

    // Миграция: добавляем поле email если его нет
    const addEmailField = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='email') THEN
              ALTER TABLE users ADD COLUMN email VARCHAR(100);
              -- Для существующих пользователей генерируем email из id
              UPDATE users SET email = CONCAT('user', id, '@temp.com') WHERE email IS NULL;
              ALTER TABLE users ALTER COLUMN email SET NOT NULL;
              ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
          END IF;
      END $$;
    `;
    await pool.query(addEmailField);
    console.log('✓ Поле email добавлено/проверено в users');

    // Применяем миграции для добавления полей профиля
    const addProfileFields = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='phone') THEN
              ALTER TABLE users ADD COLUMN phone VARCHAR(20);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='address') THEN
              ALTER TABLE users ADD COLUMN address TEXT;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='profile_photo') THEN
              ALTER TABLE users ADD COLUMN profile_photo TEXT;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='updated_at') THEN
              ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          END IF;
      END $$;
    `;

    await pool.query(addProfileFields);
    console.log('✓ Миграции для полей профиля применены');

    // Применяем миграции для добавления полей role и active
    const addRoleAndActiveFields = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='role') THEN
              ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'customer';
              CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='active') THEN
              ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT true;
              CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
          END IF;
      END $$;
    `;

    await pool.query(addRoleAndActiveFields);
    console.log('✓ Миграции для полей role и active применены');

    // Миграция: удаляем старое ограничение role если оно есть и создаем новое
    const fixRoleConstraint = `
      DO $$ 
      BEGIN
          -- Удаляем старое ограничение если оно существует
          IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
              ALTER TABLE users DROP CONSTRAINT users_role_check;
          END IF;
          
          -- Создаем новое ограничение с правильными значениями
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check_new') THEN
              ALTER TABLE users ADD CONSTRAINT users_role_check_new 
              CHECK (role IN ('customer', 'master', 'admin'));
          END IF;
      END $$;
    `;
    await pool.query(fixRoleConstraint);
    console.log('✓ Ограничение role обновлено');

    // Применяем миграции для добавления полей мастера (last_name, birth_date, iin)
    const addMasterFields = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='last_name') THEN
              ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='birth_date') THEN
              ALTER TABLE users ADD COLUMN birth_date DATE;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='iin') THEN
              ALTER TABLE users ADD COLUMN iin VARCHAR(12) UNIQUE;
              CREATE INDEX IF NOT EXISTS idx_users_iin ON users(iin);
          END IF;
      END $$;
    `;

    await pool.query(addMasterFields);
    console.log('✓ Поля мастера (last_name, birth_date, iin) добавлены/проверены');

    // Создаем таблицу portfolio
    const createPortfolioTable = `
      CREATE TABLE IF NOT EXISTS portfolio (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        images TEXT[],
        execution_time VARCHAR(100),
        materials VARCHAR(255),
        dimensions VARCHAR(100),
        furniture_type VARCHAR(100),
        style VARCHAR(100),
        color VARCHAR(100),
        client_name VARCHAR(255),
        location VARCHAR(255),
        price DECIMAL(10, 2),
        warranty_period VARCHAR(50),
        assembly_included BOOLEAN DEFAULT true,
        delivery_included BOOLEAN DEFAULT false,
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createPortfolioIndexes = `
      CREATE INDEX IF NOT EXISTS idx_portfolio_master_id ON portfolio(master_id);
      CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
      CREATE INDEX IF NOT EXISTS idx_portfolio_public ON portfolio(is_public);
    `;

    await pool.query(createPortfolioTable);
    console.log('✓ Таблица portfolio создана/проверена');

    await pool.query(createPortfolioIndexes);
    console.log('✓ Индексы для portfolio созданы/проверены');

    // Миграция для добавления новых полей в portfolio
    const addPortfolioFields = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='execution_time') THEN
              ALTER TABLE portfolio ADD COLUMN execution_time VARCHAR(100);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='materials') THEN
              ALTER TABLE portfolio ADD COLUMN materials VARCHAR(255);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='dimensions') THEN
              ALTER TABLE portfolio ADD COLUMN dimensions VARCHAR(100);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='furniture_type') THEN
              ALTER TABLE portfolio ADD COLUMN furniture_type VARCHAR(100);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='style') THEN
              ALTER TABLE portfolio ADD COLUMN style VARCHAR(100);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='color') THEN
              ALTER TABLE portfolio ADD COLUMN color VARCHAR(100);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='location') THEN
              ALTER TABLE portfolio ADD COLUMN location VARCHAR(255);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='warranty_period') THEN
              ALTER TABLE portfolio ADD COLUMN warranty_period VARCHAR(50);
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='assembly_included') THEN
              ALTER TABLE portfolio ADD COLUMN assembly_included BOOLEAN DEFAULT true;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='delivery_included') THEN
              ALTER TABLE portfolio ADD COLUMN delivery_included BOOLEAN DEFAULT false;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='is_public') THEN
              ALTER TABLE portfolio ADD COLUMN is_public BOOLEAN DEFAULT true;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='portfolio' AND column_name='updated_at') THEN
              ALTER TABLE portfolio ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          END IF;
      END $$;
    `;

    await pool.query(addPortfolioFields);
    console.log('✓ Миграции для новых полей portfolio применены');

    // Создаем таблицу master_profiles для дополнительной информации о мастерах
    const createMasterProfilesTable = `
      CREATE TABLE IF NOT EXISTS master_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255),
        bio TEXT,
        specializations TEXT[],
        years_of_experience INTEGER DEFAULT 0,
        education VARCHAR(500),
        certifications TEXT[],
        
        work_schedule VARCHAR(255),
        min_order_amount DECIMAL(10, 2),
        max_projects_simultaneously INTEGER DEFAULT 3,
        
        services_offered TEXT[],
        materials_work_with TEXT[],
        equipment TEXT,
        workspace_size VARCHAR(100),
        has_showroom BOOLEAN DEFAULT false,
        showroom_address TEXT,
        
        payment_methods TEXT[],
        warranty_terms TEXT,
        return_policy TEXT,
        
        website VARCHAR(255),
        instagram VARCHAR(100),
        facebook VARCHAR(100),
        telegram VARCHAR(100),
        whatsapp VARCHAR(50),
        
        languages TEXT[],
        delivery_available BOOLEAN DEFAULT true,
        assembly_available BOOLEAN DEFAULT true,
        design_services BOOLEAN DEFAULT false,
        consultation_free BOOLEAN DEFAULT true,
        
        rating DECIMAL(3, 2) DEFAULT 0.00,
        reviews_count INTEGER DEFAULT 0,
        completed_orders INTEGER DEFAULT 0,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createMasterProfilesIndexes = `
      CREATE INDEX IF NOT EXISTS idx_master_profiles_user_id ON master_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_master_profiles_rating ON master_profiles(rating);
    `;

    await pool.query(createMasterProfilesTable);
    console.log('✓ Таблица master_profiles создана/проверена');

    await pool.query(createMasterProfilesIndexes);
    console.log('✓ Индексы для master_profiles созданы/проверены');

    // Миграция: обновляем NULL значения в master_profiles
    const updateNullValues = `
      UPDATE master_profiles 
      SET rating = COALESCE(rating, 0.00),
          reviews_count = COALESCE(reviews_count, 0),
          completed_orders = COALESCE(completed_orders, 0)
      WHERE rating IS NULL OR reviews_count IS NULL OR completed_orders IS NULL;
    `;
    await pool.query(updateNullValues);
    console.log('✓ Обновлены NULL значения в master_profiles');

    // Создаем таблицу orders (заказы)
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        furniture_type VARCHAR(100),
        style VARCHAR(100),
        materials TEXT,
        dimensions VARCHAR(255),
        budget_min DECIMAL(10, 2),
        budget_max DECIMAL(10, 2),
        deadline DATE,
        delivery_address TEXT,
        delivery_required BOOLEAN DEFAULT false,
        assembly_required BOOLEAN DEFAULT false,
        photos TEXT[],
        status VARCHAR(50) DEFAULT 'auction',
        assigned_master_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        final_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createOrdersIndexes = `
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_assigned_master_id ON orders(assigned_master_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
    `;

    await pool.query(createOrdersTable);
    console.log('✓ Таблица orders создана/проверена');

    // Миграция: добавляем customer_id если его нет
    const addCustomerIdField = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='customer_id') THEN
              ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
              -- Обновляем существующие записи, устанавливая customer_id = user_id если такое поле есть
              IF EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='user_id') THEN
                  UPDATE orders SET customer_id = user_id WHERE customer_id IS NULL;
              END IF;
              -- Делаем поле NOT NULL после заполнения данных
              ALTER TABLE orders ALTER COLUMN customer_id SET NOT NULL;
          END IF;
      END $$;
    `;
    await pool.query(addCustomerIdField);
    console.log('✓ Поле customer_id добавлено/проверено в orders');

    // Миграция: добавляем assigned_master_id если его нет
    const addAssignedMasterIdField = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='assigned_master_id') THEN
              ALTER TABLE orders ADD COLUMN assigned_master_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
              -- Обновляем существующие записи, устанавливая assigned_master_id = master_id если такое поле есть
              IF EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='master_id') THEN
                  UPDATE orders SET assigned_master_id = master_id WHERE assigned_master_id IS NULL;
              END IF;
          END IF;
      END $$;
    `;
    await pool.query(addAssignedMasterIdField);
    console.log('✓ Поле assigned_master_id добавлено/проверено в orders');

    await pool.query(createOrdersIndexes);
    console.log('✓ Индексы для orders созданы/проверены');

    // Миграция: добавляем поля category и final_price если их нет
    const addOrderFields = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='category') THEN
              ALTER TABLE orders ADD COLUMN category VARCHAR(100);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='final_price') THEN
              ALTER TABLE orders ADD COLUMN final_price DECIMAL(10, 2);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='title') THEN
              ALTER TABLE orders ADD COLUMN title VARCHAR(255);
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='description') THEN
              ALTER TABLE orders ADD COLUMN description TEXT;
          END IF;
      END $$;
    `;
    await pool.query(addOrderFields);
    console.log('✓ Поля category, final_price, title, description добавлены/проверены в orders');

    // Добавляем поле furniture_config для хранения 3D конфигурации
    const addFurnitureConfigField = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='furniture_config') THEN
              ALTER TABLE orders ADD COLUMN furniture_config JSONB;
          END IF;
      END $$;
    `;
    await pool.query(addFurnitureConfigField);
    console.log('✓ Поле furniture_config добавлено в таблицу orders');

    // Добавляем поля для отслеживания доставки
    const addDeliveryFields = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='delivery_status') THEN
              ALTER TABLE orders ADD COLUMN delivery_status VARCHAR(50) DEFAULT 'pending';
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='shipped_at') THEN
              ALTER TABLE orders ADD COLUMN shipped_at TIMESTAMP;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='delivered_at') THEN
              ALTER TABLE orders ADD COLUMN delivered_at TIMESTAMP;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='tracking_number') THEN
              ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='orders' AND column_name='delivery_notes') THEN
              ALTER TABLE orders ADD COLUMN delivery_notes TEXT;
          END IF;
      END $$;
    `;
    await pool.query(addDeliveryFields);
    console.log('✓ Поля доставки добавлены в таблицу orders');

    // Создаем таблицу order_bids (ставки/предложения на заказы)
    const createOrderBidsTable = `
      CREATE TABLE IF NOT EXISTS order_bids (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        proposed_price DECIMAL(10, 2) NOT NULL,
        estimated_days INTEGER NOT NULL,
        comment TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_id, master_id)
      );
    `;

    const createOrderBidsIndexes = `
      CREATE INDEX IF NOT EXISTS idx_order_bids_order_id ON order_bids(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_bids_master_id ON order_bids(master_id);
      CREATE INDEX IF NOT EXISTS idx_order_bids_status ON order_bids(status);
    `;

    await pool.query(createOrderBidsTable);
    console.log('✓ Таблица order_bids создана/проверена');

    await pool.query(createOrderBidsIndexes);
    console.log('✓ Индексы для order_bids созданы/проверены');

    // Создаем таблицу chats (чаты между клиентом и мастером по заказу)
    const createChatsTable = `
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'active',
        customer_accepted_rules BOOLEAN DEFAULT FALSE,
        master_accepted_rules BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_id)
      );
    `;

    const createChatsIndexes = `
      CREATE INDEX IF NOT EXISTS idx_chats_order_id ON chats(order_id);
      CREATE INDEX IF NOT EXISTS idx_chats_customer_id ON chats(customer_id);
      CREATE INDEX IF NOT EXISTS idx_chats_master_id ON chats(master_id);
    `;

    await pool.query(createChatsTable);
    console.log('✓ Таблица chats создана/проверена');

    await pool.query(createChatsIndexes);
    console.log('✓ Индексы для chats созданы/проверены');

    // Миграция: Проверяем и добавляем колонки для правил чата
    const checkCustomerRulesColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chats' 
      AND column_name = 'customer_accepted_rules'
    `;
    const customerRulesCheck = await pool.query(checkCustomerRulesColumn);
    
    if (customerRulesCheck.rows.length === 0) {
      console.log(' Колонка customer_accepted_rules отсутствует в chats. Добавляю...');
      await pool.query(`ALTER TABLE chats ADD COLUMN customer_accepted_rules BOOLEAN DEFAULT FALSE`);
      console.log('✓ Колонка customer_accepted_rules добавлена в chats');
    } else {
      console.log('✓ Колонка customer_accepted_rules уже существует в chats');
    }

    const checkMasterRulesColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'chats' 
      AND column_name = 'master_accepted_rules'
    `;
    const masterRulesCheck = await pool.query(checkMasterRulesColumn);
    
    if (masterRulesCheck.rows.length === 0) {
      console.log(' Колонка master_accepted_rules отсутствует в chats. Добавляю...');
      await pool.query(`ALTER TABLE chats ADD COLUMN master_accepted_rules BOOLEAN DEFAULT FALSE`);
      console.log('✓ Колонка master_accepted_rules добавлена в chats');
    } else {
      console.log('✓ Колонка master_accepted_rules уже существует в chats');
    }

    // Создаем таблицу chat_messages (сообщения в чатах)
    const createChatMessagesTable = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createChatMessagesIndexes = `
      CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
    `;

    await pool.query(createChatMessagesTable);
    console.log('✓ Таблица chat_messages создана/проверена');

    await pool.query(createChatMessagesIndexes);
    console.log('✓ Индексы для chat_messages созданы/проверены');

    // Создаем таблицу order_work_stages (этапы работы над заказом)
    const createWorkStagesTable = `
      CREATE TABLE IF NOT EXISTS order_work_stages (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        stage_key VARCHAR(50) NOT NULL,
        stage_name VARCHAR(255) NOT NULL,
        stage_order INTEGER NOT NULL,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(order_id, stage_key)
      );
    `;

    const createWorkStagesIndexes = `
      CREATE INDEX IF NOT EXISTS idx_work_stages_order_id ON order_work_stages(order_id);
      CREATE INDEX IF NOT EXISTS idx_work_stages_completed ON order_work_stages(completed);
    `;

    await pool.query(createWorkStagesTable);
    console.log('✓ Таблица order_work_stages создана/проверена');

    await pool.query(createWorkStagesIndexes);
    console.log('✓ Индексы для order_work_stages созданы/проверены');

    // Создаем таблицу transactions (транзакции для выплат мастерам)
    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createTransactionsIndexes = `
      CREATE INDEX IF NOT EXISTS idx_transactions_master_id ON transactions(master_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    `;

    await pool.query(createTransactionsTable);
    console.log('✓ Таблица transactions создана/проверена');

    // Миграция: добавляем master_id если его нет
    const addMasterIdToTransactions = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='transactions' AND column_name='master_id') THEN
              ALTER TABLE transactions ADD COLUMN master_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
              ALTER TABLE transactions ALTER COLUMN master_id SET NOT NULL;
          END IF;
      END $$;
    `;
    await pool.query(addMasterIdToTransactions);
    console.log('✓ Поле master_id добавлено/проверено в transactions');

    // Миграция: добавляем order_id если его нет
    const addOrderIdToTransactions = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='transactions' AND column_name='order_id') THEN
              ALTER TABLE transactions ADD COLUMN order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE;
              ALTER TABLE transactions ALTER COLUMN order_id SET NOT NULL;
          END IF;
      END $$;
    `;
    await pool.query(addOrderIdToTransactions);
    console.log('✓ Поле order_id добавлено/проверено в transactions');

    await pool.query(createTransactionsIndexes);
    console.log('✓ Индексы для transactions созданы/проверены');

    // Добавляем поле balance в таблицу users если его нет
    const addBalanceField = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='users' AND column_name='balance') THEN
              ALTER TABLE users ADD COLUMN balance DECIMAL(10, 2) DEFAULT 0;
          END IF;
      END $$;
    `;
    await pool.query(addBalanceField);
    console.log('✓ Поле balance добавлено в таблицу users');

    // Создаем таблицу reviews
    const createReviewsTable = `
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
        customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createReviewsTable);
    console.log('✓ Таблица reviews создана/проверена');

    const createReviewsIndexes = `
      CREATE INDEX IF NOT EXISTS idx_reviews_master ON reviews(master_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
    `;
    await pool.query(createReviewsIndexes);
    console.log('✓ Индексы для reviews созданы/проверены');

    // Миграция: добавляем поля в reviews если их нет
    const addReviewFields = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='reviews' AND column_name='customer_id') THEN
              ALTER TABLE reviews ADD COLUMN customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
              -- Пытаемся заполнить из orders.customer_id
              UPDATE reviews r 
              SET customer_id = o.customer_id 
              FROM orders o 
              WHERE r.order_id = o.id AND r.customer_id IS NULL;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='reviews' AND column_name='master_id') THEN
              ALTER TABLE reviews ADD COLUMN master_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
              -- Пытаемся заполнить из orders.assigned_master_id
              UPDATE reviews r 
              SET master_id = o.assigned_master_id 
              FROM orders o 
              WHERE r.order_id = o.id AND r.master_id IS NULL;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='reviews' AND column_name='order_id') THEN
              ALTER TABLE reviews ADD COLUMN order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE;
          END IF;
      END $$;
    `;
    await pool.query(addReviewFields);
    console.log('✓ Поля customer_id, master_id, order_id добавлены/проверены в reviews');

    // Миграция: Добавляем недостающие поля в master_profiles
    const addMasterProfileFields = `
      DO $$ 
      BEGIN
        -- Добавляем bio
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='bio') THEN
            ALTER TABLE master_profiles ADD COLUMN bio TEXT;
        END IF;
        
        -- Добавляем company_name
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='company_name') THEN
            ALTER TABLE master_profiles ADD COLUMN company_name VARCHAR(255);
        END IF;
        
        -- Добавляем specializations
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='specializations') THEN
            ALTER TABLE master_profiles ADD COLUMN specializations TEXT[];
        END IF;
        
        -- Добавляем years_of_experience
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='years_of_experience') THEN
            ALTER TABLE master_profiles ADD COLUMN years_of_experience INTEGER DEFAULT 0;
        END IF;
        
        -- Добавляем education
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='education') THEN
            ALTER TABLE master_profiles ADD COLUMN education VARCHAR(500);
        END IF;
        
        -- Добавляем certifications
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='certifications') THEN
            ALTER TABLE master_profiles ADD COLUMN certifications TEXT[];
        END IF;
        
        -- Добавляем work_schedule
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='work_schedule') THEN
            ALTER TABLE master_profiles ADD COLUMN work_schedule VARCHAR(255);
        END IF;
        
        -- Добавляем min_order_amount
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='min_order_amount') THEN
            ALTER TABLE master_profiles ADD COLUMN min_order_amount DECIMAL(10, 2);
        END IF;
        
        -- Добавляем max_projects_simultaneously
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='max_projects_simultaneously') THEN
            ALTER TABLE master_profiles ADD COLUMN max_projects_simultaneously INTEGER DEFAULT 3;
        END IF;
        
        -- Добавляем services_offered
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='services_offered') THEN
            ALTER TABLE master_profiles ADD COLUMN services_offered TEXT[];
        END IF;
        
        -- Добавляем materials_work_with
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='materials_work_with') THEN
            ALTER TABLE master_profiles ADD COLUMN materials_work_with TEXT[];
        END IF;
        
        -- Добавляем equipment
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='equipment') THEN
            ALTER TABLE master_profiles ADD COLUMN equipment TEXT;
        END IF;
        
        -- Добавляем workspace_size
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='workspace_size') THEN
            ALTER TABLE master_profiles ADD COLUMN workspace_size VARCHAR(100);
        END IF;
        
        -- Добавляем has_showroom
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='has_showroom') THEN
            ALTER TABLE master_profiles ADD COLUMN has_showroom BOOLEAN DEFAULT false;
        END IF;
        
        -- Добавляем showroom_address
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='showroom_address') THEN
            ALTER TABLE master_profiles ADD COLUMN showroom_address TEXT;
        END IF;
        
        -- Добавляем payment_methods
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='payment_methods') THEN
            ALTER TABLE master_profiles ADD COLUMN payment_methods TEXT[];
        END IF;
        
        -- Добавляем warranty_terms
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='warranty_terms') THEN
            ALTER TABLE master_profiles ADD COLUMN warranty_terms TEXT;
        END IF;
        
        -- Добавляем return_policy
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='return_policy') THEN
            ALTER TABLE master_profiles ADD COLUMN return_policy TEXT;
        END IF;
        
        -- Добавляем website
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='website') THEN
            ALTER TABLE master_profiles ADD COLUMN website VARCHAR(255);
        END IF;
        
        -- Добавляем instagram
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='instagram') THEN
            ALTER TABLE master_profiles ADD COLUMN instagram VARCHAR(100);
        END IF;
        
        -- Добавляем facebook
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='facebook') THEN
            ALTER TABLE master_profiles ADD COLUMN facebook VARCHAR(100);
        END IF;
        
        -- Добавляем telegram
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='telegram') THEN
            ALTER TABLE master_profiles ADD COLUMN telegram VARCHAR(100);
        END IF;
        
        -- Добавляем whatsapp
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='whatsapp') THEN
            ALTER TABLE master_profiles ADD COLUMN whatsapp VARCHAR(50);
        END IF;
        
        -- Добавляем languages
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='languages') THEN
            ALTER TABLE master_profiles ADD COLUMN languages TEXT[];
        END IF;
        
        -- Добавляем delivery_available
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='delivery_available') THEN
            ALTER TABLE master_profiles ADD COLUMN delivery_available BOOLEAN DEFAULT true;
        END IF;
        
        -- Добавляем assembly_available
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='assembly_available') THEN
            ALTER TABLE master_profiles ADD COLUMN assembly_available BOOLEAN DEFAULT true;
        END IF;
        
        -- Добавляем design_services
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='design_services') THEN
            ALTER TABLE master_profiles ADD COLUMN design_services BOOLEAN DEFAULT false;
        END IF;
        
        -- Добавляем consultation_free
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name='master_profiles' AND column_name='consultation_free') THEN
            ALTER TABLE master_profiles ADD COLUMN consultation_free BOOLEAN DEFAULT true;
        END IF;
      END $$;
    `;
    await pool.query(addMasterProfileFields);
    console.log('✓ Все поля добавлены/проверены в master_profiles');

    // Миграция: Добавляем поля для комиссионной системы
    const addCommissionFields = `
      DO $$ 
      BEGIN
        -- Добавляем дату регистрации мастера (для расчета первого месяца)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'master_profiles' AND column_name = 'registered_at') THEN
          ALTER TABLE master_profiles ADD COLUMN registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          UPDATE master_profiles SET registered_at = CURRENT_TIMESTAMP WHERE registered_at IS NULL;
        END IF;

        -- Счетчик заказов в первый месяц
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'master_profiles' AND column_name = 'first_month_orders') THEN
          ALTER TABLE master_profiles ADD COLUMN first_month_orders INTEGER DEFAULT 0;
        END IF;

        -- Баланс комиссий (сколько должен платформе)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'master_profiles' AND column_name = 'commission_balance') THEN
          ALTER TABLE master_profiles ADD COLUMN commission_balance DECIMAL(10, 2) DEFAULT 0.00;
        END IF;

        -- Всего заплачено комиссий
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'master_profiles' AND column_name = 'total_commission_paid') THEN
          ALTER TABLE master_profiles ADD COLUMN total_commission_paid DECIMAL(10, 2) DEFAULT 0.00;
        END IF;
      END $$;
    `;
    await pool.query(addCommissionFields);
    console.log('✓ Поля комиссионной системы добавлены в master_profiles');

    // Создаем таблицу для транзакций комиссий
    const createCommissionTransactionsTable = `
      CREATE TABLE IF NOT EXISTS commission_transactions (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        order_amount DECIMAL(10, 2) NOT NULL,
        commission_amount DECIMAL(10, 2) NOT NULL,
        commission_type VARCHAR(50) NOT NULL, -- 'first_month' или 'percentage'
        commission_rate DECIMAL(5, 2), -- процент комиссии (если применимо)
        status VARCHAR(50) DEFAULT 'pending', -- pending, paid, cancelled
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP
      );
    `;
    await pool.query(createCommissionTransactionsTable);
    console.log('✓ Таблица commission_transactions создана/проверена');

    const createCommissionIndexes = `
      CREATE INDEX IF NOT EXISTS idx_commission_master ON commission_transactions(master_id);
      CREATE INDEX IF NOT EXISTS idx_commission_order ON commission_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_commission_status ON commission_transactions(status);
    `;
    await pool.query(createCommissionIndexes);
    console.log('✓ Индексы для commission_transactions созданы/проверены');

    // Миграция: Добавляем поле wallet_balance в master_profiles
    const addWalletBalance = `
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'master_profiles' AND column_name = 'wallet_balance') THEN
          ALTER TABLE master_profiles ADD COLUMN wallet_balance DECIMAL(10, 2) DEFAULT 0.00;
        END IF;
      END $$;
    `;
    await pool.query(addWalletBalance);
    console.log('✓ Поле wallet_balance добавлено в master_profiles');

    // Создаем таблицу для транзакций кошелька (обновленная версия)
    const createWalletTransactionsTable = `
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'commission_payment', 'order_payment'
        status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, cancelled
        order_id INTEGER,
        payment_intent_id VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createWalletTransactionsTable);
    console.log('✓ Таблица wallet_transactions создана/проверена');

    const createWalletIndexes = `
      CREATE INDEX IF NOT EXISTS idx_wallet_master ON wallet_transactions(master_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_type ON wallet_transactions(type);
      CREATE INDEX IF NOT EXISTS idx_wallet_status ON wallet_transactions(status);
      CREATE INDEX IF NOT EXISTS idx_wallet_created ON wallet_transactions(created_at DESC);
    `;
    await pool.query(createWalletIndexes);
    console.log('✓ Индексы для wallet_transactions созданы/проверены');

    // Миграция: Проверяем и добавляем колонку order_id если её нет
    const checkOrderIdColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' 
      AND column_name = 'order_id'
    `;
    const orderIdCheck = await pool.query(checkOrderIdColumn);
    
    if (orderIdCheck.rows.length === 0) {
      console.log(' Колонка order_id отсутствует в wallet_transactions. Добавляю...');
      await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN order_id INTEGER`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id)`);
      console.log('✓ Колонка order_id добавлена в wallet_transactions');
    } else {
      console.log('✓ Колонка order_id уже существует в wallet_transactions');
    }

    // Миграция: Проверяем и добавляем колонку payment_intent_id если её нет
    const checkPaymentIntentColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' 
      AND column_name = 'payment_intent_id'
    `;
    const paymentIntentCheck = await pool.query(checkPaymentIntentColumn);
    
    if (paymentIntentCheck.rows.length === 0) {
      console.log(' Колонка payment_intent_id отсутствует в wallet_transactions. Добавляю...');
      await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN payment_intent_id VARCHAR(255)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_wallet_payment_intent ON wallet_transactions(payment_intent_id)`);
      console.log('✓ Колонка payment_intent_id добавлена в wallet_transactions');
    } else {
      console.log('✓ Колонка payment_intent_id уже существует в wallet_transactions');
    }

    // Миграция: Проверяем и добавляем колонку description если её нет
    const checkDescriptionColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' 
      AND column_name = 'description'
    `;
    const descriptionCheck = await pool.query(checkDescriptionColumn);
    
    if (descriptionCheck.rows.length === 0) {
      console.log(' Колонка description отсутствует в wallet_transactions. Добавляю...');
      await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN description TEXT`);
      console.log('✓ Колонка description добавлена в wallet_transactions');
    } else {
      console.log('✓ Колонка description уже существует в wallet_transactions');
    }

    // Миграция: Проверяем и добавляем колонку created_at если её нет
    const checkCreatedAtColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' 
      AND column_name = 'created_at'
    `;
    const createdAtCheck = await pool.query(checkCreatedAtColumn);
    
    if (createdAtCheck.rows.length === 0) {
      console.log(' Колонка created_at отсутствует в wallet_transactions. Добавляю...');
      await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      console.log('✓ Колонка created_at добавлена в wallet_transactions');
    } else {
      console.log('✓ Колонка created_at уже существует в wallet_transactions');
    }

    // Миграция: Проверяем и добавляем колонку updated_at если её нет
    const checkUpdatedAtColumn = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' 
      AND column_name = 'updated_at'
    `;
    const updatedAtCheck = await pool.query(checkUpdatedAtColumn);
    
    if (updatedAtCheck.rows.length === 0) {
      console.log(' Колонка updated_at отсутствует в wallet_transactions. Добавляю...');
      await pool.query(`ALTER TABLE wallet_transactions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
      console.log('✓ Колонка updated_at добавлена в wallet_transactions');
    } else {
      console.log('✓ Колонка updated_at уже существует в wallet_transactions');
    }

    // Создаем триггер для автоматического создания профиля мастера
    const createMasterProfileTrigger = `
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

      DROP TRIGGER IF EXISTS trigger_create_master_profile ON users;

      CREATE TRIGGER trigger_create_master_profile
      AFTER INSERT OR UPDATE OF role ON users
      FOR EACH ROW
      EXECUTE FUNCTION create_master_profile();
    `;
    await pool.query(createMasterProfileTrigger);
    console.log('✓ Триггер для автоматического создания профиля мастера создан');

    // Создаем профили для существующих мастеров (если они еще не созданы)
    const createExistingMasterProfiles = `
      INSERT INTO master_profiles (user_id, registered_at)
      SELECT id, created_at FROM users WHERE role = 'master'
      ON CONFLICT (user_id) DO NOTHING;
    `;
    await pool.query(createExistingMasterProfiles);
    console.log('✓ Профили для существующих мастеров проверены/созданы');

    // Создаем таблицу для расписания
    const createScheduleTable = `
      CREATE TABLE IF NOT EXISTS schedule_items (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('deadline', 'reminder', 'meeting', 'other')),
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_schedule_master ON schedule_items(master_id);
      CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule_items(date);
      CREATE INDEX IF NOT EXISTS idx_schedule_order ON schedule_items(order_id);
    `;
    await pool.query(createScheduleTable);
    console.log('✓ Таблица schedule_items создана/проверена');

    // Создаем таблицу для уведомлений
    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(500),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
    `;
    await pool.query(createNotificationsTable);
    console.log('✓ Таблица notifications создана/проверена');

    // Создаем таблицу для настроек мастеров
    const createMasterSettingsTable = `
      CREATE TABLE IF NOT EXISTS master_settings (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        settings JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_master_settings_master ON master_settings(master_id);
    `;
    await pool.query(createMasterSettingsTable);
    console.log('✓ Таблица master_settings создана/проверена');

    // Создаем таблицу favorites (избранное)
    const createFavoritesTable = `
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, order_id)
      );

      CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_order_id ON favorites(order_id);
      CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);
    `;
    await pool.query(createFavoritesTable);
    console.log('✓ Таблица favorites создана/проверена');

    // Создаем таблицу portfolio_favorites (избранные работы портфолио)
    const createPortfolioFavoritesTable = `
      CREATE TABLE IF NOT EXISTS portfolio_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        portfolio_id INTEGER NOT NULL REFERENCES portfolio(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, portfolio_id)
      );

      CREATE INDEX IF NOT EXISTS idx_portfolio_favorites_user_id ON portfolio_favorites(user_id);
      CREATE INDEX IF NOT EXISTS idx_portfolio_favorites_portfolio_id ON portfolio_favorites(portfolio_id);
      CREATE INDEX IF NOT EXISTS idx_portfolio_favorites_created_at ON portfolio_favorites(created_at DESC);
    `;
    await pool.query(createPortfolioFavoritesTable);
    console.log('✓ Таблица portfolio_favorites создана/проверена');

    // Создаем таблицу furniture_3d_models (3D модели мебели)
    const createFurniture3DModelsTable = `
      CREATE TABLE IF NOT EXISTS furniture_3d_models (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        furniture_type VARCHAR(100),
        base_price DECIMAL(10, 2) NOT NULL DEFAULT 0, -- базовая цена модели
        obj_file_url TEXT NOT NULL,
        mtl_file_url TEXT,
        texture_files JSONB,
        preview_image TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_3d_models_category ON furniture_3d_models(category);
      CREATE INDEX IF NOT EXISTS idx_3d_models_active ON furniture_3d_models(active);
      CREATE INDEX IF NOT EXISTS idx_3d_models_created_at ON furniture_3d_models(created_at DESC);
    `;
    await pool.query(createFurniture3DModelsTable);
    console.log('✓ Таблица furniture_3d_models создана/проверена');

    // Миграция: обновляем структуру таблицы furniture_3d_models если она уже существует
    const migrateFurniture3DModels = `
      DO $$ 
      BEGIN
        -- Добавляем base_price если не существует
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'furniture_3d_models' AND column_name = 'base_price') THEN
          ALTER TABLE furniture_3d_models ADD COLUMN base_price DECIMAL(10, 2) NOT NULL DEFAULT 0;
        END IF;

        -- Удаляем старые столбцы если существуют
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'furniture_3d_models' AND column_name = 'price') THEN
          ALTER TABLE furniture_3d_models DROP COLUMN IF EXISTS price;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'furniture_3d_models' AND column_name = 'style') THEN
          ALTER TABLE furniture_3d_models DROP COLUMN IF EXISTS style;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'furniture_3d_models' AND column_name = 'materials') THEN
          ALTER TABLE furniture_3d_models DROP COLUMN IF EXISTS materials;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'furniture_3d_models' AND column_name = 'width') THEN
          ALTER TABLE furniture_3d_models DROP COLUMN IF EXISTS width;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'furniture_3d_models' AND column_name = 'height') THEN
          ALTER TABLE furniture_3d_models DROP COLUMN IF EXISTS height;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'furniture_3d_models' AND column_name = 'depth') THEN
          ALTER TABLE furniture_3d_models DROP COLUMN IF EXISTS depth;
        END IF;
      END $$;
    `;
    await pool.query(migrateFurniture3DModels);
    console.log('✓ Миграция furniture_3d_models выполнена');

    // Миграция: добавляем поле view_settings для сохранения настроек камеры и объекта
    const addViewSettings = `
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'furniture_3d_models' AND column_name = 'view_settings') THEN
          ALTER TABLE furniture_3d_models ADD COLUMN view_settings JSONB;
        END IF;
      END $$;
    `;
    await pool.query(addViewSettings);
    console.log('✓ Поле view_settings добавлено/проверено');

    // Создаем таблицу model_parameters (параметры для 3D моделей с ценами)
    const createModelParametersTable = `
      CREATE TABLE IF NOT EXISTS model_parameters (
        id SERIAL PRIMARY KEY,
        model_id INTEGER NOT NULL REFERENCES furniture_3d_models(id) ON DELETE CASCADE,
        parameter_type VARCHAR(50) NOT NULL, -- material, size, style, color, finish
        parameter_name VARCHAR(100) NOT NULL,
        parameter_value VARCHAR(255) NOT NULL,
        price_modifier DECIMAL(10, 2) DEFAULT 0, -- дополнительная цена для этого параметра
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_model_parameters_model_id ON model_parameters(model_id);
      CREATE INDEX IF NOT EXISTS idx_model_parameters_type ON model_parameters(parameter_type);
    `;
    await pool.query(createModelParametersTable);
    console.log('✓ Таблица model_parameters создана/проверена');

    console.log('✅ Инициализация базы данных завершена успешно!\n');

  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    throw error;
  }
};

export default pool;
