import { Request, Response } from 'express';
import pool from '../config/database';

// Добавить параметр к модели
export const addModelParameter = async (req: Request, res: Response) => {
  try {
    const { model_id, parameter_type, parameter_name, parameter_value, price_modifier, is_default } = req.body;

    const query = `
      INSERT INTO model_parameters (
        model_id, parameter_type, parameter_name, parameter_value, 
        price_modifier, is_default
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      model_id,
      parameter_type,
      parameter_name,
      parameter_value,
      price_modifier || 0,
      is_default || false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding parameter:', error);
    res.status(500).json({ message: 'Ошибка при добавлении параметра' });
  }
};

// Получить все параметры модели
export const getModelParameters = async (req: Request, res: Response) => {
  try {
    const { model_id } = req.params;

    const query = `
      SELECT * FROM model_parameters 
      WHERE model_id = $1 
      ORDER BY parameter_type, parameter_name
    `;

    const result = await pool.query(query, [model_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching parameters:', error);
    res.status(500).json({ message: 'Ошибка при получении параметров' });
  }
};

// Обновить параметр
export const updateModelParameter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { parameter_name, parameter_value, price_modifier, is_default } = req.body;

    const query = `
      UPDATE model_parameters 
      SET parameter_name = $1, parameter_value = $2, 
          price_modifier = $3, is_default = $4
      WHERE id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [
      parameter_name,
      parameter_value,
      price_modifier,
      is_default,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Параметр не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating parameter:', error);
    res.status(500).json({ message: 'Ошибка при обновлении параметра' });
  }
};

// Удалить параметр
export const deleteModelParameter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM model_parameters WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Параметр не найден' });
    }

    res.json({ message: 'Параметр удалён' });
  } catch (error) {
    console.error('Error deleting parameter:', error);
    res.status(500).json({ message: 'Ошибка при удалении параметра' });
  }
};

// Получить модель с параметрами
export const getModelWithParameters = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Получить модель
    const modelQuery = 'SELECT * FROM furniture_3d_models WHERE id = $1';
    const modelResult = await pool.query(modelQuery, [id]);

    if (modelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Модель не найдена' });
    }

    // Получить параметры
    const paramsQuery = `
      SELECT * FROM model_parameters 
      WHERE model_id = $1 
      ORDER BY parameter_type, parameter_name
    `;
    const paramsResult = await pool.query(paramsQuery, [id]);

    // Группировать параметры по типу
    const groupedParams: { [key: string]: any[] } = {};
    paramsResult.rows.forEach(param => {
      if (!groupedParams[param.parameter_type]) {
        groupedParams[param.parameter_type] = [];
      }
      groupedParams[param.parameter_type].push(param);
    });

    res.json({
      model: modelResult.rows[0],
      parameters: groupedParams
    });
  } catch (error) {
    console.error('Error fetching model with parameters:', error);
    res.status(500).json({ message: 'Ошибка при получении модели' });
  }
};

// Рассчитать итоговую цену
export const calculatePrice = async (req: Request, res: Response) => {
  try {
    const { model_id, selected_parameters } = req.body; // selected_parameters - массив ID параметров

    // Получить базовую цену модели
    const modelQuery = 'SELECT base_price FROM furniture_3d_models WHERE id = $1';
    const modelResult = await pool.query(modelQuery, [model_id]);

    if (modelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Модель не найдена' });
    }

    let totalPrice = parseFloat(modelResult.rows[0].base_price);

    // Добавить цены выбранных параметров
    if (selected_parameters && selected_parameters.length > 0) {
      const paramsQuery = `
        SELECT SUM(price_modifier) as additional_price 
        FROM model_parameters 
        WHERE id = ANY($1)
      `;
      const paramsResult = await pool.query(paramsQuery, [selected_parameters]);
      
      if (paramsResult.rows[0].additional_price) {
        totalPrice += parseFloat(paramsResult.rows[0].additional_price);
      }
    }

    res.json({
      base_price: modelResult.rows[0].base_price,
      total_price: totalPrice
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ message: 'Ошибка при расчёте цены' });
  }
};
