import { Request, Response } from 'express';
import pool from '../config/database';

// Получить отзывы клиента
export const getCustomerReviews = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
        r.id,
        r.order_id,
        r.customer_id,
        r.master_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        o.title as order_title,
        m.name as master_name,
        m.profile_photo as master_photo
       FROM reviews r
       JOIN orders o ON r.order_id = o.id
       JOIN users m ON r.master_id = m.id
       WHERE r.customer_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    // Transform to match frontend Review type
    const reviews = result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      orderTitle: row.order_title,
      sellerId: row.master_id,
      sellerName: row.master_name,
      sellerPhoto: row.master_photo,
      rating: row.rating,
      comment: row.comment || '',
      pros: [], // TODO: Add pros/cons fields to DB if needed
      cons: [],
      images: [], // TODO: Add images field to DB if needed
      createdAt: row.created_at,
      isEditable: true, // Customer can edit their own reviews
      sellerResponse: null,
      sellerResponseAt: null
    }));

    res.json({ reviews });
  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({ message: 'Ошибка при получении отзывов' });
  }
};

// Получить отзывы о мастере
export const getMasterReviews = async (req: Request, res: Response) => {
  try {
    const { masterId } = req.params;

    const result = await pool.query(
      `SELECT 
        r.id,
        r.order_id,
        r.customer_id,
        r.master_id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        o.title as order_title,
        c.name as customer_name,
        c.profile_photo as customer_photo
       FROM reviews r
       JOIN orders o ON r.order_id = o.id
       JOIN users c ON r.customer_id = c.id
       WHERE r.master_id = $1
       ORDER BY r.created_at DESC`,
      [masterId]
    );

    const reviews = result.rows.map(row => ({
      id: row.id,
      orderId: row.order_id,
      orderTitle: row.order_title,
      customerId: row.customer_id,
      customerName: row.customer_name,
      customerPhoto: row.customer_photo,
      rating: row.rating,
      comment: row.comment || '',
      createdAt: row.created_at
    }));

    res.json({ reviews });
  } catch (error) {
    console.error('Get master reviews error:', error);
    res.status(500).json({ message: 'Ошибка при получении отзывов' });
  }
};

// Создать отзыв
export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
      return res.status(400).json({ message: 'Не указаны обязательные поля' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Рейтинг должен быть от 1 до 5' });
    }

    // Проверяем, существует ли заказ и принадлежит ли он пользователю
    const orderCheck = await pool.query(
      'SELECT id, customer_id, assigned_master_id, status FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const order = orderCheck.rows[0];

    if (order.customer_id !== userId) {
      return res.status(403).json({ message: 'Вы не можете оставить отзыв на этот заказ' });
    }

    if (!order.assigned_master_id) {
      return res.status(400).json({ message: 'Заказ не имеет назначенного мастера' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Можно оставить отзыв только на завершенный заказ' });
    }

    // Проверяем, не оставлен ли уже отзыв
    const reviewCheck = await pool.query(
      'SELECT id FROM reviews WHERE order_id = $1',
      [orderId]
    );

    if (reviewCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Отзыв на этот заказ уже оставлен' });
    }

    // Создаем отзыв
    const result = await pool.query(
      `INSERT INTO reviews (order_id, customer_id, master_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orderId, userId, order.assigned_master_id, rating, comment || '']
    );

    // Обновляем рейтинг мастера
    await pool.query(
      `UPDATE users 
       SET rating = (
         SELECT AVG(rating)::NUMERIC(3,2) 
         FROM reviews 
         WHERE master_id = $1
       ),
       reviews_count = (
         SELECT COUNT(*) 
         FROM reviews 
         WHERE master_id = $1
       )
       WHERE id = $1`,
      [order.assigned_master_id]
    );

    res.json({
      message: 'Отзыв успешно создан',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Ошибка при создании отзыва' });
  }
};

// Обновить отзыв
export const updateReview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Некорректный рейтинг' });
    }

    // Проверяем, принадлежит ли отзыв пользователю
    const reviewCheck = await pool.query(
      'SELECT customer_id, master_id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    if (reviewCheck.rows[0].customer_id !== userId) {
      return res.status(403).json({ message: 'Вы не можете редактировать этот отзыв' });
    }

    // Обновляем отзыв
    const result = await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [rating, comment || '', reviewId]
    );

    // Обновляем рейтинг мастера
    const masterId = reviewCheck.rows[0].master_id;
    await pool.query(
      `UPDATE users 
       SET rating = (
         SELECT AVG(rating)::NUMERIC(3,2) 
         FROM reviews 
         WHERE master_id = $1
       )
       WHERE id = $1`,
      [masterId]
    );

    res.json({
      message: 'Отзыв успешно обновлен',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении отзыва' });
  }
};

// Удалить отзыв
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.params;

    // Проверяем, принадлежит ли отзыв пользователю
    const reviewCheck = await pool.query(
      'SELECT customer_id, master_id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    if (reviewCheck.rows[0].customer_id !== userId) {
      return res.status(403).json({ message: 'Вы не можете удалить этот отзыв' });
    }

    const masterId = reviewCheck.rows[0].master_id;

    // Удаляем отзыв
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    // Обновляем рейтинг мастера
    await pool.query(
      `UPDATE users 
       SET rating = COALESCE((
         SELECT AVG(rating)::NUMERIC(3,2) 
         FROM reviews 
         WHERE master_id = $1
       ), 0),
       reviews_count = (
         SELECT COUNT(*) 
         FROM reviews 
         WHERE master_id = $1
       )
       WHERE id = $1`,
      [masterId]
    );

    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Ошибка при удалении отзыва' });
  }
};
