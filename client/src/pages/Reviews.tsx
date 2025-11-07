import { useState, useEffect } from 'react';
import { 
  MdStars, 
  MdSearch, 
  MdAdd,
  MdThumbUp,
  MdThumbDown
} from 'react-icons/md';
import { appService } from '../services/appService';
import type { Review } from '../types/app';
import styles from './Orders.module.css';

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await appService.getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.orderTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#fbbf24' : '#d1d5db' }}>★</span>
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
            <MdStars className={styles.titleIcon} />
            Мои отзывы
          </h1>
          <button className={styles.createButton}>
            <MdAdd size={20} />
            Оставить отзыв
          </button>
        </div>

        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.total}`}>
            <div className={styles.statValue}>{reviews.length}</div>
            <div className={styles.statLabel}>Всего отзывов</div>
          </div>
          <div className={`${styles.statCard} ${styles.active}`}>
            <div className={styles.statValue}>{averageRating}</div>
            <div className={styles.statLabel}>Средняя оценка</div>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.searchBox}>
            <MdSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Поиск по отзывам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <MdStars size={64} />
          <h3>Нет отзывов</h3>
          <p>Вы еще не оставили ни одного отзыва</p>
        </div>
      ) : (
        <div className={styles.reviewsGrid}>
          {filteredReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>
                  <h3>{review.orderTitle}</h3>
                  <p className={styles.sellerName}>Мастер: {review.sellerName}</p>
                </div>
                <div className={styles.reviewRating}>
                  {renderStars(review.rating)}
                </div>
              </div>

              <div className={styles.reviewContent}>
                <p>{review.comment}</p>
              </div>

              {(review.pros && review.pros.length > 0) && (
                <div className={styles.reviewList}>
                  <strong className={styles.prosTitle}>
                    <MdThumbUp size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Плюсы:
                  </strong>
                  <ul>
                    {review.pros.map((pro, idx) => (
                      <li key={idx} className={styles.proItem}>{pro}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(review.cons && review.cons.length > 0) && (
                <div className={styles.reviewList}>
                  <strong className={styles.consTitle}>
                    <MdThumbDown size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    Минусы:
                  </strong>
                  <ul>
                    {review.cons.map((con, idx) => (
                      <li key={idx} className={styles.conItem}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}

              {review.images && review.images.length > 0 && (
                <div className={styles.reviewImages}>
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Фото ${idx + 1}`} />
                  ))}
                </div>
              )}

              {review.sellerResponse && (
                <div className={styles.sellerResponse}>
                  <div className={styles.responseHeader}>
                    <strong>Ответ продавца:</strong>
                    <span>{formatDate(review.sellerResponseAt!)}</span>
                  </div>
                  <p>{review.sellerResponse}</p>
                </div>
              )}

              <div className={styles.reviewFooter}>
                <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                {review.isEditable && (
                  <button className={styles.editButton}>Редактировать</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
