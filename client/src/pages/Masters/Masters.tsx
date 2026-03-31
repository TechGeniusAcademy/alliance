import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { 
  FiChevronRight, 
  FiSearch,
  FiStar,
  FiBriefcase,
  FiMapPin,
  FiCheck,
  FiHeart,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiMessageCircle,
  FiArrowRight
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../constants';
import { Button } from '../../components/ui/Button';
import styles from './Masters.module.css';

const ITEMS_PER_PAGE = 20;

interface Master {
  id: string;
  name: string;
  avatar: string;
  specializationKey: string;
  rating: number;
  reviewsCount: number;
  ordersCount: number;
  city: string;
  isVerified: boolean;
  isPro: boolean;
  isOnline: boolean;
  portfolio: string[];
  moreWorks: number;
}

export const MastersPage = () => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка мастеров из базы данных
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/masters/public`);
        console.log('Masters API response:', response.data);
        const mastersData = response.data.map((master: any) => {
          console.log('Master data:', { id: master.id, name: master.name, profilePicture: master.profilePicture });
          return {
          id: master.id.toString(),
          name: master.name,
          avatar: master.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          specializationKey: master.specialty || 'kitchen',
          rating: parseFloat(master.rating) || 4.5,
          reviewsCount: master.reviews_count || 0,
          ordersCount: master.completedOrders || 0,
          city: master.address || 'Алматы',
          isVerified: master.is_verified || false,
          isPro: master.is_pro || false,
          isOnline: master.active || false,
          portfolio: master.portfolio || [],
          moreWorks: master.portfolio_count || 0
        };
        });
        setMasters(mastersData);
      } catch (error) {
        console.error('Ошибка загрузки мастеров:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMasters();
  }, []);

  // Получаем локализованную специализацию
  const getSpecialization = (key: string) => t(`${key}`);

  // Фильтрация мастеров
  const filteredMasters = masters.filter((master) => {
    // Поиск по имени, специализации или городу
    const nameText = master.name;
    const specText = getSpecialization(master.specializationKey);
    const cityText = master.city;
    const matchesSearch = searchQuery === '' || 
      nameText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cityText.toLowerCase().includes(searchQuery.toLowerCase());

    // Фильтры по категориям
    let matchesFilter = true;
    switch (activeFilter) {
      case 'kitchen':
        matchesFilter = master.specializationKey === 'kitchen';
        break;
      case 'wardrobes':
        matchesFilter = master.specializationKey === 'wardrobe' || 
                        master.specializationKey === 'cabinet';
        break;
      case 'soft':
        matchesFilter = master.specializationKey === 'soft';
        break;
      case 'rating':
        matchesFilter = master.rating >= 4.5;
        break;
      case 'verified':
        matchesFilter = master.isVerified;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  // Сортировка
  const sortedMasters = [...filteredMasters].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'orders':
        return b.ordersCount - a.ordersCount;
      case 'reviews':
        return b.reviewsCount - a.reviewsCount;
      default:
        return 0;
    }
  });

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <nav className={styles.breadcrumbs}>
            <Link to={ROUTES.HOME}>{t('nav.home')}</Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span>{t('nav.masters')}</span>
          </nav>
          <h1 className={styles.heroTitle}>{t('mastersPage.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>
            {t('mastersPage.heroSubtitle')}
          </p>
          <div className={styles.search}>
            <div className={styles.searchInputWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input 
                type="text" 
                className={styles.searchInput}
                placeholder={t('mastersPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="primary" size="large">
              {t('mastersPage.searchButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.main}>
        <div className={styles.mainContainer}>
          {/* Quick Filters */}
          <div className={styles.quickFilters}>
            <button 
              className={`${styles.filterChip} ${activeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              {t('mastersPage.allSpecializations')}
            </button>
            <button 
              className={`${styles.filterChip} ${activeFilter === 'kitchen' ? styles.active : ''}`}
              onClick={() => setActiveFilter('kitchen')}
            >
              {t('mastersPage.kitchens')}
            </button>
            <button 
              className={`${styles.filterChip} ${activeFilter === 'wardrobes' ? styles.active : ''}`}
              onClick={() => setActiveFilter('wardrobes')}
            >
              {t('mastersPage.wardrobes')}
            </button>
            <button 
              className={`${styles.filterChip} ${activeFilter === 'soft' ? styles.active : ''}`}
              onClick={() => setActiveFilter('soft')}
            >
              {t('mastersPage.softFurniture')}
            </button>
            <button 
              className={`${styles.filterChip} ${activeFilter === 'rating' ? styles.active : ''}`}
              onClick={() => setActiveFilter('rating')}
            >
              <FiStar /> {t('mastersPage.ratingFilter')}
            </button>
            <button 
              className={`${styles.filterChip} ${activeFilter === 'verified' ? styles.active : ''}`}
              onClick={() => setActiveFilter('verified')}
            >
              <FiCheck /> {t('mastersPage.verifiedFilter')}
            </button>
            <button 
              className={styles.filterReset}
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
            >
              {t('mastersPage.resetFilters')}
            </button>
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.resultsCount}>
              {t('mastersPage.found')}: <strong>{sortedMasters.length}</strong> {t('mastersPage.mastersCount')}
            </div>
            <div className={styles.toolbarRight}>
              <div className={styles.viewToggle}>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <FiGrid />
                </button>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <FiList />
                </button>
              </div>
              <select 
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="rating">{t('mastersPage.sortByRating')}</option>
                <option value="orders">{t('mastersPage.sortByOrders')}</option>
                <option value="reviews">{t('mastersPage.sortByReviews')}</option>
                <option value="date">{t('mastersPage.sortByDate')}</option>
              </select>
            </div>
          </div>

          {/* Masters Grid */}
          <div className={viewMode === 'grid' ? styles.mastersGrid : styles.mastersList}>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                {t('mastersPage.loading') || 'Загрузка...'}
              </div>
            ) : sortedMasters.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                {t('mastersPage.noMasters') || 'Мастера не найдены'}
              </div>
            ) : (
              sortedMasters
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((master) => (
              <div key={master.id} className={styles.masterCard}>
                <div className={styles.cardHeader}>
                  <button className={styles.favoriteBtn}>
                    <FiHeart />
                  </button>
                  <div className={styles.avatar}>
                    <img src={master.avatar} alt={master.name} />
                    {master.isOnline && <div className={styles.onlineBadge}></div>}
                  </div>
                  <div className={styles.masterInfo}>
                    <h3 className={styles.masterName}>
                      {master.name}
                      {master.isVerified && (
                        <span className={styles.verifiedBadge}>
                          <FiCheck />
                        </span>
                      )}
                      {master.isPro && <span className={styles.proBadge}>PRO</span>}
                    </h3>
                    <p className={styles.specialization}>{getSpecialization(master.specializationKey)}</p>
                    <div className={styles.location}>
                      <FiMapPin />
                      <span>{master.city}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.stats}>
                    <div className={styles.stat}>
                      <FiStar />
                      <span className={styles.rating}>{master.rating}</span>
                      <span>({master.reviewsCount})</span>
                    </div>
                    <div className={styles.stat}>
                      <FiBriefcase />
                      <span>{master.ordersCount} {t('mastersPage.ordersCount')}</span>
                    </div>
                  </div>
                  <div className={styles.portfolioPreview}>
                    {master.portfolio.map((img, idx) => (
                      <div key={idx} className={styles.portfolioItem}>
                        <img src={img} alt={`${t('portfolio.title')} ${idx + 1}`} />
                      </div>
                    ))}
                    {master.moreWorks > 0 && (
                      <div className={styles.portfolioMore}>+{master.moreWorks}</div>
                    )}
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <Button variant="outline" size="small">
                    <FiMessageCircle />
                    {t('mastersPage.writeMessage')}
                  </Button>
                  <Button 
                    variant="primary" 
                    size="small" 
                    as={Link} 
                    to={`${ROUTES.MASTERS}/${master.id}`}
                  >
                    {t('mastersPage.viewProfile')}
                  </Button>
                </div>
              </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {sortedMasters.length > ITEMS_PER_PAGE && (
            <div className={styles.pagination}>
              <button 
                className={styles.pageButton} 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <FiChevronLeft />
              </button>
              {(() => {
                const totalPages = Math.ceil(sortedMasters.length / ITEMS_PER_PAGE);
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
                      className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
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
                disabled={currentPage === Math.ceil(sortedMasters.length / ITEMS_PER_PAGE)}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>{t('mastersPage.ctaTitle')}</h2>
          <p className={styles.ctaText}>
            {t('mastersPage.ctaText')}
          </p>
          <Button 
            variant="primary" 
            size="large" 
            as={Link} 
            to={ROUTES.CONTACT}
            rightIcon={<FiArrowRight />}
          >
            {t('mastersPage.ctaButton')}
          </Button>
        </div>
      </section>
    </>
  );
};
