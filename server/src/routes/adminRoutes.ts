import express from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleBlockUser,
  changeUserRole
} from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/isAdmin';
import pool from '../config/database';

const router = express.Router();

// Временно отключаем авторизацию для тестирования
// TODO: Включить обратно для продакшн
// router.use(authMiddleware);
// router.use(isAdmin);

// GET /api/users - получить всех пользователей
router.get('/', getUsers);

// POST /api/users - создать пользователя
router.post('/', createUser);

// PUT /api/users/:id - обновить пользователя
router.put('/:id', updateUser);

// DELETE /api/users/:id - удалить пользователя
router.delete('/:id', deleteUser);

// PATCH /api/users/:id/block - заблокировать/разблокировать
router.patch('/:id/block', toggleBlockUser);

// PATCH /api/users/:id/role - изменить роль
router.patch('/:id/role', changeUserRole);

// TEMPORARY: Fix master profiles NULL values
router.get('/fix-master-profiles', async (req, res) => {
  try {
    const updateResult = await pool.query(`
      UPDATE master_profiles 
      SET 
        rating = COALESCE(rating, 0.00),
        reviews_count = COALESCE(reviews_count, 0),
        completed_orders = COALESCE(completed_orders, 0)
      WHERE rating IS NULL OR reviews_count IS NULL OR completed_orders IS NULL
      RETURNING user_id, rating, reviews_count, completed_orders
    `);
    
    const checkResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        mp.rating,
        mp.reviews_count,
        mp.completed_orders
      FROM users u
      LEFT JOIN master_profiles mp ON mp.user_id = u.id
      WHERE u.role = 'master'
      ORDER BY u.id
    `);
    
    res.json({
      updated: updateResult.rowCount,
      updatedRows: updateResult.rows,
      allMasters: checkResult.rows
    });
  } catch (error) {
    console.error('Fix error:', error);
    res.status(500).json({ error: 'Failed to fix master profiles' });
  }
});

// TEMPORARY: Recalculate master statistics from actual data
router.get('/recalculate-master-stats', async (req, res) => {
  try {
    // Получаем всех мастеров
    const masters = await pool.query(`
      SELECT id FROM users WHERE role = 'master'
    `);
    
    const results = [];
    
    for (const master of masters.rows) {
      const masterId = master.id;
      
      // Считаем выполненные заказы
      const completedOrders = await pool.query(`
        SELECT COUNT(*) as count
        FROM orders
        WHERE assigned_master_id = $1 AND status = 'completed'
      `, [masterId]);
      
      // Считаем отзывы и средний рейтинг
      const reviewStats = await pool.query(`
        SELECT 
          COUNT(*) as reviews_count,
          COALESCE(AVG(rating), 0) as avg_rating
        FROM reviews
        WHERE master_id = $1
      `, [masterId]);
      
      const completedCount = parseInt(completedOrders.rows[0].count);
      const reviewsCount = parseInt(reviewStats.rows[0].reviews_count);
      const avgRating = parseFloat(reviewStats.rows[0].avg_rating);
      
      // Обновляем профиль мастера
      await pool.query(`
        INSERT INTO master_profiles (user_id, completed_orders, reviews_count, rating)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET
          completed_orders = EXCLUDED.completed_orders,
          reviews_count = EXCLUDED.reviews_count,
          rating = EXCLUDED.rating,
          updated_at = CURRENT_TIMESTAMP
      `, [masterId, completedCount, reviewsCount, avgRating.toFixed(2)]);
      
      results.push({
        master_id: masterId,
        completed_orders: completedCount,
        reviews_count: reviewsCount,
        rating: avgRating.toFixed(2)
      });
    }
    
    res.json({
      message: 'Statistics recalculated',
      results
    });
  } catch (error) {
    console.error('Recalculate error:', error);
    res.status(500).json({ error: 'Failed to recalculate statistics' });
  }
});

export default router;
