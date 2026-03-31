import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdLocalShipping, MdCheck, MdTimer, MdAttachMoney, MdPerson, MdSearch, MdTrendingUp, MdChat } from 'react-icons/md';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { orderService } from '../../services/orderService';
import { API_BASE_URL } from '../../config/api';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './MasterActiveOrders.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface WorkStage {
  id: number;
  order_id: number;
  stage_key: string;
  stage_name: string;
  stage_order: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface ActiveOrder {
  id: number;
  title: string;
  description: string;
  status: string;
  delivery_address: string | null;
  delivery_status: string;
  final_price: number;
  deadline: string | null;
  customer_name: string;
  created_at?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isUrgent: boolean;
  isWarning: boolean;
  percentage: number;
}

interface OrderWithProgress extends ActiveOrder {
  timeRemaining: TimeRemaining;
  progressPercentage: number;
}

const MasterActiveOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showShipModal, setShowShipModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProgress | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [workStages, setWorkStages] = useState<WorkStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(false);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadActiveOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate time remaining for a deadline
  const calculateTimeRemaining = (deadline: string | null, createdAt?: string): TimeRemaining => {
    if (!deadline) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: false, isWarning: false, percentage: 0 };
    }

    const now = currentTime;
    const deadlineTime = new Date(deadline).getTime();
    const createdTime = createdAt ? new Date(createdAt).getTime() : now;
    const totalDuration = deadlineTime - createdTime;
    const remaining = deadlineTime - now;

    if (remaining <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isUrgent: true, isWarning: false, percentage: 100 };
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    const isUrgent = days < 2;
    const isWarning = days >= 2 && days < 7;
    const percentage = totalDuration > 0 ? Math.min(100, Math.max(0, ((totalDuration - remaining) / totalDuration) * 100)) : 0;

    return { days, hours, minutes, seconds, isUrgent, isWarning, percentage };
  };

  // Process orders with progress data
  const ordersWithProgress: OrderWithProgress[] = useMemo(() => {
    return orders.map(order => {
      const timeRemaining = calculateTimeRemaining(order.deadline, order.created_at);
      const progressPercentage = timeRemaining.percentage;
      return { ...order, timeRemaining, progressPercentage };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, currentTime]);

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return ordersWithProgress;
    
    const query = searchQuery.toLowerCase();
    return ordersWithProgress.filter(order => 
      order.title.toLowerCase().includes(query) ||
      order.description.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query)
    );
  }, [ordersWithProgress, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeCount = filteredOrders.filter(o => o.delivery_status === 'pending').length;
    const inProgressCount = filteredOrders.filter(o => o.delivery_status === 'shipped').length;
    const warningCount = filteredOrders.filter(o => o.timeRemaining.isWarning).length;
    const urgentCount = filteredOrders.filter(o => o.timeRemaining.isUrgent && o.deadline).length;
    
    return { activeCount, inProgressCount, warningCount, urgentCount };
  }, [filteredOrders]);

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
          <span className={styles.countdownLabel}>{t('masterActiveOrders.countdown.days')}</span>
        </div>
        <span className={styles.countdownSeparator}>:</span>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{String(timeRemaining.hours).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{t('masterActiveOrders.countdown.hours')}</span>
        </div>
        <span className={styles.countdownSeparator}>:</span>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{String(timeRemaining.minutes).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{t('masterActiveOrders.countdown.minutes')}</span>
        </div>
        <span className={styles.countdownSeparator}>:</span>
        <div className={styles.countdownItem}>
          <span className={styles.countdownValue}>{String(timeRemaining.seconds).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{t('masterActiveOrders.countdown.seconds')}</span>
        </div>
      </div>
    );
  };

  const handleOpenChat = async (orderId: number) => {
    try {
      // Получаем информацию о чате для этого заказа
      const response = await fetch(`${API_BASE_URL}/api/chats/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { chat } = await response.json();
        // Навигация к чату с передачей chatId
        navigate('/master-dashboard/chats', { 
          state: { chatId: chat.id, forceReload: true } 
        });
      } else {
        showToast(t('masterActiveOrders.notifications.chatNotFound'), 'error');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      showToast(t('masterActiveOrders.notifications.chatError'), 'error');
    }
  };

  const handleOpenSubmitModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowSubmitModal(true);
  };

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedOrderId(null);
  };

  const handleSubmitForReview = async () => {
    if (!selectedOrderId) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/chats/order/${selectedOrderId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to submit for review');
      }

      showToast(t('masterActiveOrders.notifications.submitSuccess'), 'success');
      handleCloseSubmitModal();
      loadActiveOrders();
    } catch (error) {
      console.error('Error submitting for review:', error);
      showToast(t('masterActiveOrders.notifications.submitError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const loadActiveOrders = async () => {
    try {
      setLoading(true);
      // Получаем все заказы и фильтруем те, где мастер назначен и заказ в работе
      const response = await fetch(`${API_BASE_URL}/api/orders/master/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading active orders:', error);
      showToast(t('masterActiveOrders.notifications.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShipModal = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowShipModal(true);
    setTrackingNumber('');
    setDeliveryNotes('');
  };

  const handleCloseShipModal = () => {
    setShowShipModal(false);
    setSelectedOrderId(null);
    setTrackingNumber('');
    setDeliveryNotes('');
  };

  const handleOpenDetailModal = (order: OrderWithProgress) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    loadWorkStages(order.id);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
    setWorkStages([]);
  };

  const loadWorkStages = async (orderId: number) => {
    try {
      setLoadingStages(true);
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/work-stages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkStages(data.stages || []);
      }
    } catch (error) {
      console.error('Error loading work stages:', error);
    } finally {
      setLoadingStages(false);
    }
  };

  const handleInitializeWorkStages = async (orderId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/work-stages/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkStages(data.stages || []);
        showToast(t('masterActiveOrders.workStages.initializeSuccess'), 'success');
      } else {
        showToast(t('masterActiveOrders.workStages.initializeError'), 'error');
      }
    } catch (error) {
      console.error('Error initializing work stages:', error);
      showToast(t('masterActiveOrders.workStages.initializeError'), 'error');
    }
  };

  const handleToggleStage = async (orderId: number, stageId: number, completed: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/work-stages/${stageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setWorkStages(prev => prev.map(stage => 
          stage.id === stageId ? data.stage : stage
        ));
        showToast(t('masterActiveOrders.workStages.updateSuccess'), 'success');
      } else {
        showToast(t('masterActiveOrders.workStages.updateError'), 'error');
      }
    } catch (error) {
      console.error('Error updating work stage:', error);
      showToast(t('masterActiveOrders.workStages.updateError'), 'error');
    }
  };

  const handleSubmitShipping = async () => {
    if (!selectedOrderId) return;

    try {
      setSubmitting(true);
      await orderService.markAsShipped(selectedOrderId, {
        tracking_number: trackingNumber || undefined,
        delivery_notes: deliveryNotes || undefined,
      });

      showToast(t('masterActiveOrders.notifications.shippingSuccess'), 'success');
      handleCloseShipModal();
      loadActiveOrders();
    } catch (error) {
      console.error('Error marking as shipped:', error);
      showToast(t('masterActiveOrders.notifications.shippingError'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('masterActiveOrders.status.pending');
      case 'shipped': return t('masterActiveOrders.status.shipped');
      case 'delivered': return t('masterActiveOrders.status.delivered');
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'shipped': return '#3b82f6';
      case 'delivered': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className={styles.ordersPage}>
        <div className={styles.loader} />
      </div>
    );
  }

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <MdTrendingUp className={styles.titleIcon} />
            {t('masterActiveOrders.title')}
          </h1>
          <p className={styles.pageSubtitle}>{t('masterActiveOrders.subtitle')}</p>
        </div>
        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.statCardActive}`}>
            <div className={styles.statValue}>{stats.activeCount}</div>
            <div className={styles.statLabel}>{t('masterActiveOrders.stats.active')}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardInProgress}`}>
            <div className={styles.statValue}>{stats.inProgressCount}</div>
            <div className={styles.statLabel}>{t('masterActiveOrders.stats.shipped')}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardWarning}`}>
            <div className={styles.statValue}>{stats.warningCount}</div>
            <div className={styles.statLabel}>{t('masterActiveOrders.stats.warning')}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardUrgent}`}>
            <div className={styles.statValue}>{stats.urgentCount}</div>
            <div className={styles.statLabel}>{t('masterActiveOrders.stats.urgent')}</div>
          </div>
        </div>
      </div>

      <div className={styles.searchBar}>
        <MdSearch className={styles.searchIcon} size={24} />
        <input
          type="text"
          placeholder={t('masterActiveOrders.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <MdTimer size={80} />
          </div>
          <p className={styles.emptyStateText}>
            {searchQuery ? t('masterActiveOrders.labels.noResults') : t('masterActiveOrders.labels.noOrders')}
          </p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map((order) => {
            const cardClass = order.timeRemaining.isUrgent && order.deadline
              ? `${styles.orderCard} ${styles.orderCardUrgent}`
              : order.timeRemaining.isWarning && order.deadline
              ? `${styles.orderCard} ${styles.orderCardWarning}`
              : styles.orderCard;

            const progressColor = order.timeRemaining.isUrgent
              ? '#ef4444'
              : order.timeRemaining.isWarning
              ? '#f59e0b'
              : '#667eea';

            return (
              <div key={order.id} className={cardClass} onClick={() => handleOpenDetailModal(order)} style={{ cursor: 'pointer' }}>
                <div className={styles.orderHeader}>
                  <div>
                    <h3 className={styles.orderTitle}>{order.title}</h3>
                    <div className={styles.customerName}>
                      <MdPerson size={16} />
                      {order.customer_name}
                    </div>
                  </div>
                  <div 
                    className={styles.statusBadge}
                    style={{ background: getStatusColor(order.delivery_status) }}
                  >
                    {getStatusText(order.delivery_status)}
                  </div>
                </div>

                <p className={styles.orderDescription}>{order.description}</p>

                {order.deadline && renderCountdown(order.timeRemaining)}

                {order.deadline && (
                  <div className={styles.progressSection}>
                    <div className={styles.progressGrid}>
                      <div className={styles.circularProgress}>
                        <CircularProgressbar
                          value={order.progressPercentage}
                          text={`${Math.round(order.progressPercentage)}%`}
                          styles={buildStyles({
                            textSize: '1.5rem',
                            pathColor: progressColor,
                            textColor: '#2d3748',
                            trailColor: '#e2e8f0',
                          })}
                        />
                      </div>
                      <div className={styles.linearProgress}>
                        <div className={styles.progressLabel}>
                          <span>{t('masterActiveOrders.labels.progressLabel')}</span>
                          <span className={styles.progressPercentage}>
                            {Math.round(order.progressPercentage)}%
                          </span>
                        </div>
                        <div className={styles.progressBarContainer}>
                          <div 
                            className={styles.progressBar}
                            style={{ 
                              width: `${order.progressPercentage}%`,
                              background: `linear-gradient(90deg, ${progressColor} 0%, ${progressColor}cc 100%)`
                            }}
                          />
                        </div>
                        <div className={styles.progressStats}>
                          <div className={styles.progressStat}>
                            <div className={styles.statLabel}>{t('masterActiveOrders.labels.timeElapsed')}</div>
                            <div className={styles.statValue}>{Math.round(order.progressPercentage)}%</div>
                          </div>
                          <div className={styles.progressStat}>
                            <div className={styles.statLabel}>{t('masterActiveOrders.labels.timeRemaining')}</div>
                            <div className={styles.statValue}>{Math.round(100 - order.progressPercentage)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <MdAttachMoney size={24} color="#667eea" className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>{t('masterActiveOrders.labels.price')}</div>
                      <div className={styles.infoValue}>{formatPrice(order.final_price)}</div>
                    </div>
                  </div>
                  {order.deadline && (
                    <div className={styles.infoItem}>
                      <MdTimer size={24} color="#667eea" className={styles.infoIcon} />
                      <div className={styles.infoContent}>
                        <div className={styles.infoLabel}>{t('masterActiveOrders.labels.deadline')}</div>
                        <div className={styles.infoValue}>{formatDate(order.deadline)}</div>
                      </div>
                    </div>
                  )}
                </div>

                {order.delivery_address && (
                  <div className={styles.deliveryAddress}>
                    <div className={styles.deliveryLabel}>{t('masterActiveOrders.labels.deliveryAddress')}</div>
                    <div className={styles.deliveryValue}>{order.delivery_address}</div>
                  </div>
                )}

                {order.delivery_status === 'pending' && order.delivery_address && (
                  <div className={styles.actionSection}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenShipModal(order.id);
                      }}
                      className={styles.shipButton}
                    >
                      <MdLocalShipping size={20} />
                      {t('masterActiveOrders.labels.shipOrder')}
                    </button>
                  </div>
                )}

                {order.status === 'in_progress' && (
                  <div className={styles.actionSection}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSubmitModal(order.id);
                      }}
                      className={styles.submitButton}
                    >
                      <MdCheck size={20} />
                      {t('masterActiveOrders.labels.submitForReview')}
                    </button>
                  </div>
                )}

                <div className={styles.actionSection}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChat(order.id);
                    }}
                    className={styles.chatButton}
                  >
                    <MdChat size={20} />
                    {t('masterActiveOrders.labels.openChat')}
                  </button>
                </div>

                {order.status === 'review' && (
                  <div className={`${styles.statusMessage} ${styles.statusMessageReview}`}>
                    <MdTimer size={20} />
                    {t('masterActiveOrders.labels.awaitingReview')}
                  </div>
                )}

                {order.delivery_status === 'shipped' && (
                  <div className={`${styles.statusMessage} ${styles.statusMessageShipped}`}>
                    <MdCheck size={20} />
                    {t('masterActiveOrders.labels.orderShipped')}
                  </div>
                )}

                {order.delivery_status === 'delivered' && (
                  <div className={`${styles.statusMessage} ${styles.statusMessageDelivered}`}>
                    <MdCheck size={20} />
                    {t('masterActiveOrders.labels.orderDelivered')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Модальное окно деталей заказа */}
      {showDetailModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={handleCloseDetailModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className={styles.modalBody}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 className={styles.modalTitle} style={{ marginBottom: '8px' }}>{selectedOrder.title}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', fontSize: '0.95rem' }}>
                    <MdPerson size={18} />
                    {selectedOrder.customer_name}
                  </div>
                </div>
                <div 
                  className={styles.statusBadge}
                  style={{ background: getStatusColor(selectedOrder.delivery_status) }}
                >
                  {getStatusText(selectedOrder.delivery_status)}
                </div>
              </div>

              <p style={{ color: '#4a5568', lineHeight: '1.6', marginBottom: '24px' }}>
                {selectedOrder.description}
              </p>

              {selectedOrder.deadline && (
                <>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
                     {t('masterActiveOrders.modal.countdownTitle')}
                  </h3>
                  {renderCountdown(selectedOrder.timeRemaining)}
                </>
              )}

              {selectedOrder.deadline && (
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
                    {t('masterActiveOrders.modal.progressTitle')}
                  </h3>
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '180px', height: '180px', flexShrink: 0 }}>
                      <CircularProgressbar
                        value={selectedOrder.progressPercentage}
                        text={`${Math.round(selectedOrder.progressPercentage)}%`}
                        styles={buildStyles({
                          textSize: '1.2rem',
                          pathColor: selectedOrder.timeRemaining.isUrgent
                            ? '#ef4444'
                            : selectedOrder.timeRemaining.isWarning
                            ? '#f59e0b'
                            : '#667eea',
                          textColor: '#2d3748',
                          trailColor: '#e2e8f0',
                        })}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '4px' }}>{t('masterActiveOrders.labels.timeElapsed')}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748' }}>
                          {Math.round(selectedOrder.progressPercentage)}%
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '4px' }}>{t('masterActiveOrders.labels.timeRemaining')}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748' }}>
                          {Math.round(100 - selectedOrder.progressPercentage)}%
                        </div>
                      </div>
                      <div style={{ 
                        padding: '16px', 
                        borderRadius: '10px', 
                        border: '2px solid',
                        borderColor: selectedOrder.timeRemaining.isUrgent ? '#ef4444' : selectedOrder.timeRemaining.isWarning ? '#f59e0b' : '#10b981',
                        background: selectedOrder.timeRemaining.isUrgent ? '#fef2f2' : selectedOrder.timeRemaining.isWarning ? '#fffbeb' : '#f0fdf4'
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '4px' }}>{t('masterActiveOrders.labels.status')}</div>
                        <div style={{ 
                          fontSize: '1.2rem', 
                          fontWeight: '700',
                          color: selectedOrder.timeRemaining.isUrgent ? '#ef4444' : selectedOrder.timeRemaining.isWarning ? '#f59e0b' : '#10b981'
                        }}>
                          {selectedOrder.timeRemaining.isUrgent ? `🔥 ${t('masterActiveOrders.labels.urgent')}` : selectedOrder.timeRemaining.isWarning ? ` ${t('masterActiveOrders.labels.warning')}` : `✅ ${t('masterActiveOrders.labels.onTime')}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', marginBottom: '16px' }}>
                   {t('masterActiveOrders.modal.detailsTitle')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div className={styles.infoItem}>
                    <MdAttachMoney size={24} color="#667eea" className={styles.infoIcon} />
                    <div className={styles.infoContent}>
                      <div className={styles.infoLabel}>{t('masterActiveOrders.labels.cost')}</div>
                      <div className={styles.infoValue}>{formatPrice(selectedOrder.final_price)}</div>
                    </div>
                  </div>
                  {selectedOrder.deadline && (
                    <div className={styles.infoItem}>
                      <MdTimer size={24} color="#667eea" className={styles.infoIcon} />
                      <div className={styles.infoContent}>
                        <div className={styles.infoLabel}>{t('masterActiveOrders.labels.deadline')}</div>
                        <div className={styles.infoValue}>{formatDate(selectedOrder.deadline)}</div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedOrder.delivery_address && (
                  <div style={{ marginTop: '12px' }} className={styles.deliveryAddress}>
                    <div className={styles.deliveryLabel}>{t('masterActiveOrders.labels.deliveryAddress')}</div>
                    <div className={styles.deliveryValue}>{selectedOrder.delivery_address}</div>
                  </div>
                )}
              </div>

              {/* Work Stages Section */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', margin: 0 }}>
                    {t('masterActiveOrders.modal.workStagesTitle')}
                  </h3>
                  {!loadingStages && workStages.length === 0 && (
                    <button
                      onClick={() => handleInitializeWorkStages(selectedOrder.id)}
                      style={{
                        padding: '6px 14px',
                        background: '#667eea',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {t('masterActiveOrders.workStages.initializeButton')}
                    </button>
                  )}
                </div>
                
                {loadingStages ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
                    Загрузка...
                  </div>
                ) : workStages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {workStages.map((stage, index) => (
                      <div
                        key={stage.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '14px',
                          background: stage.completed ? '#f0fdf4' : '#f9fafb',
                          borderRadius: '10px',
                          border: stage.completed ? '2px solid #10b981' : '1px solid #e5e7eb',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: stage.completed ? '#10b981' : '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              color: stage.completed ? '#fff' : '#6b7280',
                              fontSize: '0.875rem'
                            }}
                          >
                            {stage.completed ? '✓' : index + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontWeight: '600',
                              color: stage.completed ? '#10b981' : '#2d3748',
                              fontSize: '0.95rem',
                              marginBottom: stage.completed_at ? '4px' : 0
                            }}>
                              {t(`masterActiveOrders.workStages.${stage.stage_key}`)}
                            </div>
                            {stage.completed_at && (
                              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                                ✓ Завершено: {formatDate(stage.completed_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={stage.completed}
                            onChange={(e) => handleToggleStage(selectedOrder.id, stage.id, e.target.checked)}
                            style={{
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              accentColor: '#10b981'
                            }}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#718096',
                    background: '#f9fafb',
                    borderRadius: '10px',
                    border: '1px dashed #d1d5db'
                  }}>
                    Этапы работы еще не добавлены
                  </div>
                )}
              </div>

              {selectedOrder.delivery_status === 'pending' && selectedOrder.delivery_address && (
                <div style={{ marginTop: '24px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseDetailModal();
                      handleOpenShipModal(selectedOrder.id);
                    }}
                    className={styles.shipButton}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <MdLocalShipping size={20} />
                    {t('masterActiveOrders.labels.shipOrder')}
                  </button>
                </div>
              )}

              {selectedOrder.delivery_status === 'shipped' && (
                <div className={`${styles.statusMessage} ${styles.statusMessageShipped}`} style={{ marginTop: '24px' }}>
                  <MdCheck size={20} />
                  {t('masterActiveOrders.labels.orderShipped')}
                </div>
              )}

              {selectedOrder.delivery_status === 'delivered' && (
                <div className={`${styles.statusMessage} ${styles.statusMessageDelivered}`} style={{ marginTop: '24px' }}>
                  <MdCheck size={20} />
                  {t('masterActiveOrders.labels.orderDelivered')}
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleCloseDetailModal} className={styles.cancelButton}>
                  {t('masterActiveOrders.modal.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно отправки */}
      {showShipModal && (
        <div className={styles.modalOverlay} onClick={handleCloseShipModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{t('masterActiveOrders.shipModal.title')}</h2>

              <div className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('masterActiveOrders.shipModal.trackingLabel')}
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={t('masterActiveOrders.shipModal.trackingPlaceholder')}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t('masterActiveOrders.shipModal.notesLabel')}
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder={t('masterActiveOrders.shipModal.notesPlaceholder')}
                    rows={4}
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button onClick={handleCloseShipModal} className={styles.cancelButton}>
                    {t('masterActiveOrders.shipModal.cancel')}
                  </button>
                  <button
                    onClick={handleSubmitShipping}
                    disabled={submitting}
                    className={styles.submitButton}
                  >
                    {submitting ? t('masterActiveOrders.shipModal.submitting') : t('masterActiveOrders.shipModal.confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно сдачи на проверку */}
      {showSubmitModal && (
        <div className={styles.modalOverlay} onClick={handleCloseSubmitModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalBody}>
              <h2 className={styles.modalTitle}>{t('masterActiveOrders.submitModal.title')}</h2>
              <p style={{ color: '#4a5568', marginBottom: '24px', lineHeight: '1.6' }}>
                {t('masterActiveOrders.submitModal.description')}
              </p>

              <div className={styles.modalActions}>
                <button onClick={handleCloseSubmitModal} className={styles.cancelButton}>
                  {t('masterActiveOrders.submitModal.cancel')}
                </button>
                <button
                  onClick={handleSubmitForReview}
                  disabled={submitting}
                  className={styles.submitButtonModal}
                >
                  {submitting ? t('masterActiveOrders.submitModal.submitting') : t('masterActiveOrders.submitModal.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default MasterActiveOrders;
