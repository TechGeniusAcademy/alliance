import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getMasterStatistics, getMasterActivity } from '../controllers/statisticsController';

const router = express.Router();

// Получить статистику мастера
router.get('/master', authMiddleware, getMasterStatistics);

// Получить недавнюю активность мастера
router.get('/master/activity', authMiddleware, getMasterActivity);

export default router;
