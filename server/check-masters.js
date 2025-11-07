const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'auth_db',
  user: 'postgres',
  password: 'postgres'
});

async function checkMasters() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        mp.rating, 
        mp.reviews_count, 
        mp.completed_orders
      FROM users u 
      LEFT JOIN master_profiles mp ON mp.user_id = u.id 
      WHERE u.role = 'master'
      ORDER BY u.id
    `);
    
    console.log('Masters data:');
    console.log(JSON.stringify(result.rows, null, 2));
    
    // Проверяем отзывы
    const reviews = await pool.query(`
      SELECT 
        r.id,
        r.master_id,
        r.rating,
        r.comment,
        u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      ORDER BY r.master_id
    `);
    
    console.log('\nReviews data:');
    console.log(JSON.stringify(reviews.rows, null, 2));
    
    // Проверяем заказы
    const orders = await pool.query(`
      SELECT 
        id,
        assigned_master_id,
        status,
        title
      FROM orders
      WHERE assigned_master_id IS NOT NULL
      ORDER BY assigned_master_id
    `);
    
    console.log('\nOrders data:');
    console.log(JSON.stringify(orders.rows, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkMasters();
