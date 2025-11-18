import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdChat, MdClose } from 'react-icons/md';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../config/api';
import chatService from '../services/chatService';
import styles from './ChatNotification.module.css';

interface NotificationData {
  chatId: number;
  senderName: string;
  message: string;
}

const ChatNotification = () => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const socketRef = useRef<Socket | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Создаем WebSocket соединение
    socketRef.current = io(WS_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketRef.current.on('connect', () => {
      console.log('✅ ChatNotification WebSocket подключен');
      // Загружаем чаты и присоединяемся к их комнатам
      loadChatsAndJoinRooms();
    });

    // Слушаем новые сообщения
    socketRef.current.on('newMessage', (message: any) => {
      console.log('📩 ChatNotification получил новое сообщение:', message);
      
      // Показываем уведомление только если НЕ на странице чатов
      const isChatPage = location.pathname.includes('/chats');
      const currentUserId = getCurrentUserId();
      
      if (!isChatPage && message.sender_id !== currentUserId) {
        // Очищаем предыдущий таймаут если есть
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
        }

        setNotification({
          chatId: message.chat_id,
          senderName: message.sender_name,
          message: message.message
        });

        // Вибрация на мобильных устройствах (если поддерживается)
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }

        // Автоматически скрываем через 6 секунд
        notificationTimeoutRef.current = setTimeout(() => {
          setNotification(null);
        }, 6000);
      }
    });

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [location.pathname]);

  const loadChatsAndJoinRooms = async () => {
    try {
      const chats = await chatService.getMyChats();
      // Присоединяемся ко всем чатам пользователя
      chats.forEach(chat => {
        socketRef.current?.emit('joinChat', chat.id);
        console.log(`Присоединились к чату ${chat.id}`);
      });
    } catch (error) {
      console.error('Failed to load chats for notifications:', error);
    }
  };

  const getCurrentUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return Number(user.id);
      } catch {
        return 0;
      }
    }
    return 0;
  };

  const handleClick = () => {
    const userRole = localStorage.getItem('userRole');
    const basePath = userRole === 'master' ? '/master' : '/dashboard';
    navigate(`${basePath}/chats`);
    setNotification(null);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <div className={styles.notification} onClick={handleClick}>
      <div className={styles.icon}>
        <MdChat size={24} />
      </div>
      <div className={styles.content}>
        <div className={styles.sender}>{notification.senderName}</div>
        <div className={styles.message}>
          {notification.message.length > 50 
            ? notification.message.substring(0, 50) + '...' 
            : notification.message}
        </div>
      </div>
      <button className={styles.closeBtn} onClick={handleClose}>
        <MdClose size={20} />
      </button>
    </div>
  );
};

export default ChatNotification;
