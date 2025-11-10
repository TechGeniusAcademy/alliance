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

    await pool.query(createOrdersIndexes);
    console.log('✓ Индексы для orders созданы/проверены');

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

    console.log('✅ Инициализация базы данных завершена успешно!\n');

  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    throw error;
  }
};

export default pool;
