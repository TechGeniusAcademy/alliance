import { Request, Response } from 'express';
import pool from '../config/database';
import whatsappService from '../services/whatsappService';

// Создать ставку на заказ
export const createBid = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { orderId } = req.params;
    const { proposed_price, estimated_days, comment } = req.body;

    // ПРОВЕРКА: Проверяем, нет ли у мастера неоплаченных комиссий
    const unpaidCommissionsCheck = await pool.query(
      `SELECT COUNT(*) as unpaid_count, SUM(commission_amount) as total_unpaid
       FROM commission_transactions
       WHERE master_id = $1 AND status = 'pending'`,
      [masterId]
    );

    const unpaidCount = parseInt(unpaidCommissionsCheck.rows[0].unpaid_count);
    const totalUnpaid = parseFloat(unpaidCommissionsCheck.rows[0].total_unpaid || 0);

    if (unpaidCount > 0) {
      return res.status(403).json({ 
        message: `У вас есть ${unpaidCount} неоплаченных комиссий на сумму ${totalUnpaid}₸. Пожалуйста, оплатите их перед тем, как делать новые ставки.`,
        error: 'UNPAID_COMMISSIONS',
        unpaidCount,
        totalUnpaid
      });
    }

    // Проверяем, что заказ существует и находится в аукционе
    const orderCheck = await pool.query(
      `SELECT o.id, o.status, o.title, o.customer_id, u.phone as customer_phone 
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.id = $1`,
      [orderId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    const order = orderCheck.rows[0];

    if (order.status !== 'auction') {
      return res.status(400).json({ message: 'Заказ не находится в аукционе' });
    }

    // Получаем информацию о мастере
    const masterInfo = await pool.query(
      `SELECT 
        u.name as master_name,
        u.phone as master_phone,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed') as completed_projects
       FROM users u
       LEFT JOIN reviews r ON r.master_id = u.id
       LEFT JOIN orders o ON o.master_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, u.name, u.phone`,
      [masterId]
    );

    const master = masterInfo.rows[0];

    // Проверяем, есть ли уже ставка от этого мастера
    const existingBid = await pool.query(
      'SELECT id FROM order_bids WHERE order_id = $1 AND master_id = $2',
      [orderId, masterId]
    );

    let isNewBid = false;

    if (existingBid.rows.length > 0) {
      // Обновляем существующую ставку
      const result = await pool.query(
        `UPDATE order_bids 
         SET proposed_price = $1, estimated_days = $2, comment = $3, 
             status = 'pending', updated_at = CURRENT_TIMESTAMP
         WHERE order_id = $4 AND master_id = $5
         RETURNING *`,
        [proposed_price, estimated_days, comment, orderId, masterId]
      );

      // Отправляем уведомление клиенту об обновлении ставки
      if (order.customer_phone) {
        whatsappService.sendNewBidNotification(order.customer_phone, {
          orderId: order.id,
          orderTitle: order.title,
          masterName: master.master_name,
          masterRating: parseFloat(master.rating),
          proposedPrice: proposed_price,
          estimatedDays: estimated_days,
          comment: comment || '',
          completedProjectsCount: parseInt(master.completed_projects)
        }).catch((err: any) => console.error('Ошибка отправки WhatsApp уведомления:', err));
      }

      return res.json({
        message: 'Ставка обновлена',
        bid: result.rows[0],
      });
    }

    isNewBid = true;

    // Создаем новую ставку
    const result = await pool.query(
      `INSERT INTO order_bids (order_id, master_id, proposed_price, estimated_days, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orderId, masterId, proposed_price, estimated_days, comment]
    );

    // Отправляем уведомление клиенту о новой ставке
    if (order.customer_phone) {
      whatsappService.sendNewBidNotification(order.customer_phone, {
        orderId: order.id,
        orderTitle: order.title,
        masterName: master.master_name,
        masterRating: parseFloat(master.rating),
        proposedPrice: proposed_price,
        estimatedDays: estimated_days,
        comment: comment || '',
        completedProjectsCount: parseInt(master.completed_projects)
      }).catch((err: any) => console.error('Ошибка отправки WhatsApp уведомления:', err));
    }

    res.status(201).json({
      message: 'Ставка успешно создана',
      bid: result.rows[0],
    });
  } catch (error) {
    console.error('Create bid error:', error);
    res.status(500).json({ message: 'Ошибка при создании ставки' });
  }
};

// Получить свои ставки (для мастера)
export const getMyBids = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;

    const result = await pool.query(
      `SELECT 
        ob.*,
        o.title as order_title,
        o.description as order_description,
        o.budget_min,
        o.budget_max,
        o.deadline,
        o.status as order_status,
        u.name as customer_name
       FROM order_bids ob
       JOIN orders o ON ob.order_id = o.id
       JOIN users u ON o.customer_id = u.id
       WHERE ob.master_id = $1
       ORDER BY ob.created_at DESC`,
      [masterId]
    );

    res.json({ bids: result.rows });
  } catch (error) {
    console.error('Get my bids error:', error);
    res.status(500).json({ message: 'Ошибка при получении ставок' });
  }
};

// Получить ставку мастера на конкретный заказ
export const getMyBidForOrder = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { orderId } = req.params;

    const result = await pool.query(
      'SELECT * FROM order_bids WHERE order_id = $1 AND master_id = $2',
      [orderId, masterId]
    );

    if (result.rows.length === 0) {
      // Возвращаем null вместо 404, это нормальная ситуация
      return res.json({ bid: null });
    }

    res.json({ bid: result.rows[0] });
  } catch (error) {
    console.error('Get bid error:', error);
    res.status(500).json({ message: 'Ошибка при получении ставки' });
  }
};

// Удалить свою ставку
export const deleteBid = async (req: Request, res: Response) => {
  try {
    const masterId = req.userId;
    const { bidId } = req.params;

    const result = await pool.query(
      'DELETE FROM order_bids WHERE id = $1 AND master_id = $2 RETURNING id',
      [bidId, masterId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Нет доступа к этой ставке' });
    }

    res.json({ message: 'Ставка удалена' });
  } catch (error) {
    console.error('Delete bid error:', error);
    res.status(500).json({ message: 'Ошибка при удалении ставки' });
  }
};

// Получить все ставки на заказ (для сравнения конкуренции)
export const getOrderBidsForMaster = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Получаем только количество ставок и диапазон цен (без имен мастеров)
    const result = await pool.query(
      `SELECT 
        COUNT(*) as bids_count,
        MIN(proposed_price) as min_bid,
        MAX(proposed_price) as max_bid,
        AVG(proposed_price) as avg_bid
       FROM order_bids
       WHERE order_id = $1 AND status = 'pending'`,
      [orderId]
    );

    res.json({ competition: result.rows[0] });
  } catch (error) {
    console.error('Get order bids error:', error);
    res.status(500).json({ message: 'Ошибка при получении информации о ставках' });
  }
};
