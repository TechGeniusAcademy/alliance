import { useState, useEffect } from 'react';
import { MdHistory, MdAttachMoney, MdTimer, MdCheckCircle, MdCancel, MdHourglassEmpty } from 'react-icons/md';
import bidService from '../../services/bidService';
import type { Bid } from '../../services/bidService';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './Master.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const AuctionHistory = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadMyBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyBids = async () => {
    try {
      setLoading(true);
      const data = await bidService.getMyBids();
      setBids(data);
    } catch (error) {
      console.error('Error loading bids:', error);
      showToast('Ошибка при загрузке ставок', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return { icon: <MdCheckCircle size={18} />, text: 'Принята', color: '#48bb78' };
      case 'rejected':
        return { icon: <MdCancel size={18} />, text: 'Отклонена', color: '#f56565' };
      default:
        return { icon: <MdHourglassEmpty size={18} />, text: 'В ожидании', color: '#ed8936' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
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
          <MdHistory style={{ verticalAlign: 'middle', marginRight: '12px' }} />
          Мои ставки
        </h1>
        <p style={{ color: '#718096', marginTop: '8px' }}>
          Все ваши предложения на заказы
        </p>
      </div>

      {bids.length === 0 ? (
        <div className={styles.section}>
          <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
            У вас пока нет ставок
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {bids.map((bid) => {
            const statusBadge = getStatusBadge(bid.status);
            return (
              <div key={bid.id} className={styles.section} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#2d3748' }}>
                      {bid.order_title}
                    </h3>
                    {bid.customer_name && (
                      <p style={{ margin: '0 0 8px 0', color: '#718096', fontSize: '0.9rem' }}>
                        Клиент: {bid.customer_name}
                      </p>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: statusBadge.color,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                  }}>
                    {statusBadge.icon}
                    {statusBadge.text}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                    <MdAttachMoney size={24} color="#667eea" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>Ваше предложение</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                        {formatPrice(bid.proposed_price)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                    <MdTimer size={24} color="#667eea" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>Срок выполнения</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                        {bid.estimated_days} {bid.estimated_days === 1 ? 'день' : 'дней'}
                      </div>
                    </div>
                  </div>

                  {bid.budget_min && bid.budget_max && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                      <MdAttachMoney size={24} color="#718096" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#718096' }}>Бюджет клиента</div>
                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                          {formatPrice(bid.budget_min)} - {formatPrice(bid.budget_max)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {bid.comment && (
                  <div style={{ marginBottom: '12px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '4px' }}>
                      Ваш комментарий:
                    </div>
                    <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>
                      {bid.comment}
                    </p>
                  </div>
                )}

                <div style={{ fontSize: '0.85rem', color: '#a0aec0' }}>
                  Создано: {formatDate(bid.created_at)}
                </div>
              </div>
            );
          })}
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

export default AuctionHistory;
