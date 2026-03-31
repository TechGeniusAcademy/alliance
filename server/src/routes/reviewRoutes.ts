import { Router } from 'express';
import {
  getCustomerReviews,
  getMasterReviews,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Получить отзывы клиента (свои отзывы)
router.get('/', getCustomerReviews);

// Получить отзывы о мастере
router.get('/master/:masterId', getMasterReviews);

// Создать отзыв
router.post('/', createReview);

// Обновить отзыв
router.put('/:reviewId', updateReview);

// Удалить отзыв
router.delete('/:reviewId', deleteReview);

export default router;
