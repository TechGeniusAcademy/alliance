import pool from '../config/database';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    console.log('🚀 Начинаем создание админа...');

    // 1. Добавляем колонку role если её нет
    console.log('📝 Проверяем наличие колонки role...');
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
      `);
      console.log('✅ Колонка role добавлена или уже существует');
    } catch (error) {
      console.log(' Ошибка при добавлении колонки role:', error);
    }

    // 2. Создаем индекс на email если его нет
    try {
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `);
      console.log('✅ Индекс на email создан');
    } catch (error) {
      console.log(' Ошибка при создании индекса:', error);
    }

    // 3. Проверяем, существует ли уже админ
    const adminExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      ['admin@furniture.com']
    );

    if (adminExists.rows.length > 0) {
      console.log(' Админ уже существует!');
      console.log('📧 Email: admin@furniture.com');
      console.log('🔑 Пароль: admin123');
      
      // Обновляем роль на всякий случай
      await pool.query(
        "UPDATE users SET role = 'admin' WHERE email = $1",
        ['admin@furniture.com']
      );
      console.log('✅ Роль обновлена на admin');
    } else {
      // 4. Создаем нового админа
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, role`,
        ['Администратор', 'admin@furniture.com', hashedPassword, 'admin']
      );

      console.log('✅ Админ успешно создан!');
      console.log('👤 Данные для входа:');
      console.log('📧 Email: admin@furniture.com');
      console.log('🔑 Пароль: admin123');
      console.log('🆔 ID:', result.rows[0].id);
    }

    // 5. Показываем всех пользователей с их ролями
    const allUsers = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('\n Список всех пользователей:');
    console.table(allUsers.rows);

  } catch (error) {
    console.error('❌ Ошибка при создании админа:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Соединение с БД закрыто');
  }
}

createAdmin();
