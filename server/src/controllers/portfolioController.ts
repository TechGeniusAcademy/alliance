import { Request, Response } from 'express';
import pool from '../config/database';

// Получить все работы портфолио мастера
export const getPortfolio = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // ID из токена

    const result = await pool.query(
      `SELECT * FROM portfolio 
       WHERE master_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Ошибка при загрузке портфолио' });
  }
};

// Получить одну работу по ID
export const getPortfolioItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      'SELECT * FROM portfolio WHERE id = $1 AND master_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Работа не найдена' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({ message: 'Ошибка при загрузке работы' });
  }
};

// Создать новую работу в портфолио
export const createPortfolioItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      title,
      description,
      category,
      images,
      execution_time,
      materials,
      dimensions,
      furniture_type,
      style,
      color,
      client_name,
      location,
      price,
      warranty_period,
      assembly_included,
      delivery_included,
      is_public
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Название обязательно' });
    }

    const result = await pool.query(
      `INSERT INTO portfolio 
       (master_id, title, description, category, images, execution_time, materials, dimensions, 
        furniture_type, style, color, client_name, location, price, warranty_period, 
        assembly_included, delivery_included, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
       RETURNING *`,
      [userId, title, description, category, images || [], execution_time, materials, dimensions,
       furniture_type, style, color, client_name, location, price, warranty_period,
       assembly_included ?? true, delivery_included ?? false, is_public ?? true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).json({ message: 'Ошибка при создании работы' });
  }
};

// Обновить работу в портфолио
export const updatePortfolioItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const {
      title,
      description,
      category,
      images,
      execution_time,
      materials,
      dimensions,
      furniture_type,
      style,
      color,
      client_name,
      location,
      price,
      warranty_period,
      assembly_included,
      delivery_included,
      is_public
    } = req.body;

    // Проверяем, что работа принадлежит этому мастеру
    const checkResult = await pool.query(
      'SELECT * FROM portfolio WHERE id = $1 AND master_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Работа не найдена' });
    }

    const result = await pool.query(
      `UPDATE portfolio 
       SET title = $1, 
           description = $2, 
           category = $3, 
           images = $4, 
           execution_time = $5, 
           materials = $6, 
           dimensions = $7,
           furniture_type = $8,
           style = $9,
           color = $10,
           client_name = $11, 
           location = $12,
           price = $13, 
           warranty_period = $14,
           assembly_included = $15,
           delivery_included = $16,
           is_public = $17,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $18 AND master_id = $19
       RETURNING *`,
      [title, description, category, images, execution_time, materials, dimensions,
       furniture_type, style, color, client_name, location, price, warranty_period,
       assembly_included, delivery_included, is_public, id, userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({ message: 'Ошибка при обновлении работы' });
  }
};

// Удалить работу из портфолио
export const deletePortfolioItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      'DELETE FROM portfolio WHERE id = $1 AND master_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Работа не найдена' });
    }

    res.json({ message: 'Работа успешно удалена' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ message: 'Ошибка при удалении работы' });
  }
};

// Получить публичное портфолио мастера (для клиентов)
export const getPublicPortfolio = async (req: Request, res: Response) => {
  try {
    const { masterId } = req.params;

    const result = await pool.query(
      `SELECT id, title, description, category, images, execution_time, materials, dimensions,
              furniture_type, style, color, location, price, warranty_period, 
              assembly_included, delivery_included, created_at
       FROM portfolio 
       WHERE master_id = $1 AND is_public = true
       ORDER BY created_at DESC`,
      [masterId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    res.status(500).json({ message: 'Ошибка при загрузке портфолио' });
  }
};

// Получить все публичные работы всех мастеров
export const getAllPublicPortfolio = async (req: Request, res: Response) => {
  try {
    // Сначала проверим, существует ли таблица
    const tableCheck = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'portfolio'
      )`
    );

    if (!tableCheck.rows[0].exists) {
      console.log('Portfolio table does not exist yet, returning empty array');
      return res.json([]);
    }

    const result = await pool.query(
      `SELECT p.id, p.master_id, p.title, p.description, p.category, p.images, 
              p.execution_time, p.materials, p.dimensions, p.furniture_type, p.style, 
              p.color, p.location, p.price, p.warranty_period, p.assembly_included, 
              p.delivery_included, p.created_at,
              u.name as master_name, u.phone as master_phone
       FROM portfolio p
       JOIN users u ON p.master_id = u.id
       WHERE p.is_public = true AND u.active = true AND u.role = 'master'
       ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching all public portfolio:', error);
    console.error('Error details:', error.message, error.code);
    res.status(500).json({ 
      message: 'Ошибка при загрузке работ',
      error: error.message 
    });
  }
};
