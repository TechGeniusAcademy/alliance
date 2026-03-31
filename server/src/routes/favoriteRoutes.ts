import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} from '../controllers/favoriteController';

const router = express.Router();

// Все роуты требуют аутентификации
router.use(authMiddleware);

// GET /api/favorites - Получить все избранные заказы
router.get('/', getFavorites);

// POST /api/favorites - Добавить заказ в избранное
router.post('/', addToFavorites);

// DELETE /api/favorites/:orderId - Удалить заказ из избранного
router.delete('/:orderId', removeFromFavorites);

// GET /api/favorites/check/:orderId - Проверить, в избранном ли заказ
router.get('/check/:orderId', checkFavorite);

export default router;
