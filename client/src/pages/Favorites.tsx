import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import { masterService } from '../services/masterService';
import { API_BASE_URL } from '../config/api';
import type { Favorite } from '../types/order';
import OrderCard from '../components/OrderCard';
import MasterProfileModal from '../components/MasterProfileModal';
import { MdSearch, MdFavorite, MdFavoriteBorder, MdShoppingCart, MdImage, MdClose, MdChevronLeft, MdChevronRight, MdPerson, MdStar, MdChat, MdAttachMoney, MdLocationOn } from 'react-icons/md';
import styles from './Orders.module.css';
import portfolioStyles from './BrowsePortfolio.module.css';

const Favorites = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [orderFavorites, setOrderFavorites] = useState<Favorite[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [portfolioFavorites, setPortfolioFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'portfolio'>('orders');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMasterProfile, setShowMasterProfile] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedItem]);

  const fetchPortfolioFavorites = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/portfolio-favorites`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.favorites || [];
  };

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, portfolioData] = await Promise.all([
        orderService.getFavorites().catch(() => []),
        fetchPortfolioFavorites().catch(() => [])
      ]);
      setOrderFavorites(ordersData);
      setPortfolioFavorites(portfolioData);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleOrderFavoriteToggle = async (orderId: number, isFavorite: boolean) => {
    try {
      if (!isFavorite) {
        await orderService.removeFromFavorites(orderId);
        setOrderFavorites(prev => prev.filter(fav => fav.orderId !== orderId));
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const handlePortfolioFavoriteRemove = async (portfolioId: number) => {
    try {
      await masterService.removePortfolioFromFavorites(portfolioId);
      setPortfolioFavorites(prev => prev.filter(fav => fav.portfolioId !== portfolioId));
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const filteredOrderFavorites = orderFavorites.filter(fav =>
    fav.order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.order.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPortfolioFavorites = portfolioFavorites.filter(fav =>
    fav.portfolio?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fav.portfolio?.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOrderPrice = orderFavorites.reduce((sum, fav) => {
    const price = fav.order.price.final || fav.order.price.max;
    return sum + price;
  }, 0);

  const totalCount = orderFavorites.length + portfolioFavorites.length;
  const displayedFavorites = activeTab === 'orders' ? filteredOrderFavorites : filteredPortfolioFavorites;

  return (
    <div className={styles.ordersPage}>
      <div className={styles.pageHeader} style={{ padding: '1.5rem 0', marginBottom: '1.5rem' }}>
        <div>
          <h1 className={styles.pageTitle} style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            <MdFavorite className={styles.titleIcon} style={{ color: '#ef4444' }} />
            {t('favoritesPage.title')}
          </h1>
          <p className={styles.pageSubtitle} style={{ fontSize: '0.875rem' }}>{t('favoritesPage.subtitle')}</p>
        </div>
        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.statCardFavorite}`} style={{ padding: '0.75rem 1rem' }}>
            <div className={styles.statValue} style={{ fontSize: '1.5rem' }}>{totalCount}</div>
            <div className={styles.statLabel} style={{ fontSize: '0.75rem' }}>{t('favoritesPage.stats.total')}</div>
          </div>
          {activeTab === 'orders' && (
            <div className={styles.statCard} style={{ padding: '0.75rem 1rem' }}>
              <div className={styles.statValue} style={{ fontSize: '1.5rem' }}>{totalOrderPrice.toLocaleString('ru-RU')} ₸</div>
              <div className={styles.statLabel} style={{ fontSize: '0.75rem' }}>{t('favoritesPage.stats.totalCost')}</div>
            </div>
          )}
        </div>
      </div>

      {/* Табы */}
      <div className={styles.tabs} style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button
          className={activeTab === 'orders' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.625rem 1.25rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: activeTab === 'orders' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
            color: activeTab === 'orders' ? '#fff' : '#666',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <MdShoppingCart size={18} />
          {t('favoritesPage.tabs.orders')} ({orderFavorites.length})
        </button>
        <button
          className={activeTab === 'portfolio' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('portfolio')}
          style={{
            padding: '0.625rem 1.25rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: activeTab === 'portfolio' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
            color: activeTab === 'portfolio' ? '#fff' : '#666',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <MdImage size={18} />
          {t('favoritesPage.tabs.portfolio')} ({portfolioFavorites.length})
        </button>
      </div>

      <div className={styles.filters} style={{ marginBottom: '1.25rem' }}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('favoritesPage.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            style={{ fontSize: '0.875rem', padding: '0.625rem 0.875rem 0.625rem 2.5rem' }}
          />
        </div>

      </div>

      {loading ? (
        <div className={styles.loadingContainer} style={{ padding: '3rem' }}>
          <div className={styles.loader}></div>
          <p style={{ fontSize: '0.875rem' }}>{t('favoritesPage.loading')}</p>
        </div>
      ) : displayedFavorites.length === 0 ? (
        <div className={styles.emptyState} style={{ padding: '3rem 1.5rem' }}>
          <div className={styles.emptyIcon}>
            <MdFavoriteBorder size={56} />
          </div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{t('favoritesPage.empty.title')}</h3>
          <p style={{ fontSize: '0.875rem' }}>
            {activeTab === 'orders' 
              ? t('favoritesPage.empty.orders')
              : t('favoritesPage.empty.portfolio')}
          </p>
        </div>
      ) : (
        <>
          {activeTab === 'orders' ? (
            <div className={styles.ordersGrid}>
              {filteredOrderFavorites.map(fav => (
                <OrderCard
                  key={fav.id}
                  order={fav.order}
                  onFavoriteToggle={handleOrderFavoriteToggle}
                  isFavorite={true}
                />
              ))}
            </div>
          ) : (
            <div className={styles.ordersGrid}>
              {filteredPortfolioFavorites.map(fav => (
                <div 
                  key={fav.id}
                  onClick={() => {
                    setSelectedItem(fav.portfolio);
                    setCurrentImageIndex(0);
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ position: 'relative', paddingTop: '60%', background: '#f5f5f5' }}>
                    {fav.portfolio?.images?.[0] ? (
                      <img 
                        src={fav.portfolio.images[0]} 
                        alt={fav.portfolio.title}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                      }}>
                        <MdImage size={40} />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortfolioFavoriteRemove(fav.portfolioId);
                      }}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        zIndex: 2
                      }}
                    >
                      <MdFavorite size={20} color="#ef4444" />
                    </button>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', lineHeight: '1.3' }}>
                      {fav.portfolio?.title || t('favoritesPage.portfolio.noTitle')}
                    </h3>
                    {fav.portfolio?.description && (
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.8125rem', lineHeight: '1.4' }}>
                        {fav.portfolio.description.slice(0, 80)}...
                      </p>
                    )}
                    {fav.portfolio?.price && (
                      <div style={{ fontWeight: '600', color: '#667eea', fontSize: '0.95rem' }}>
                        {fav.portfolio.price.toLocaleString('ru-RU')} ₸
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal window for portfolio item details */}
      {selectedItem && (
        <div 
          className={portfolioStyles.modalOverlay}
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className={portfolioStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={portfolioStyles.closeButton}
              onClick={() => setSelectedItem(null)}
            >
              <MdClose size={24} />
            </button>

            <div className={portfolioStyles.imageSlider}>
              <img 
                src={selectedItem.images?.[currentImageIndex] || ''} 
                alt={selectedItem.title}
                className={portfolioStyles.mainImage}
              />
              
              {selectedItem.images && selectedItem.images.length > 1 && (
                <>
                  <button 
                    className={`${portfolioStyles.sliderButton} ${portfolioStyles.prevButton}`}
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? selectedItem.images!.length - 1 : prev - 1
                    )}
                  >
                    <MdChevronLeft size={32} />
                  </button>
                  <button 
                    className={`${portfolioStyles.sliderButton} ${portfolioStyles.nextButton}`}
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === selectedItem.images!.length - 1 ? 0 : prev + 1
                    )}
                  >
                    <MdChevronRight size={32} />
                  </button>
                  <div className={portfolioStyles.imageCounter}>
                    {currentImageIndex + 1} / {selectedItem.images.length}
                  </div>
                </>
              )}
              
              {selectedItem.images && selectedItem.images.length > 1 && (
                <div className={portfolioStyles.thumbnails}>
                  {selectedItem.images.map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${selectedItem.title} ${idx + 1}`}
                      className={`${portfolioStyles.thumbnail} ${idx === currentImageIndex ? portfolioStyles.activeThumbnail : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className={portfolioStyles.modalInfo}>
              <h2 className={portfolioStyles.modalTitle}>{selectedItem.title}</h2>
              
              {selectedItem.category && (
                <span className={portfolioStyles.categoryBadge}>
                  {selectedItem.category}
                </span>
              )}

              {selectedItem.description && (
                <p className={portfolioStyles.description}>{selectedItem.description}</p>
              )}

              <div className={portfolioStyles.detailsGrid}>
                {selectedItem.furniture_type && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>{t('favoritesPage.portfolio.details.furnitureType')}</span>
                    <span className={portfolioStyles.detailValue}>{selectedItem.furniture_type}</span>
                  </div>
                )}
                {selectedItem.style && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>{t('favoritesPage.portfolio.details.style')}</span>
                    <span className={portfolioStyles.detailValue}>{selectedItem.style}</span>
                  </div>
                )}
                {selectedItem.materials && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>{t('favoritesPage.portfolio.details.materials')}</span>
                    <span className={portfolioStyles.detailValue}>
                      {Array.isArray(selectedItem.materials) 
                        ? selectedItem.materials.join(', ')
                        : selectedItem.materials}
                    </span>
                  </div>
                )}
                {selectedItem.color && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>{t('favoritesPage.portfolio.details.color')}</span>
                    <span className={portfolioStyles.detailValue}>{selectedItem.color}</span>
                  </div>
                )}
                {selectedItem.dimensions && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>{t('favoritesPage.portfolio.details.dimensions')}</span>
                    <span className={portfolioStyles.detailValue}>
                      {selectedItem.dimensions.width && `Ш: ${selectedItem.dimensions.width}см`}
                      {selectedItem.dimensions.height && `, В: ${selectedItem.dimensions.height}см`}
                      {selectedItem.dimensions.depth && `, Г: ${selectedItem.dimensions.depth}см`}
                    </span>
                  </div>
                )}
                {selectedItem.execution_time && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>{t('favoritesPage.portfolio.details.executionTime')}</span>
                    <span className={portfolioStyles.detailValue}>{selectedItem.execution_time} {t('favoritesPage.portfolio.details.days')}</span>
                  </div>
                )}
                {selectedItem.warranty_period && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>{t('favoritesPage.portfolio.details.warranty')}</span>
                    <span className={portfolioStyles.detailValue}>{selectedItem.warranty_period} {t('favoritesPage.portfolio.details.months')}</span>
                  </div>
                )}
                {selectedItem.location && (
                  <div className={portfolioStyles.detailItem}>
                    <span className={portfolioStyles.detailLabel}>
                      <MdLocationOn size={18} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {t('favoritesPage.portfolio.details.location')}
                    </span>
                    <span className={portfolioStyles.detailValue}>{selectedItem.location}</span>
                  </div>
                )}
              </div>

              {(selectedItem.assembly_included !== undefined || selectedItem.delivery_included !== undefined) && (
                <div className={portfolioStyles.servicesSection}>
                  <h4>{t('favoritesPage.portfolio.services.title')}</h4>
                  <div className={portfolioStyles.servicesBadges}>
                    {selectedItem.assembly_included && (
                      <span className={portfolioStyles.serviceBadge}>✓ {t('favoritesPage.portfolio.services.assembly')}</span>
                    )}
                    {selectedItem.delivery_included && (
                      <span className={portfolioStyles.serviceBadge}>✓ {t('favoritesPage.portfolio.services.delivery')}</span>
                    )}
                  </div>
                </div>
              )}

              {selectedItem.price && (
                <div className={portfolioStyles.priceSection}>
                  <MdAttachMoney size={24} />
                  <span className={portfolioStyles.price}>
                    {selectedItem.price.toLocaleString('ru-RU')} ₸
                  </span>
                </div>
              )}

              {selectedItem.master && (
                <div className={portfolioStyles.masterInfoSection}>
                  <h4>{t('favoritesPage.portfolio.master.title')}</h4>
                  <div className={portfolioStyles.masterInfo}>
                    <div className={portfolioStyles.masterDetails}>
                      <p className={portfolioStyles.masterName}>{selectedItem.master.name}</p>
                      {selectedItem.master.rating !== undefined && (
                        <div className={portfolioStyles.masterRating}>
                          <MdStar color="#fbbf24" size={20} />
                          <span>{selectedItem.master.rating.toFixed(1)}</span>
                          {selectedItem.master.reviewsCount !== undefined && (
                            <span className={portfolioStyles.reviewsCount}>
                              ({selectedItem.master.reviewsCount} {t('favoritesPage.portfolio.master.reviews')})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={portfolioStyles.masterActions}>
                      <button 
                        className={portfolioStyles.viewProfileButton}
                        onClick={() => {
                          setSelectedMasterId(selectedItem.master!.id);
                          setShowMasterProfile(true);
                        }}
                      >
                        <MdPerson size={20} />
                        {t('favoritesPage.portfolio.master.profile')}
                      </button>
                      <button 
                        className={portfolioStyles.contactButton}
                        onClick={() => navigate(`/dashboard/messages?masterId=${selectedItem.master!.id}`)}
                      >
                        <MdChat size={20} />
                        {t('favoritesPage.portfolio.master.contact')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Master Profile Modal */}
      {showMasterProfile && selectedMasterId && (
        <MasterProfileModal
          masterId={selectedMasterId}
          onClose={() => {
            setShowMasterProfile(false);
            setSelectedMasterId(null);
          }}
        />
      )}
    </div>
  );
};

export default Favorites;
