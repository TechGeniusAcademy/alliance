import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  FiHome,
  FiChevronRight,
  FiStar,
  FiCheckCircle,
  FiMessageSquare,
  FiHeart,
  FiShare2,
  FiUser,
  FiImage
} from 'react-icons/fi';
import styles from './MasterProfile.module.css';

// Mock master data
// Commented out unused data
/* const masterData = {
  id: 1,
  name: 'Алексей Петров',
  specialty: 'Мастер корпусной мебели',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  rating: 4.9,
  reviewsCount: 127,
  projectsCount: 89,
  experience: 12,
  verified: true,
  online: true,
  location: 'Алматы, Казахстан',
  responseTime: '~ 30 минут',
  tags: ['Кухни на заказ', 'Шкафы-купе', 'Гардеробные', 'Корпусная мебель', 'Встроенная мебель'],
  about: `Здравствуйте! Меня зовут Алексей, и я занимаюсь изготовлением корпусной мебели уже более 12 лет. 
  
Специализируюсь на кухнях, шкафах-купе и гардеробных системах. Работаю с качественными материалами от проверенных поставщиков: EGGER, Kronospan, Blum.

Мой подход — индивидуальный дизайн под ваши потребности, точные замеры и качественная установка. Предоставляю гарантию на все работы от 2 лет.

Буду рад помочь с вашим проектом!`,
  highlights: [
    { icon: <FiBriefcase />, value: '89 проектов', label: 'Выполнено' },
    { icon: <FiCalendar />, value: '12 лет', label: 'Опыт работы' },
    { icon: <FiAward />, value: 'ТОП-10', label: 'Рейтинг ALLIANCE' },
    { icon: <FiShield />, value: '2 года', label: 'Гарантия' }
  ],
  portfolio: [
    { id: 1, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', title: 'Кухня в стиле модерн' },
    { id: 2, image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&h=400&fit=crop', title: 'Встроенный шкаф-купе' },
    { id: 3, image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=400&h=400&fit=crop', title: 'Гардеробная система' },
    { id: 4, image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=400&fit=crop', title: 'Кухня П-образная' },
    { id: 5, image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop', title: 'Прихожая' },
    { id: 6, image: 'https://images.unsplash.com/photo-1616627988170-6e5a7f3b69d7?w=400&h=400&fit=crop', title: 'Детская комната' }
  ],
  reviews: [
    {
      id: 1,
      author: 'Марина К.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      rating: 5,
      date: '15 декабря 2024',
      text: 'Отличная работа! Алексей сделал для нас потрясающую кухню. Все точно по замерам, качественные материалы, быстрая установка. Особенно понравился подход к деталям — всё продумано до мелочей.',
      project: 'Кухня угловая 3.2м'
    },
    {
      id: 2,
      author: 'Сергей М.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 5,
      date: '28 ноября 2024',
      text: 'Заказывали встроенный шкаф-купе в спальню. Результат превзошёл ожидания! Мастер очень ответственный, работает аккуратно, соблюдает сроки. Рекомендую!',
      project: 'Шкаф-купе 2.4м'
    },
    {
      id: 3,
      author: 'Елена Т.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 4,
      date: '10 ноября 2024',
      text: 'Хорошая работа, качественные материалы. Единственное — немного затянули со сроками из-за поставки фурнитуры. Но результат того стоит.',
      project: 'Гардеробная комната'
    }
  ],
  prices: [
    { service: 'Кухня (погонный метр)', price: 'от 45 000 ₸' },
    { service: 'Шкаф-купе (м²)', price: 'от 35 000 ₸' },
    { service: 'Гардеробная система', price: 'от 150 000 ₸' },
    { service: 'Замер и дизайн-проект', price: 'Бесплатно' },
    { service: 'Доставка и монтаж', price: 'от 15 000 ₸' }
  ],
  guarantees: [
    'Гарантия на мебель — 2 года',
    'Бесплатный выезд на замер',
    'Фиксированная цена в договоре',
    'Оплата по факту выполнения',
    'Бесплатное гарантийное обслуживание'
  ],
  contacts: {
    phone: '+7 (777) 123-45-67',
    email: 'aleksey@alliance.kz',
    responseTime: 'Обычно отвечает в течение 30 минут'
  },
  similarMasters: [
    {
      id: 2,
      name: 'Сергей Иванов',
      specialty: 'Столяр-краснодеревщик',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Дмитрий Козлов',
      specialty: 'Дизайнер-конструктор',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Михаил Новиков',
      specialty: 'Мастер детской мебели',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      rating: 4.9
    }
  ]
};
*/

