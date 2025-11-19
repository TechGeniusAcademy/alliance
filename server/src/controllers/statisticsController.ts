import { Request, Response } from 'express';
import pool from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
}

// Получить статистику мастера
export const getMasterStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const masterId = req.user?.id;
    const { period = 'month' } = req.query;

    // Определяем временной диапазон
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `AND o.created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = `AND o.created_at >= '${monthAgo.toISOString()}'`;
        break;
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFilter = `AND o.created_at >= '${quarterAgo.toISOString()}'`;
        break;
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateFilter = `AND o.created_at >= '${yearAgo.toISOString()}'`;
        break;
    }

    // Основные метрики
    const metricsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.status IN ('in_progress', 'accepted') THEN 1 END) as active_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.final_price ELSE 0 END), 0) as total_income,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.final_price END), 0) as average_order_value,
        COUNT(DISTINCT o.customer_id) as total_clients
      FROM orders o
      WHERE o.assigned_master_id = $1 ${dateFilter}`,
      [masterId]
    );

    // Рейтинг
    const ratingResult = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as average_rating
       FROM reviews
       WHERE master_id = $1`,
      [masterId]
    );

    // Процент завершения
    const metrics = metricsResult.rows[0];
    const completionRate = metrics.total_orders > 0 
      ? Math.round((metrics.completed_orders / metrics.total_orders) * 100) 
      : 0;

    // Месячные данные
    const monthlyResult = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon') as month,
        COUNT(*) as orders,
        COALESCE(SUM(o.final_price), 0) as income
      FROM orders o
      WHERE o.assigned_master_id = $1 
        AND o.status = 'completed'
        AND o.created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', o.created_at)
      ORDER BY DATE_TRUNC('month', o.created_at) ASC
      LIMIT 6`,
      [masterId]
    );

    // Популярные категории
    const totalOrdersForCategories = await pool.query(
      `SELECT COUNT(*) as total FROM orders o WHERE o.assigned_master_id = $1 ${dateFilter}`,
      [masterId]
    );
    const totalCategoryOrders = parseInt(totalOrdersForCategories.rows[0]?.total || 0);
    
    const categoriesResult = await pool.query(
      `SELECT 
        o.category,
        COUNT(*) as count
      FROM orders o
      WHERE o.assigned_master_id = $1 ${dateFilter}
      GROUP BY o.category
      ORDER BY count DESC
      LIMIT 5`,
      [masterId]
    );

    // Недавняя активность (последние 7 дней)
    const activityResult = await pool.query(
      `SELECT 
        DATE(o.updated_at) as date,
        COUNT(*) as orders_completed,
        COALESCE(SUM(o.final_price), 0) as income
      FROM orders o
      WHERE o.assigned_master_id = $1 
        AND o.status = 'completed'
        AND o.updated_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(o.updated_at)
      ORDER BY date DESC`,
      [masterId]
    );

    // Показатели производительности
    const performanceResult = await pool.query(
      `SELECT 
        COUNT(CASE WHEN o.deadline >= o.updated_at THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) as on_time_delivery,
        COUNT(CASE WHEN r.rating >= 4 THEN 1 END) * 100.0 / NULLIF(COUNT(r.id), 0) as customer_satisfaction
      FROM orders o
      LEFT JOIN reviews r ON r.order_id = o.id
      WHERE o.assigned_master_id = $1 
        AND o.status = 'completed' 
        ${dateFilter}`,
      [masterId]
    );

    // Повторные клиенты
    const repeatClientsResult = await pool.query(
      `SELECT 
        COUNT(DISTINCT customer_id) * 100.0 / NULLIF((SELECT COUNT(DISTINCT customer_id) FROM orders WHERE assigned_master_id = $1), 0) as repeat_clients
      FROM orders
      WHERE assigned_master_id = $1
      GROUP BY customer_id
      HAVING COUNT(*) > 1`,
      [masterId]
    );

    const performance = performanceResult.rows[0];
    const repeatClients = repeatClientsResult.rows[0];

    res.json({
      totalOrders: parseInt(metrics.total_orders),
      completedOrders: parseInt(metrics.completed_orders),
      activeOrders: parseInt(metrics.active_orders),
      totalIncome: parseFloat(metrics.total_income),
      averageRating: parseFloat(ratingResult.rows[0].average_rating),
      totalClients: parseInt(metrics.total_clients),
      completionRate: completionRate,
      responseTime: 2.5, // Заглушка, можно рассчитать реально из чатов
      monthlyData: monthlyResult.rows.map(row => ({
        month: row.month,
        orders: parseInt(row.orders),
        income: parseFloat(row.income)
      })),
      topCategories: categoriesResult.rows.map(row => ({
        category: row.category || 'Без категории',
        count: parseInt(row.count),
        percentage: totalCategoryOrders > 0 
          ? Math.round((parseInt(row.count) / totalCategoryOrders) * 1000) / 10 
          : 0
      })),
      recentActivity: activityResult.rows.map(row => ({
        date: row.date,
        ordersCompleted: parseInt(row.orders_completed),
        income: parseFloat(row.income)
      })),
      performanceMetrics: {
        onTimeDelivery: Math.round(parseFloat(performance.on_time_delivery) || 0),
        customerSatisfaction: Math.round(parseFloat(performance.customer_satisfaction) || 0),
        repeatClients: Math.round(parseFloat(repeatClients?.repeat_clients) || 0),
        averageOrderValue: parseFloat(metrics.average_order_value)
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
