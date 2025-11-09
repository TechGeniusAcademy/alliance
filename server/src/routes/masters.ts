import express from 'express';
import { getAllPublicMasters, getPublicMasterProfile } from '../controllers/publicMasterController';

const router = express.Router();

// Публичные роуты (не требуют авторизации)
router.get('/public', getAllPublicMasters);
router.get('/public/:id', getPublicMasterProfile);

export default router;
