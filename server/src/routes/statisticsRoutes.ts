import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getMasterStatistics } from '../controllers/statisticsController';

const router = express.Router();

// Получить статистику мастера
router.get('/master', authMiddleware, getMasterStatistics);

export default router;
