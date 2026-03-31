import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdNotifications,
  MdCheckCircle,
  MdInfo,
  MdWarning,
  MdError,
  MdDelete,
  MdDoneAll,
  MdFilterList,
  MdRefresh
} from 'react-icons/md';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import Toast, { type ToastType } from '../../components/Toast';
import styles from './MasterNotifications.module.css';

interface Notification {
  id: number;
  user_id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

const MasterNotifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
      setToast({ message: t('masterNotifications.notifications.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error);
      setToast({ message: t('masterNotifications.notifications.markError'), type: 'error' });
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setToast({ message: t('masterNotifications.notifications.markAllSuccess'), type: 'success' });
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error);
      setToast({ message: t('masterNotifications.notifications.markAllError'), type: 'error' });
    }
  };

  const deleteNotification = async (id: number) => {
    if (!confirm(t('masterNotifications.confirmations.deleteOne'))) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.filter(n => n.id !== id));
      setToast({ message: t('masterNotifications.notifications.deleteSuccess'), type: 'success' });
    } catch (error) {
      console.error('Ошибка удаления уведомления:', error);
      setToast({ message: t('masterNotifications.notifications.deleteError'), type: 'error' });
    }
  };

  const deleteAllRead = async () => {
    if (!confirm(t('masterNotifications.confirmations.deleteAllRead'))) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/notifications/read`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(notifications.filter(n => !n.is_read));
      setToast({ message: t('masterNotifications.notifications.deleteAllSuccess'), type: 'success' });
    } catch (error) {
      console.error('Ошибка удаления уведомлений:', error);
      setToast({ message: t('masterNotifications.notifications.deleteAllError'), type: 'error' });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <MdCheckCircle size={24} />;
      case 'warning': return <MdWarning size={24} />;
      case 'error': return <MdError size={24} />;
      default: return <MdInfo size={24} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#e94560';
      default: return '#667eea';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('masterNotifications.timeAgo.justNow');
    if (minutes < 60) return t('masterNotifications.timeAgo.minutesAgo', { count: minutes });
    if (hours < 24) return t('masterNotifications.timeAgo.hoursAgo', { count: hours });
    if (days < 7) return t('masterNotifications.timeAgo.daysAgo', { count: days });
    
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{t('masterNotifications.title')}</h1>
          <p>
            {unreadCount > 0 
              ? t('masterNotifications.unreadCount', { count: unreadCount })
              : t('masterNotifications.allRead')}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={loadNotifications} className={styles.refreshButton} disabled={loading}>
            <MdRefresh size={20} />
            {t('masterNotifications.refresh')}
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className={styles.markAllButton}>
              <MdDoneAll size={20} />
              {t('masterNotifications.markAllRead')}
            </button>
          )}
          {notifications.some(n => n.is_read) && (
            <button onClick={deleteAllRead} className={styles.deleteAllButton}>
              <MdDelete size={20} />
              {t('masterNotifications.deleteAllRead')}
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          <MdFilterList size={18} />
          {t('masterNotifications.filters.all')} ({notifications.length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
          onClick={() => setFilter('unread')}
        >
          <MdNotifications size={18} />
          {t('masterNotifications.filters.unread')} ({unreadCount})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'read' ? styles.active : ''}`}
          onClick={() => setFilter('read')}
        >
          <MdCheckCircle size={18} />
          {t('masterNotifications.filters.read')} ({notifications.length - unreadCount})
        </button>
      </div>

      <div className={styles.notificationsList}>
        {loading ? (
          <div className={styles.loading}>{t('masterNotifications.loading')}</div>
        ) : filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <MdNotifications size={64} />
            <p>{t('masterNotifications.empty.title')}</p>
            <span>
              {filter === 'unread' 
                ? t('masterNotifications.empty.allRead')
                : filter === 'read'
                ? t('masterNotifications.empty.noRead')
                : t('masterNotifications.empty.noNotifications')}
            </span>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`${styles.notificationCard} ${!notification.is_read ? styles.unread : ''}`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div 
                className={styles.notificationIcon}
                style={{ color: getTypeColor(notification.type) }}
              >
                {getTypeIcon(notification.type)}
              </div>

              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h3>{notification.title}</h3>
                  {!notification.is_read && <span className={styles.unreadDot} />}
                </div>
                <p className={styles.notificationMessage}>{notification.message}</p>
                <div className={styles.notificationFooter}>
                  <div className={styles.notificationTime}>
                    {getTypeIcon(notification.type)}
                    <span>{formatDate(notification.created_at)}</span>
                  </div>
                  {notification.link && (
                    <a 
                      href={notification.link} 
                      className={styles.notificationLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t('masterNotifications.goToLink')} →
                    </a>
                  )}
                </div>
              </div>

              <button 
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
              >
                <MdDelete size={20} />
              </button>
            </div>
          ))
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MasterNotifications;
