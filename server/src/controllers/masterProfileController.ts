import { Request, Response } from 'express';
import pool from '../config/database';

// Получить профиль мастера
export const getMasterProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT mp.*, u.name, u.email, u.phone, u.address, u.profile_photo
       FROM master_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Если профиля нет, создаем пустой с начальными значениями
      const createResult = await pool.query(
        `INSERT INTO master_profiles (user_id, rating, reviews_count, completed_orders) 
         VALUES ($1, 0.00, 0, 0) RETURNING *`,
        [userId]
      );
      
      const userInfo = await pool.query(
        'SELECT name, email, phone, address, profile_photo FROM users WHERE id = $1',
        [userId]
      );

      return res.json({
        profile: {
          ...createResult.rows[0],
          ...userInfo.rows[0],
        },
      });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get master profile error:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
};

// Обновить профиль мастера
export const updateMasterProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const {
      // Основные данные пользователя
      name,
      phone,
      address,
      profile_photo,
      
      // Данные профиля мастера
      company_name,
      bio,
      specializations,
      years_of_experience,
      education,
      certifications,
      work_schedule,
      min_order_amount,
      max_projects_simultaneously,
      services_offered,
      materials_work_with,
      equipment,
      workspace_size,
      has_showroom,
      showroom_address,
      payment_methods,
      warranty_terms,
      return_policy,
      website,
      instagram,
      facebook,
      telegram,
      whatsapp,
      languages,
      delivery_available,
      assembly_available,
      design_services,
      consultation_free,
    } = req.body;

    // Обновляем основные данные пользователя
    await pool.query(
      `UPDATE users 
       SET name = $1, phone = $2, address = $3, profile_photo = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [name, phone, address, profile_photo, userId]
    );

    // Проверяем, есть ли профиль мастера
    const profileCheck = await pool.query(
      'SELECT id FROM master_profiles WHERE user_id = $1',
      [userId]
    );

    let profileResult;

    if (profileCheck.rows.length === 0) {
      // Создаем новый профиль
      profileResult = await pool.query(
        `INSERT INTO master_profiles (
          user_id, company_name, bio, specializations, years_of_experience,
          education, certifications, work_schedule, min_order_amount,
          max_projects_simultaneously, services_offered, materials_work_with,
          equipment, workspace_size, has_showroom, showroom_address,
          payment_methods, warranty_terms, return_policy, website,
          instagram, facebook, telegram, whatsapp, languages,
          delivery_available, assembly_available, design_services, consultation_free
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        ) RETURNING *`,
        [
          userId, company_name, bio, specializations, years_of_experience,
          education, certifications, work_schedule, min_order_amount,
          max_projects_simultaneously, services_offered, materials_work_with,
          equipment, workspace_size, has_showroom, showroom_address,
          payment_methods, warranty_terms, return_policy, website,
          instagram, facebook, telegram, whatsapp, languages,
          delivery_available, assembly_available, design_services, consultation_free,
        ]
      );
    } else {
      // Обновляем существующий профиль
      profileResult = await pool.query(
        `UPDATE master_profiles SET
          company_name = $1, bio = $2, specializations = $3, years_of_experience = $4,
          education = $5, certifications = $6, work_schedule = $7, min_order_amount = $8,
          max_projects_simultaneously = $9, services_offered = $10, materials_work_with = $11,
          equipment = $12, workspace_size = $13, has_showroom = $14, showroom_address = $15,
          payment_methods = $16, warranty_terms = $17, return_policy = $18, website = $19,
          instagram = $20, facebook = $21, telegram = $22, whatsapp = $23, languages = $24,
          delivery_available = $25, assembly_available = $26, design_services = $27,
          consultation_free = $28, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $29
        RETURNING *`,
        [
          company_name, bio, specializations, years_of_experience,
          education, certifications, work_schedule, min_order_amount,
          max_projects_simultaneously, services_offered, materials_work_with,
          equipment, workspace_size, has_showroom, showroom_address,
          payment_methods, warranty_terms, return_policy, website,
          instagram, facebook, telegram, whatsapp, languages,
          delivery_available, assembly_available, design_services, consultation_free,
          userId,
        ]
      );
    }

    res.json({
      message: 'Профиль успешно обновлен',
      profile: profileResult.rows[0],
    });
  } catch (error) {
    console.error('Update master profile error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
};

// Получить публичный профиль мастера (для клиентов)
export const getPublicMasterProfile = async (req: Request, res: Response) => {
  try {
    const { masterId } = req.params;

    const result = await pool.query(
      `SELECT 
        mp.*,
        u.name, u.email, u.address, u.profile_photo, u.created_at as user_created_at,
        (SELECT COUNT(*) FROM portfolio WHERE master_id = u.id AND is_public = true) as portfolio_count
       FROM master_profiles mp
       JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = $1 AND u.role = 'master' AND u.active = true`,
      [masterId]
    );

    if (result.rows.length === 0) {
      // Если профиля master_profiles нет, возвращаем базовую информацию из users
      const userResult = await pool.query(
        `SELECT 
          u.id, u.name, u.email, u.address, u.profile_photo, u.created_at as user_created_at,
          (SELECT COUNT(*) FROM portfolio WHERE master_id = u.id AND is_public = true) as portfolio_count
         FROM users u
         WHERE u.id = $1 AND u.role = 'master' AND u.active = true`,
        [masterId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'Мастер не найден' });
      }

      return res.json({
        profile: {
          ...userResult.rows[0],
          bio: null,
          specializations: [],
          years_of_experience: 0,
          rating: 0,
          reviews_count: 0,
          completed_orders: 0,
        },
      });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get public master profile error:', error);
    res.status(500).json({ message: 'Ошибка при получении профиля мастера' });
  }
};
