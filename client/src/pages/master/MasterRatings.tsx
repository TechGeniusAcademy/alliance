import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MdStar, MdStarBorder, MdPerson } from 'react-icons/md';
import axios from 'axios';
import styles from './Master.module.css';

interface Review {
  id: number;
  order_id: number;
  rating: number;
  comment: string;
  created_at: string;
  order_title: string;
  order_category: string;
  order_price: number;
  customer_name: string;
  customer_photo: string | null;
}

interface Stats {
  total_reviews: number;
  average_rating: string;
  five_star: number;
  four_star: number;
  three_star: number;
  two_star: number;
  one_star: number;
}

const MasterRatings = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chats/reviews/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          star <= rating ? <MdStar key={star} size={20} /> : <MdStarBorder key={star} size={20} />
        ))}
      </div>
    );
  };

  const getPercentage = (count: number) => {
    if (!stats || stats.total_reviews === 0) return 0;
    return Math.round((count / parseInt(stats.total_reviews.toString())) * 100);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <MdStar style={{ verticalAlign: 'middle', marginRight: '12px' }} />
            {t('masterSidebar.ratings')}
          </h1>
        </div>
        <div className={styles.section}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdStar style={{ verticalAlign: 'middle', marginRight: '12px' }} />
          {t('masterSidebar.ratings')}
        </h1>
      </div>

      {stats && (
        <div className={styles.section}>
          <h2>Общая статистика</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 2fr', 
            gap: '30px', 
            marginTop: '20px',
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Средний рейтинг */}
            <div style={{ textAlign: 'center', borderRight: '1px solid #e5e7eb', paddingRight: '30px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#667eea' }}>
                {parseFloat(stats.average_rating).toFixed(1)}
              </div>
              <div style={{ marginTop: '10px' }}>
                {renderStars(Math.round(parseFloat(stats.average_rating)))}
              </div>
              <div style={{ marginTop: '10px', color: '#6b7280', fontSize: '14px' }}>
                {stats.total_reviews} {stats.total_reviews === 1 ? 'отзыв' : 'отзывов'}
              </div>
            </div>

            {/* Распределение рейтингов */}
            <div>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = star === 5 ? stats.five_star :
                             star === 4 ? stats.four_star :
                             star === 3 ? stats.three_star :
                             star === 2 ? stats.two_star : stats.one_star;
                const percentage = getPercentage(parseInt(count.toString()));
                
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '50px' }}>
                      <span style={{ fontSize: '14px' }}>{star}</span>
                      <MdStar size={16} color="#fbbf24" />
                    </div>
                    <div style={{ 
                      flex: 1, 
                      height: '8px', 
                      background: '#e5e7eb', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '14px', color: '#6b7280', width: '50px', textAlign: 'right' }}>
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Список отзывов */}
      <div className={styles.section}>
        <h2>Все отзывы</h2>
        {reviews.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#6b7280',
            background: 'white',
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <MdStar size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>У вас пока нет отзывов</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Завершите первый заказ, чтобы получить отзыв от клиента
            </p>
          </div>
        ) : (
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reviews.map((review) => (
              <div 
                key={review.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      overflow: 'hidden'
                    }}>
                      {review.customer_photo ? (
                        <img src={review.customer_photo} alt={review.customer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <MdPerson size={28} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{review.customer_name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {new Date(review.created_at).toLocaleDateString('ru-RU', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {review.comment && (
                  <p style={{ 
                    color: '#374151', 
                    lineHeight: '1.6',
                    marginBottom: '12px',
                    padding: '12px',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    {review.comment}
                  </p>
                )}

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  <span><strong>Заказ:</strong> {review.order_title}</span>
                  <span>•</span>
                  <span><strong>Категория:</strong> {review.order_category}</span>
                  {review.order_price && (
                    <>
                      <span>•</span>
                      <span><strong>Сумма:</strong> {review.order_price} ₸</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterRatings;
