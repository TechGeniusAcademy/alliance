import { Request, Response } from 'express';
import pool from '../config/database';

// Получить всех мастеров (публичная информация без контактов)
export const getAllPublicMasters = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        mp.specializations[1] as specialty,
        mp.years_of_experience as experience,
        u.profile_photo as "profilePicture",
        mp.bio,
        COALESCE(mp.rating, 5.0) as rating,
        COALESCE(mp.completed_orders, 0) as "completedOrders",
        CASE WHEN mp.certifications IS NOT NULL AND array_length(mp.certifications, 1) > 0 THEN true ELSE false END as verified,
        mp.specializations as skills
      FROM users u
      LEFT JOIN master_profiles mp ON u.id = mp.user_id
      WHERE u.role = 'master'
      ORDER BY rating DESC, "completedOrders" DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public masters:', error);
    res.status(500).json({ error: 'Failed to fetch masters' });
  }
};

// Получить профиль мастера (публичная информация)
export const getPublicMasterProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        u.id,
        u.name,
        mp.specializations[1] as specialty,
        mp.years_of_experience as experience,
        u.profile_photo as "profilePicture",
        mp.bio,
        COALESCE(mp.rating, 5.0) as rating,
        COALESCE(mp.completed_orders, 0) as "completedOrders",
        CASE WHEN mp.certifications IS NOT NULL AND array_length(mp.certifications, 1) > 0 THEN true ELSE false END as verified,
        mp.specializations as skills
      FROM users u
      LEFT JOIN master_profiles mp ON u.id = mp.user_id
      WHERE u.role = 'master' AND u.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Master not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching public master profile:', error);
    res.status(500).json({ error: 'Failed to fetch master profile' });
  }
};
