import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order';
import { API_BASE_URL } from '../config/api';
import OrderCard from '../components/OrderCard';
import { MdFilterList, MdSearch, MdInbox, MdClose, MdPerson, MdAttachMoney, MdTimer, MdStar, MdCheck } from 'react-icons/md';
import Toast from '../components/Toast';
import styles from './Orders.module.css';

interface OrderBid {
  id: number;
  order_id: number;
  master_id: number;
  proposed_price: number;
  estimated_days: number;
  comment?: string;
  status: string;
  created_at: string;
  master_name?: string;
  master_photo?: string;
  master_address?: string;
  rating?: number;
  reviews_count?: number;
  completed_orders?: number;
}

const MyOrders = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [bids, setBids] = useState<OrderBid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusCount = (status: Order['status'] | 'all') => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  const handleViewBids = async (order: Order) => {
    setSelectedOrder(order);
    setShowBidsModal(true);
    setLoadingBids(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${order.id}/bids`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bids data from API:', data.bids);
        setBids(data.bids || []);
      }
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setLoadingBids(false);
    }
  };

  const handleCloseBidsModal = () => {
    setShowBidsModal(false);
    setSelectedOrder(null);
    setBids([]);
  };

  const handleAcceptBid = async (bidId: number) => {
    try {
      const bid = bids.find(b => b.id === bidId);
      if (!bid) return;

      // Показываем информационное уведомление
      setToast({ 
        message: `${t('myOrders.messages.accepting')} ${bid.master_name}...`, 
        type: 'info' 
      });

      // Принимаем заявку напрямую
      const response = await orderService.acceptBid(bidId);
      
      console.log('🔍 ACCEPT BID RESPONSE:', response);
      console.log('🔍 chatId from response:', response.chatId);
      
      setToast({ 
        message: t('myOrders.messages.bidAccepted'), 
        type: 'success' 
      });
      
      handleCloseBidsModal();
      loadOrders(); // Обновляем список заказов
      
      // Перенаправляем в чат через 1 секунду с информацией о chatId
      setTimeout(() => {
        console.log('🔍 NAVIGATING TO CHAT with chatId:', response.chatId);
        navigate('/dashboard/chats', { 
          state: { chatId: response.chatId, forceReload: true } 
        });
      }, 1000);
      
    } catch (error: unknown) {
      console.error('Error accepting bid:', error);
      
      const err = error as { response?: { data?: { error?: string; message?: string; required?: number; available?: number } } };
      
      if (err.response?.data?.error === 'INSUFFICIENT_FUNDS') {
        const required = err.response.data.required || 0;
        const available = err.response.data.available || 0;
        setToast({ 
          message: t('myOrders.messages.insufficientFunds', { required, available }),
          type: 'error' 
        });
      } else if (err.response?.data?.error === 'UNPAID_COMMISSIONS') {
        setToast({ 
          message: t('myOrders.messages.unpaidCommissions'),
          type: 'error' 
        });
      } else {
        setToast({ 
          message: err.response?.data?.message || t('myOrders.messages.acceptError'), 
          type: 'error' 
        });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('myOrders.title')}</h1>
          <p className={styles.pageSubtitle}>{t('myOrders.subtitle')}</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{getStatusCount('completed')}</div>
            <div className={styles.statLabel}>{t('myOrders.stats.completed')}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{getStatusCount('active')}</div>
            <div className={styles.statLabel}>{t('myOrders.stats.active')}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{orders.length}</div>
            <div className={styles.statLabel}>{t('myOrders.stats.total')}</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('myOrders.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <MdFilterList className={styles.filterIcon} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Order['status'] | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">{t('myOrders.filters.allStatuses')} ({getStatusCount('all')})</option>
            <option value="pending">{t('myOrders.filters.pending')} ({getStatusCount('pending')})</option>
            <option value="active">{t('myOrders.filters.active')} ({getStatusCount('active')})</option>
            <option value="in_progress">{t('myOrders.filters.inProgress')} ({getStatusCount('in_progress')})</option>
            <option value="completed">{t('myOrders.filters.completed')} ({getStatusCount('completed')})</option>
            <option value="cancelled">{t('myOrders.filters.cancelled')} ({getStatusCount('cancelled')})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>{t('myOrders.loading')}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <MdInbox size={64} />
          </div>
          <h3>{t('myOrders.emptyState.title')}</h3>
          <p>{t('myOrders.emptyState.description')}</p>
        </div>
      ) : (
        <div className={styles.ordersGrid}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{ position: 'relative' }}>
              <OrderCard
                order={order}
                showActions={false}
              />
              {order.bidsCount > 0 && (order.status === 'auction' || order.status === 'pending' || order.status === 'active') && (
                <button
                  onClick={() => handleViewBids(order)}
                  style={{
                    position: 'absolute',
                    bottom: '60px',
                    right: '16px',
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {t('myOrders.viewBids')} ({order.bidsCount})
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно со списком предложений */}
      {showBidsModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
        }}
        onClick={handleCloseBidsModal}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '32px' }}>
              {/* Заголовок */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={handleCloseBidsModal}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#edf2f7',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MdClose size={24} />
                </button>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#2d3748' }}>
                  {t('myOrders.bidsModal.title')}
                </h2>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
                  {selectedOrder.title}
                </p>
              </div>

              {loadingBids ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className={styles.loader}></div>
                  <p style={{ color: '#718096', marginTop: '16px' }}>{t('myOrders.bidsModal.loading')}</p>
                </div>
              ) : bids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <MdInbox size={64} style={{ color: '#cbd5e0', marginBottom: '16px' }} />
                  <p style={{ color: '#718096', fontSize: '1.1rem' }}>{t('myOrders.bidsModal.noBids')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bids.map((bid) => (
                    <div key={bid.id} style={{
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: bid.master_photo ? `url(${bid.master_photo})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: '600',
                          }}>
                            {!bid.master_photo && <MdPerson size={32} />}
                          </div>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#2d3748' }}>
                              {bid.master_name || t('myOrders.bidsModal.defaultMaster')}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#718096' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MdStar color="#f6ad55" />
                                <span>{bid.rating !== null && bid.rating !== undefined ? Number(bid.rating).toFixed(1) : '0.0'}</span>
                              </div>
                              <span>•</span>
                              <span>{bid.completed_orders || 0} {t('myOrders.bidsModal.orders')}</span>
                              <span>•</span>
                              <span>{bid.reviews_count || 0} {t('myOrders.bidsModal.reviews')}</span>
                            </div>
                          </div>
                        </div>
                        {bid.status === 'accepted' && (
                          <div style={{
                            background: '#48bb78',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <MdCheck size={18} />
                            {t('myOrders.bidsModal.accepted')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <MdAttachMoney size={20} color="#667eea" />
                            <span style={{ fontSize: '0.85rem', color: '#718096' }}>{t('myOrders.bidsModal.price')}</span>
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748' }}>
                            {formatPrice(bid.proposed_price)}
                          </div>
                        </div>
                        <div style={{ padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <MdTimer size={20} color="#667eea" />
                            <span style={{ fontSize: '0.85rem', color: '#718096' }}>{t('myOrders.bidsModal.deadline')}</span>
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748' }}>
                            {bid.estimated_days} {bid.estimated_days === 1 ? t('myOrders.bidsModal.day') : t('myOrders.bidsModal.days')}
                          </div>
                        </div>
                      </div>

                      {bid.comment && (
                        <div style={{ marginBottom: '16px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                            {t('myOrders.bidsModal.masterComment')}
                          </div>
                          <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {bid.comment}
                          </p>
                        </div>
                      )}

                      <div style={{ fontSize: '0.85rem', color: '#a0aec0', marginBottom: '12px' }}>
                        {t('myOrders.bidsModal.bidSent')} {formatDate(bid.created_at)}
                      </div>

                      {bid.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          style={{
                            width: '100%',
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          {t('myOrders.bidsModal.acceptBid')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

export default MyOrders;
