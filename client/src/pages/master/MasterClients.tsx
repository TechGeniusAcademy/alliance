import { useState, useEffect } from 'react';
import {
  MdPeople,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdWork,
  MdAttachMoney,
  MdStar,
  MdSearch,
  MdChat,
  MdHistory
} from 'react-icons/md';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import Toast, { type ToastType } from '../../components/Toast';
import styles from './MasterClients.module.css';

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_photo?: string;
  total_orders: number;
  completed_orders: number;
  active_orders: number;
  total_spent: number;
  average_rating?: number;
  first_order_date: string;
  last_order_date: string;
  status: 'active' | 'completed' | 'inactive';
}

interface ClientDetails {
  client: Client;
  orders: {
    id: number;
    title: string;
    category: string;
    status: string;
    final_price?: number;
    created_at: string;
    updated_at: string;
    rating?: number;
    review?: string;
  }[];
}

const MasterClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'orders' | 'spent' | 'recent'>('recent');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'inactive'>('all');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    loadClients();
  }, [sortBy, filterStatus]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/clients/master`, {
        params: { sortBy, filterStatus },
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
      setToast({ message: 'Не удалось загрузить клиентов', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadClientDetails = async (clientId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/clients/master/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedClient(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Ошибка загрузки данных клиента:', error);
      setToast({ message: 'Не удалось загрузить данные клиента', type: 'error' });
    }
  };

  const openChat = (clientId: number) => {
    // Переход в чаты с этим клиентом
    window.location.href = `/master/chats?client=${clientId}`;
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#667eea';
      case 'inactive': return '#9ca3af';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Завершён';
      case 'inactive': return 'Неактивный';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Клиенты</h1>
          <p>Ваша база клиентов и история работы с ними</p>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <MdSearch size={20} />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filters}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">Все клиенты</option>
            <option value="active">Активные</option>
            <option value="completed">Завершённые</option>
            <option value="inactive">Неактивные</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="recent">По дате</option>
            <option value="name">По имени</option>
            <option value="orders">По заказам</option>
            <option value="spent">По сумме</option>
          </select>
        </div>
      </div>

      {/* Статистика */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <MdPeople size={24} />
          <div>
            <span>Всего клиентов</span>
            <strong>{clients.length}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <MdWork size={24} />
          <div>
            <span>Активных проектов</span>
            <strong>{clients.reduce((sum, c) => sum + c.active_orders, 0)}</strong>
          </div>
        </div>
        <div className={styles.statCard}>
          <MdAttachMoney size={24} />
          <div>
            <span>Общая выручка</span>
            <strong>{clients.reduce((sum, c) => sum + c.total_spent, 0).toLocaleString('ru-RU')} ₸</strong>
          </div>
        </div>
      </div>

      {/* Список клиентов */}
      <div className={styles.clientsGrid}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : filteredClients.length === 0 ? (
          <div className={styles.emptyState}>
            <MdPeople size={64} />
            <p>Клиенты не найдены</p>
            <span>Попробуйте изменить параметры поиска</span>
          </div>
        ) : (
          filteredClients.map(client => (
            <div key={client.id} className={styles.clientCard}>
              <div className={styles.clientHeader}>
                <div className={styles.clientAvatar}>
                  {client.profile_photo ? (
                    <img src={client.profile_photo} alt={client.name} />
                  ) : (
                    <MdPeople size={32} />
                  )}
                </div>
                <div className={styles.clientInfo}>
                  <h3>{client.name}</h3>
                  <span 
                    className={styles.status}
                    style={{ color: getStatusColor(client.status) }}
                  >
                    {getStatusText(client.status)}
                  </span>
                </div>
              </div>

              <div className={styles.clientContacts}>
                {client.email && (
                  <div className={styles.contactItem}>
                    <MdEmail size={16} />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className={styles.contactItem}>
                    <MdPhone size={16} />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className={styles.contactItem}>
                    <MdLocationOn size={16} />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>

              <div className={styles.clientStats}>
                <div className={styles.statItem}>
                  <span>Заказов</span>
                  <strong>{client.total_orders}</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Выручка</span>
                  <strong>{client.total_spent.toLocaleString('ru-RU')} ₸</strong>
                </div>
                {client.average_rating && (
                  <div className={styles.statItem}>
                    <span>Рейтинг</span>
                    <strong><MdStar size={14} /> {client.average_rating.toFixed(1)}</strong>
                  </div>
                )}
              </div>

              <div className={styles.clientFooter}>
                <span className={styles.dateInfo}>
                  Последний заказ: {formatDate(client.last_order_date)}
                </span>
                <div className={styles.actions}>
                  <button onClick={() => openChat(client.id)} className={styles.chatButton}>
                    <MdChat size={18} />
                  </button>
                  <button onClick={() => loadClientDetails(client.id)} className={styles.detailsButton}>
                    <MdHistory size={18} />
                    История
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Модальное окно с деталями */}
      {showModal && selectedClient && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedClient.client.name}</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>×</button>
            </div>

            <div className={styles.modalContent}>
              {/* Информация о клиенте */}
              <div className={styles.clientDetailSection}>
                <h3>Информация о клиенте</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <MdEmail size={18} />
                    <div>
                      <span>Email</span>
                      <strong>{selectedClient.client.email}</strong>
                    </div>
                  </div>
                  {selectedClient.client.phone && (
                    <div className={styles.detailItem}>
                      <MdPhone size={18} />
                      <div>
                        <span>Телефон</span>
                        <strong>{selectedClient.client.phone}</strong>
                      </div>
                    </div>
                  )}
                  {selectedClient.client.address && (
                    <div className={styles.detailItem}>
                      <MdLocationOn size={18} />
                      <div>
                        <span>Адрес</span>
                        <strong>{selectedClient.client.address}</strong>
                      </div>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <MdWork size={18} />
                    <div>
                      <span>Первый заказ</span>
                      <strong>{formatDate(selectedClient.client.first_order_date)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Статистика по заказам */}
              <div className={styles.clientDetailSection}>
                <h3>Статистика</h3>
                <div className={styles.statsRow}>
                  <div className={styles.statBox}>
                    <span>Всего заказов</span>
                    <strong>{selectedClient.client.total_orders}</strong>
                  </div>
                  <div className={styles.statBox}>
                    <span>Завершено</span>
                    <strong>{selectedClient.client.completed_orders}</strong>
                  </div>
                  <div className={styles.statBox}>
                    <span>Активных</span>
                    <strong>{selectedClient.client.active_orders}</strong>
                  </div>
                  <div className={styles.statBox}>
                    <span>Общая сумма</span>
                    <strong>{selectedClient.client.total_spent.toLocaleString('ru-RU')} ₸</strong>
                  </div>
                </div>
              </div>

              {/* История заказов */}
              <div className={styles.clientDetailSection}>
                <h3>История заказов</h3>
                <div className={styles.ordersList}>
                  {selectedClient.orders.map(order => (
                    <div key={order.id} className={styles.orderItem}>
                      <div className={styles.orderHeader}>
                        <div>
                          <strong>{order.title}</strong>
                          <span className={styles.category}>{order.category}</span>
                        </div>
                        <span className={styles.orderStatus}>{order.status}</span>
                      </div>
                      <div className={styles.orderDetails}>
                        <span>Создан: {formatDate(order.created_at)}</span>
                        {order.final_price && (
                          <span className={styles.price}>{order.final_price.toLocaleString('ru-RU')} ₸</span>
                        )}
                      </div>
                      {order.rating && (
                        <div className={styles.orderRating}>
                          <MdStar size={16} />
                          <span>{order.rating.toFixed(1)}</span>
                          {order.review && <span className={styles.reviewText}>— {order.review}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MasterClients;
