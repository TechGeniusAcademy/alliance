import express from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/authMiddleware';
import pool from '../config/database';

const router = express.Router();

// Генерация изображения через Stability AI
router.post('/generate-image', authMiddleware, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt is required and must be a string' });
    }

    // Проверка наличия API ключа
    const apiKey = process.env.STABILITY_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        message: 'Stability AI API key is not configured. Please add STABILITY_API_KEY to your environment variables.' 
      });
    }

    // Улучшаем промпт для генерации мебели
    const enhancedPrompt = `High-quality professional photograph of ${prompt}, furniture design, interior design, modern, elegant, studio lighting, 4k resolution, detailed textures`;

    console.log('Generating image with prompt:', enhancedPrompt);

    // Вызов Stability AI API (SDXL 1.0)
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [
          {
            text: enhancedPrompt,
            weight: 1
          },
          {
            text: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text',
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const imageData = response.data.artifacts[0];
    
    if (!imageData || !imageData.base64) {
      throw new Error('No image data received from Stability AI');
    }

    // Возвращаем base64 изображение
    const imageUrl = `data:image/png;base64,${imageData.base64}`;

    // Сохраняем в базу данных
    const userId = (req as any).userId;
    const saveResult = await pool.query(
      `INSERT INTO ai_generated_images (user_id, prompt, image_url)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [userId, prompt, imageUrl]
    );

    res.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      imageId: saveResult.rows[0].id,
      createdAt: saveResult.rows[0].created_at,
    });

  } catch (error) {
    console.error('Error generating image:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 401) {
        return res.status(401).json({ 
          message: 'Invalid Stability AI API key. Please check your configuration.' 
        });
      }

      if (status === 402) {
        return res.status(402).json({ 
          message: 'Insufficient credits in Stability AI account. Please top up your balance.' 
        });
      }

      if (status === 429) {
        const errorData = error.response?.data;
        if (errorData?.name === 'insufficient_balance') {
          return res.status(402).json({ 
            message: `Insufficient balance in Stability AI account. ${errorData.message || 'Please top up your balance.'}` 
          });
        }
        return res.status(429).json({ 
          message: 'Rate limit exceeded. Please try again in a few moments.' 
        });
      }

      if (status === 400) {
        return res.status(400).json({ 
          message: `Invalid request: ${message}` 
        });
      }

      return res.status(status || 500).json({ 
        message: `Stability AI error: ${message}` 
      });
    }

    res.status(500).json({ 
      message: 'Failed to generate image. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Получить все сгенерированные изображения пользователя
router.get('/my-images', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await pool.query(
      `SELECT id, prompt, image_url, created_at
       FROM ai_generated_images
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_generated_images WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      images: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch images.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Удалить сгенерированное изображение
router.delete('/images/:imageId', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { imageId } = req.params;

    const result = await pool.query(
      'DELETE FROM ai_generated_images WHERE id = $1 AND user_id = $2 RETURNING id',
      [imageId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Image not found or access denied' });
    }

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      message: 'Failed to delete image.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
