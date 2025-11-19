import { Request, Response } from 'express';
import pool from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
}

// Получить все уведомления пользователя
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT 
        id,
        user_id,
        type,
        title,
        message,
        link,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      notifications: result.rows
    });
  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Отметить уведомление как прочитанное
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка отметки уведомления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Отметить все уведомления как прочитанные
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка отметки всех уведомлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить уведомление
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await pool.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления уведомления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Удалить все прочитанные уведомления
export const deleteAllRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await pool.query(
      `DELETE FROM notifications 
       WHERE user_id = $1 AND is_read = true`,
      [userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления прочитанных уведомлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить количество непрочитанных уведомлений
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({
      count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Ошибка получения счётчика:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Создать уведомление (служебная функция)
export const createNotification = async (
  userId: number,
  type: 'info' | 'success' | 'warning' | 'error',
  title: string,
  message: string,
  link?: string
) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, message, link || null]
    );
  } catch (error) {
    console.error('Ошибка создания уведомления:', error);
  }
};
