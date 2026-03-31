const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alliance_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function recreateWalletTransactionsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Пересоздание таблицы wallet_transactions...\n');
    
    await client.query('BEGIN');
    
    // 1. Создаем временную таблицу с правильной структурой
    console.log('1️⃣ Создаю временную таблицу...');
    await client.query(`
      CREATE TABLE wallet_transactions_new (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        order_id INTEGER,
        payment_intent_id VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Временная таблица создана');
    
    // 2. Проверяем существование старой таблицы и копируем данные
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'wallet_transactions'
      )
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('\n2️⃣ Копирую данные из старой таблицы...');
      
      // Получаем список существующих колонок
      const columnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'wallet_transactions'
      `);
      const existingColumns = columnsResult.rows.map(r => r.column_name);
      
      // Формируем список колонок для копирования (только те что есть в обеих таблицах)
      const targetColumns = ['master_id', 'amount', 'type', 'status', 'order_id', 'payment_intent_id', 'description', 'created_at', 'updated_at'];
      const columnsToCopy = targetColumns.filter(col => existingColumns.includes(col));
      
      if (columnsToCopy.length > 0) {
        const columnsStr = columnsToCopy.join(', ');
        await client.query(`
          INSERT INTO wallet_transactions_new (${columnsStr})
          SELECT ${columnsStr}
          FROM wallet_transactions
        `);
        console.log(`✓ Скопировано данных: ${columnsToCopy.length} колонок`);
      } else {
        console.log(' Нет общих колонок для копирования');
      }
      
      // 3. Удаляем старую таблицу
      console.log('\n3️⃣ Удаляю старую таблицу...');
      await client.query('DROP TABLE wallet_transactions CASCADE');
      console.log('✓ Старая таблица удалена');
    } else {
      console.log(' Старая таблица не найдена, пропускаю копирование');
    }
    
    // 4. Переименовываем новую таблицу
    console.log('\n4️⃣ Переименовываю новую таблицу...');
    await client.query('ALTER TABLE wallet_transactions_new RENAME TO wallet_transactions');
    console.log('✓ Таблица переименована');
    
    // 5. Создаем индексы
    console.log('\n5️⃣ Создаю индексы...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wallet_master ON wallet_transactions(master_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_type ON wallet_transactions(type);
      CREATE INDEX IF NOT EXISTS idx_wallet_status ON wallet_transactions(status);
      CREATE INDEX IF NOT EXISTS idx_wallet_created ON wallet_transactions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_wallet_order_id ON wallet_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_wallet_payment_intent ON wallet_transactions(payment_intent_id);
    `);
    console.log('✓ Индексы созданы');
    
    await client.query('COMMIT');
    
    console.log('\n✅ Таблица wallet_transactions успешно пересоздана!\n');
    
    // Проверяем результат
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions'
      ORDER BY ordinal_position
    `);
    
    console.log(' Структура новой таблицы:');
    console.table(result.rows);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

recreateWalletTransactionsTable()
  .then(() => {
    console.log('✅ Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Провалилось:', error);
    process.exit(1);
  });
