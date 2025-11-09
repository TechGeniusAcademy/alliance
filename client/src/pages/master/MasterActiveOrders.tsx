import { useState, useEffect } from 'react';
import { MdLocalShipping, MdCheck, MdTimer, MdAttachMoney } from 'react-icons/md';
import { orderService } from '../../services/orderService';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './Master.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
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
}

const MasterActiveOrders = () => {
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showShipModal, setShowShipModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const loadActiveOrders = async () => {
    try {
      setLoading(true);
      // Получаем все заказы и фильтруем те, где мастер назначен и заказ в работе
      const response = await fetch('http://localhost:5000/api/orders/master/active', {
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
      showToast('Ошибка при загрузке заказов', 'error');
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

  const handleSubmitShipping = async () => {
    if (!selectedOrderId) return;

    try {
      setSubmitting(true);
      await orderService.markAsShipped(selectedOrderId, {
        tracking_number: trackingNumber || undefined,
        delivery_notes: deliveryNotes || undefined,
      });

      showToast('Заказ отмечен как отправленный!', 'success');
      handleCloseShipModal();
      loadActiveOrders();
    } catch (error) {
      console.error('Error marking as shipped:', error);
      showToast('Ошибка при отправке заказа', 'error');
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
      case 'pending': return 'Ожидает отправки';
      case 'shipped': return 'Отправлено';
      case 'delivered': return 'Доставлено';
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
      <div className={styles.pageContainer}>
        <div className={styles.loader} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdTimer style={{ verticalAlign: 'middle', marginRight: '12px' }} />
          Активные заказы
        </h1>
        <p style={{ color: '#718096', marginTop: '8px' }}>
          Заказы в работе
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.section}>
          <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
            У вас пока нет активных заказов
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={styles.section} 
              style={{ padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#2d3748' }}>
                    {order.title}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: '#718096' }}>
                    Заказчик: {order.customer_name}
                  </div>
                </div>
                <div style={{ 
                  background: getStatusColor(order.delivery_status),
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {getStatusText(order.delivery_status)}
                </div>
              </div>

              <p style={{ margin: '0 0 16px 0', color: '#4a5568', lineHeight: '1.6' }}>
                {order.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                  <MdAttachMoney size={24} color="#667eea" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>Цена</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                      {formatPrice(order.final_price)}
                    </div>
                  </div>
                </div>
                {order.deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                    <MdTimer size={24} color="#667eea" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>Срок</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                        {formatDate(order.deadline)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {order.delivery_address && (
                <div style={{ marginBottom: '16px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '4px' }}>Адрес доставки</div>
                  <div style={{ fontSize: '0.95rem', color: '#2d3748' }}>{order.delivery_address}</div>
                </div>
              )}

              {order.delivery_status === 'pending' && order.delivery_address && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => handleOpenShipModal(order.id)}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <MdLocalShipping size={20} />
                    Отправить заказ
                  </button>
                </div>
              )}

              {order.delivery_status === 'shipped' && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#dbeafe', borderRadius: '8px', color: '#1e40af' }}>
                  <MdCheck size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Заказ отправлен. Ожидает подтверждения клиентом.
                </div>
              )}

              {order.delivery_status === 'delivered' && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#d1fae5', borderRadius: '8px', color: '#065f46' }}>
                  <MdCheck size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Заказ успешно доставлен!
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно отправки */}
      {showShipModal && (
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
        onClick={handleCloseShipModal}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '32px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#2d3748' }}>
                Отправка заказа
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>
                    Трек-номер (необязательно)
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Введите трек-номер для отслеживания"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>
                    Примечания (необязательно)
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Дополнительная информация о доставке"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={handleCloseShipModal}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#e2e8f0',
                      color: '#4a5568',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSubmitShipping}
                    disabled={submitting}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: submitting ? '#cbd5e0' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Отправка...' : 'Подтвердить отправку'}
                  </button>
                </div>
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
