const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alliance_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Запуск миграции: добавление order_id в wallet_transactions...');
    
    const migrationPath = path.join(__dirname, 'migrations', 'add_order_id_to_wallet_transactions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    console.log('✅ Миграция успешно применена!');
    
    // Проверяем результат
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' 
      AND column_name = 'order_id'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Колонка order_id существует:', result.rows[0]);
    } else {
      console.log(' Колонка order_id не найдена!');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при применении миграции:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('✅ Миграция завершена');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Миграция провалилась:', error);
    process.exit(1);
  });
