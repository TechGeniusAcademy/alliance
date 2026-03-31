import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  FiHome,
  FiChevronRight,
  FiUsers,
  FiGrid,
  FiList,
  FiStar,
  FiCheckCircle,
  FiMapPin,
  FiClock,
  FiArrowRight,
  FiSearch,
  FiChevronLeft
} from 'react-icons/fi';
import styles from './CategoryDetail.module.css';

const ITEMS_PER_PAGE = 20;

// Интерфейсы для типизации
interface Master {
  id: number;
  name: string;
  profilePicture: string | null;
  specialty: string;
  rating: number;
  experience: number;
  completedOrders: number;
  verified: boolean;
  skills?: string[];
  specializations?: string[];
}

interface Order {
  id: number;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  location?: string;
  deadline?: string;
  created_at: string;
  status: string;
}

interface _Category {
  name: string;
  description: string;
  icon: string;
  mastersCount: number;
  ordersCount: number;
  avgRating: number;
}

// Маппинг категорий для фильтрации мастеров
const categoryKeywords: Record<string, string[]> = {
  'kitchen': ['кухн', 'kitchen'],
  'bedroom': ['спальн', 'bedroom'],
  'living': ['гостин', 'living', 'зал'],
  'office': ['офис', 'office', 'кабинет'],
  'children': ['детск', 'children'],
  'hallway': ['прихож', 'hallway', 'коридор'],
  'bathroom': ['ванн', 'bathroom', 'санузел'],
  'wardrobe': ['шкаф', 'wardrobe', 'гардероб'],
};

// Моковые данные категорий (пока не будет API)
const categoriesData: Record<string, {
  nameKey: string;
  descKey: string;
  image: string;
  avgRating: number;
}> = {
  'kitchen': {
    nameKey: 'categoriesPage.mainCategories.kitchen',
    descKey: 'categoriesPage.mainCategories.kitchenDesc',
    image: '/categories/kitchen.jpg',
    avgRating: 4.8
  },
  'bedroom': {
    nameKey: 'categoriesPage.mainCategories.bedroom',
    descKey: 'categoriesPage.mainCategories.bedroomDesc',
    image: '/categories/3d-rendering-business-meeting-and-working-room-on-2025-01-07-12-18-14-utc.jpg',
    avgRating: 4.9
  },
  'living': {
    nameKey: 'categoriesPage.mainCategories.living',
    descKey: 'categoriesPage.mainCategories.livingDesc',
    image: '/categories/living room.jpg',
    avgRating: 4.7
  },
  'office': {
    nameKey: 'categoriesPage.mainCategories.office',
    descKey: 'categoriesPage.mainCategories.officeDesc',
    image: '/categories/ofiice.jpg',
    avgRating: 4.7
  },
  'children': {
    nameKey: 'categoriesPage.mainCategories.children',
    descKey: 'categoriesPage.mainCategories.childrenDesc',
    image: '/categories/childrensroom.jpg',
    avgRating: 4.8
  },
  'hallway': {
    nameKey: 'categoriesPage.mainCategories.hallway',
    descKey: 'categoriesPage.mainCategories.hallwayDesc',
    image: '/categories/hallway.jpg',
    avgRating: 4.7
  },
  'bathroom': {
    nameKey: 'categoriesPage.mainCategories.bathroom',
    descKey: 'categoriesPage.mainCategories.bathroomDesc',
    image: '/categories/bathroom.jpg',
    avgRating: 4.6
  },
  'wardrobe': {
    nameKey: 'categoriesPage.mainCategories.wardrobe',
    descKey: 'categoriesPage.mainCategories.wardrobeDesc',
    image: '/categories/wardrobe.jpg',
    avgRating: 4.8
  }
};

