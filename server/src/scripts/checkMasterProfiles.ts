import pool from '../config/database';

async function checkMasterProfiles() {
  try {
    console.log('🔍 Проверка структуры таблицы master_profiles...\n');

    // Проверяем колонки
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'master_profiles' 
      ORDER BY ordinal_position
    `);

    console.log(' Колонки таблицы master_profiles:');
    console.table(columns.rows);

    // Проверяем данные
    const data = await pool.query(`
      SELECT 
        mp.id,
        mp.user_id,
        mp.registered_at,
        mp.first_month_orders,
        mp.commission_balance,
        mp.total_commission_paid,
        mp.wallet_balance,
        u.name,
        u.email
      FROM master_profiles mp
      JOIN users u ON u.id = mp.user_id
    `);

    console.log('\n👥 Данные мастеров:');
    console.table(data.rows);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

checkMasterProfiles();
