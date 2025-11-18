import { Request, Response } from 'express';
import pool from '../config/database';

// Получить все события расписания мастера
export const getScheduleItems = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;

    const result = await pool.query(
      `SELECT 
        s.*,
        o.title as order_title
       FROM schedule_items s
       LEFT JOIN orders o ON s.order_id = o.id
       WHERE s.master_id = $1
       ORDER BY s.date ASC, s.time ASC`,
      [masterId]
    );

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get schedule items error:', error);
    res.status(500).json({ message: 'Ошибка при получении расписания' });
  }
};

// Создать новое событие
export const createScheduleItem = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { title, description, date, time, type, priority, order_id } = req.body;

    if (!title || !date || !time || !type || !priority) {
      return res.status(400).json({ message: 'Заполните все обязательные поля' });
    }

    const result = await pool.query(
      `INSERT INTO schedule_items (master_id, title, description, date, time, type, priority, order_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [masterId, title, description, date, time, type, priority, order_id || null]
    );

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Create schedule item error:', error);
    res.status(500).json({ message: 'Ошибка при создании события' });
  }
};

// Обновить событие
export const updateScheduleItem = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { id } = req.params;
    const { title, description, date, time, type, priority, status, order_id } = req.body;

    // Проверяем права доступа
    const checkResult = await pool.query(
      'SELECT * FROM schedule_items WHERE id = $1 AND master_id = $2',
      [id, masterId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Событие не найдено' });
    }

    const result = await pool.query(
      `UPDATE schedule_items 
       SET title = $1, description = $2, date = $3, time = $4, type = $5, priority = $6, status = $7, order_id = $8, updated_at = NOW()
       WHERE id = $9 AND master_id = $10
       RETURNING *`,
      [title, description, date, time, type, priority, status, order_id || null, id, masterId]
    );

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Update schedule item error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении события' });
  }
};

// Удалить событие
export const deleteScheduleItem = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { id } = req.params;

    // Проверяем права доступа
    const checkResult = await pool.query(
      'SELECT * FROM schedule_items WHERE id = $1 AND master_id = $2',
      [id, masterId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Событие не найдено' });
    }

    await pool.query('DELETE FROM schedule_items WHERE id = $1 AND master_id = $2', [id, masterId]);

    res.json({ message: 'Событие удалено' });
  } catch (error) {
    console.error('Delete schedule item error:', error);
    res.status(500).json({ message: 'Ошибка при удалении события' });
  }
};

// Изменить статус события
export const toggleScheduleItemStatus = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { id } = req.params;
    const { status } = req.body;

    // Проверяем права доступа
    const checkResult = await pool.query(
      'SELECT * FROM schedule_items WHERE id = $1 AND master_id = $2',
      [id, masterId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Событие не найдено' });
    }

    const result = await pool.query(
      `UPDATE schedule_items 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND master_id = $3
       RETURNING *`,
      [status, id, masterId]
    );

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Toggle schedule item status error:', error);
    res.status(500).json({ message: 'Ошибка при изменении статуса' });
  }
};
