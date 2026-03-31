import express from 'express';
import multer from 'multer';
import path from 'path';
import { feedbackController } from '../controllers/feedbackController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/feedback');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Недопустимый тип файла'));
    }
  }
});

// Public route - submit feedback with files
router.post('/', upload.array('attachments', 5), feedbackController.createFeedback);

// Admin routes - require authentication
router.get('/', authMiddleware, feedbackController.getAllFeedback);
router.get('/stats', authMiddleware, feedbackController.getFeedbackStats);
router.get('/:id', authMiddleware, feedbackController.getFeedbackById);
router.put('/:id', authMiddleware, feedbackController.updateFeedbackStatus);
router.delete('/:id', authMiddleware, feedbackController.deleteFeedback);
router.get('/:id/download/:filename', authMiddleware, feedbackController.downloadAttachment);

export default router;