export const MasterProfilePage = () => {
  const { id } = useParams();
  const [_reviewsFilter, _setReviewsFilter] = useState('all');
  const [master, setMaster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMasterProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/masters/public/${id}`);
        setMaster(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching master profile:', err);
        setError('Не удалось загрузить профиль мастера');
      } finally {
        setLoading(false);
      }
    };

    fetchMasterProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (error || !master) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>{error || 'Мастер не найден'}</div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        style={{
          fill: i < Math.floor(rating) ? '#f39c12' : 'none',
          color: '#f39c12'
        }}
      />
    ));
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>
              <FiHome /> Главная
            </Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <Link to="/masters" className={styles.breadcrumbLink}>
              Мастера
            </Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>{master.name}</span>
          </nav>

          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarSection}>
                <img 
                  src={master.profilePicture || 'https://via.placeholder.com/200'} 
                  alt={master.name} 
                  className={styles.avatar} 
                />
              </div>
              
              <div className={styles.profileInfo}>
                <h1 className={styles.profileName}>
                  {master.name}
                  {master.verified && (
                    <span className={styles.verifiedBadge}>
                      <FiCheckCircle /> Проверен
                    </span>
                  )}
                </h1>
                <p className={styles.profileSpecialty}>{master.specialty || 'Мастер мебели'}</p>
                
                <div className={styles.profileRating}>
                  <div className={styles.stars}>{renderStars(master.rating || 5.0)}</div>
                  <span className={styles.ratingValue}>{master.rating || 5.0}</span>
                  <span className={styles.reviewsCount}>({master.completedOrders || 0} проектов)</span>
                </div>

                <div className={styles.profileTags}>
                  {master.skills && master.skills.length > 0 ? (
                    master.skills.map((tag: string, index: number) => (
                      <span key={index} className={styles.profileTag}>{tag}</span>
                    ))
                  ) : (
                    <span className={styles.profileTag}>Мебель на заказ</span>
                  )}
                </div>
              </div>

              <div className={styles.profileActions}>
                <button className={styles.contactButton}>
                  <FiMessageSquare /> Написать сообщение
                </button>
                <button className={styles.secondaryButton}>
                  <FiHeart /> В избранное
                </button>
                <button className={styles.secondaryButton}>
                  <FiShare2 /> Поделиться
                </button>
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{master.completedOrders || 0}</span>
                <span className={styles.statLabel}>проектов</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{master.experience || 0}</span>
                <span className={styles.statLabel}>лет опыта</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{master.rating || 5.0}</span>
                <span className={styles.statLabel}>рейтинг</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* About Section */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FiUser /> О мастере
              </h2>
              <p className={styles.aboutText} style={{ whiteSpace: 'pre-line' }}>
                {master.bio || 'Информация о мастере не указана'}
              </p>
            </section>

            {/* Portfolio Section - пока скрыто, так как API не возвращает портфолио */}
            {false && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FiImage /> Портфолио
              </h2>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Портфолио скоро будет доступно
              </div>
            </section>
            )}

            {/* Reviews Section - пока скрыто, так как API не возвращает отзывы */}
            {false && (
            <section className={styles.section}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                  <FiStar /> Отзывы
                </h2>
              </div>
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Отзывы скоро будут доступны
              </div>
            </section>
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Contact Info */}
            <div className={styles.priceCard}>
              <h3 className={styles.priceTitle}>Информация о мастере</h3>
              <div className={styles.priceList}>
                <div className={styles.priceItem}>
                  <span className={styles.priceService}>Специализация</span>
                  <span className={styles.priceValue}>{master.specialty || 'Мебель'}</span>
                </div>
                <div className={styles.priceItem}>
                  <span className={styles.priceService}>Опыт работы</span>
                  <span className={styles.priceValue}>{master.experience || 0} лет</span>
                </div>
                <div className={styles.priceItem}>
                  <span className={styles.priceService}>Выполнено проектов</span>
                  <span className={styles.priceValue}>{master.completedOrders || 0}</span>
                </div>
                <div className={styles.priceItem}>
                  <span className={styles.priceService}>Рейтинг</span>
                  <span className={styles.priceValue}>{master.rating || 5.0} / 5.0</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            {master.skills && master.skills.length > 0 && (
              <div className={styles.contactCard}>
                <h3 className={styles.contactTitle}>Навыки</h3>
                <div className={styles.profileTags}>
                  {master.skills.map((skill: string, index: number) => (
                    <span key={index} className={styles.profileTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
