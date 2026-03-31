const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alliance_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function checkWalletTransactionsStructure() {
  try {
    console.log('🔍 Проверка структуры таблицы wallet_transactions...\n');
    
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions'
      ORDER BY ordinal_position
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Таблица wallet_transactions не найдена!');
    } else {
      console.log('✅ Структура таблицы wallet_transactions:\n');
      console.table(result.rows);
      
      // Проверяем наличие необходимых колонок
      const columns = result.rows.map(row => row.column_name);
      const requiredColumns = ['id', 'master_id', 'amount', 'type', 'status', 'order_id', 'payment_intent_id', 'description', 'created_at', 'updated_at'];
      
      console.log('\n Проверка обязательных колонок:');
      requiredColumns.forEach(col => {
        const exists = columns.includes(col);
        console.log(`${exists ? '✓' : '✗'} ${col}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await pool.end();
  }
}

checkWalletTransactionsStructure();
