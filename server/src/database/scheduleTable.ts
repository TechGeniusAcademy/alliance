import pool from '../config/database';

export const createScheduleTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schedule_items (
        id SERIAL PRIMARY KEY,
        master_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('deadline', 'reminder', 'meeting', 'other')),
        priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
        order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_schedule_master ON schedule_items(master_id);
      CREATE INDEX IF NOT EXISTS idx_schedule_date ON schedule_items(date);
      CREATE INDEX IF NOT EXISTS idx_schedule_order ON schedule_items(order_id);
    `);

    console.log('✅ Таблица schedule_items создана');
  } catch (error) {
    console.error('❌ Ошибка при создании таблицы schedule_items:', error);
    throw error;
  }
};
