import express from 'express';
import {
  getPortfolio,
  getPortfolioItem,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  getPublicPortfolio,
  getAllPublicPortfolio
} from '../controllers/portfolioController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Защищенные маршруты (требуют аутентификации)
router.get('/portfolio', authenticateToken, getPortfolio);
router.get('/portfolio/:id', authenticateToken, getPortfolioItem);
router.post('/portfolio', authenticateToken, createPortfolioItem);
router.put('/portfolio/:id', authenticateToken, updatePortfolioItem);
router.delete('/portfolio/:id', authenticateToken, deletePortfolioItem);

// Публичные маршруты (не требуют аутентификации)
router.get('/public/portfolio', getAllPublicPortfolio); // Все работы
router.get('/public/portfolio/:masterId', getPublicPortfolio); // Работы конкретного мастера

export default router;
