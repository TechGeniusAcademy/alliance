const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'auth_db',
  user: 'postgres',
  password: 'postgres'
});

async function fixMasterProfiles() {
  try {
    console.log('Проверяем текущее состояние master_profiles...');
    
    const current = await pool.query(`
      SELECT user_id, rating, reviews_count, completed_orders 
      FROM master_profiles 
      ORDER BY user_id
    `);
    
    console.log('Текущие данные:');
    console.log(current.rows);
    
    console.log('\nОбновляем NULL значения на 0...');
    
    const updateResult = await pool.query(`
      UPDATE master_profiles 
      SET 
        rating = COALESCE(rating, 0.00),
        reviews_count = COALESCE(reviews_count, 0),
        completed_orders = COALESCE(completed_orders, 0)
      WHERE rating IS NULL OR reviews_count IS NULL OR completed_orders IS NULL
      RETURNING user_id, rating, reviews_count, completed_orders
    `);
    
    console.log(`\nОбновлено записей: ${updateResult.rowCount}`);
    console.log('Обновленные данные:');
    console.log(updateResult.rows);
    
    console.log('\nПроверяем итоговое состояние...');
    
    const final = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.role,
        mp.rating,
        mp.reviews_count,
        mp.completed_orders
      FROM users u
      LEFT JOIN master_profiles mp ON mp.user_id = u.id
      WHERE u.role = 'master'
      ORDER BY u.id
    `);
    
    console.log('Финальные данные мастеров:');
    console.log(final.rows);
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await pool.end();
  }
}

fixMasterProfiles();
