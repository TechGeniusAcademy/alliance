import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import pool from '../config/database';

// Регистрация пользователя
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, lastName, birthDate, iin, captchaToken } = req.body;

  try {
    // Проверка Google reCAPTCHA
    if (!captchaToken) {
      return res.status(400).json({ message: 'Необходимо пройти проверку CAPTCHA' });
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: recaptchaSecret,
          response: captchaToken
        }
      }
    );

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ message: 'Проверка CAPTCHA не пройдена' });
    }

    // Проверка существования пользователя
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Проверка уникальности ИИН для мастеров
    if (role === 'master' && iin) {
      const iinExists = await pool.query(
        'SELECT * FROM users WHERE iin = $1',
        [iin]
      );

      if (iinExists.rows.length > 0) {
        return res.status(400).json({ message: 'Пользователь с таким ИИН уже существует' });
      }
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Определяем роль пользователя
    const userRole = role === 'master' ? 'master' : 'customer';

    // Создание пользователя (с дополнительными полями для мастеров)
    let insertQuery: string;
    let insertValues: any[];

    if (userRole === 'master' && lastName && birthDate && iin) {
      insertQuery = `
        INSERT INTO users (name, last_name, email, password_hash, role, birth_date, iin) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, name, last_name, email, role, birth_date, iin, created_at
      `;
      insertValues = [name, lastName, email, hashedPassword, userRole, birthDate, iin];
    } else {
      insertQuery = `
        INSERT INTO users (name, email, password_hash, role) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, role, created_at
      `;
      insertValues = [name, email, hashedPassword, userRole];
    }

    const newUser = await pool.query(insertQuery, insertValues);

    // Создание токена
    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email, role: userRole },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    // Формируем ответ
    const userResponse: any = {
      id: newUser.rows[0].id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: userRole,
    };

    if (userRole === 'master') {
      userResponse.lastName = newUser.rows[0].last_name;
      userResponse.birthDate = newUser.rows[0].birth_date;
      userResponse.iin = newUser.rows[0].iin;
    }

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
};

// Вход пользователя
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Поиск пользователя
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Создание токена
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role || 'user' },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role || 'user',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
};
