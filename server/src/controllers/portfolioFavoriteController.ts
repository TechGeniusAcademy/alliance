import { Request, Response } from 'express';
import pool from '../config/database';

// Получить избранные работы портфолио
export const getFavoritePortfolios = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT 
        pf.id,
        pf.portfolio_id,
        pf.user_id,
        pf.created_at as added_at,
        p.*,
        u.name as master_name,
        u.profile_photo as master_photo,
        mp.rating as master_rating
       FROM portfolio_favorites pf
       JOIN portfolio p ON pf.portfolio_id = p.id
       JOIN users u ON p.master_id = u.id
       LEFT JOIN master_profiles mp ON u.id = mp.user_id
       WHERE pf.user_id = $1
       ORDER BY pf.created_at DESC`,
      [userId]
    );

    const favorites = result.rows.map(row => {
      const { id, portfolio_id, user_id, added_at, ...portfolioData } = row;
      return {
        id,
        portfolioId: portfolio_id,
        userId: user_id,
        addedAt: added_at,
        portfolio: portfolioData
      };
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorite portfolios error:', error);
    res.status(500).json({ message: 'Ошибка при получении избранных работ' });
  }
};

// Добавить работу в избранное
export const addPortfolioToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { portfolioId } = req.body;

    if (!portfolioId) {
      return res.status(400).json({ message: 'Не указан ID работы' });
    }

    // Проверяем, существует ли работа
    const portfolioCheck = await pool.query('SELECT id FROM portfolio WHERE id = $1', [portfolioId]);
    if (portfolioCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Работа не найдена' });
    }

    // Проверяем, не добавлена ли уже в избранное
    const favoriteCheck = await pool.query(
      'SELECT id FROM portfolio_favorites WHERE user_id = $1 AND portfolio_id = $2',
      [userId, portfolioId]
    );

    if (favoriteCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Работа уже в избранном' });
    }

    // Добавляем в избранное
    await pool.query(
      'INSERT INTO portfolio_favorites (user_id, portfolio_id) VALUES ($1, $2)',
      [userId, portfolioId]
    );

    res.json({ message: 'Работа добавлена в избранное' });
  } catch (error) {
    console.error('Add portfolio to favorites error:', error);
    res.status(500).json({ message: 'Ошибка при добавлении в избранное' });
  }
};

// Удалить работу из избранного
export const removePortfolioFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { portfolioId } = req.params;

    const result = await pool.query(
      'DELETE FROM portfolio_favorites WHERE user_id = $1 AND portfolio_id = $2 RETURNING *',
      [userId, portfolioId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Работа не найдена в избранном' });
    }

    res.json({ message: 'Работа удалена из избранного' });
  } catch (error) {
    console.error('Remove portfolio from favorites error:', error);
    res.status(500).json({ message: 'Ошибка при удалении из избранного' });
  }
};

// Проверить, в избранном ли работа
export const checkPortfolioFavorite = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { portfolioId } = req.params;

    const result = await pool.query(
      'SELECT id FROM portfolio_favorites WHERE user_id = $1 AND portfolio_id = $2',
      [userId, portfolioId]
    );

    res.json({ isFavorite: result.rows.length > 0 });
  } catch (error) {
    console.error('Check portfolio favorite error:', error);
    res.status(500).json({ message: 'Ошибка при проверке избранного' });
  }
};
