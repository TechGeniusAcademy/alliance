import pool from '../config/database';

// Скрипт для проверки подключения к базе данных
const testConnection = async () => {
  try {
    console.log('🔍 Проверка подключения к базе данных...\n');

    const result = await pool.query('SELECT NOW()');
    console.log('✅ Подключение успешно!');
    console.log('Время сервера:', result.rows[0].now);

    // Проверка таблиц
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\n Существующие таблицы:');
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // Проверка количества пользователей
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Количество пользователей в базе: ${usersCount.rows[0].count}`);

    await pool.end();
    console.log('\n✓ Проверка завершена');
  } catch (error) {
    console.error('❌ Ошибка подключения:', error);
    process.exit(1);
  }
};

testConnection();
