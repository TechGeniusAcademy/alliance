import { useState, useEffect, useRef, memo, useCallback, useMemo, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { MdChat, MdSearch, MdSend, MdAttachFile, MdShoppingCart } from 'react-icons/md';
import { io, Socket } from 'socket.io-client';
import chatService, { type Chat, type Message } from '../../services/chatService';
import Toast, { type ToastType } from '../../components/Toast';
import ChatRulesModal from '../../components/ChatRulesModal';
import SelectOrderModal from '../../components/SelectOrderModal';
import chatStyles from '../Chats.module.css';
import { WS_URL } from '../../config/api';

// Стили вынесены наружу для предотвращения пересоздания объектов
const avatarPlaceholderStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '14px',
  fontWeight: 'bold'
} as const;

// Мемоизированный компонент сообщения для оптимизации рендеринга
const ChatMessage = memo(({ msg, isMyMessage }: { msg: Message; isMyMessage: boolean }) => {
  return (
    <div
      className={`${chatStyles.message} ${isMyMessage ? chatStyles.myMessage : chatStyles.theirMessage}`}
    >
      {!isMyMessage && (
        <div className={chatStyles.messageAvatar}>
          {msg.sender_photo ? (
            <img src={msg.sender_photo} alt={msg.sender_name} />
          ) : (
            <div style={avatarPlaceholderStyle}>
              {msg.sender_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      <div className={chatStyles.messageContent}>
        {!isMyMessage && (
          <span className={chatStyles.messageSender}>{msg.sender_name}</span>
        )}
        <div className={chatStyles.messageBubble}>
          {msg.image_url && (
            <img 
              src={msg.image_url} 
              alt="Shared image" 
              style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '8px', display: 'block' }}
            />
          )}
          <p>{msg.message}</p>
        </div>
        <span className={chatStyles.messageTime}>
          {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

const MasterChats = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [_submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showSelectOrderModal, setShowSelectOrderModal] = useState(false);
  const [activeOrders, _setActiveOrders] = useState<any[]>([]);
  const [loadingOrders, _setLoadingOrders] = useState(false);
  const currentUserId = (() => {
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
  })();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserAtBottomRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  const scrollPositionRef = useRef(0);
  const lastMessageCountRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const pendingUpdateRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);

  // Подключение WebSocket
  useEffect(() => {
    socketRef.current = io(WS_URL);
    
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket подключен (Master)');
    });

    socketRef.current.on('newMessage', (message: Message) => {
      console.log('📩 Получено новое сообщение:', message);
      
      // Обновляем список сообщений если это текущий чат
      if (selectedChat && message.chat_id === selectedChat.id) {
        setMessages(prev => {
          // Проверяем что сообщение еще не добавлено (избегаем дубликатов)
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          const updated = [...prev, message];
          lastMessageCountRef.current = updated.length;
          
          // ВАЖНО: Прокручиваем вниз при получении нового сообщения
          // Используем requestAnimationFrame для гарантии что DOM обновился
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
              }
            });
          });
          
          return updated;
        });
      }

      // Обновляем список чатов - последнее сообщение и время
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.id === message.chat_id) {
            return {
              ...chat,
              last_message: message.message,
              last_message_time: message.created_at,
              // Увеличиваем счетчик непрочитанных, если сообщение не от нас и не в открытом чате
              unread_count: message.sender_id !== currentUserId && (!selectedChat || selectedChat.id !== message.chat_id)
                ? chat.unread_count + 1
                : chat.unread_count
            };
          }
          return chat;
        }).sort((a, b) => {
          // Сортируем по времени последнего сообщения
          const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
          const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
          return timeB - timeA;
        });
      });
    });

    // Обработчик прочтения сообщений
    socketRef.current.on('messagesRead', (data: { chatId: number }) => {
      console.log('✓ Сообщения прочитаны в чате:', data.chatId);
      // Сбрасываем счетчик непрочитанных для этого чата
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === data.chatId ? { ...chat, unread_count: 0 } : chat
        )
      );
    });

    // Обновление статуса заказа
    socketRef.current.on('orderStatusUpdated', (newStatus: string) => {
      console.log('🔄 Статус заказа обновлен:', newStatus);
      setSelectedChat(prev => {
        if (!prev) return prev;
        return { ...prev, order_status: newStatus };
      });
      // Также обновляем в списке чатов
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat?.id ? { ...chat, order_status: newStatus } : chat
        )
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [selectedChat?.id, currentUserId]);

  // Загружаем список чатов только один раз при монтировании
  useEffect(() => {
    loadChats(true);
    // НЕТ POLLING - список чатов обновится через WebSocket события
  }, [location.pathname]);

  // Обработка навигации с параметрами (открытие конкретного чата)
  useEffect(() => {
    const state = location.state as { chatId?: number; forceReload?: boolean } | null;
    
    // Если есть chatId с forceReload - перезагружаем чаты и затем открываем нужный
    if (state?.chatId && state?.forceReload) {
      const targetChatId = state.chatId; // Сохраняем ID до очистки state
      
      // ВАЖНО: Очищаем state СРАЗУ, чтобы избежать повторного срабатывания useEffect
      window.history.replaceState({}, document.title);
      
      const loadAndSelectChat = async () => {
        try {
          const data = await chatService.getMyChats();
          setChats(data);
          
          // Ищем нужный чат после загрузки
          const chatToOpen = data.find((chat: any) => chat.id === targetChatId);
          if (chatToOpen) {
            setSelectedChat(chatToOpen);
            setShowChatWindow(true);
          } else {
            // Если не нашли - выбираем первый (активный)
            if (data.length > 0) {
              setSelectedChat(data[0]);
            }
          }
        } catch (error) {
          console.error('Ошибка загрузки чатов:', error);
        }
      };
      
      loadAndSelectChat();
      return;
    }
    
    // Если есть chatId без forceReload - открываем из существующего списка
    if (state?.chatId && chats.length > 0) {
      const chatToOpen = chats.find(chat => chat.id === state.chatId);
      if (chatToOpen) {
        setSelectedChat(chatToOpen);
        setShowChatWindow(true);
      }
      // Очищаем state после обработки
      window.history.replaceState({}, document.title);
      return;
    }
  }, [location.state, chats]);

  useEffect(() => {
    if (selectedChat) {
      isInitialLoadRef.current = true;
      loadMessages(selectedChat.id, true);
      
      // Присоединяемся к комнате чата
      socketRef.current?.emit('joinChat', selectedChat.id);
      
      // Отмечаем сообщения как прочитанные
      chatService.markMessagesAsRead(selectedChat.id).then(() => {
        // Отправляем событие о прочтении сообщений через WebSocket
        socketRef.current?.emit('messagesRead', { chatId: selectedChat.id });
      }).catch(err => console.error('Failed to mark messages as read:', err));
      
      return () => {
        // Покидаем комнату при смене чата
        socketRef.current?.emit('leaveChat', selectedChat.id);
      };
    }
  }, [selectedChat]);

  // Синхронная прокрутка ДО отрисовки (useLayoutEffect вместо useEffect)
  useLayoutEffect(() => {
    if (messages.length === 0 || !messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const prevCount = lastMessageCountRef.current;
    const newCount = messages.length;
    
    // КРИТИЧНО: запускаем только если количество изменилось
    if (prevCount === newCount && !isInitialLoadRef.current) {
      return; // Нет изменений - ничего не делаем
    }
    
    if (isInitialLoadRef.current) {
      // Первая загрузка - мгновенно вниз БЕЗ requestAnimationFrame
      container.scrollTop = container.scrollHeight;
      isInitialLoadRef.current = false;
      lastMessageCountRef.current = newCount;
    } else if (newCount > prevCount) {
      // Есть новые сообщения
      if (isUserAtBottomRef.current || scrollPositionRef.current === -1) {
        // Синхронная прокрутка - происходит ДО отрисовки на экране
        container.scrollTop = container.scrollHeight;
      }
      // Сбрасываем флаги
      scrollPositionRef.current = 0;
      lastMessageCountRef.current = newCount;
    }
  }, [messages]);

  // Отслеживание позиции скролла
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      isUserAtBottomRef.current = isAtBottom;
    }
  };

  const loadChats = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await chatService.getMyChats();
      if (!data || !Array.isArray(data)) {
        setChats([]);
        return;
      }
      setChats(data);
      
      if (data.length > 0) {
        // Если нет выбранного чата - выбираем первый
        if (!selectedChat) {
          setSelectedChat(data[0]);
        } else {
          // Если текущий чат завершен, а есть активные - переключаемся на первый активный
          const currentChatStillExists = data.find(c => c.id === selectedChat.id);
          
          if (currentChatStillExists) {
            // Обновляем данные текущего чата (статус мог измениться)
            setSelectedChat(currentChatStillExists);
          } else {
            // Если текущего чата нет в списке - выбираем первый
            setSelectedChat(data[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      setChats([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const loadMessages = async (chatId: number, showLoader = true) => {
    try {
      // Throttling: не обновляем чаще чем раз в 100мс (кроме первой загрузки)
      const now = Date.now();
      if (!showLoader && !isInitialLoadRef.current) {
        if (now - lastUpdateTimeRef.current < 100) {
          if (!pendingUpdateRef.current) {
            pendingUpdateRef.current = true;
            setTimeout(() => {
              pendingUpdateRef.current = false;
              loadMessages(chatId, false);
            }, 100);
          }
          return;
        }
      }
      lastUpdateTimeRef.current = now;
      
      if (showLoader) setLoadingMessages(true);
      
      const data = await chatService.getChatMessages(chatId);
      
      // Радикальная оптимизация: не обновляем state если ничего не изменилось
      setMessages(prevMessages => {
        // Первая загрузка
        if (prevMessages.length === 0) {
          lastMessageCountRef.current = data.length;
          return data;
        }
        
        // Быстрая проверка: количество сообщений
        if (prevMessages.length !== data.length) {
          lastMessageCountRef.current = data.length;
          return data;
        }
        
        // Проверяем только последнее сообщение (самая частая ситуация)
        const prevLastId = prevMessages[prevMessages.length - 1]?.id;
        const newLastId = data[data.length - 1]?.id;
        
        // Если ID последнего сообщения совпадает - НЕ обновляем (возвращаем ту же ссылку)
        if (prevLastId === newLastId) {
          return prevMessages; // React не перерисует!
        }
        
        lastMessageCountRef.current = data.length;
        return data;
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  };

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(chat => {
      const participantName = chat.customer_id === currentUserId ? chat.master_name : chat.customer_name;
      return participantName.toLowerCase().includes(query) ||
        chat.order_title.toLowerCase().includes(query);
    });
  }, [chats, searchQuery, currentUserId]);

  const unreadCount = Array.isArray(chats) ? chats.reduce((sum, chat) => sum + chat.unread_count, 0) : 0;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const handleAcceptRules = async () => {
    if (!selectedChat) return;
    
    try {
      const updatedChat = await chatService.acceptChatRules(selectedChat.id);
      
      // Обновляем чат в списке
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, ...updatedChat }
            : chat
        )
      );
      
      // Обновляем выбранный чат
      setSelectedChat(prev => prev ? { ...prev, ...updatedChat } : null);
      
      setShowRulesModal(false);
      setToast({ message: 'Правила приняты. Можете начать общение!', type: 'success' });
    } catch (error) {
      console.error('Failed to accept rules:', error);
      setToast({ message: 'Ошибка при принятии правил', type: 'error' });
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    // Проверяем принятие правил перед отправкой
    if (!selectedChat.master_accepted_rules) {
      setShowRulesModal(true);
      return;
    }
    
    const messageText = newMessage;
    setNewMessage(''); // Сразу очищаем поле
    
    try {
      // Отправляем на сервер
      await chatService.sendMessage(selectedChat.id, messageText);
      
      // Получаем обновленный список сообщений (включая новое с правильным ID)
      const data = await chatService.getChatMessages(selectedChat.id);
      
      // Отправляем через WebSocket всем участникам чата
      const newMsg = data[data.length - 1]; // Последнее сообщение
      socketRef.current?.emit('sendMessage', {
        chatId: selectedChat.id,
        message: newMsg
      });
      
      // Обновляем локальное состояние
      setMessages(data);
      lastMessageCountRef.current = data.length;
      
      // ВАЖНО: Прокручиваем вниз после отправки своего сообщения
      // Двойной requestAnimationFrame гарантирует что DOM полностью обновился
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        });
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setToast({ message: 'Ошибка при отправке сообщения', type: 'error' });
    }
  }, [newMessage, selectedChat]);

  // const _handleSubmitForReview = async () => {
  //   if (!selectedChat) return;
    
  //   try {
  //     // Определяем ID клиента
  //     const customerId = selectedChat.customer_id === currentUserId 
  //       ? selectedChat.master_id 
  //       : selectedChat.customer_id;
      
  //     // Проверяем активные заказы с этим клиентом
  //     setLoadingOrders(true);
  //     const orders = await chatService.getActiveOrdersWithUser(customerId, 'customer');
  //     setLoadingOrders(false);
      
  //     if (orders.length > 1) {
  //       // Несколько заказов - показываем модальное окно
  //       setActiveOrders(orders);
  //       setShowSelectOrderModal(true);
  //       return;
  //     }
      
  //     // Один заказ - продолжаем как обычно
  //     await handleActualSubmitForReview(selectedChat.order_id);
  //   } catch (error) {
  //     console.error('Failed to load active orders:', error);
  //     setLoadingOrders(false);
  //     // Если ошибка - продолжаем с текущим заказом
  //     if (selectedChat.order_id) {
  //       await handleActualSubmitForReview(selectedChat.order_id);
  //     }
  //   }
  // };

  const handleSelectOrder = async (orderId: number) => {
    setShowSelectOrderModal(false);
    await handleActualSubmitForReview(orderId);
  };

  const handleActualSubmitForReview = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите отправить работу на оценку клиенту?')) {
      return;
    }

    try {
      setSubmitting(true);
      await chatService.submitForReview(orderId);
      
      if (!selectedChat) return;
      
      // Отправляем событие через WebSocket о смене статуса
      socketRef.current?.emit('orderStatusChanged', {
        chatId: selectedChat.id,
        orderStatus: 'pending_review'
      });
      
      setToast({ message: 'Работа отправлена на оценку! Ожидайте решения клиента.', type: 'success' });
      
      // Обновляем локальное состояние
      setSelectedChat({ ...selectedChat, order_status: 'pending_review' });
      loadChats(false);
      loadMessages(selectedChat.id, false);
    } catch (error) {
      console.error('Failed to submit for review:', error);
      setToast({ message: 'Ошибка при отправке на оценку', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getParticipantName = (chat: Chat) => {
    return chat.customer_id === currentUserId ? chat.master_name : chat.customer_name;
  };

  const getParticipantPhoto = (chat: Chat) => {
    return chat.customer_id === currentUserId ? chat.master_photo : chat.customer_photo;
  };

  if (loading) {
    return (
      <div className={chatStyles.pageContainer}>
        <div className={chatStyles.loader}></div>
      </div>
    );
  }

  return (
    <div className={chatStyles.chatsContainer}>
      {/* Sidebar with chat list */}
      <div className={`${chatStyles.chatsSidebar} ${showChatWindow ? chatStyles.hideOnMobile : ''}`}>
        <div className={chatStyles.chatsHeader}>
          <h2>Сообщения</h2>
          {unreadCount > 0 && (
            <span className={chatStyles.unreadBadge}>{unreadCount}</span>
          )}
        </div>

        <div className={chatStyles.searchBox}>
          <MdSearch className={chatStyles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={chatStyles.chatsList}>
          {filteredChats.length === 0 ? (
            <div className={chatStyles.emptyChats}>
              <MdChat size={48} />
              <p>Нет чатов</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const participantName = getParticipantName(chat);
              const participantPhoto = getParticipantPhoto(chat);
              
              return (
                <div
                  key={chat.id}
                  className={`${chatStyles.chatItem} ${selectedChat?.id === chat.id ? chatStyles.active : ''}`}
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowChatWindow(true);
                    
                    // Проверяем, принял ли мастер правила
                    if (!chat.master_accepted_rules) {
                      setShowRulesModal(true);
                    }
                  }}
                >
                  <div className={chatStyles.chatAvatar}>
                    {participantPhoto ? (
                      <img src={participantPhoto} alt={participantName} />
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        {participantName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={chatStyles.chatInfo}>
                    <div className={chatStyles.chatTop}>
                      <span className={chatStyles.chatName}>{participantName}</span>
                      {chat.last_message_time && (
                        <span className={chatStyles.chatTime}>{formatTime(chat.last_message_time)}</span>
                      )}
                    </div>
                    <div className={chatStyles.chatBottom}>
                      <span className={chatStyles.lastMessage}>{chat.last_message || 'Нет сообщений'}</span>
                      {chat.unread_count > 0 && (
                        <span className={chatStyles.chatUnread}>{chat.unread_count}</span>
                      )}
                    </div>
                    {chat.order_title && (
                      <div className={chatStyles.chatOrder}>
                        <MdShoppingCart size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {chat.order_title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat window */}
      <div className={`${chatStyles.chatWindow} ${showChatWindow ? chatStyles.showOnMobile : ''}`}>
        {selectedChat ? (
          <>
            <div className={chatStyles.chatWindowHeader}>
              <button 
                className={chatStyles.backButton}
                onClick={() => setShowChatWindow(false)}
              >
                ←
              </button>
              <div className={chatStyles.chatAvatar}>
                {getParticipantPhoto(selectedChat) ? (
                  <img src={getParticipantPhoto(selectedChat)!} alt={getParticipantName(selectedChat)} />
                ) : (
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {getParticipantName(selectedChat).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className={chatStyles.chatWindowInfo}>
                <h3>{getParticipantName(selectedChat)}</h3>
                {selectedChat.order_title && (
                  <p>Заказ: {selectedChat.order_title}</p>
                )}
              </div>
              {selectedChat.order_status === 'completed' && (
                <div className={chatStyles.statusBadge} style={{
                  background: '#d1fae5',
                  color: '#065f46'
                }}>
                  ✓ Работа принята
                </div>
              )}
            </div>

            <div className={chatStyles.messagesContainer} ref={messagesContainerRef} onScroll={handleScroll}>
              {loadingMessages ? (
                <div className={chatStyles.messagesPlaceholder}>
                  <div className={chatStyles.loader}></div>
                </div>
              ) : messages.length === 0 ? (
                <div className={chatStyles.messagesPlaceholder}>
                  <MdChat size={64} />
                  <p>Нет сообщений. Начните общение!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage 
                      key={msg.id} 
                      msg={msg} 
                      isMyMessage={Number(msg.sender_id) === currentUserId}
                    />
                  ))}
                </>
              )}
            </div>

            <div className={chatStyles.chatInput}>
              <button 
                className={chatStyles.attachButton}
                disabled={selectedChat.order_status === 'completed'}
              >
                <MdAttachFile size={24} />
              </button>
              <input
                type="text"
                placeholder={selectedChat.order_status === 'completed' ? 'Заказ завершен' : 'Написать сообщение...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && selectedChat.order_status !== 'completed' && handleSendMessage()}
                disabled={selectedChat.order_status === 'completed'}
              />
              <button 
                className={chatStyles.sendButton}
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || selectedChat.order_status === 'completed'}
              >
                <MdSend size={24} />
              </button>
            </div>
          </>
        ) : (
          <div className={chatStyles.noChatSelected}>
            <MdChat size={80} />
            <h3>Выберите чат</h3>
            <p>Начните общение с клиентами</p>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {showRulesModal && (
        <ChatRulesModal
          onAccept={handleAcceptRules}
          userType="master"
        />
      )}

      {showSelectOrderModal && (
        <SelectOrderModal
          orders={activeOrders}
          onSelect={handleSelectOrder}
          onClose={() => setShowSelectOrderModal(false)}
          title={t('selectOrder.title')}
          subtitle={t('selectOrder.forSubmit')}
          loading={loadingOrders}
        />
      )}
    </div>
  );
};

export default MasterChats;
