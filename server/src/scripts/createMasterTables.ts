import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🚀 Начинаем миграцию для создания таблиц мастеров...');

    // Читаем SQL файл
    const sqlPath = path.join(__dirname, '../database/create_master_profiles.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Выполняем миграцию
    await pool.query(sql);

    console.log('✅ Миграция успешно выполнена!');
    console.log(' Созданные таблицы:');
    console.log('  - master_profiles');
    console.log('  - commission_transactions');
    console.log('  - wallet_transactions');
    console.log('  - Триггер для автоматического создания профиля мастера');

    // Проверяем таблицы
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('master_profiles', 'commission_transactions', 'wallet_transactions')
      ORDER BY table_name
    `);

    console.log('\nПодтверждение созданных таблиц:');
    console.table(tables.rows);

    // Создаём профили для существующих мастеров
    console.log('\n👷 Создаём профили для существующих мастеров...');
    const result = await pool.query(`
      INSERT INTO master_profiles (user_id, registered_at)
      SELECT id, created_at FROM users WHERE role = 'master'
      ON CONFLICT (user_id) DO NOTHING
      RETURNING user_id
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Создано профилей: ${result.rows.length}`);
    } else {
      console.log('ℹ️ Профили мастеров уже существуют или нет пользователей с ролью master');
    }

  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Соединение с БД закрыто');
  }
}

runMigration();
