import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';

// Получение профиля пользователя
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const user = await pool.query(
      'SELECT id, name, email, phone, address, profile_photo, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении профиля' });
  }
};

// Обновление профиля пользователя
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { name, phone, address, profile_photo } = req.body;

    const updatedUser = await pool.query(
      `UPDATE users 
       SET name = $1, phone = $2, address = $3, profile_photo = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 
       RETURNING id, name, email, phone, address, profile_photo`,
      [name, phone, address, profile_photo, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      message: 'Профиль успешно обновлен',
      user: updatedUser.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении профиля' });
  }
};

// Смена пароля
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Необходимо указать текущий и новый пароль' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Новый пароль должен содержать минимум 6 символов' });
    }

    // Получаем текущий пароль пользователя
    const user = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем текущий пароль
    const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный текущий пароль' });
    }

    // Хешируем новый пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Обновляем пароль
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Ошибка сервера при смене пароля' });
  }
};

// Получить публичную информацию о мастере
export const getMasterInfo = async (req: Request, res: Response) => {
  try {
    const { masterId } = req.params;

    // Получаем основную информацию о мастере
    const masterResult = await pool.query(
      `SELECT id, name, email, phone, address, profile_photo, created_at 
       FROM users 
       WHERE id = $1 AND role = 'master' AND active = true`,
      [masterId]
    );

    if (masterResult.rows.length === 0) {
      return res.status(404).json({ message: 'Мастер не найден' });
    }

    const master = masterResult.rows[0];

    // Получаем статистику мастера
    const portfolioCount = await pool.query(
      'SELECT COUNT(*) FROM portfolio WHERE master_id = $1 AND is_public = true',
      [masterId]
    );

    // Подсчитываем средний рейтинг (когда будет таблица с отзывами)
    // Пока используем моковые данные
    const stats = {
      portfolioCount: parseInt(portfolioCount.rows[0].count),
      rating: 4.8, // TODO: заменить на реальный подсчет из таблицы reviews
      reviewsCount: 127, // TODO: заменить на реальный подсчет
      completedOrders: 243, // TODO: заменить на реальный подсчет из таблицы orders
    };

    res.json({
      master: {
        ...master,
        ...stats,
      },
    });
  } catch (error) {
    console.error('Get master info error:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении информации о мастере' });
  }
};