export const CategoryDetailPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'masters' | 'orders'>('masters');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('rating');
  const [priceFilter, setPriceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Состояния для данных
  const [masters, setMasters] = useState<Master[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgRating, setAvgRating] = useState<number>(0);

  // Get category data or use default
  const categoryData = categoriesData[id || 'kitchen'];
  const category = categoryData ? {
    name: t(categoryData.nameKey),
    description: t(categoryData.descKey),
    image: categoryData.image,
    avgRating: avgRating
  } : {
    name: t('categoriesPage.mainCategories.kitchen'),
    description: t('categoriesPage.mainCategories.kitchenDesc'),
    image: '/categories/kitchen.jpg',
    avgRating: avgRating
  };

  // Загрузка данных с API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Загружаем мастеров
        const mastersResponse = await axios.get(`${API_BASE_URL}/api/masters/public`);
        
        // Фильтруем мастеров по специализации категории
        const allMasters = mastersResponse.data;
        const categoryId = id || 'kitchen';
        const keywords = categoryKeywords[categoryId] || [];
        
        const filteredMasters = allMasters.filter((master: Master) => {
          // Если у мастера нет специализаций, не показываем его
          if (!master.skills || master.skills.length === 0) {
            return false;
          }
          
          // Если нет ключевых слов для категории, показываем всех мастеров
          if (keywords.length === 0) {
            return true;
          }
          
          // Проверяем, есть ли хотя бы одно ключевое слово в специализациях мастера
          return master.skills.some((spec: string) => {
            const specLower = spec.toLowerCase();
            return keywords.some(keyword => specLower.includes(keyword.toLowerCase()));
          });
        });
        
        setMasters(filteredMasters);
        
        // Вычисляем средний рейтинг из загруженных мастеров
        if (filteredMasters.length > 0) {
          const totalRating = filteredMasters.reduce((sum: number, master: Master) => sum + master.rating, 0);
          setAvgRating(Number((totalRating / filteredMasters.length).toFixed(1)));
          
          // Подсчитываем общее количество выполненных заказов всех мастеров в категории
          const totalOrders = filteredMasters.reduce((sum: number, master: Master) => sum + master.completedOrders, 0);
          // Используем массив orders для хранения информации о количестве
          setOrders(Array(totalOrders).fill({}));
        } else {
          setAvgRating(0);
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
              <FiHome /> {t('categoryDetail.breadcrumb.home')}
            </Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <Link to="/categories" className={styles.breadcrumbLink}>
              {t('categoryDetail.breadcrumb.categories')}
            </Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>{category.name}</span>
          </nav>

          <div className={styles.heroContent}>
            <div className={styles.categoryImage}>
              <img src={category.image} alt={category.name} />
            </div>
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>{category.name}</h1>
              <p className={styles.heroDescription}>{category.description}</p>
              <div className={styles.heroStats}>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNumber}>{masters.length}</span>
                  <span className={styles.heroStatLabel}>{t('categoryDetail.stats.masters')}</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNumber}>{orders.length}</span>
                  <span className={styles.heroStatLabel}>{t('categoryDetail.stats.orders')}</span>
                </div>
                <div className={styles.heroStat}>
                  <span className={styles.heroStatNumber}>{category.avgRating}</span>
                  <span className={styles.heroStatLabel}>{t('categoryDetail.stats.rating')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'masters' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('masters')}
          >
            <FiUsers /> {t('categoryDetail.tabs.masters')}
            <span className={styles.tabCount}>{masters.length}</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className={styles.filtersBar}>
          <div className={styles.filtersLeft}>
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">{t('categoryDetail.filters.sortByRating')}</option>
              <option value="reviews">{t('categoryDetail.filters.sortByReviews')}</option>
              <option value="price-asc">{t('categoryDetail.filters.sortByPriceAsc')}</option>
              <option value="price-desc">{t('categoryDetail.filters.sortByPriceDesc')}</option>
              <option value="experience">{t('categoryDetail.filters.sortByExperience')}</option>
            </select>
            <select
              className={styles.filterSelect}
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">{t('categoryDetail.filters.anyPrice')}</option>
              <option value="low">{t('categoryDetail.filters.priceLow')}</option>
              <option value="medium">{t('categoryDetail.filters.priceMedium')}</option>
              <option value="high">{t('categoryDetail.filters.priceHigh')}</option>
            </select>
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t('categoryDetail.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button
              className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewButtonActive : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* Masters Tab Content */}
        {activeTab === 'masters' && (
          <div className={viewMode === 'grid' ? styles.mastersGrid : styles.mastersList}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                Загрузка...
              </div>
            ) : error ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'red' }}>
                {error}
              </div>
            ) : masters.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                Мастера не найдены
              </div>
            ) : (
              masters
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((master) => (
                <div key={master.id} className={styles.masterCard}>
                  <div className={styles.masterHeader}>
                    <img
                      src={master.profilePicture || 'https://via.placeholder.com/200'}
                      alt={master.name}
                      className={styles.masterAvatar}
                    />
                    <div className={styles.masterInfo}>
                      <h3 className={styles.masterName}>
                        {master.name}
                        {master.verified && (
                          <FiCheckCircle className={styles.verifiedBadge} />
                        )}
                      </h3>
                      <p className={styles.masterSpecialty}>{master.specialty}</p>
                      <div className={styles.masterRating}>
                        <div className={styles.stars}>{renderStars(master.rating)}</div>
                        <span className={styles.ratingValue}>{master.rating}</span>
                        <span className={styles.reviewsCount}>({master.completedOrders} {t('categoryDetail.master.reviews')})</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.masterStats}>
                    <div className={styles.masterStat}>
                      <span className={styles.masterStatValue}>{master.completedOrders}</span>
                      <span className={styles.masterStatLabel}>{t('categoryDetail.master.projects')}</span>
                    </div>
                    <div className={styles.masterStat}>
                      <span className={styles.masterStatValue}>{master.experience || 0}</span>
                      <span className={styles.masterStatLabel}>{t('categoryDetail.master.yearsExperience')}</span>
                    </div>
                  </div>
                  <div className={styles.masterTags}>
                    {master.specializations?.map((tag, idx) => (
                      <span key={idx} className={styles.masterTag}>{tag}</span>
                    ))}
                  </div>
                  <div className={styles.masterFooter}>
                    <div className={styles.masterPrice}>
                      {t('categoryDetail.master.from')} <span className={styles.masterPriceValue}>По договоренности</span>
                    </div>
                    <Link to={`/masters/${master.id}`} className={styles.masterButton}>
                      {t('categoryDetail.master.details')}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <div className={styles.ordersGrid}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                Загрузка...
              </div>
            ) : error ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'red' }}>
                {error}
              </div>
            ) : orders.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                Заказы не найдены
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderBadges}>
                    {order.status === 'auction' && (
                      <span className={`${styles.orderBadge} ${styles.badgeNew}`}>
                        {t('categoryDetail.order.new')}
                      </span>
                    )}
                  </div>
                  <h3 className={styles.orderTitle}>{order.title}</h3>
                  <p className={styles.orderDescription}>{order.description}</p>
                  <div className={styles.orderMeta}>
                    {order.location && (
                      <div className={styles.orderMetaItem}>
                        <FiMapPin /> {order.location}
                      </div>
                    )}
                    {order.deadline && (
                      <div className={styles.orderMetaItem}>
                        <FiClock /> {order.deadline}
                      </div>
                    )}
                  </div>
                  <div className={styles.orderFooter}>
                    <div>
                      <span className={styles.orderBudget}>{t('categoryDetail.order.budget')}</span>
                      <span className={styles.orderBudgetValue}>
                        {order.budget_min && order.budget_max 
                          ? `${order.budget_min.toLocaleString()} - ${order.budget_max.toLocaleString()} ₸`
                          : 'По договоренности'
                        }
                      </span>
                    </div>
                    <Link to={`/orders/${order.id}`} className={styles.orderButton}>
                      {t('categoryDetail.order.respond')}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {activeTab === 'masters' && masters.length > ITEMS_PER_PAGE && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <FiChevronLeft />
            </button>
            {(() => {
              const totalPages = Math.ceil(masters.length / ITEMS_PER_PAGE);
              const pages = [];
              const maxVisible = 5;
              
              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);
              
              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    className={`${styles.pageButton} ${currentPage === i ? styles.pageButtonActive : ''}`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i}
                  </button>
                );
              }
              
              return pages;
            })()}
            <button
              className={styles.pageButton}
              disabled={currentPage === Math.ceil(masters.length / ITEMS_PER_PAGE)}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        )}

        {/* CTA Section */}
        <section className={styles.cta}>
          <h2 className={styles.ctaTitle}>{t('categoryDetail.cta.title')}</h2>
          <p className={styles.ctaText}>
            {t('categoryDetail.cta.text')}
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/orders/create" className={`${styles.ctaButton} ${styles.ctaButtonPrimary}`}>
              {t('categoryDetail.cta.placeOrder')} <FiArrowRight />
            </Link>
            <Link to="/contact" className={`${styles.ctaButton} ${styles.ctaButtonSecondary}`}>
              {t('categoryDetail.cta.getConsultation')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
