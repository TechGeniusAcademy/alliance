const { Client } = require('pg');
require('dotenv').config();

console.log('🔍 Проверка подключения к PostgreSQL...\n');
console.log('Параметры подключения:');
console.log(`  Хост: ${process.env.DB_HOST || 'localhost'}`);
console.log(`  Порт: ${process.env.DB_PORT || '5432'}`);
console.log(`  Пользователь: ${process.env.DB_USER || 'postgres'}`);
console.log(`  Пароль: ${process.env.DB_PASSWORD ? '***' : 'НЕ УКАЗАН'}\n`);

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'postgres' // Подключаемся к стандартной базе
});

client.connect()
  .then(() => {
    console.log('✅ PostgreSQL подключен успешно!');
    console.log('✅ Сервер базы данных работает корректно\n');
    
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('📊 Информация о PostgreSQL:');
    console.log(result.rows[0].version);
    console.log('\n✨ Всё готово! Можете запускать сервер: npm run dev\n');
    return client.end();
  })
  .catch((err) => {
    console.error('❌ Ошибка подключения к PostgreSQL:\n');
    
    if (err.code === 'ECONNREFUSED') {
      console.error('⚠️  PostgreSQL не запущен или недоступен на порту', process.env.DB_PORT || '5432');
      console.error('\n📖 Решения:');
      console.error('   1. Убедитесь, что PostgreSQL установлен');
      console.error('   2. Запустите службу PostgreSQL');
      console.error('   3. Проверьте, что PostgreSQL слушает порт 5432');
      console.error('\n📚 Подробная инструкция в файле: POSTGRES_SETUP_HELP.md\n');
    } else if (err.code === '28P01') {
      console.error('⚠️  Неверный пароль');
      console.error('\n📖 Решение:');
      console.error('   Проверьте пароль в файле .env (DB_PASSWORD)\n');
    } else {
      console.error('Детали ошибки:', err.message);
      console.error('Код ошибки:', err.code, '\n');
    }
    
    process.exit(1);
  });
