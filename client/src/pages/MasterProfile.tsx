import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdStar, MdLocationOn, MdPhone, MdEmail, MdChat, MdVerified, MdWork } from 'react-icons/md';
import masterService from '../services/masterService';
import type { PortfolioItem } from '../services/masterService';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import styles from './MasterProfile.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const MasterProfile = () => {
  const { masterId } = useParams<{ masterId: string }>();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Mock данные мастера (позже можно будет получать с бэкенда)
  const masterData = {
    id: parseInt(masterId || '0'),
    name: 'Имя Мастера',
    phone: '+7 (777) 123-45-67',
    email: 'master@example.com',
    address: 'Алматы, Казахстан',
    rating: 4.8,
    reviewsCount: 127,
    completedOrders: 243,
    yearsOfExperience: 8,
    verified: true,
    description: 'Профессиональный мебельщик с более чем 8-летним опытом работы. Специализируюсь на изготовлении кухонной мебели, шкафов-купе и корпусной мебели на заказ. Использую только качественные материалы и современное оборудование.',
    specializations: ['Кухонная мебель', 'Шкафы-купе', 'Корпусная мебель', 'Офисная мебель'],
    avatar: 'https://ui-avatars.com/api/?name=Master&size=200&background=667eea&color=fff'
  };

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadMasterPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId]);

  const loadMasterPortfolio = async () => {
    try {
      setLoading(true);
      if (masterId) {
        const data = await masterService.getPublicPortfolio(parseInt(masterId));
        setPortfolio(data);
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
      showToast('Ошибка при загрузке портфолио', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContactMaster = () => {
    navigate('/dashboard/messages', { 
      state: { masterId: masterData.id, masterName: masterData.name } 
    });
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header с кнопкой назад */}
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <MdArrowBack size={24} />
        Назад
      </button>

      {/* Информация о мастере */}
      <div className={styles.masterHeader}>
        <div className={styles.avatarSection}>
          <img src={masterData.avatar} alt={masterData.name} className={styles.avatar} />
          {masterData.verified && (
            <div className={styles.verifiedBadge}>
              <MdVerified size={20} />
              Проверен
            </div>
          )}
        </div>

        <div className={styles.masterInfo}>
          <div className={styles.nameRow}>
            <h1>{masterData.name}</h1>
            <div className={styles.rating}>
              <MdStar size={24} />
              <span className={styles.ratingValue}>{masterData.rating}</span>
              <span className={styles.reviewsCount}>({masterData.reviewsCount} отзывов)</span>
            </div>
          </div>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <MdLocationOn size={20} />
              <span>{masterData.address}</span>
            </div>
            <div className={styles.contactItem}>
              <MdPhone size={20} />
              <a href={`tel:${masterData.phone}`}>{masterData.phone}</a>
            </div>
            {masterData.email && (
              <div className={styles.contactItem}>
                <MdEmail size={20} />
                <a href={`mailto:${masterData.email}`}>{masterData.email}</a>
              </div>
            )}
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <MdWork size={32} />
              <div>
                <div className={styles.statValue}>{masterData.completedOrders}</div>
                <div className={styles.statLabel}>Выполненных заказов</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <MdVerified size={32} />
              <div>
                <div className={styles.statValue}>{masterData.yearsOfExperience} лет</div>
                <div className={styles.statLabel}>Опыт работы</div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.contactButton} onClick={handleContactMaster}>
              <MdChat size={20} />
              Написать сообщение
            </button>
            <a href={`tel:${masterData.phone}`} className={styles.callButton}>
              <MdPhone size={20} />
              Позвонить
            </a>
          </div>
        </div>
      </div>

      {/* О мастере */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>О мастере</h2>
        <p className={styles.description}>{masterData.description}</p>
      </div>

      {/* Специализации */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Специализации</h2>
        <div className={styles.specializations}>
          {masterData.specializations.map((spec, idx) => (
            <div key={idx} className={styles.specializationBadge}>
              {spec}
            </div>
          ))}
        </div>
      </div>

      {/* Портфолио */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Портфолио ({portfolio.length})</h2>
        
        {loading ? (
          <div className={styles.loader} />
        ) : portfolio.length > 0 ? (
          <div className={styles.portfolioGrid}>
            {portfolio.map((item) => (
              <div key={item.id} className={styles.portfolioCard}>
                <div className={styles.cardImage}>
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.title} />
                  ) : (
                    <div className={styles.noImage}>Нет фото</div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h3>{item.title}</h3>
                  {item.category && (
                    <span className={styles.categoryBadge}>{item.category}</span>
                  )}
                  {item.price && (
                    <div className={styles.price}>{item.price.toLocaleString()} ₸</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyMessage}>Портфолио пока пусто</p>
        )}
      </div>

      {/* Toast notifications */}
      <div className={styles.toastContainer}>
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

export default MasterProfile;
