import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import adminRoutes from './routes/adminRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import masterProfileRoutes from './routes/masterProfileRoutes';
import orderRoutes from './routes/orderRoutes';
import bidRoutes from './routes/bidRoutes';
import chatRoutes from './routes/chatRoutes';
import transactionRoutes from './routes/transactionRoutes';
import paymentRoutes from './routes/paymentRoutes';
import mastersRoutes from './routes/masters';
import pool, { initializeDatabase } from './config/database';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173', // Vite dev server
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', adminRoutes);
app.use('/api/master', portfolioRoutes);
app.use('/api/master-profile', masterProfileRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/masters', mastersRoutes);

// Проверка подключения к базе данных
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'OK', message: 'Database connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});

// WebSocket для реального времени
io.on('connection', (socket) => {
  console.log('✅ Пользователь подключился:', socket.id);

  // Присоединиться к комнате чата
  socket.on('joinChat', (chatId: number) => {
    socket.join(`chat_${chatId}`);
    console.log(`Пользователь ${socket.id} присоединился к чату ${chatId}`);
  });

  // Покинуть комнату чата
  socket.on('leaveChat', (chatId: number) => {
    socket.leave(`chat_${chatId}`);
    console.log(`Пользователь ${socket.id} покинул чат ${chatId}`);
  });

  // Новое сообщение
  socket.on('sendMessage', async (data: { chatId: number; message: any }) => {
    // Отправляем сообщение всем в комнате чата (включая отправителя)
    io.to(`chat_${data.chatId}`).emit('newMessage', data.message);
    console.log(`Новое сообщение в чате ${data.chatId}`);
  });

  // Обновление статуса заказа
  socket.on('orderStatusChanged', async (data: { chatId: number; orderStatus: string }) => {
    // Отправляем обновление статуса всем в комнате чата
    io.to(`chat_${data.chatId}`).emit('orderStatusUpdated', data.orderStatus);
    console.log(`Статус заказа изменен в чате ${data.chatId}: ${data.orderStatus}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Пользователь отключился:', socket.id);
  });
});

// Экспортируем io для использования в контроллерах
export { io };

// Инициализация базы данных и запуск сервера
const startServer = async () => {
  try {
    // Инициализируем базу данных
    await initializeDatabase();
    
    // Запускаем сервер (используем httpServer вместо app)
    httpServer.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
      console.log(`🔌 WebSocket готов`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();
