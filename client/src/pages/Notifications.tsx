import { useState, useEffect } from 'react';
import { MdNotifications, MdCheckCircle, MdDelete } from 'react-icons/md';
import { appService } from '../services/appService';
import type { Notification } from '../types/app';
import styles from './Notifications.module.css';

import { 
  MdShoppingCart, 
  MdPayment as MdPaymentIcon, 
  MdLocalShipping as MdDeliveryIcon, 
  MdMessage, 
  MdInfo, 
  MdLocalOffer as MdPromoIcon 
} from 'react-icons/md';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await appService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    await appService.markNotificationAsRead(id);
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = async () => {
    await appService.markAllNotificationsAsRead();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order': return '#3b82f6';
      case 'payment': return '#10b981';
      case 'delivery': return '#f59e0b';
      case 'message': return '#8b5cf6';
      case 'system': return '#6b7280';
      case 'promo': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <MdShoppingCart size={24} />;
      case 'payment': return <MdPaymentIcon size={24} />;
      case 'delivery': return <MdDeliveryIcon size={24} />;
      case 'message': return <MdMessage size={24} />;
      case 'system': return <MdInfo size={24} />;
      case 'promo': return <MdPromoIcon size={24} />;
      default: return <MdInfo size={24} />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>
            <MdNotifications className={styles.titleIcon} />
            Уведомления
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button 
              className={styles.markAllButton}
              onClick={handleMarkAllAsRead}
            >
              <MdCheckCircle size={20} />
              Отметить все как прочитанные
            </button>
          )}
        </div>

        <div className={styles.filterTabs}>
          <button
            className={filter === 'all' ? styles.active : ''}
            onClick={() => setFilter('all')}
          >
            Все ({notifications.length})
          </button>
          <button
            className={filter === 'unread' ? styles.active : ''}
            onClick={() => setFilter('unread')}
          >
            Непрочитанные ({unreadCount})
          </button>
          <button
            className={filter === 'read' ? styles.active : ''}
            onClick={() => setFilter('read')}
          >
            Прочитанные ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className={styles.emptyState}>
          <MdNotifications size={64} />
          <h3>Нет уведомлений</h3>
          <p>Здесь будут появляться важные уведомления</p>
        </div>
      ) : (
        <div className={styles.notificationsList}>
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.notificationItem} ${!notif.isRead ? styles.unread : ''}`}
            >
              <div 
                className={styles.notificationIcon}
                style={{ backgroundColor: getNotificationColor(notif.type) }}
              >
                {getNotificationIcon(notif.type)}
              </div>
              
              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h3>{notif.title}</h3>
                  <span className={styles.notificationTime}>
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                <p>{notif.message}</p>
                {notif.actionUrl && (
                  <button className={styles.actionButton}>
                    Перейти
                  </button>
                )}
              </div>

              <div className={styles.notificationActions}>
                {!notif.isRead && (
                  <button
                    className={styles.markReadButton}
                    onClick={() => handleMarkAsRead(notif.id)}
                    title="Отметить как прочитанное"
                  >
                    <MdCheckCircle size={20} />
                  </button>
                )}
                <button
                  className={styles.deleteButton}
                  title="Удалить"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
