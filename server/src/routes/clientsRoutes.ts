import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getMasterClients, getClientDetails } from '../controllers/clientsController';

const router = express.Router();

// Получить всех клиентов мастера
router.get('/master', authMiddleware, getMasterClients);

// Получить детальную информацию о клиенте
router.get('/master/:clientId', authMiddleware, getClientDetails);

export default router;
