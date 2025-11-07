import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { MdShoppingCart, MdAttachMoney, MdCalendarToday, MdLocationOn, MdPerson, MdTimer, MdClose, MdTrendingUp, MdEdit, MdImage, MdViewInAr, MdLocalShipping, MdBuild, MdCategory, MdStraighten } from 'react-icons/md';
import { orderService, type AuctionOrder } from '../../services/orderService';
import bidService from '../../services/bidService';
import type { Bid, BidCompetition } from '../../services/bidService';
import { Bed, Wardrobe, Table, Chair, Sofa, Dresser, Grill } from '../../components/3d/FurnitureModels';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './Master.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const MasterOrders = () => {
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

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadAuctionOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAuctionOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading auction orders...');
      const data = await orderService.getAuctionOrders();
      console.log('Auction orders loaded:', data);
      setOrders(data);
    } catch (error) {
      console.error('Error loading auction orders:', error);
      showToast('Ошибка при загрузке заказов', 'error');
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
  };

  const handleSubmitBid = async () => {
    if (!selectedOrder) return;

    const price = parseFloat(bidPrice);
    const days = parseInt(bidDays);

    if (isNaN(price) || price <= 0) {
      showToast('Укажите корректную цену', 'error');
      return;
    }

    if (isNaN(days) || days <= 0) {
      showToast('Укажите корректный срок выполнения', 'error');
      return;
    }

    try {
      setSubmittingBid(true);
      await bidService.createBid(selectedOrder.id, {
        proposed_price: price,
        estimated_days: days,
        comment: bidComment,
      });

      showToast(existingBid ? 'Ставка обновлена!' : 'Ставка успешно создана!', 'success');
      handleCloseBidModal();
      loadAuctionOrders(); // Перезагружаем заказы
    } catch (error) {
      console.error('Error submitting bid:', error);
      showToast('Ошибка при создании ставки', 'error');
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
          <MdShoppingCart style={{ verticalAlign: 'middle', marginRight: '12px' }} />
          Аукцион заказов
        </h1>
        <p style={{ color: '#718096', marginTop: '8px' }}>
          Все доступные заказы от клиентов
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.section}>
          <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
            Нет доступных заказов в аукционе
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {orders.map((order) => (
            <div 
              key={order.id} 
              className={styles.section} 
              style={{ padding: '24px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onClick={() => handleOpenDetailsModal(order)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#2d3748' }}>
                    {order.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#718096' }}>
                    {order.customer_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MdPerson size={18} />
                        <span>{order.customer_name}</span>
                      </div>
                    )}
                    {order.customer_address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MdLocationOn size={18} />
                        <span>{order.customer_address}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MdTimer size={18} />
                      <span>Создан: {formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  {order.bids_count || 0} {order.bids_count === 1 ? 'ставка' : 'ставок'}
                </div>
              </div>

              <p style={{ margin: '0 0 16px 0', color: '#4a5568', lineHeight: '1.6' }}>
                {order.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {order.budget_min && order.budget_max && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                    <MdAttachMoney size={24} color="#667eea" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>Бюджет</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                        {formatPrice(order.budget_min)} - {formatPrice(order.budget_max)}
                      </div>
                    </div>
                  </div>
                )}
                {order.deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                    <MdCalendarToday size={24} color="#667eea" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>Срок выполнения</div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                        {formatDate(order.deadline)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(order.materials || order.dimensions) && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {order.materials && (
                    <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                      <strong>Материалы:</strong> {order.materials}
                    </div>
                  )}
                  {order.dimensions && (
                    <div style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                      <strong>Размеры:</strong> {order.dimensions}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {order.delivery_required && (
                  <span style={{ 
                    padding: '6px 12px', 
                    background: '#edf2f7', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem',
                    color: '#4a5568'
                  }}>
                    Требуется доставка
                  </span>
                )}
                {order.assembly_required && (
                  <span style={{ 
                    padding: '6px 12px', 
                    background: '#edf2f7', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem',
                    color: '#4a5568'
                  }}>
                    Требуется сборка
                  </span>
                )}
              </div>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBidModal(order);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {order.bids_count && order.bids_count > 0 ? <MdEdit size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> : null}
                  {order.bids_count && order.bids_count > 0 ? 'Изменить предложение' : 'Сделать предложение'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно с деталями заказа */}
      {showDetailsModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
        }}
        onClick={handleCloseDetailsModal}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '32px' }}>
              {/* Заголовок */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={handleCloseDetailsModal}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#edf2f7',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MdClose size={24} />
                </button>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#2d3748' }}>
                  {selectedOrder.title}
                </h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#718096', marginTop: '12px' }}>
                  {selectedOrder.customer_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MdPerson size={18} />
                      <span>{selectedOrder.customer_name}</span>
                    </div>
                  )}
                  {selectedOrder.customer_address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MdLocationOn size={18} />
                      <span>{selectedOrder.customer_address}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MdTimer size={18} />
                    <span>Создан: {formatDate(selectedOrder.created_at)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Левая колонка - 3D Визуализация */}
                <div>
                  <div style={{ 
                    borderRadius: '12px',
                    minHeight: '400px',
                    overflow: 'hidden',
                    background: '#f0f0f0',
                    position: 'relative',
                  }}>
                    {selectedOrder.furniture_config ? (
                      <Canvas 
                        camera={{ position: [3, 2, 5], fov: 50 }}
                        shadows
                        gl={{ antialias: true, alpha: false }}
                        style={{ width: '100%', height: '400px' }}
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
                      <div style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <MdViewInAr size={80} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>3D Визуализация</h3>
                        <p style={{ margin: 0, opacity: 0.8, textAlign: 'center' }}>
                          3D модель не была создана для этого заказа
                        </p>
                        {/* Декоративные элементы */}
                        <div style={{
                          position: 'absolute',
                          top: '-50px',
                          right: '-50px',
                          width: '200px',
                          height: '200px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                        }} />
                        <div style={{
                          position: 'absolute',
                          bottom: '-30px',
                          left: '-30px',
                          width: '150px',
                          height: '150px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '50%',
                        }} />
                      </div>
                    )}
                  </div>

                  {/* Фотографии */}
                  {selectedOrder.photos && selectedOrder.photos.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MdImage size={20} />
                        Фотографии
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                        {selectedOrder.photos.map((photo, index) => (
                          <div key={index} style={{
                            width: '100%',
                            paddingBottom: '100%',
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: '#f7fafc',
                          }}>
                            <img
                              src={photo}
                              alt={`Фото ${index + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
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
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#2d3748' }}>Описание заказа</h4>
                    <div style={{ 
                      background: '#f7fafc', 
                      borderRadius: '8px', 
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {selectedOrder.description.split('\n').filter(line => line.trim()).map((line, index) => {
                        const [label, ...valueParts] = line.split(':');
                        const value = valueParts.join(':').trim();
                        
                        if (value) {
                          return (
                            <div key={index} style={{ 
                              display: 'flex', 
                              padding: '8px',
                              background: 'white',
                              borderRadius: '6px',
                              borderLeft: '3px solid #667eea',
                            }}>
                              <strong style={{ 
                                color: '#4a5568', 
                                minWidth: '140px',
                                fontSize: '0.9rem',
                              }}>
                                {label.trim()}:
                              </strong>
                              <span style={{ 
                                color: '#718096',
                                fontSize: '0.9rem',
                                flex: 1,
                              }}>
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
                  <div style={{ 
                    background: '#f7fafc', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '20px',
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Основные параметры</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {selectedOrder.budget_min && selectedOrder.budget_max && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <MdAttachMoney size={24} color="#667eea" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>Бюджет</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
                              {formatPrice(selectedOrder.budget_min)} - {formatPrice(selectedOrder.budget_max)}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.deadline && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <MdCalendarToday size={24} color="#667eea" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>Срок выполнения</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
                              {formatDate(selectedOrder.deadline)}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.category && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <MdCategory size={24} color="#667eea" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: '#718096' }}>Категория</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
                              {selectedOrder.furniture_type || selectedOrder.category}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Дополнительные параметры */}
                  {(selectedOrder.materials || selectedOrder.dimensions || selectedOrder.style) && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#2d3748' }}>Дополнительно</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedOrder.materials && (
                          <div style={{ padding: '10px', background: '#f7fafc', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                            <strong style={{ color: '#4a5568', minWidth: '100px' }}>Материалы:</strong>
                            <span style={{ color: '#718096' }}>{selectedOrder.materials}</span>
                          </div>
                        )}
                        {selectedOrder.dimensions && (
                          <div style={{ padding: '10px', background: '#f7fafc', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                            <MdStraighten size={20} color="#667eea" style={{ minWidth: '20px' }} />
                            <div>
                              <strong style={{ color: '#4a5568' }}>Размеры:</strong>
                              <span style={{ color: '#718096', marginLeft: '8px' }}>{selectedOrder.dimensions}</span>
                            </div>
                          </div>
                        )}
                        {selectedOrder.style && (
                          <div style={{ padding: '10px', background: '#f7fafc', borderRadius: '8px', display: 'flex', gap: '8px' }}>
                            <strong style={{ color: '#4a5568', minWidth: '100px' }}>Стиль:</strong>
                            <span style={{ color: '#718096' }}>{selectedOrder.style}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Требования */}
                  {(selectedOrder.delivery_required || selectedOrder.assembly_required || selectedOrder.delivery_address) && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#2d3748' }}>Требования</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedOrder.delivery_address && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f7fafc', borderRadius: '8px' }}>
                            <MdLocationOn size={20} color="#667eea" />
                            <span style={{ color: '#4a5568' }}>{selectedOrder.delivery_address}</span>
                          </div>
                        )}
                        {selectedOrder.delivery_required && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#e6fffa', borderRadius: '8px', border: '1px solid #81e6d9' }}>
                            <MdLocalShipping size={20} color="#319795" />
                            <span style={{ color: '#234e52', fontWeight: '500' }}>Требуется доставка</span>
                          </div>
                        )}
                        {selectedOrder.assembly_required && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#e6fffa', borderRadius: '8px', border: '1px solid #81e6d9' }}>
                            <MdBuild size={20} color="#319795" />
                            <span style={{ color: '#234e52', fontWeight: '500' }}>Требуется сборка</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Конкуренция */}
                  {selectedOrder.bids_count && selectedOrder.bids_count > 0 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                      padding: '16px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <MdTrendingUp size={20} color="#667eea" />
                        <strong style={{ color: '#2d3748' }}>Конкуренция</strong>
                      </div>
                      <div style={{ fontSize: '1.1rem', color: '#4a5568' }}>
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
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1.05rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {selectedOrder.bids_count && selectedOrder.bids_count > 0 ? <MdEdit size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> : null}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px',
        }}
        onClick={handleCloseBidModal}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '32px' }}>
              {/* Заголовок */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={handleCloseBidModal}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#edf2f7',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MdClose size={24} />
                </button>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#2d3748' }}>
                  {existingBid ? 'Изменить предложение' : 'Сделать предложение'}
                </h2>
                <p style={{ margin: 0, color: '#718096', fontSize: '0.95rem' }}>
                  {selectedOrder.title}
                </p>
              </div>

              {/* Информация о конкуренции */}
              {competition && competition.bids_count > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <MdTrendingUp size={20} color="#667eea" />
                    <strong style={{ color: '#2d3748' }}>Конкуренция</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.9rem' }}>
                    <div>
                      <div style={{ color: '#718096', marginBottom: '4px' }}>Ставок</div>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>{competition.bids_count}</div>
                    </div>
                    <div>
                      <div style={{ color: '#718096', marginBottom: '4px' }}>Мин. цена</div>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {new Intl.NumberFormat('ru-RU').format(competition.min_bid)} ₸
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#718096', marginBottom: '4px' }}>Средняя</div>
                      <div style={{ fontWeight: '600', color: '#2d3748' }}>
                        {new Intl.NumberFormat('ru-RU').format(Math.round(competition.avg_bid))} ₸
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Бюджет клиента */}
              {selectedOrder.budget_min && selectedOrder.budget_max && (
                <div style={{ marginBottom: '24px', padding: '12px', background: '#f7fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#718096', marginBottom: '4px' }}>Бюджет клиента</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748' }}>
                    {new Intl.NumberFormat('ru-RU').format(selectedOrder.budget_min)} - {new Intl.NumberFormat('ru-RU').format(selectedOrder.budget_max)} ₸
                  </div>
                </div>
              )}

              {/* Форма */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>
                    Ваша цена <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="Введите цену в тенге"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>
                    Срок выполнения (дней) <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={bidDays}
                    onChange={(e) => setBidDays(e.target.value)}
                    placeholder="Сколько дней потребуется"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#4a5568' }}>
                    Комментарий
                  </label>
                  <textarea
                    value={bidComment}
                    onChange={(e) => setBidComment(e.target.value)}
                    placeholder="Дополнительная информация о вашем предложении"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <button
                  onClick={handleSubmitBid}
                  disabled={submittingBid}
                  style={{
                    padding: '14px 24px',
                    background: submittingBid ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    cursor: submittingBid ? 'not-allowed' : 'pointer',
                    marginTop: '8px',
                  }}
                >
                  {submittingBid ? 'Отправка...' : existingBid ? 'Обновить предложение' : 'Отправить предложение'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
