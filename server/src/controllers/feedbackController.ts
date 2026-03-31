import { Request, Response } from 'express';
import pool from '../config/database';
import path from 'path';
import fs from 'fs';

export const feedbackController = {
  // Create new feedback
  async createFeedback(req: Request, res: Response) {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
      }

      // Handle file attachments
      const attachments: any[] = [];
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file: any) => {
          attachments.push({
            filename: file.filename,
            originalname: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
          });
        });
      }

      const result = await pool.query(
        `INSERT INTO feedback (name, email, phone, subject, message, status, attachments)
         VALUES ($1, $2, $3, $4, $5, 'new', $6)
         RETURNING *`,
        [name, email, phone || null, subject, message, JSON.stringify(attachments)]
      );

      res.status(201).json({
        message: 'Сообщение успешно отправлено',
        feedback: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ error: 'Ошибка при отправке сообщения' });
    }
  },

  // Get all feedback (admin only)
  async getAllFeedback(req: Request, res: Response) {
    try {
      const { status, limit = 50, offset = 0 } = req.query;

      let query = 'SELECT * FROM feedback';
      const params: any[] = [];

      if (status && status !== 'all') {
        query += ' WHERE status = $1';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM feedback';
      const countParams: any[] = [];
      if (status && status !== 'all') {
        countQuery += ' WHERE status = $1';
        countParams.push(status);
      }
      const countResult = await pool.query(countQuery, countParams);

      res.json({
        feedback: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Ошибка при загрузке обратной связи' });
    }
  },

  // Get single feedback by ID
  async getFeedbackById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT * FROM feedback WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Сообщение не найдено' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Ошибка при загрузке сообщения' });
    }
  },

  // Update feedback status
  async updateFeedbackStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Некорректный статус' });
      }

      const resolved_at = status === 'resolved' || status === 'closed' ? new Date() : null;

      const result = await pool.query(
        `UPDATE feedback 
         SET status = $1, admin_notes = $2, resolved_at = $3
         WHERE id = $4
         RETURNING *`,
        [status, admin_notes || null, resolved_at, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Сообщение не найдено' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ error: 'Ошибка при обновлении статуса' });
    }
  },

  // Delete feedback
  async deleteFeedback(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM feedback WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Сообщение не найдено' });
      }

      res.json({ message: 'Сообщение удалено' });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ error: 'Ошибка при удалении сообщения' });
    }
  },

  // Get feedback statistics
  async getFeedbackStats(req: Request, res: Response) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE status = 'new') as new_count,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
          COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
          COUNT(*) as total_count
        FROM feedback
      `;

      const result = await pool.query(statsQuery);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Ошибка при загрузке статистики' });
    }
  },

  // Download attachment
  async downloadAttachment(req: Request, res: Response) {
    try {
      const { id, filename } = req.params;

      const result = await pool.query(
        'SELECT attachments FROM feedback WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Сообщение не найдено' });
      }

      const attachments = result.rows[0].attachments || [];
      const attachment = attachments.find((att: any) => att.filename === filename);

      if (!attachment) {
        return res.status(404).json({ error: 'Файл не найден' });
      }

      const filePath = path.resolve(attachment.path);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Файл не найден на сервере' });
      }

      res.download(filePath, attachment.originalname);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      res.status(500).json({ error: 'Ошибка при скачивании файла' });
    }
  }
};
