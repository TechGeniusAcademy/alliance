import { Request, Response } from 'express';
import pool from '../config/database';

// Получить избранные заказы
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
        f.id,
        f.order_id,
        f.user_id,
        f.created_at as added_at,
        o.*,
        u.name as client_name,
        u.profile_photo as client_photo,
        (SELECT COUNT(*) FROM order_bids WHERE order_id = o.id) as bids_count
       FROM favorites f
       JOIN orders o ON f.order_id = o.id
       JOIN users u ON o.customer_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    // Transform to match frontend Favorite type with nested order
    const favorites = result.rows.map(row => {
      const { 
        id, 
        order_id, 
        user_id, 
        added_at,
        budget_min,
        budget_max,
        final_price,
        furniture_type,
        customer_id,
        assigned_master_id,
        created_at,
        updated_at,
        photos,
        bids_count,
        materials,
        dimensions,
        ...orderData 
      } = row;
      
      // Parse materials - can be TEXT or comma-separated string
      let materialsArray: string[] = [];
      if (materials) {
        if (typeof materials === 'string') {
          // If it's a comma-separated string
          materialsArray = materials.split(',').map((m: string) => m.trim()).filter(Boolean);
        } else if (Array.isArray(materials)) {
          materialsArray = materials;
        }
      }

      // Parse dimensions if it's a string
      let dimensionsObj = undefined;
      if (dimensions && typeof dimensions === 'string') {
        try {
          dimensionsObj = JSON.parse(dimensions);
        } catch {
          // If it's not JSON, leave it undefined
        }
      } else if (dimensions && typeof dimensions === 'object') {
        dimensionsObj = dimensions;
      }
      
      return {
        id,
        orderId: order_id,
        userId: user_id,
        addedAt: added_at,
        order: {
          ...orderData,
          id: order_id,
          furnitureType: furniture_type,
          clientId: customer_id,
          sellerId: assigned_master_id,
          images: photos || [],
          bidsCount: parseInt(bids_count) || 0,
          createdAt: created_at,
          materials: materialsArray,
          dimensions: dimensionsObj,
          price: {
            min: parseFloat(budget_min) || 0,
            max: parseFloat(budget_max) || 0,
            final: final_price ? parseFloat(final_price) : undefined
          }
        }
      };
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Ошибка при получении избранного' });
  }
};

// Добавить в избранное
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Не указан ID заказа' });
    }

    // Проверяем, существует ли заказ
    const orderCheck = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Проверяем, не добавлен ли уже в избранное
    const favoriteCheck = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND order_id = $2',
      [userId, orderId]
    );

    if (favoriteCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Заказ уже в избранном' });
    }

    // Добавляем в избранное
    await pool.query(
      'INSERT INTO favorites (user_id, order_id) VALUES ($1, $2)',
      [userId, orderId]
    );

    res.json({ message: 'Заказ добавлен в избранное' });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Ошибка при добавлении в избранное' });
  }
};

// Удалить из избранного
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND order_id = $2 RETURNING *',
      [userId, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден в избранном' });
    }

    res.json({ message: 'Заказ удален из избранного' });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Ошибка при удалении из избранного' });
  }
};

// Проверить, в избранном ли заказ
export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    const result = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND order_id = $2',
      [userId, orderId]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Ошибка при проверке избранного' });
  }
};
