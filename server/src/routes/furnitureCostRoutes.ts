import express from 'express';
import { furnitureCostController } from '../controllers/furnitureCostController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Analyze furniture image and get cost estimate
router.post('/analyze-cost', authMiddleware, furnitureCostController.analyzeFurnitureImage);

export default router;
