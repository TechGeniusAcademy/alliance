import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';

// Получить всех пользователей
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, address, role, active, created_at as "createdAt" FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
};

// Создать пользователя
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Имя, email, пароль и роль обязательны' });
    }

    // Проверка уникальности email
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email уже используется' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, address, role, active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, name, email, phone, address, role, active, created_at as "createdAt"',
      [name, email, hashedPassword, phone || null, address || null, role, true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Ошибка при создании пользователя' });
  }
};

// Обновить пользователя
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, address, role } = req.body;

    // Проверка уникальности email (кроме текущего пользователя)
    if (email) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Email уже используется' });
      }
    }

    // Если пароль передан, хешируем его
    let query = 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), address = COALESCE($4, address), role = COALESCE($5, role)';
    let values: any[] = [name, email, phone, address, role];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += ', password = $6';
      values.push(hashedPassword);
      query += ' WHERE id = $7 RETURNING id, name, email, phone, address, role, active, created_at as "createdAt"';
      values.push(id);
    } else {
      query += ' WHERE id = $6 RETURNING id, name, email, phone, address, role, active, created_at as "createdAt"';
      values.push(id);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
  }
};

// Удалить пользователя
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email, phone, address, role, active, created_at as "createdAt"',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Ошибка при удалении пользователя' });
  }
};

// Заблокировать/разблокировать пользователя
export const toggleBlockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE users SET active = NOT active WHERE id = $1 RETURNING id, name, email, phone, address, role, active, created_at as "createdAt"',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling user block:', error);
    res.status(500).json({ message: 'Ошибка при изменении статуса пользователя' });
  }
};

// Изменить роль пользователя
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Роль обязательна' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, phone, address, role, active, created_at as "createdAt"',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Ошибка при изменении роли пользователя' });
  }
};
