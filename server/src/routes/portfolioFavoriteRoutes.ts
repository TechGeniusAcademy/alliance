import { Router } from 'express';
import {
  getFavoritePortfolios,
  addPortfolioToFavorites,
  removePortfolioFromFavorites,
  checkPortfolioFavorite
} from '../controllers/portfolioFavoriteController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Получить избранные работы портфолио
router.get('/', getFavoritePortfolios);

// Добавить работу в избранное
router.post('/', addPortfolioToFavorites);

// Удалить работу из избранного
router.delete('/:portfolioId', removePortfolioFromFavorites);

// Проверить, в избранном ли работа
router.get('/check/:portfolioId', checkPortfolioFavorite);

export default router;
