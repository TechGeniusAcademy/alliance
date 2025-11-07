import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList, MdImage, MdClose, MdLocationOn, MdAttachMoney, MdPerson, MdChat, MdStar, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import masterService from '../services/masterService';
import type { PortfolioItem } from '../services/masterService';
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
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [filteredPortfolio, setFilteredPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMasterProfile, setShowMasterProfile] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState<number | null>(null);
  
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
  }, [selectedItem]);

  const loadAllPortfolio = async () => {
    try {
      setLoading(true);
      const data = await masterService.getAllPublicPortfolio();
      setPortfolio(data);
      setFilteredPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      showToast('Ошибка при загрузке работ', 'error');
    } finally {
      setLoading(false);
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
    'Кухонная мебель',
    'Шкафы-купе и гардеробные',
    'Спальная мебель',
    'Гостиная (стенки, тумбы)',
    'Офисная мебель',
    'Детская мебель',
    'Прихожие',
    'Столы (обеденные, письменные)',
    'Стулья и кресла',
    'Корпусная мебель на заказ',
    'Мягкая мебель',
    'Встроенная мебель',
    'Ванная комната',
  ];

  const styles_list = ['Современный', 'Классический', 'Минимализм', 'Лофт', 'Скандинавский', 'Прованс'];
  const materials_list = ['ЛДСП', 'МДФ', 'Массив', 'Шпон', 'Пластик', 'Стекло', 'Металл'];

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
            Работы мебельщиков
          </h1>
          <p className={styles.subtitle}>
            {filteredPortfolio.length} {filteredPortfolio.length === 1 ? 'работа' : 'работ'}
          </p>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <MdSearch className={styles.searchIcon} size={24} />
          <input
            type="text"
            placeholder="Поиск по названию, материалам, типу мебели..."
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
          Фильтры
        </button>
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Категория</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Стиль</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Все стили</option>
              {styles_list.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Материал</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Все материалы</option>
              {materials_list.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Цена от (₸)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label>Цена до (₸)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="1000000"
              className={styles.filterInput}
            />
          </div>

          <button className={styles.clearFiltersButton} onClick={clearFilters}>
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Сетка работ */}
      {filteredPortfolio.length === 0 ? (
        <div className={styles.emptyState}>
          <MdImage size={80} />
          <h2>Работы не найдены</h2>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
          <button className={styles.clearFiltersButton} onClick={clearFilters}>
            Сбросить фильтры
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
                    <span>Нет фото</span>
                  </div>
                )}
                {item.images && item.images.length > 1 && (
                  <div className={styles.imageCount}>
                    <MdImage size={16} />
                    {item.images.length}
                  </div>
                )}
              </div>

              <div className={styles.cardContent}>
                <h3>{item.title}</h3>

                {item.category && (
                  <span className={styles.categoryBadge}>{item.category}</span>
                )}

                {item.furniture_type && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Тип:</span>
                    <span>{item.furniture_type}</span>
                  </div>
                )}

                {item.style && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Стиль:</span>
                    <span>{item.style}</span>
                  </div>
                )}

                {item.materials && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Материалы:</span>
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
                    <span>Нет изображений</span>
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
                    <h3>Описание</h3>
                    <p>{selectedItem.description}</p>
                  </div>
                )}

                <div className={styles.detailsGrid}>
                  {selectedItem.furniture_type && (
                    <div className={styles.detailItem}>
                      <strong>Тип мебели:</strong>
                      <span>{selectedItem.furniture_type}</span>
                    </div>
                  )}

                  {selectedItem.style && (
                    <div className={styles.detailItem}>
                      <strong>Стиль:</strong>
                      <span>{selectedItem.style}</span>
                    </div>
                  )}

                  {selectedItem.materials && (
                    <div className={styles.detailItem}>
                      <strong>Материалы:</strong>
                      <span>{selectedItem.materials}</span>
                    </div>
                  )}

                  {selectedItem.color && (
                    <div className={styles.detailItem}>
                      <strong>Цвет/Отделка:</strong>
                      <span>{selectedItem.color}</span>
                    </div>
                  )}

                  {selectedItem.dimensions && (
                    <div className={styles.detailItem}>
                      <strong>Размеры:</strong>
                      <span>{selectedItem.dimensions}</span>
                    </div>
                  )}

                  {selectedItem.execution_time && (
                    <div className={styles.detailItem}>
                      <strong>Срок изготовления:</strong>
                      <span>{selectedItem.execution_time}</span>
                    </div>
                  )}

                  {selectedItem.warranty_period && (
                    <div className={styles.detailItem}>
                      <strong>Гарантия:</strong>
                      <span>{selectedItem.warranty_period}</span>
                    </div>
                  )}

                  {selectedItem.location && (
                    <div className={styles.detailItem}>
                      <strong><MdLocationOn size={16} /> Место:</strong>
                      <span>{selectedItem.location}</span>
                    </div>
                  )}
                </div>

                <div className={styles.servicesSection}>
                  {selectedItem.assembly_included && (
                    <div className={styles.serviceBadge}>✓ Сборка включена</div>
                  )}
                  {selectedItem.delivery_included && (
                    <div className={styles.serviceBadge}>✓ Доставка включена</div>
                  )}
                </div>

                {selectedItem.price && (
                  <div className={styles.priceSection}>
                    <MdAttachMoney size={28} />
                    <span className={styles.priceLabel}>Стоимость:</span>
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
                Информация о мастере
              </h3>
              
              <div className={styles.masterCard}>
                  <div className={styles.masterDetails}>
                    <div className={styles.masterName}>
                      {selectedItem.master_name || 'Мастер'}
                    </div>

                    <div className={styles.masterStats}>
                      <div className={styles.statItem}>
                        <MdStar size={18} />
                        <span>4.8 (127 отзывов)</span>
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
                    Профиль мастера
                  </button>
                  
                  <button 
                    className={styles.contactButton}
                    onClick={() => navigate('/dashboard/messages', { 
                      state: { masterId: selectedItem.master_id, masterName: selectedItem.master_name } 
                    })}
                  >
                    <MdChat size={20} />
                    Написать сообщение
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
