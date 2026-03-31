import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { MdShoppingCart, MdAttachMoney, MdCalendarToday, MdLocationOn, MdPerson, MdTimer, MdClose, MdTrendingUp, MdEdit, MdImage, MdViewInAr, MdLocalShipping, MdBuild, MdCategory, MdStraighten, MdSearch, MdSort, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { orderService, type AuctionOrder } from '../../services/orderService';
import bidService from '../../services/bidService';
import type { Bid, BidCompetition } from '../../services/bidService';
import { commissionService, type CommissionCalculation } from '../../services/commissionService';
import { Bed, Wardrobe, Table, Chair, Sofa, Dresser, Grill } from '../../components/3d/FurnitureModels';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './MasterOrders.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const MasterOrders = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<AuctionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AuctionOrder | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bidPrice, setBidPrice] = useState('');
  const [bidDays, setBidDays] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [existingBid, setExistingBid] = useState<Bid | null>(null);
  const [competition, setCompetition] = useState<BidCompetition | null>(null);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [commissionInfo, setCommissionInfo] = useState<CommissionCalculation | null>(null);

  // Фильтры и поиск
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBudget, setFilterBudget] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'bids'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 9;

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getBidsText = (count: number) => {
    if (count === 1) return t('masterOrders.bids');
    return t('masterOrders.bidsPlural');
  };

  useEffect(() => {
    loadAuctionOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сбросить на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCategory, filterBudget, sortBy, sortOrder]);

  const loadAuctionOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading auction orders...');
      const data = await orderService.getAuctionOrders();
      console.log('Auction orders loaded:', data);
      setOrders(data);
    } catch (error) {
      console.error('Error loading auction orders:', error);
      showToast(t('masterOrders.notifications.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidModal = async (order: AuctionOrder) => {
    setSelectedOrder(order);
    setShowBidModal(true);
    setBidPrice('');
    setBidDays('');
    setBidComment('');
    setExistingBid(null);
    setCompetition(null);

    // Загружаем существующую ставку если есть
    try {
      const bid = await bidService.getMyBidForOrder(order.id);
      if (bid) {
        setExistingBid(bid);
        setBidPrice(bid.proposed_price.toString());
        setBidDays(bid.estimated_days.toString());
        setBidComment(bid.comment || '');
      }
    } catch (error) {
      console.error('Error loading bid:', error);
    }

    // Загружаем информацию о конкуренции
    try {
      const comp = await bidService.getCompetition(order.id);
      setCompetition(comp);
    } catch (error) {
      console.error('Error loading competition:', error);
    }
  };

  const handleOpenDetailsModal = (order: AuctionOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleCloseBidModal = () => {
    setShowBidModal(false);
    setBidPrice('');
    setBidDays('');
    setBidComment('');
    setExistingBid(null);
    setCompetition(null);
    setCommissionInfo(null);
  };

  // Рассчитать комиссию при изменении цены
  const handleBidPriceChange = async (value: string) => {
    setBidPrice(value);
    const price = parseFloat(value);
    
    if (!isNaN(price) && price > 0) {
      try {
        const commission = await commissionService.calculateCommission(price);
        setCommissionInfo(commission);
      } catch (error) {
        console.error('Error calculating commission:', error);
        setCommissionInfo(null);
      }
    } else {
      setCommissionInfo(null);
    }
  };

  const handleSubmitBid = async () => {
    if (!selectedOrder) return;

    const price = parseFloat(bidPrice);
    const days = parseInt(bidDays);

    if (isNaN(price) || price <= 0) {
      showToast(t('masterOrders.notifications.errorPrice'), 'error');
      return;
    }

    if (isNaN(days) || days <= 0) {
      showToast(t('masterOrders.notifications.errorDuration'), 'error');
      return;
    }

    try {
      setSubmittingBid(true);
      await bidService.createBid(selectedOrder.id, {
        proposed_price: price,
        estimated_days: days,
        comment: bidComment,
      });

      showToast(existingBid ? t('masterOrders.notifications.bidUpdated') : t('masterOrders.notifications.bidCreated'), 'success');
      handleCloseBidModal();
      loadAuctionOrders(); // Перезагружаем заказы
    } catch (error: unknown) {
      console.error('Error submitting bid:', error);
      
      const err = error as { response?: { data?: { error?: string; message?: string; unpaidCount?: number; totalUnpaid?: number } } };
      
      if (err.response?.data?.error === 'UNPAID_COMMISSIONS') {
        const unpaidCount = err.response.data.unpaidCount || 0;
        const totalUnpaid = err.response.data.totalUnpaid || 0;
        showToast(
          t('masterOrders.notifications.errorUnpaid', { count: unpaidCount, total: totalUnpaid.toFixed(2) }),
          'error'
        );
      } else {
        showToast(err.response?.data?.message || t('masterOrders.notifications.errorGeneral'), 'error');
      }
    } finally {
      setSubmittingBid(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '—';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
  };

  // Фильтрация и сортировка заказов
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Поиск по названию и описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.title.toLowerCase().includes(query) ||
        order.description.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории
    if (filterCategory !== 'all') {
      filtered = filtered.filter(order => 
        order.category === filterCategory || order.furniture_type === filterCategory
      );
    }

    // Фильтр по бюджету
    if (filterBudget !== 'all') {
      filtered = filtered.filter(order => {
        if (!order.budget_max) return true;
        
        switch (filterBudget) {
          case 'low':
            return order.budget_max <= 100000;
          case 'medium':
            return order.budget_max > 100000 && order.budget_max <= 500000;
          case 'high':
            return order.budget_max > 500000;
          default:
            return true;
        }
      });
    }

    // Сортировка
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'date':
          compareValue = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'price':
          compareValue = (b.budget_max || 0) - (a.budget_max || 0);
          break;
        case 'bids':
          compareValue = (b.bids_count || 0) - (a.bids_count || 0);
          break;
      }

      return sortOrder === 'asc' ? -compareValue : compareValue;
    });

    return filtered;
  }, [orders, searchQuery, filterCategory, filterBudget, sortBy, sortOrder]);

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filteredAndSortedOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredAndSortedOrders, currentPage, ordersPerPage]);

  // Получить уникальные категории
  const categories = useMemo(() => {
    const cats = new Set<string>();
    orders.forEach(order => {
      if (order.category) cats.add(order.category);
      if (order.furniture_type) cats.add(order.furniture_type);
    });
    return Array.from(cats);
  }, [orders]);

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
          <MdShoppingCart className={styles.titleIcon} />
          {t('masterOrders.title')}
          {(searchQuery || filterCategory !== 'all' || filterBudget !== 'all') && (
            <span className={styles.filterBadge}>
              {[searchQuery ? 1 : 0, filterCategory !== 'all' ? 1 : 0, filterBudget !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)} {t('masterOrders.activeFilters')}
            </span>
          )}
        </h1>
        <p className={styles.pageSubtitle}>
          {t('masterOrders.subtitle')}
        </p>
      </div>

      {/* Фильтры и поиск */}
      {orders.length > 0 && (
        <div className={styles.filterSection}>
          {/* Поиск */}
          <div className={styles.searchBox}>
            <MdSearch size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t('masterOrders.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Фильтры */}
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <MdCategory size={18} />
                {t('masterOrders.category')}
              </label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">{t('masterOrders.allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <MdAttachMoney size={18} />
                {t('masterOrders.budgetFilter')}
              </label>
              <select 
                value={filterBudget} 
                onChange={(e) => setFilterBudget(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">{t('masterOrders.anyBudget')}</option>
                <option value="low">{t('masterOrders.budgetLow')}</option>
                <option value="medium">{t('masterOrders.budgetMedium')}</option>
                <option value="high">{t('masterOrders.budgetHigh')}</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <MdSort size={18} />
                {t('masterOrders.sortBy')}
              </label>
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-') as ['date' | 'price' | 'bids', 'asc' | 'desc'];
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className={styles.filterSelect}
              >
                <option value="date-desc">{t('masterOrders.sortNewest')}</option>
                <option value="date-asc">{t('masterOrders.sortOldest')}</option>
                <option value="price-desc">{t('masterOrders.sortPriceDesc')}</option>
                <option value="price-asc">{t('masterOrders.sortPriceAsc')}</option>
                <option value="bids-desc">{t('masterOrders.sortBidsDesc')}</option>
                <option value="bids-asc">{t('masterOrders.sortBidsAsc')}</option>
              </select>
            </div>
          </div>

          {/* Информация о результатах */}
          <div className={styles.resultsInfo}>
            <div>
              {t('masterOrders.found')} <span className={styles.resultsCount}>{filteredAndSortedOrders.length}</span> {t('masterOrders.of')} {orders.length} {t('masterOrders.orders')}
            </div>
            {(searchQuery || filterCategory !== 'all' || filterBudget !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setFilterBudget('all');
                  setCurrentPage(1);
                }}
                className={styles.clearFilters}
              >
                {t('masterOrders.clearFilters')}
              </button>
            )}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t('masterOrders.noOrders')}</p>
        </div>
      ) : filteredAndSortedOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t('masterOrders.noResults')}</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
              setFilterBudget('all');
            }}
            className={styles.clearFilters}
            style={{ marginTop: '16px' }}
          >
            {t('masterOrders.clearFilters')}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.ordersGrid}>
            {paginatedOrders.map((order) => (
            <div 
              key={order.id} 
              className={styles.orderCard}
              onClick={() => handleOpenDetailsModal(order)}
            >
              <div className={styles.orderHeader}>
                <div>
                  <h3 className={styles.orderTitle}>
                    {order.title}
                  </h3>
                  <div className={styles.orderMeta}>
                    {order.customer_name && (
                      <div className={styles.metaItem}>
                        <MdPerson size={18} />
                        <span>{order.customer_name}</span>
                      </div>
                    )}
                    {order.customer_address && (
                      <div className={styles.metaItem}>
                        <MdLocationOn size={18} />
                        <span>{order.customer_address}</span>
                      </div>
                    )}
                    <div className={styles.metaItem}>
                      <MdTimer size={18} />
                      <span>{t('masterOrders.createdOn')} {formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.bidsBadge}>
                  {order.bids_count || 0} {getBidsText(order.bids_count || 0)}
                </div>
              </div>

              <p className={styles.orderDescription}>
                {order.description}
              </p>

              <div className={styles.orderDetails}>
                {order.budget_min && order.budget_max && (
                  <div className={styles.detailItem}>
                    <MdAttachMoney size={24} color="#667eea" />
                    <div>
                      <div className={styles.detailLabel}>{t('masterOrders.budgetLabel')}</div>
                      <div className={styles.detailValue}>
                        {formatPrice(order.budget_min)} - {formatPrice(order.budget_max)}
                      </div>
                    </div>
                  </div>
                )}
                {order.deadline && (
                  <div className={styles.detailItem}>
                    <MdCalendarToday size={24} color="#667eea" />
                    <div>
                      <div className={styles.detailLabel}>{t('masterOrders.deadline')}</div>
                      <div className={styles.detailValue}>
                        {formatDate(order.deadline)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(order.materials || order.dimensions) && (
                <div className={styles.orderSpecs}>
                  {order.materials && (
                    <div>
                      <strong>{t('masterOrders.materials')}</strong> {order.materials}
                    </div>
                  )}
                  {order.dimensions && (
                    <div>
                      <strong>{t('masterOrders.dimensions')}</strong> {order.dimensions}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.orderTags}>
                {order.delivery_required && (
                  <span className={styles.tag}>
                    {t('masterOrders.deliveryRequired')}
                  </span>
                )}
                {order.assembly_required && (
                  <span className={styles.tag}>
                    {t('masterOrders.assemblyRequired')}
                  </span>
                )}
              </div>

              <div className={styles.orderActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBidModal(order);
                  }}
                  className={styles.bidButton}
                >
                  {order.bids_count && order.bids_count > 0 ? <MdEdit size={20} className={styles.buttonIcon} /> : null}
                  {order.bids_count && order.bids_count > 0 ? t('masterOrders.updateBid') : t('masterOrders.makeBid')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.pageButton}
              title={t('masterOrders.pagination.previous')}
            >
              <MdChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Показываем только некоторые страницы
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`${styles.pageButton} ${currentPage === pageNum ? styles.active : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className={styles.pageInfo}>...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
              title={t('masterOrders.pagination.next')}
            >
              <MdChevronRight size={20} />
            </button>

            <span className={styles.pageInfo}>
              {t('masterOrders.pagination.page')} {currentPage} {t('masterOrders.pagination.of')} {totalPages}
            </span>
          </div>
        )}
      </>
      )}

      {/* Модальное окно с деталями заказа */}
      {showDetailsModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={handleCloseDetailsModal}>
          <div 
            className={`${styles.modalContent} ${styles.modalContentLarge}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalBody}>
              {/* Заголовок */}
              <div className={styles.modalHeader}>
                <button onClick={handleCloseDetailsModal} className={styles.closeButton}>
                  <MdClose size={24} />
                </button>
                <h2 className={styles.modalTitle}>
                  {selectedOrder.title}
                </h2>
                <div className={styles.orderMeta}>
                  {selectedOrder.customer_name && (
                    <div className={styles.metaItem}>
                      <MdPerson size={18} />
                      <span>{selectedOrder.customer_name}</span>
                    </div>
                  )}
                  {selectedOrder.customer_address && (
                    <div className={styles.metaItem}>
                      <MdLocationOn size={18} />
                      <span>{selectedOrder.customer_address}</span>
                    </div>
                  )}
                  <div className={styles.metaItem}>
                    <MdTimer size={18} />
                    <span>Создан: {formatDate(selectedOrder.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailsGrid}>
                {/* Левая колонка - 3D Визуализация */}
                <div className={styles.visualSection}>
                  <div className={styles.canvas3d}>
                    {selectedOrder.furniture_config ? (
                      <Canvas 
                        camera={{ position: [3, 2, 5], fov: 50 }}
                        shadows
                        gl={{ antialias: true, alpha: false }}
                        className={styles.canvas3d}
                      >
                        <color attach="background" args={['#ffffff']} />
                        <ambientLight intensity={0.4} />
                        <directionalLight 
                          position={[5, 10, 5]} 
                          intensity={1}
                          castShadow
                          shadow-mapSize-width={2048}
                          shadow-mapSize-height={2048}
                        />
                        <spotLight 
                          position={[-5, 10, -5]} 
                          intensity={0.3}
                          angle={0.3}
                          penumbra={1}
                        />
                        
                        {/* Рендерим мебель на основе конфигурации */}
                        {selectedOrder.furniture_config.type === 'bed' && <Bed config={selectedOrder.furniture_config} />}
                        {selectedOrder.furniture_config.type === 'wardrobe' && <Wardrobe config={selectedOrder.furniture_config} />}
                        {selectedOrder.furniture_config.type === 'table' && <Table config={selectedOrder.furniture_config} />}
                        {selectedOrder.furniture_config.type === 'chair' && <Chair config={selectedOrder.furniture_config} />}
                        {selectedOrder.furniture_config.type === 'sofa' && <Sofa config={selectedOrder.furniture_config} />}
                        {selectedOrder.furniture_config.type === 'dresser' && <Dresser config={selectedOrder.furniture_config} />}
                        {selectedOrder.furniture_config.type === 'grill' && <Grill config={selectedOrder.furniture_config} />}
                        
                        <Grid 
                          args={[20, 20]} 
                          cellSize={0.5}
                          cellThickness={0.5}
                          cellColor="#cccccc"
                          sectionSize={2}
                          sectionThickness={1}
                          sectionColor="#999999"
                          fadeDistance={25}
                          fadeStrength={1}
                          followCamera={false}
                        />
                        
                        <Environment preset="apartment" />
                        <OrbitControls 
                          enableDamping
                          dampingFactor={0.05}
                          minDistance={2}
                          maxDistance={10}
                          maxPolarAngle={Math.PI / 2}
                        />
                      </Canvas>
                    ) : (
                      <div className={styles.noModel}>
                        <MdViewInAr size={80} className={styles.noModelIcon} />
                        <h3 className={styles.noModelTitle}>3D Визуализация</h3>
                        <p className={styles.noModelText}>
                          3D модель не была создана для этого заказа
                        </p>
                        {/* Декоративные элементы */}
                        <div className={styles.decorCircle1} />
                        <div className={styles.decorCircle2} />
                      </div>
                    )}
                  </div>

                  {/* Фотографии */}
                  {selectedOrder.photos && selectedOrder.photos.length > 0 && (
                    <div className={styles.photosSection}>
                      <h4 className={styles.sectionTitle}>
                        <MdImage size={20} />
                        Фотографии
                      </h4>
                      <div className={styles.photosGrid}>
                        {selectedOrder.photos.map((photo, index) => (
                          <div key={index} className={styles.photoItem}>
                            <img
                              src={photo}
                              alt={`Фото ${index + 1}`}
                              className={styles.photoImage}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Правая колонка - Детали */}
                <div>
                  {/* Описание */}
                  <div className={styles.infoSection}>
                    <h4 className={styles.sectionTitle}>Описание заказа</h4>
                    <div className={styles.descriptionBox}>
                      {selectedOrder.description.split('\n').filter(line => line.trim()).map((line, index) => {
                        const [label, ...valueParts] = line.split(':');
                        const value = valueParts.join(':').trim();
                        
                        if (value) {
                          return (
                            <div key={index} className={styles.descriptionLine}>
                              <strong className={styles.descriptionLabel}>
                                {label.trim()}:
                              </strong>
                              <span className={styles.descriptionValue}>
                                {value}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Основные параметры */}
                  <div className={styles.paramBox}>
                    <h4 className={styles.sectionTitle}>Основные параметры</h4>
                    <div className={styles.paramGrid}>
                      {selectedOrder.budget_min && selectedOrder.budget_max && (
                        <div className={styles.paramItem}>
                          <MdAttachMoney size={24} color="#667eea" className={styles.paramIcon} />
                          <div className={styles.paramContent}>
                            <div className={styles.detailLabel}>Бюджет</div>
                            <div className={styles.detailValue}>
                              {formatPrice(selectedOrder.budget_min)} - {formatPrice(selectedOrder.budget_max)}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.deadline && (
                        <div className={styles.paramItem}>
                          <MdCalendarToday size={24} color="#667eea" className={styles.paramIcon} />
                          <div className={styles.paramContent}>
                            <div className={styles.detailLabel}>Срок выполнения</div>
                            <div className={styles.detailValue}>
                              {formatDate(selectedOrder.deadline)}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.category && (
                        <div className={styles.paramItem}>
                          <MdCategory size={24} color="#667eea" className={styles.paramIcon} />
                          <div className={styles.paramContent}>
                            <div className={styles.detailLabel}>Категория</div>
                            <div className={styles.detailValue}>
                              {selectedOrder.furniture_type || selectedOrder.category}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Дополнительные параметры */}
                  {(selectedOrder.materials || selectedOrder.dimensions || selectedOrder.style) && (
                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionTitle}>Дополнительно</h4>
                      <div className={styles.additionalList}>
                        {selectedOrder.materials && (
                          <div className={styles.additionalItem}>
                            <strong className={styles.descriptionLabel}>Материалы:</strong>
                            <span className={styles.descriptionValue}>{selectedOrder.materials}</span>
                          </div>
                        )}
                        {selectedOrder.dimensions && (
                          <div className={styles.additionalItem}>
                            <MdStraighten size={20} color="#667eea" className={styles.paramIcon} />
                            <div>
                              <strong className={styles.descriptionLabel}>Размеры:</strong>
                              <span className={styles.descriptionValue}>{selectedOrder.dimensions}</span>
                            </div>
                          </div>
                        )}
                        {selectedOrder.style && (
                          <div className={styles.additionalItem}>
                            <strong className={styles.descriptionLabel}>Стиль:</strong>
                            <span className={styles.descriptionValue}>{selectedOrder.style}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Требования */}
                  {(selectedOrder.delivery_required || selectedOrder.assembly_required || selectedOrder.delivery_address) && (
                    <div className={styles.infoSection}>
                      <h4 className={styles.sectionTitle}>Требования</h4>
                      <div className={styles.additionalList}>
                        {selectedOrder.delivery_address && (
                          <div className={styles.requirementItem}>
                            <MdLocationOn size={20} color="#667eea" />
                            <span>{selectedOrder.delivery_address}</span>
                          </div>
                        )}
                        {selectedOrder.delivery_required && (
                          <div className={`${styles.requirementItem} ${styles.requirementItemHighlight}`}>
                            <MdLocalShipping size={20} color="#319795" />
                            <span className={styles.requirementText}>Требуется доставка</span>
                          </div>
                        )}
                        {selectedOrder.assembly_required && (
                          <div className={`${styles.requirementItem} ${styles.requirementItemHighlight}`}>
                            <MdBuild size={20} color="#319795" />
                            <span className={styles.requirementText}>Требуется сборка</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Конкуренция */}
                  {selectedOrder.bids_count && selectedOrder.bids_count > 0 && (
                    <div className={styles.competitionBox}>
                      <div className={styles.competitionHeader}>
                        <MdTrendingUp size={20} color="#667eea" />
                        <strong>Конкуренция</strong>
                      </div>
                      <div className={styles.competitionValue}>
                        <strong>{selectedOrder.bids_count}</strong> {selectedOrder.bids_count === 1 ? 'мастер уже сделал' : 'мастеров уже сделали'} предложение
                      </div>
                    </div>
                  )}

                  {/* Кнопка действия */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseDetailsModal();
                      handleOpenBidModal(selectedOrder);
                    }}
                    className={styles.submitButton}
                  >
                    {selectedOrder.bids_count && selectedOrder.bids_count > 0 ? <MdEdit size={20} className={styles.buttonIcon} /> : null}
                    {selectedOrder.bids_count && selectedOrder.bids_count > 0 ? 'Изменить предложение' : 'Сделать предложение'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для создания ставки */}
      {showBidModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={handleCloseBidModal}>
          <div 
            className={`${styles.modalContent} ${styles.modalContentSmall}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalBody}>
              {/* Заголовок */}
              <div className={styles.modalHeader}>
                <button onClick={handleCloseBidModal} className={styles.closeButton}>
                  <MdClose size={24} />
                </button>
                <h2 className={styles.modalTitle}>
                  {existingBid ? 'Изменить предложение' : 'Сделать предложение'}
                </h2>
                <p className={styles.modalSubtitle}>
                  {selectedOrder.title}
                </p>
              </div>

              {/* Информация о конкуренции */}
              {competition && competition.bids_count > 0 && (
                <div className={styles.competitionBox}>
                  <div className={styles.competitionHeader}>
                    <MdTrendingUp size={20} color="#667eea" />
                    <strong>Конкуренция</strong>
                  </div>
                  <div className={styles.competitionStats}>
                    <div className={styles.competitionStat}>
                      <div className={styles.competitionLabel}>Ставок</div>
                      <div className={styles.competitionValue}>{competition.bids_count}</div>
                    </div>
                    <div className={styles.competitionStat}>
                      <div className={styles.competitionLabel}>Мин. цена</div>
                      <div className={styles.competitionValue}>
                        {new Intl.NumberFormat('ru-RU').format(competition.min_bid)} ₸
                      </div>
                    </div>
                    <div className={styles.competitionStat}>
                      <div className={styles.competitionLabel}>Средняя</div>
                      <div className={styles.competitionValue}>
                        {new Intl.NumberFormat('ru-RU').format(Math.round(competition.avg_bid))} ₸
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Бюджет клиента */}
              {selectedOrder.budget_min && selectedOrder.budget_max && (
                <div className={styles.budgetBox}>
                  <div className={styles.budgetLabel}>Бюджет клиента</div>
                  <div className={styles.budgetValue}>
                    {new Intl.NumberFormat('ru-RU').format(selectedOrder.budget_min)} - {new Intl.NumberFormat('ru-RU').format(selectedOrder.budget_max)} ₸
                  </div>
                </div>
              )}

              {/* Форма */}
              <div className={styles.bidForm}>
                <div>
                  <label className={styles.formLabel}>
                    Ваша цена <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => handleBidPriceChange(e.target.value)}
                    placeholder="Введите цену в тенге"
                    className={styles.formInput}
                  />
                  {commissionInfo && (
                    <div className={`${styles.commissionInfo} ${commissionInfo.type === 'first_month' ? styles.commissionInfoFirst : styles.commissionInfoPercent}`}>
                      <div className={styles.commissionTitle}>
                        Комиссия платформы:
                      </div>
                      <div className={styles.commissionText}>
                        {commissionInfo.type === 'first_month' ? (
                          <>
                            <strong>{new Intl.NumberFormat('ru-RU').format(commissionInfo.amount)} ₸</strong>
                            {' '}(фиксированная ставка за заказ в первый месяц)
                          </>
                        ) : (
                          <>
                            <strong>{new Intl.NumberFormat('ru-RU').format(commissionInfo.amount)} ₸</strong>
                            {' '}({commissionInfo.rate}% от суммы заказа)
                          </>
                        )}
                      </div>
                      <div className={styles.commissionResult}>
                        Вы получите: <strong className={styles.commissionAmount}>
                          {new Intl.NumberFormat('ru-RU').format(parseFloat(bidPrice) - commissionInfo.amount)} ₸
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Срок выполнения (дней) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    value={bidDays}
                    onChange={(e) => setBidDays(e.target.value)}
                    placeholder="Сколько дней потребуется"
                    className={styles.formInput}
                  />
                </div>

                <div>
                  <label className={styles.formLabel}>
                    Комментарий
                  </label>
                  <textarea
                    value={bidComment}
                    onChange={(e) => setBidComment(e.target.value)}
                    placeholder="Дополнительная информация о вашем предложении"
                    rows={4}
                    className={styles.formTextarea}
                  />
                </div>

                <button
                  onClick={handleSubmitBid}
                  disabled={submittingBid}
                  className={`${styles.submitButton} ${submittingBid ? styles.submitButtonDisabled : ''}`}
                >
                  {submittingBid ? 'Отправка...' : existingBid ? 'Обновить предложение' : 'Отправить предложение'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className={styles.toastsContainer}>
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

export default MasterOrders;
