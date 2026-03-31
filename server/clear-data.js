const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    console.log('🗑️  Clearing orders and chat history...');
    
    await pool.query('BEGIN');
    
    // Delete in correct order to respect foreign key constraints
    const result1 = await pool.query('DELETE FROM chat_messages');
    console.log(`   Deleted ${result1.rowCount} chat messages`);
    
    const result2 = await pool.query('DELETE FROM chats');
    console.log(`   Deleted ${result2.rowCount} chats`);
    
    const result3 = await pool.query('DELETE FROM order_bids');
    console.log(`   Deleted ${result3.rowCount} order bids`);
    
    const result4 = await pool.query('DELETE FROM commission_transactions');
    console.log(`   Deleted ${result4.rowCount} commission transactions`);
    
    const result5 = await pool.query('DELETE FROM wallet_transactions WHERE order_id IS NOT NULL');
    console.log(`   Deleted ${result5.rowCount} wallet transactions`);
    
    const result6 = await pool.query("DELETE FROM transactions WHERE type = 'payment'");
    console.log(`   Deleted ${result6.rowCount} payment transactions`);
    
    const result7 = await pool.query('DELETE FROM orders');
    console.log(`   Deleted ${result7.rowCount} orders`);
    
    await pool.query('COMMIT');
    
    console.log('\n✅ Successfully cleared all orders and chat history!');
    process.exit(0);
  } catch(e) {
    await pool.query('ROLLBACK');
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  }
})();
