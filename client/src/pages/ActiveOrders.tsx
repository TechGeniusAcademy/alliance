import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import { API_BASE_URL } from '../config/api';
import type { Order } from '../types/order';
import { 
  MdSearch, 
  MdTrendingUp, 
  MdAccessTime, 
  MdCheckCircle,
  MdCalendarToday,
  MdAttachMoney,
  MdPerson,
  MdLocationOn,
  MdTimeline,
  MdLocalShipping,
  MdBuild,
  MdClose,
  MdChat
} from 'react-icons/md';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './ActiveOrders.module.css';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  isWarning: boolean;
  percentage: number;
}

interface OrderWithProgress extends Order {
  timeRemaining: TimeRemaining;
  progressPercentage: number;
}

const ActiveOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProgress | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
    
    // Обновляем время каждую секунду для обратного отсчета
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getActiveOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load active orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAcceptModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowAcceptModal(true);
    setRating(5);
    setReview('');
  };

  const handleCloseAcceptModal = () => {
    setShowAcceptModal(false);
    setSelectedOrderId(null);
    setRating(5);
    setReview('');
  };

  const handleAcceptWork = async () => {
    if (!selectedOrderId) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/chats/order/${selectedOrderId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rating,
          review 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept work');
      }

      handleCloseAcceptModal();
      loadOrders();
    } catch (error) {
      console.error('Error accepting work:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChat = async (orderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { chat } = await response.json();
        navigate('/dashboard/chats', { 
          state: { chatId: chat.id, forceReload: true } 
        });
      } else {
        alert(t('activeOrders.notifications.chatNotFound'));
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      alert(t('activeOrders.notifications.chatError'));
    }
  };

  // Вычисление оставшегося времени
  const calculateTimeRemaining = useCallback((deadline: string, createdAt: string): TimeRemaining => {
    const now = currentTime.getTime();
    const end = new Date(deadline).getTime();
    const start = new Date(createdAt).getTime();
    const total = end - start;
    const remaining = end - now;

    if (remaining <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isUrgent: true,
        isWarning: false,
        percentage: 100,
      };
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const percentage = total > 0 ? ((total - remaining) / total) * 100 : 0;
    const daysRemaining = remaining / (1000 * 60 * 60 * 24);

    return {
      days,
      hours,
      minutes,
      seconds,
      isUrgent: daysRemaining < 2,
      isWarning: daysRemaining < 7 && daysRemaining >= 2,
      percentage: Math.min(percentage, 100),
    };
  }, [currentTime]);

  // Добавление прогресса к заказам
  const ordersWithProgress: OrderWithProgress[] = useMemo(() => {
    return orders.map(order => {
      const timeRemaining = calculateTimeRemaining(
        order.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        order.createdAt
      );
      
      return {
        ...order,
        timeRemaining,
        progressPercentage: timeRemaining.percentage,
      };
    });
    // currentTime нужен, так как используется внутри calculateTimeRemaining
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, currentTime, calculateTimeRemaining]);

  const filteredOrders = ordersWithProgress.filter(order =>
    order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = orders.filter(o => o.status === 'active').length;
  const inProgressCount = orders.filter(o => o.status === 'in_progress').length;
  const urgentCount = ordersWithProgress.filter(o => o.timeRemaining.isUrgent).length;
  const warningCount = ordersWithProgress.filter(o => o.timeRemaining.isWarning).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
  };

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      pending: t('activeOrders.statuses.pending'),
      active: t('activeOrders.statuses.active'),
      in_progress: t('activeOrders.statuses.in_progress'),
      completed: t('activeOrders.statuses.completed'),
      cancelled: t('activeOrders.statuses.cancelled'),
    };
    return statuses[status] || status;
  };

  const renderCountdown = (timeRemaining: TimeRemaining) => {
    const countdownClass = timeRemaining.isUrgent
      ? `${styles.countdown} ${styles.countdownUrgent}`
      : timeRemaining.isWarning
      ? `${styles.countdown} ${styles.countdownWarning}`
      : styles.countdown;

    return (
      <div className={countdownClass}>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{String(timeRemaining.days).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{t('activeOrders.countdown.days')}</span>
        </div>
        <span className={styles.countdownSeparator}>:</span>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{String(timeRemaining.hours).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{t('activeOrders.countdown.hours')}</span>
        </div>
        <span className={styles.countdownSeparator}>:</span>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{String(timeRemaining.minutes).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{t('activeOrders.countdown.minutes')}</span>
        </div>
        <span className={styles.countdownSeparator}>:</span>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{String(timeRemaining.seconds).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{t('activeOrders.countdown.seconds')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <MdTrendingUp className={styles.titleIcon} />
            {t('activeOrders.title')}
          </h1>
          <p className={styles.pageSubtitle}>{t('activeOrders.subtitle')}</p>
        </div>
        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.statCardActive}`}>
            <div className={styles.statValue}>{activeCount}</div>
            <div className={styles.statLabel}>{t('activeOrders.stats.active')}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardInProgress}`}>
            <div className={styles.statValue}>{inProgressCount}</div>
            <div className={styles.statLabel}>{t('activeOrders.stats.inProgress')}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardWarning}`}>
            <div className={styles.statValue}>{warningCount}</div>
            <div className={styles.statLabel}>{t('activeOrders.stats.soonDeadline')}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardUrgent}`}>
            <div className={styles.statValue}>{urgentCount}</div>
            <div className={styles.statLabel}>{t('activeOrders.stats.urgent')}</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('activeOrders.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>{t('activeOrders.loading')}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}></div>
          <h3>{t('activeOrders.emptyState.title')}</h3>
          <p>{t('activeOrders.emptyState.description')}</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className={styles.orderCard}
              onClick={() => setSelectedOrder(order)}
            >
              {/* Заголовок карточки */}
              <div className={styles.cardHeader}>
                <h3 className={styles.orderTitle}>{order.title}</h3>
                <div className={styles.orderMeta}>
                  <div className={styles.metaItem}>
                    <MdPerson size={16} />
                    <span>Клиент #{order.clientId}</span>
                  </div>
                  {order.deliveryAddress && (
                    <div className={styles.metaItem}>
                      <MdLocationOn size={16} />
                      <span>{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>
                <div className={styles.statusBadge}>
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Контент карточки */}
              <div className={styles.cardContent}>
                {/* Обратный отсчет */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4a5568', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdAccessTime size={18} />
                    {t('activeOrders.countdown.title')}
                  </div>
                  {renderCountdown(order.timeRemaining)}
                </div>

                {/* Прогресс бар и круговая диаграмма */}
                <div className={styles.progressSection}>
                  <div className={styles.progressGrid}>
                    {/* Круговая диаграмма */}
                    <div className={styles.circularProgress}>
                      <CircularProgressbar
                        value={order.progressPercentage}
                        text={`${Math.round(order.progressPercentage)}%`}
                        styles={buildStyles({
                          textSize: '24px',
                          pathColor: order.timeRemaining.isUrgent 
                            ? '#ef4444' 
                            : order.timeRemaining.isWarning 
                            ? '#f59e0b' 
                            : '#667eea',
                          textColor: '#2d3748',
                          trailColor: '#e2e8f0',
                          pathTransitionDuration: 0.5,
                        })}
                      />
                    </div>
                    
                    {/* Линейный прогресс */}
                    <div className={styles.linearProgress}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>{t('activeOrders.progress.title')}</span>
                        <span className={styles.progressPercentage}>
                          {Math.round(order.progressPercentage)}%
                        </span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ 
                            width: `${order.progressPercentage}%`,
                            backgroundColor: order.timeRemaining.isUrgent 
                              ? '#ef4444' 
                              : order.timeRemaining.isWarning 
                              ? '#f59e0b' 
                              : '#667eea'
                          }}
                        />
                      </div>
                      <div className={styles.progressStats}>
                        <div className={styles.progressStat}>
                          <span className={styles.statLabel}>{t('activeOrders.progress.elapsed')}</span>
                          <span className={styles.statValue}>{Math.round(order.progressPercentage)}%</span>
                        </div>
                        <div className={styles.progressStat}>
                          <span className={styles.statLabel}>{t('activeOrders.progress.remaining')}</span>
                          <span className={styles.statValue}>{Math.round(100 - order.progressPercentage)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Временная линия */}
                <div className={styles.timeline}>
                  <div className={styles.timelineTitle}>
                    <MdTimeline size={18} />
                    {t('activeOrders.timeline.title')}
                  </div>
                  <div className={styles.timelineItems}>
                    <div className={styles.timelineItem}>
                      <div className={`${styles.timelineIcon} ${styles.completed}`}>
                        <MdCheckCircle size={18} />
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineLabel}>{t('activeOrders.timeline.created')}</div>
                        <div className={styles.timelineDate}>{formatDate(order.createdAt)}</div>
                      </div>
                    </div>
                    <div className={styles.timelineItem}>
                      <div className={`${styles.timelineIcon} ${order.status === 'in_progress' || order.status === 'completed' ? styles.completed : styles.active}`}>
                        <MdBuild size={18} />
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineLabel}>{t('activeOrders.timeline.inProgress')}</div>
                        <div className={styles.timelineDate}>
                          {order.status === 'in_progress' || order.status === 'completed' ? t('activeOrders.timeline.executing') : t('activeOrders.timeline.waiting')}
                        </div>
                      </div>
                    </div>
                    <div className={styles.timelineItem}>
                      <div className={`${styles.timelineIcon} ${order.status === 'completed' ? styles.completed : styles.pending}`}>
                        <MdLocalShipping size={18} />
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineLabel}>{t('activeOrders.timeline.delivery')}</div>
                        <div className={styles.timelineDate}>
                          {order.deadline ? formatDate(order.deadline) : t('activeOrders.timeline.notSpecified')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Информация о заказе */}
                <div className={styles.orderInfo}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <MdAttachMoney size={20} />
                    </div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>{t('activeOrders.info.cost')}</div>
                      <div className={styles.infoValue}>
                        {order.price?.final 
                          ? formatPrice(order.price.final)
                          : `${formatPrice(order.price?.min || 0)} - ${formatPrice(order.price?.max || 0)}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <MdCalendarToday size={20} />
                    </div>
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>{t('activeOrders.info.deadline')}</div>
                      <div className={styles.infoValue}>
                        {order.deadline ? formatDate(order.deadline) : t('activeOrders.timeline.notSpecified')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Теги */}
                {(order.deliveryAddress || order.materials?.length) && (
                  <div className={styles.cardTags}>
                    {order.deliveryAddress && (
                      <div className={styles.tag}>
                        <MdLocalShipping size={14} />
                        {t('activeOrders.tags.delivery')}
                      </div>
                    )}
                    {order.materials && order.materials.length > 0 && (
                      <div className={styles.tag}>
                        <MdBuild size={14} />
                        {t('activeOrders.tags.materials')} {order.materials.length}
                      </div>
                    )}
                  </div>
                )}

                {/* Действия */}
                <div className={styles.cardActions}>
                  {order.status === 'review' && (
                    <button
                      className={`${styles.actionButton} ${styles.successButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAcceptModal(order.id);
                      }}
                    >
                      <MdCheckCircle size={18} />
                      {t('activeOrders.buttons.acceptWork')}
                    </button>
                  )}
                  <button
                    className={`${styles.actionButton} ${styles.chatButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChat(order.id);
                    }}
                  >
                    <MdChat size={18} />
                    {t('activeOrders.buttons.openChat')}
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.primaryButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                  >
                    {t('activeOrders.buttons.details')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно с деталями */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedOrder.title}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedOrder(null)}
              >
                <MdClose size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div>
                  {/* Большая круговая диаграмма прогресса */}
                  <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>
                      <MdTimeline size={20} />
                      {t('activeOrders.modal.progressTitle')}
                    </h3>
                    <div className={styles.modalProgressSection}>
                      <div className={styles.modalCircularProgress}>
                        <CircularProgressbar
                          value={selectedOrder.progressPercentage}
                          text={`${Math.round(selectedOrder.progressPercentage)}%`}
                          styles={buildStyles({
                            textSize: '20px',
                            pathColor: selectedOrder.timeRemaining.isUrgent 
                              ? '#ef4444' 
                              : selectedOrder.timeRemaining.isWarning 
                              ? '#f59e0b' 
                              : '#667eea',
                            textColor: '#2d3748',
                            trailColor: '#e2e8f0',
                            pathTransitionDuration: 0.5,
                          })}
                        />
                      </div>
                      <div className={styles.modalProgressDetails}>
                        <div className={styles.progressDetailItem}>
                          <span className={styles.progressDetailLabel}>{t('activeOrders.progress.elapsed')}:</span>
                          <span className={styles.progressDetailValue}>{Math.round(selectedOrder.progressPercentage)}%</span>
                        </div>
                        <div className={styles.progressDetailItem}>
                          <span className={styles.progressDetailLabel}>{t('activeOrders.progress.remaining')}:</span>
                          <span className={styles.progressDetailValue}>{Math.round(100 - selectedOrder.progressPercentage)}%</span>
                        </div>
                        <div className={styles.progressDetailItem}>
                          <span className={styles.progressDetailLabel}>{t('activeOrders.info.status')}:</span>
                          <span className={styles.progressDetailValue} style={{ 
                            color: selectedOrder.timeRemaining.isUrgent 
                              ? '#ef4444' 
                              : selectedOrder.timeRemaining.isWarning 
                              ? '#f59e0b' 
                              : '#10b981' 
                          }}>
                            {selectedOrder.timeRemaining.isUrgent 
                              ? t('activeOrders.modal.statusUrgent')
                              : selectedOrder.timeRemaining.isWarning 
                              ? t('activeOrders.modal.statusWarning')
                              : t('activeOrders.modal.statusOnTime')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>
                      <MdAccessTime size={20} />
                      {t('activeOrders.modal.countdownTitle')}
                    </h3>
                    {renderCountdown(selectedOrder.timeRemaining)}
                  </div>
                  
                  <div className={styles.detailsSection} style={{ marginTop: '20px' }}>
                    <h3 className={styles.sectionTitle}>{t('activeOrders.modal.description')}</h3>
                    <p style={{ color: '#4a5568', lineHeight: '1.6', margin: 0 }}>
                      {selectedOrder.description || t('activeOrders.modal.descriptionEmpty')}
                    </p>
                  </div>

                  <div className={styles.detailsSection} style={{ marginTop: '20px' }}>
                    <h3 className={styles.sectionTitle}>
                      <MdTimeline size={20} />
                      {t('activeOrders.modal.timelineTitle')}
                    </h3>
                    <div className={styles.timelineItems}>
                      <div className={styles.timelineItem}>
                        <div className={`${styles.timelineIcon} ${styles.completed}`}>
                          <MdCheckCircle size={18} />
                        </div>
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineLabel}>{t('activeOrders.timeline.created')}</div>
                          <div className={styles.timelineDate}>{formatDate(selectedOrder.createdAt)}</div>
                        </div>
                      </div>
                      <div className={styles.timelineItem}>
                        <div className={`${styles.timelineIcon} ${selectedOrder.status === 'in_progress' || selectedOrder.status === 'completed' ? styles.completed : styles.active}`}>
                          <MdBuild size={18} />
                        </div>
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineLabel}>{t('activeOrders.timeline.inProgress')}</div>
                          <div className={styles.timelineDate}>
                            {selectedOrder.status === 'in_progress' || selectedOrder.status === 'completed' ? t('activeOrders.timeline.executing') : t('activeOrders.timeline.waiting')}
                          </div>
                        </div>
                      </div>
                      <div className={styles.timelineItem}>
                        <div className={`${styles.timelineIcon} ${selectedOrder.status === 'completed' ? styles.completed : styles.pending}`}>
                          <MdLocalShipping size={18} />
                        </div>
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineLabel}>{t('activeOrders.timeline.delivery')}</div>
                          <div className={styles.timelineDate}>
                            {selectedOrder.deadline ? formatDate(selectedOrder.deadline) : t('activeOrders.timeline.notSpecified')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className={styles.detailsSection}>
                    <h3 className={styles.sectionTitle}>{t('activeOrders.modal.progressTitle2')}</h3>
                    <div className={styles.circularProgress}>
                      <CircularProgressbar
                        value={selectedOrder.progressPercentage}
                        text={`${Math.round(selectedOrder.progressPercentage)}%`}
                        styles={buildStyles({
                          textSize: '24px',
                          pathColor: selectedOrder.timeRemaining.isUrgent ? '#f56565' : selectedOrder.timeRemaining.isWarning ? '#ed8936' : '#667eea',
                          textColor: '#2d3748',
                          trailColor: '#e2e8f0',
                        })}
                      />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#718096', marginBottom: '4px' }}>
                        {t('activeOrders.info.status')}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
                        {getStatusText(selectedOrder.status)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.detailsSection} style={{ marginTop: '20px' }}>
                    <h3 className={styles.sectionTitle}>{t('activeOrders.modal.infoTitle')}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '4px' }}>{t('activeOrders.info.client')}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                          {t('activeOrders.info.client')} #{selectedOrder.clientId}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '4px' }}>{t('activeOrders.info.cost')}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                          {selectedOrder.price?.final 
                            ? formatPrice(selectedOrder.price.final)
                            : `${formatPrice(selectedOrder.price?.min || 0)} - ${formatPrice(selectedOrder.price?.max || 0)}`
                          }
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '4px' }}>{t('activeOrders.info.deadline')}</div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                          {selectedOrder.deadline ? formatDate(selectedOrder.deadline) : t('activeOrders.timeline.notSpecified')}
                        </div>
                      </div>
                      {selectedOrder.deliveryAddress && (
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '4px' }}>{t('activeOrders.info.deliveryAddress')}</div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                            {selectedOrder.deliveryAddress}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Work Modal */}
      {showAcceptModal && (
        <div className={styles.modalOverlay} onClick={handleCloseAcceptModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{t('activeOrders.acceptModal.title')}</h2>
              <button className={styles.closeButton} onClick={handleCloseAcceptModal}>
                <MdClose size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: '#4a5568', marginBottom: '24px', lineHeight: '1.6' }}>
                {t('activeOrders.acceptModal.description')}
              </p>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('activeOrders.acceptModal.ratingLabel')}</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        fontSize: '32px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: star <= rating ? '#fbbf24' : '#e5e7eb',
                        transition: 'all 0.2s'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('activeOrders.acceptModal.reviewLabel')}</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={t('activeOrders.acceptModal.reviewPlaceholder')}
                  rows={4}
                  className={styles.formTextarea}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div className={styles.modalActions} style={{ marginTop: '24px' }}>
                <button onClick={handleCloseAcceptModal} className={styles.cancelButton}>
                  {t('activeOrders.acceptModal.cancel')}
                </button>
                <button
                  onClick={handleAcceptWork}
                  disabled={submitting}
                  className={styles.submitButtonModal}
                  style={{
                    padding: '12px 28px',
                    background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? t('activeOrders.acceptModal.submitting') : t('activeOrders.acceptModal.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveOrders;
