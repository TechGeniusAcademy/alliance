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
import commissionRoutes from './routes/commissionRoutes';
import walletRoutes from './routes/walletRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import incomeRoutes from './routes/incomeRoutes';
import notificationsRoutes from './routes/notificationsRoutes';
import statisticsRoutes from './routes/statisticsRoutes';
import clientsRoutes from './routes/clientsRoutes';
import settingsRoutes from './routes/settingsRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import portfolioFavoriteRoutes from './routes/portfolioFavoriteRoutes';
import reviewRoutes from './routes/reviewRoutes';
import aiRoutes from './routes/ai';
import furniture3DRoutes from './routes/furniture3DRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import furnitureCostRoutes from './routes/furnitureCostRoutes';
import pool, { initializeDatabase } from './config/database';
import whatsappService from './services/whatsappService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Разрешаем все источники для локальной сети
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Разрешаем все источники для локальной сети
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/commissions', commissionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/portfolio-favorites', portfolioFavoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/furniture-3d', furniture3DRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/furniture-cost', furnitureCostRoutes);

// Статическая папка для файлов 3D моделей
app.use('/uploads', express.static('uploads'));

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
    // console.log(`Пользователь ${socket.id} присоединился к чату ${chatId}`);
  });

  // Покинуть комнату чата
  socket.on('leaveChat', (chatId: number) => {
    socket.leave(`chat_${chatId}`);
    // console.log(`Пользователь ${socket.id} покинул чат ${chatId}`);
  });

  // Новое сообщение
  socket.on('sendMessage', async (data: { chatId: number; message: any }) => {
    // Отправляем сообщение всем в комнате чата (включая отправителя)
    io.to(`chat_${data.chatId}`).emit('newMessage', data.message);
    // console.log(`Новое сообщение в чате ${data.chatId}`);
  });

  // Отметить сообщения как прочитанные
  socket.on('messagesRead', (data: { chatId: number }) => {
    // Отправляем уведомление всем в комнате чата, что сообщения прочитаны
    io.to(`chat_${data.chatId}`).emit('messagesRead', { chatId: data.chatId });
    console.log(`Сообщения прочитаны в чате ${data.chatId}`);
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
    
    // Инициализируем WhatsApp сервис (уже инициализируется при импорте)
    console.log('📱 WhatsApp сервис инициализирован');
    console.log(' Если это первый запуск, отсканируйте QR код в WhatsApp');
    
    // Запускаем сервер (используем httpServer вместо app)
    // Слушаем на 0.0.0.0 для доступа по локальной сети
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
      console.log(`🌐 Доступ по сети: http://192.168.0.10:${PORT}`);
      console.log(`🔌 WebSocket готов на ws://192.168.0.10:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();
