import { Request, Response } from 'express';
import pool from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
}

// Получить всех клиентов мастера
export const getMasterClients = async (req: AuthRequest, res: Response) => {
  try {
    const masterId = req.user?.id;
    const { sortBy = 'recent', filterStatus = 'all' } = req.query;

    let orderBy = 'last_order_date DESC';
    switch (sortBy) {
      case 'name':
        orderBy = 'u.name ASC';
        break;
      case 'orders':
        orderBy = 'total_orders DESC';
        break;
      case 'spent':
        orderBy = 'total_spent DESC';
        break;
    }

    let statusFilter = '';
    if (filterStatus === 'active') {
      statusFilter = 'AND active_orders > 0';
    } else if (filterStatus === 'completed') {
      statusFilter = 'AND completed_orders > 0 AND active_orders = 0';
    } else if (filterStatus === 'inactive') {
      statusFilter = 'AND active_orders = 0';
    }

    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.profile_photo,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status IN ('in_progress', 'accepted', 'auction') THEN 1 END) as active_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.final_price ELSE 0 END), 0) as total_spent,
        AVG(r.rating) as average_rating,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date,
        CASE 
          WHEN COUNT(CASE WHEN o.status IN ('in_progress', 'accepted') THEN 1 END) > 0 THEN 'active'
          WHEN COUNT(CASE WHEN o.status = 'completed' THEN 1 END) > 0 THEN 'completed'
          ELSE 'inactive'
        END as status
      FROM users u
      INNER JOIN orders o ON o.customer_id = u.id
      LEFT JOIN reviews r ON r.order_id = o.id AND r.master_id = $1
      WHERE o.assigned_master_id = $1
      GROUP BY u.id, u.name, u.email, u.phone, u.address, u.profile_photo
      HAVING COUNT(o.id) > 0 ${statusFilter}
      ORDER BY ${orderBy}`,
      [masterId]
    );

    res.json({
      clients: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        profile_photo: row.profile_photo,
        total_orders: parseInt(row.total_orders),
        completed_orders: parseInt(row.completed_orders),
        active_orders: parseInt(row.active_orders),
        total_spent: parseFloat(row.total_spent),
        average_rating: row.average_rating ? parseFloat(row.average_rating) : null,
        first_order_date: row.first_order_date,
        last_order_date: row.last_order_date,
        status: row.status
      }))
    });
  } catch (error) {
    console.error('Ошибка получения клиентов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получить детальную информацию о клиенте
export const getClientDetails = async (req: AuthRequest, res: Response) => {
  try {
    const masterId = req.user?.id;
    const { clientId } = req.params;

    // Информация о клиенте
    const clientResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.profile_photo,
        COUNT(o.id) as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status IN ('in_progress', 'accepted', 'auction') THEN 1 END) as active_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.final_price ELSE 0 END), 0) as total_spent,
        AVG(r.rating) as average_rating,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date,
        CASE 
          WHEN COUNT(CASE WHEN o.status IN ('in_progress', 'accepted') THEN 1 END) > 0 THEN 'active'
          WHEN COUNT(CASE WHEN o.status = 'completed' THEN 1 END) > 0 THEN 'completed'
          ELSE 'inactive'
        END as status
      FROM users u
      INNER JOIN orders o ON o.customer_id = u.id
      LEFT JOIN reviews r ON r.order_id = o.id AND r.master_id = $1
      WHERE u.id = $2 AND o.assigned_master_id = $1
      GROUP BY u.id, u.name, u.email, u.phone, u.address, u.profile_photo`,
      [masterId, clientId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    // История заказов с этим клиентом
    const ordersResult = await pool.query(
      `SELECT 
        o.id,
        o.title,
        o.category,
        o.status,
        o.final_price,
        o.created_at,
        o.updated_at,
        r.rating,
        r.review
      FROM orders o
      LEFT JOIN reviews r ON r.order_id = o.id AND r.master_id = $1
      WHERE o.customer_id = $2 AND o.assigned_master_id = $1
      ORDER BY o.created_at DESC`,
      [masterId, clientId]
    );

    const client = clientResult.rows[0];

    res.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        profile_photo: client.profile_photo,
        total_orders: parseInt(client.total_orders),
        completed_orders: parseInt(client.completed_orders),
        active_orders: parseInt(client.active_orders),
        total_spent: parseFloat(client.total_spent),
        average_rating: client.average_rating ? parseFloat(client.average_rating) : null,
        first_order_date: client.first_order_date,
        last_order_date: client.last_order_date,
        status: client.status
      },
      orders: ordersResult.rows.map(order => ({
        id: order.id,
        title: order.title,
        category: order.category,
        status: order.status,
        final_price: order.final_price ? parseFloat(order.final_price) : null,
        created_at: order.created_at,
        updated_at: order.updated_at,
        rating: order.rating ? parseFloat(order.rating) : null,
        review: order.review
      }))
    });
  } catch (error) {
    console.error('Ошибка получения данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
