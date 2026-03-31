import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import chatService from '../services/chatService';
import { WS_URL } from '../config/api';

export const useUnreadChats = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const chats = await chatService.getMyChats();
      if (!chats || !Array.isArray(chats)) {
        setUnreadCount(0);
        return [];
      }
      const total = chats.reduce((sum, chat) => sum + chat.unread_count, 0);
      setUnreadCount(total);
      return chats;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let socket: Socket | null = null;

    const initialize = async () => {
      // Получаем список чатов и считаем непрочитанные
      const chats = await fetchUnreadCount();

      // Подключаемся к WebSocket для получения обновлений в реальном времени
      socket = io(WS_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socket.on('connect', () => {
        console.log('✅ useUnreadChats WebSocket подключен');
        
        // Присоединяемся ко всем чатам пользователя
        if (chats && Array.isArray(chats)) {
          chats.forEach(chat => {
            socket?.emit('joinChat', chat.id);
            console.log(`useUnreadChats присоединился к чату ${chat.id}`);
          });
        }
      });

      // Слушаем новые сообщения
      socket.on('newMessage', (message: any) => {
        console.log('📩 useUnreadChats: новое сообщение', message);
        fetchUnreadCount();
      });

      // Слушаем события прочтения сообщений
      socket.on('messagesRead', (data: { chatId: number }) => {
        console.log('✓ useUnreadChats: сообщения прочитаны в чате', data.chatId);
        fetchUnreadCount();
      });
    };

    initialize();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchUnreadCount]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};
