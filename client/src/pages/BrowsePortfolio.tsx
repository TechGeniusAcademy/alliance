import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdSearch, MdFilterList, MdImage, MdClose, MdLocationOn, MdAttachMoney, MdPerson, MdChat, MdStar, MdChevronLeft, MdChevronRight, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import { masterService } from '../services/masterService';
import type { PortfolioItem, MasterPublicProfile } from '../services/masterService';
import { API_BASE_URL } from '../config/api';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import MasterProfileModal from '../components/MasterProfileModal';
import styles from './BrowsePortfolio.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const BrowsePortfolio = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [filteredPortfolio, setFilteredPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMasterProfile, setShowMasterProfile] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [masterInfo, setMasterInfo] = useState<MasterPublicProfile | null>(null);
  
  // Фильтры
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadAllPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, selectedStyle, minPrice, maxPrice, selectedMaterial, portfolio]);

  useEffect(() => {
    // Сбросить индекс изображения при открытии нового элемента
    setCurrentImageIndex(0);
    
    // Загрузить информацию о мастере
    if (selectedItem?.master_id) {
      loadMasterInfo(selectedItem.master_id);
    }
  }, [selectedItem]);

  const loadMasterInfo = async (masterId: number) => {
    try {
      const info = await masterService.getMasterProfile(masterId);
      setMasterInfo(info);
    } catch (error) {
      console.error('Error loading master info:', error);
      setMasterInfo(null);
    }
  };

  const loadAllPortfolio = async () => {
    try {
      setLoading(true);
      const data = await masterService.getAllPublicPortfolio();
      
      // Фильтруем работы мастеров, которые скрыли свое портфолио
      const filteredData = await Promise.all(
        data.map(async (item) => {
          if (!item.master_id) return item;
          
          try {
            // Проверяем публичные настройки мастера
            const response = await fetch(`${API_BASE_URL}/api/settings/master/${item.master_id}/public`);
            if (response.ok) {
              const settings = await response.json();
              // Если мастер скрыл портфолио, возвращаем null
              if (!settings.showPortfolio) {
                return null;
              }
            }
          } catch (error) {
            console.error('Error checking master settings:', error);
          }
          
          return item;
        })
      );
      
      // Убираем null значения (скрытые портфолио)
      const visiblePortfolio = filteredData.filter(item => item !== null) as PortfolioItem[];
      
      setPortfolio(visiblePortfolio);
      setFilteredPortfolio(visiblePortfolio);
      
      // Загружаем состояния избранного для каждой работы
      await loadFavorites(visiblePortfolio);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      showToast(t('browsePortfolio.errors.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async (items: PortfolioItem[]) => {
    try {
      const favoriteStatuses = await Promise.all(
        items.map(async (item) => {
          if (!item.id) return null;
          try {
            const isFavorite = await masterService.checkPortfolioFavorite(item.id);
            return isFavorite ? item.id : null;
          } catch {
            return null;
          }
        })
      );
      
      const favoriteIds = favoriteStatuses.filter(id => id !== null) as number[];
      setFavorites(new Set(favoriteIds));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleFavoriteToggle = async (portfolioId: number | undefined, event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем открытие модального окна
    
    if (!portfolioId) return;
    
    try {
      const isFavorite = favorites.has(portfolioId);
      
      if (isFavorite) {
        await masterService.removePortfolioFromFavorites(portfolioId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(portfolioId);
          return newSet;
        });
        showToast(t('browsePortfolio.favorites.removed'), 'success');
      } else {
        await masterService.addPortfolioToFavorites(portfolioId);
        setFavorites(prev => new Set(prev).add(portfolioId));
        showToast(t('browsePortfolio.favorites.added'), 'success');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast(t('browsePortfolio.favorites.error'), 'error');
    }
  };

  const applyFilters = () => {
    let filtered = [...portfolio];

    // Поиск по названию и описанию
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.furniture_type?.toLowerCase().includes(query) ||
        item.materials?.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Фильтр по стилю
    if (selectedStyle) {
      filtered = filtered.filter(item => 
        item.style?.toLowerCase().includes(selectedStyle.toLowerCase())
      );
    }

    // Фильтр по материалу
    if (selectedMaterial) {
      filtered = filtered.filter(item =>
        item.materials?.toLowerCase().includes(selectedMaterial.toLowerCase())
      );
    }

    // Фильтр по цене
    if (minPrice) {
      filtered = filtered.filter(item => (item.price || 0) >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(item => (item.price || 0) <= parseFloat(maxPrice));
    }

    setFilteredPortfolio(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStyle('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedMaterial('');
  };

  const categories = [
    t('browsePortfolio.categories.kitchen'),
    t('browsePortfolio.categories.wardrobes'),
    t('browsePortfolio.categories.bedroom'),
    t('browsePortfolio.categories.living'),
    t('browsePortfolio.categories.office'),
    t('browsePortfolio.categories.children'),
    t('browsePortfolio.categories.hallway'),
    t('browsePortfolio.categories.tables'),
    t('browsePortfolio.categories.chairs'),
    t('browsePortfolio.categories.custom'),
    t('browsePortfolio.categories.soft'),
    t('browsePortfolio.categories.builtin'),
    t('browsePortfolio.categories.bathroom'),
  ];

  const styles_list = [
    t('browsePortfolio.styles.modern'),
    t('browsePortfolio.styles.classic'),
    t('browsePortfolio.styles.minimalism'),
    t('browsePortfolio.styles.loft'),
    t('browsePortfolio.styles.scandinavian'),
    t('browsePortfolio.styles.provence')
  ];
  
  const materials_list = [
    t('browsePortfolio.materials.chipboard'),
    t('browsePortfolio.materials.mdf'),
    t('browsePortfolio.materials.solid'),
    t('browsePortfolio.materials.veneer'),
    t('browsePortfolio.materials.plastic'),
    t('browsePortfolio.materials.glass'),
    t('browsePortfolio.materials.metal')
  ];

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
        <div>
          <h1 className={styles.pageTitle}>
            <MdImage className={styles.titleIcon} />
            {t('browsePortfolio.title')}
          </h1>
          <p className={styles.subtitle}>
            {filteredPortfolio.length} {filteredPortfolio.length === 1 ? t('browsePortfolio.workCount.one') : t('browsePortfolio.workCount.many')}
          </p>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <MdSearch className={styles.searchIcon} size={24} />
          <input
            type="text"
            placeholder={t('browsePortfolio.search.placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button 
              className={styles.clearSearchButton}
              onClick={() => setSearchQuery('')}
            >
              <MdClose size={20} />
            </button>
          )}
        </div>

        <button 
          className={styles.filterToggleButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          <MdFilterList size={20} />
          {t('browsePortfolio.search.filters')}
        </button>
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>{t('browsePortfolio.filters.category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">{t('browsePortfolio.filters.allCategories')}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>{t('browsePortfolio.filters.style')}</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">{t('browsePortfolio.filters.allStyles')}</option>
              {styles_list.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>{t('browsePortfolio.filters.material')}</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">{t('browsePortfolio.filters.allMaterials')}</option>
              {materials_list.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>{t('browsePortfolio.filters.priceFrom')}</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>{t('browsePortfolio.filters.priceTo')}</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="1000000"
              className={styles.filterInput}
            />
          </div>

          <button className={styles.clearFiltersButton} onClick={clearFilters}>
            {t('browsePortfolio.search.clearFilters')}
          </button>
        </div>
      )}

      {/* Сетка работ */}
      {filteredPortfolio.length === 0 ? (
        <div className={styles.emptyState}>
          <MdImage size={80} />
          <h2>{t('browsePortfolio.emptyState.title')}</h2>
          <p>{t('browsePortfolio.emptyState.description')}</p>
          <button className={styles.clearFiltersButton} onClick={clearFilters}>
            {t('browsePortfolio.search.clearFilters')}
          </button>
        </div>
      ) : (
        <div className={styles.portfolioGrid}>
          {filteredPortfolio.map(item => (
            <div 
              key={item.id} 
              className={styles.portfolioCard}
              onClick={() => setSelectedItem(item)}
            >
              <div className={styles.cardImage}>
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} />
                ) : (
                  <div className={styles.noImage}>
                    <MdImage size={48} />
                    <span>{t('browsePortfolio.card.noPhoto')}</span>
                  </div>
                )}
                {item.images && item.images.length > 1 && (
                  <div className={styles.imageCount}>
                    <MdImage size={16} />
                    {item.images.length}
                  </div>
                )}
                {/* Кнопка избранного */}
                <button
                  className={styles.favoriteButton}
                  onClick={(e) => handleFavoriteToggle(item.id, e)}
                  title={favorites.has(item.id!) ? t('browsePortfolio.favorites.remove') : t('browsePortfolio.favorites.add')}
                >
                  {favorites.has(item.id!) ? (
                    <MdFavorite size={24} color="#ef4444" />
                  ) : (
                    <MdFavoriteBorder size={24} color="#fff" />
                  )}
                </button>
              </div>

              <div className={styles.cardContent}>
                <h3>{item.title}</h3>

                {item.category && (
                  <span className={styles.categoryBadge}>{item.category}</span>
                )}

                {item.furniture_type && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t('browsePortfolio.card.type')}</span>
                    <span>{item.furniture_type}</span>
                  </div>
                )}

                {item.style && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t('browsePortfolio.card.style')}</span>
                    <span>{item.style}</span>
                  </div>
                )}

                {item.materials && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>{t('browsePortfolio.card.materials')}</span>
                    <span>{item.materials}</span>
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.cardMeta}>
                    {item.price && (
                      <span className={styles.price}>
                        {item.price.toLocaleString()} ₸
                      </span>
                    )}
                    {item.execution_time && (
                      <span className={styles.executionTime}>
                        ⏱ {item.execution_time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно с подробностями */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSelectedItem(null)}>
              <MdClose size={24} />
            </button>

            <div className={styles.modalContent}>
              {/* Слайдер изображений */}
              <div className={styles.imageSlider}>
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <>
                    <div className={styles.mainImage}>
                      <img 
                        src={selectedItem.images[currentImageIndex]} 
                        alt={`${selectedItem.title} ${currentImageIndex + 1}`} 
                      />
                    </div>

                    {selectedItem.images.length > 1 && (
                      <>
                        <button 
                          className={`${styles.sliderButton} ${styles.sliderButtonPrev}`}
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === 0 ? selectedItem.images!.length - 1 : prev - 1
                          )}
                        >
                          <MdChevronLeft size={32} />
                        </button>

                        <button 
                          className={`${styles.sliderButton} ${styles.sliderButtonNext}`}
                          onClick={() => setCurrentImageIndex(prev => 
                            prev === selectedItem.images!.length - 1 ? 0 : prev + 1
                          )}
                        >
                          <MdChevronRight size={32} />
                        </button>

                        <div className={styles.imageCounter}>
                          {currentImageIndex + 1} / {selectedItem.images.length}
                        </div>

                        {/* Thumbnails */}
                        <div className={styles.thumbnails}>
                          {selectedItem.images.map((img, idx) => (
                            <div 
                              key={idx}
                              className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.thumbnailActive : ''}`}
                              onClick={() => setCurrentImageIndex(idx)}
                            >
                              <img src={img} alt={`Thumbnail ${idx + 1}`} />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className={styles.noImageLarge}>
                    <MdImage size={80} />
                    <span>{t('browsePortfolio.modal.noImages')}</span>
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className={styles.modalInfo}>
                <h2>{selectedItem.title}</h2>

                {selectedItem.category && (
                  <span className={styles.categoryBadge}>{selectedItem.category}</span>
                )}

                {selectedItem.description && (
                  <div className={styles.detailSection}>
                    <h3>{t('browsePortfolio.modal.description')}</h3>
                    <p>{selectedItem.description}</p>
                  </div>
                )}

                <div className={styles.detailsGrid}>
                  {selectedItem.furniture_type && (
                    <div className={styles.detailItem}>
                      <strong>{t('browsePortfolio.modal.furnitureType')}</strong>
                      <span>{selectedItem.furniture_type}</span>
                    </div>
                  )}

                  {selectedItem.style && (
                    <div className={styles.detailItem}>
                      <strong>{t('browsePortfolio.modal.style')}</strong>
                      <span>{selectedItem.style}</span>
                    </div>
                  )}

                  {selectedItem.materials && (
                    <div className={styles.detailItem}>
                      <strong>{t('browsePortfolio.modal.materials')}</strong>
                      <span>{selectedItem.materials}</span>
                    </div>
                  )}

                  {selectedItem.color && (
                    <div className={styles.detailItem}>
                      <strong>{t('browsePortfolio.modal.color')}</strong>
                      <span>{selectedItem.color}</span>
                    </div>
                  )}

                  {selectedItem.dimensions && (
                    <div className={styles.detailItem}>
                      <strong>{t('browsePortfolio.modal.dimensions')}</strong>
                      <span>{selectedItem.dimensions}</span>
                    </div>
                  )}

                  {selectedItem.execution_time && (
                    <div className={styles.detailItem}>
                      <strong>{t('browsePortfolio.modal.executionTime')}</strong>
                      <span>{selectedItem.execution_time}</span>
                    </div>
                  )}

                  {selectedItem.warranty_period && (
                    <div className={styles.detailItem}>
                      <strong>{t('browsePortfolio.modal.warranty')}</strong>
                      <span>{selectedItem.warranty_period}</span>
                    </div>
                  )}

                  {selectedItem.location && (
                    <div className={styles.detailItem}>
                      <strong><MdLocationOn size={16} /> {t('browsePortfolio.modal.location')}</strong>
                      <span>{selectedItem.location}</span>
                    </div>
                  )}
                </div>

                <div className={styles.servicesSection}>
                  {selectedItem.assembly_included && (
                    <div className={styles.serviceBadge}>✓ {t('browsePortfolio.modal.assemblyIncluded')}</div>
                  )}
                  {selectedItem.delivery_included && (
                    <div className={styles.serviceBadge}>✓ {t('browsePortfolio.modal.deliveryIncluded')}</div>
                  )}
                </div>

                {selectedItem.price && (
                  <div className={styles.priceSection}>
                    <MdAttachMoney size={28} />
                    <span className={styles.priceLabel}>{t('browsePortfolio.modal.price')}</span>
                    <span className={styles.priceValue}>
                      {selectedItem.price.toLocaleString()} ₸
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Информация о мастере - внизу на всю ширину */}
            <div className={styles.masterInfoSection}>
              <h3 className={styles.masterInfoTitle}>
                <MdPerson size={24} />
                {t('browsePortfolio.master.title')}
              </h3>
              
              <div className={styles.masterCard}>
                  <div className={styles.masterDetails}>
                    <div className={styles.masterName}>
                      {selectedItem.master_name || t('browsePortfolio.master.defaultName')}
                    </div>

                    <div className={styles.masterStats}>
                      <div className={styles.statItem}>
                        <MdStar size={18} />
                        <span>
                          {masterInfo?.rating ? `${Number(masterInfo.rating).toFixed(1)}` : t('browsePortfolio.master.noRating')}
                          {masterInfo?.completedOrders ? ` (${masterInfo.completedOrders} ${masterInfo.completedOrders === 1 ? t('browsePortfolio.master.orderCount.one') : masterInfo.completedOrders < 5 ? t('browsePortfolio.master.orderCount.few') : t('browsePortfolio.master.orderCount.many')})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>                <div className={styles.masterActions}>
                  <button 
                    className={styles.viewProfileButton}
                    onClick={() => {
                      setSelectedMasterId(selectedItem.master_id!);
                      setShowMasterProfile(true);
                    }}
                  >
                    <MdPerson size={20} />
                    {t('browsePortfolio.master.viewProfile')}
                  </button>
                  
                  <button 
                    className={styles.contactButton}
                    onClick={() => navigate('/dashboard/chats', { 
                      state: { masterId: selectedItem.master_id, masterName: selectedItem.master_name } 
                    })}
                  >
                    <MdChat size={20} />
                    {t('browsePortfolio.master.sendMessage')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно профиля мастера */}
      {showMasterProfile && selectedMasterId && (
        <MasterProfileModal 
          masterId={selectedMasterId} 
          onClose={() => {
            setShowMasterProfile(false);
            setSelectedMasterId(null);
          }} 
        />
      )}

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

export default BrowsePortfolio;
