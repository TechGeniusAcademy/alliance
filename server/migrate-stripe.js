const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function runMigration() {
  try {
    console.log('Applying Stripe fields migration...');
    
    await pool.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
    `);
    console.log('✓ Added stripe_payment_intent_id column');

    await pool.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'balance';
    `);
    console.log('✓ Added payment_method column');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent 
      ON transactions(stripe_payment_intent_id);
    `);
    console.log('✓ Created index on stripe_payment_intent_id');

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();
