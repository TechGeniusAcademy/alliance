import { Request, Response } from 'express';
import pool from '../config/database';

// Получить все транзакции пользователя (платежи)
export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    // Получаем все заказы пользователя
    const ordersResult = await pool.query(
      'SELECT id FROM orders WHERE customer_id = $1',
      [userId]
    );
    
    if (ordersResult.rows.length === 0) {
      return res.json({ transactions: [] });
    }
    
    const orderIds = ordersResult.rows.map(row => row.id);
    
    // Получаем транзакции по этим заказам
    const result = await pool.query(
      `SELECT 
        t.*,
        o.title as order_title,
        o.category as order_category,
        u.name as master_name
       FROM transactions t
       JOIN orders o ON t.order_id = o.id
       JOIN users u ON t.master_id = u.id
       WHERE t.order_id = ANY($1::int[])
       ORDER BY t.created_at DESC`,
      [orderIds]
    );
    
    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ message: 'Ошибка при получении транзакций' });
  }
};

// Получить баланс пользователя
export const getUserBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({ balance: parseFloat(result.rows[0].balance) || 0 });
  } catch (error) {
    console.error('Get user balance error:', error);
    res.status(500).json({ message: 'Ошибка при получении баланса' });
  }
};

// Получить статистику платежей
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    // Получаем все заказы пользователя
    const ordersResult = await pool.query(
      'SELECT id FROM orders WHERE customer_id = $1',
      [userId]
    );
    
    if (ordersResult.rows.length === 0) {
      return res.json({ 
        total: 0, 
        completed: 0, 
        pending: 0,
        totalAmount: 0 
      });
    }
    
    const orderIds = ordersResult.rows.map(row => row.id);
    
    // Статистика
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_amount
       FROM transactions
       WHERE order_id = ANY($1::int[])`,
      [orderIds]
    );
    
    const stats = statsResult.rows[0];
    
    res.json({
      total: parseInt(stats.total),
      completed: parseInt(stats.completed),
      pending: parseInt(stats.pending),
      totalAmount: parseFloat(stats.total_amount)
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
};

// Получить "счета" (заказы с финальной ценой)
export const getUserInvoices = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(
      `SELECT 
        o.*,
        u.name as master_name,
        t.status as payment_status,
        t.created_at as payment_date
       FROM orders o
       LEFT JOIN users u ON o.assigned_master_id = u.id
       LEFT JOIN transactions t ON t.order_id = o.id
       WHERE o.customer_id = $1 
       AND o.final_price IS NOT NULL
       AND o.status IN ('in_progress', 'pending_review', 'review', 'completed')
       ORDER BY o.created_at DESC`,
      [userId]
    );
    
    // Преобразуем в формат счетов
    const invoices = result.rows.map(order => ({
      id: order.id,
      orderId: order.id,
      orderTitle: order.title,
      invoiceNumber: `INV-${new Date(order.created_at).getFullYear()}-${String(order.id).padStart(4, '0')}`,
      amount: parseFloat(order.final_price),
      currency: '₸',
      status: order.payment_status === 'completed' ? 'paid' : 
              order.status === 'completed' ? 'sent' : 'draft',
      issuedAt: order.created_at,
      dueDate: order.deadline || order.created_at,
      paidAt: order.payment_status === 'completed' ? order.payment_date : null,
      items: [
        {
          id: 1,
          description: order.title,
          quantity: 1,
          unitPrice: parseFloat(order.final_price),
          total: parseFloat(order.final_price)
        }
      ]
    }));
    
    res.json({ invoices });
  } catch (error) {
    console.error('Get user invoices error:', error);
    res.status(500).json({ message: 'Ошибка при получении счетов' });
  }
};
