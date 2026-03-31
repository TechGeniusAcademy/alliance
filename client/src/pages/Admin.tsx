import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MdPeople, 
  MdGavel, 
  MdStars, 
  MdBarChart, 
  MdNotifications,
  MdMenu,
  MdClose,
  MdLogout,
  MdAdd,
  MdViewInAr,
  MdFeedback
} from 'react-icons/md';
import styles from './Admin.module.css';
import adminService from '../services/adminService';
import type { User, Auction } from '../services/adminService';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import Admin3DModels from '../components/Admin3DModels';

type AdminSection = 'users' | 'auctions' | 'ratings' | 'statistics' | 'notifications' | 'models3d' | 'feedback';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const Admin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Users management state
  const [users, setUsers] = useState<User[]>([]);
  const [, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; password: string; phone: string; address: string; role: string }>({ 
    name: '', 
    email: '', 
    password: '',
    phone: '',
    address: '',
    role: 'customer' 
  });

  // Auctions state
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  const [auctionFilter, setAuctionFilter] = useState<string>('all');
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [showAuctionModal, setShowAuctionModal] = useState(false);

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Add toast notification
  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Remove toast notification
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    if (activeSection === 'users') fetchUsers();
    if (activeSection === 'auctions') fetchAuctions();
    if (activeSection === 'feedback') fetchFeedback();
  }, [activeSection, auctionFilter, feedbackFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAuctions() {
    setLoadingAuctions(true);
    try {
      const data = await adminService.getAuctions(auctionFilter);
      setAuctions(data);
    } catch (err) {
      console.error('Failed to fetch auctions', err);
      showToast('Ошибка загрузки аукционов', 'error');
    } finally {
      setLoadingAuctions(false);
    }
  }

  async function fetchFeedback() {
    setLoadingFeedback(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feedback?status=${feedbackFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setFeedbacks(data.feedback || []);
    } catch (err) {
      console.error('Failed to fetch feedback', err);
      showToast('Ошибка загрузки обратной связи', 'error');
    } finally {
      setLoadingFeedback(false);
    }
  }

  async function updateFeedbackStatus(id: number, status: string) {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/feedback/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      showToast('Статус обновлен', 'success');
      fetchFeedback();
    } catch (err) {
      console.error('Failed to update feedback status', err);
      showToast('Ошибка при обновлении статуса', 'error');
    }
  }

  function handleViewFeedbackDetails(feedback: any) {
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
  }

  function handleViewAuctionDetails(auction: Auction) {
    setSelectedAuction(auction);
    setShowAuctionModal(true);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₸';
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function getStatusBadge(status: string) {
    const statusMap: Record<string, { label: string; className: string }> = {
      auction: { label: t('admin.active'), className: styles.statusActive },
      pending: { label: t('admin.pending'), className: styles.statusPending },
      active: { label: t('admin.active'), className: styles.statusActive },
      in_progress: { label: 'В работе', className: styles.statusInProgress },
      completed: { label: 'Завершён', className: styles.statusCompleted },
      cancelled: { label: 'Отменён', className: styles.statusCancelled }
    };
    return statusMap[status] || { label: status, className: '' };
  }

  

  function openEdit(user: User) {
    setEditingId(user.id);
    setForm({ 
      name: user.name || '', 
      email: user.email || '', 
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'customer' 
    });
    setShowForm(true);
  }

  async function saveForm() {
    try {
      if (editingId) {
        const updateData: { 
          name: string; 
          email: string; 
          phone: string;
          address: string;
          role: string;
          password?: string;
        } = { 
          name: form.name, 
          email: form.email, 
          phone: form.phone,
          address: form.address,
          role: form.role 
        };
        if (form.password) {
          updateData.password = form.password;
        }
        await adminService.updateUser(editingId, updateData);
        showToast('Пользователь успешно обновлён', 'success');
      } else {
        if (!form.password) {
          showToast('Пароль обязателен при создании пользователя', 'error');
          return;
        }
        await adminService.createUser({ 
          name: form.name, 
          email: form.email, 
          password: form.password,
          phone: form.phone,
          address: form.address,
          role: form.role 
        });
        showToast('Пользователь успешно создан', 'success');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('Ошибка при сохранении пользователя', 'error');
    }
  }

  async function handleDelete(id: string) {
    try {
      await adminService.deleteUser(id);
      showToast('Пользователь успешно удалён', 'success');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('Ошибка при удалении пользователя', 'error');
    }
  }

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      await handleDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  async function handleToggleBlock(id: string) {
    try {
      await adminService.toggleBlock(id);
      showToast('Статус пользователя изменён', 'success');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('Ошибка при изменении статуса', 'error');
    }
  }

  async function handleChangeRole(id: string, role: string) {
    try {
      await adminService.changeRole(id, role);
      showToast('Роль пользователя изменена', 'success');
      fetchUsers();
    } catch (err) {
      console.error(err);
      showToast('Ошибка при изменении роли', 'error');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const menuItems = [
    { id: 'users' as AdminSection, name: t('admin.users'), icon: MdPeople },
    { id: 'auctions' as AdminSection, name: t('admin.auctions'), icon: MdGavel },
    { id: 'feedback' as AdminSection, name: 'Обратная связь', icon: MdFeedback },
    { id: 'models3d' as AdminSection, name: t('admin.models3d'), icon: MdViewInAr },
    { id: 'ratings' as AdminSection, name: t('admin.ratings'), icon: MdStars },
    { id: 'statistics' as AdminSection, name: t('admin.statistics'), icon: MdBarChart },
    { id: 'notifications' as AdminSection, name: t('admin.notifications'), icon: MdNotifications },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return (
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>{t('admin.users')}</h1>

            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{users.length}</div>
                <div className={styles.statLabel}>{t('admin.totalUsers')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{users.filter(u => u.active).length}</div>
                <div className={styles.statLabel}>{t('admin.activeUsers')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{users.filter(u => {
                  if (!u.createdAt) return false;
                  const created = new Date(u.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}</div>
                <div className={styles.statLabel}>{t('admin.newUsers')}</div>
              </div>
            </div>

            <div className={styles.tableActions}>
              <button className={styles.btnPrimary} onClick={() => { 
                setEditingId(null); 
                setForm({ name: '', email: '', password: '', phone: '', address: '', role: 'customer' }); 
                setShowForm(true); 
              }}>
                <MdAdd style={{ marginRight: '8px', fontSize: '20px' }} />
                {t('admin.createUser') || 'Создать пользователя'}
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('admin.name')}</th>
                    <th>{t('admin.email')}</th>
                    <th>{t('admin.role')}</th>
                    <th>{t('admin.status')}</th>
                    <th>{t('admin.registeredAt') || 'Дата регистрации'}</th>
                    <th>{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={styles.badge}>{u.role}</span></td>
                      <td><span className={`${styles.status} ${u.active ? styles.statusActive : styles.statusBanned}`}>{u.active ? t('admin.active') : t('admin.banned')}</span></td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                      <td>
                        <button className={styles.btnSmall} onClick={() => { openEdit(u); }}>{t('admin.edit') || 'Редактировать'}</button>
                        <button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => { handleToggleBlock(u.id); }}>{u.active ? t('admin.block') || 'Заблокировать' : t('admin.unblock') || 'Разблокировать'}</button>
                        <button className={`${styles.btnSmall}`} onClick={() => { setConfirmDeleteId(u.id); }}>{t('admin.delete') || 'Удалить'}</button>
                        <select className={styles.roleSelect} value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)}>
                          <option value="customer">{t('admin.customer') || 'Заказчик'}</option>
                          <option value="master">{t('admin.master') || 'Мебельщик'}</option>
                          <option value="admin">{t('admin.admin') || 'Админ'}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'auctions':
        return (
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>{t('admin.auctions')}</h1>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{auctions.filter(a => a.status === 'auction').length}</div>
                <div className={styles.statLabel}>{t('admin.activeAuctions')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{auctions.filter(a => a.status === 'completed').length}</div>
                <div className={styles.statLabel}>{t('admin.completedAuctions')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{auctions.filter(a => a.status === 'pending').length}</div>
                <div className={styles.statLabel}>{t('admin.pending')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{auctions.length}</div>
                <div className={styles.statLabel}>Всего заказов</div>
              </div>
            </div>

            <div className={styles.tableActions}>
              <select 
                className={styles.filterSelect} 
                value={auctionFilter} 
                onChange={(e) => setAuctionFilter(e.target.value)}
              >
                <option value="all">Все статусы</option>
                <option value="auction">Аукцион</option>
                <option value="pending">На модерации</option>
                <option value="active">Активные</option>
                <option value="in_progress">В работе</option>
                <option value="completed">Завершённые</option>
                <option value="cancelled">Отменённые</option>
              </select>
            </div>

            {loadingAuctions ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className={styles.loader}></div>
                <p style={{ color: '#718096', marginTop: '16px' }}>Загрузка аукционов...</p>
              </div>
            ) : auctions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '16px' }}>
                <p style={{ color: '#718096', fontSize: '1.1rem' }}>Аукционы не найдены</p>
              </div>
            ) : (
              <div className={styles.auctionGrid}>
                {auctions.map((auction) => {
                  const statusInfo = getStatusBadge(auction.status);
                  return (
                    <div key={auction.id} className={styles.auctionCard}>
                      <div className={styles.auctionHeader}>
                        <h3>{auction.title}</h3>
                        <span className={`${styles.auctionStatus} ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className={styles.auctionDetails}>
                        <p><strong>{t('admin.client')}:</strong> {auction.customer_name}</p>
                        <p><strong>Бюджет:</strong> {formatPrice(auction.budget_min)}{auction.budget_max ? ` - ${formatPrice(auction.budget_max)}` : '+'}</p>
                        <p><strong>{t('admin.bidsCount')}:</strong> {auction.bids_count} ({auction.pending_bids_count} активных)</p>
                        <p><strong>Срок:</strong> до {formatDate(auction.deadline)}</p>
                        <p><strong>Создан:</strong> {formatDate(auction.created_at)}</p>
                        {auction.assigned_master_name && (
                          <p><strong>Исполнитель:</strong> {auction.assigned_master_name}</p>
                        )}
                      </div>
                      <div className={styles.auctionActions}>
                        <button 
                          className={styles.btnSmall}
                          onClick={() => handleViewAuctionDetails(auction)}
                        >
                          {t('admin.viewDetails')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'ratings':
        return (
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>{t('admin.ratings')}</h1>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Место</th>
                    <th>{t('admin.seller')}</th>
                    <th>{t('admin.rating')}</th>
                    <th>{t('admin.completedOrders')}</th>
                    <th>{t('admin.avgPrice')}</th>
                    <th>Отзывы</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.rankGold}>🥇 1</td>
                    <td>Мебельная мастерская "Уют"</td>
                    <td>
                      <div className={styles.rating}>
                        <span>⭐ 4.9</span>
                      </div>
                    </td>
                    <td>156</td>
                    <td>85,000 ₸</td>
                    <td>142</td>
                  </tr>
                  <tr>
                    <td className={styles.rankSilver}>🥈 2</td>
                    <td>ИП Петров П.П.</td>
                    <td>
                      <div className={styles.rating}>
                        <span>⭐ 4.8</span>
                      </div>
                    </td>
                    <td>134</td>
                    <td>72,000 ₸</td>
                    <td>128</td>
                  </tr>
                  <tr>
                    <td className={styles.rankBronze}>🥉 3</td>
                    <td>Столярная артель</td>
                    <td>
                      <div className={styles.rating}>
                        <span>⭐ 4.7</span>
                      </div>
                    </td>
                    <td>98</td>
                    <td>68,000 ₸</td>
                    <td>95</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'statistics':
        return (
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>{t('admin.statistics')}</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCardLarge}>
                <MdGavel className={styles.statIcon} />
                <div className={styles.statValue}>365</div>
                <div className={styles.statLabel}>{t('admin.totalAuctions')}</div>
                <div className={styles.statTrend}>+12% за месяц</div>
              </div>
              <div className={styles.statCardLarge}>
                <MdPeople className={styles.statIcon} />
                <div className={styles.statValue}>1,234</div>
                <div className={styles.statLabel}>{t('admin.totalUsers')}</div>
                <div className={styles.statTrend}>+8% за месяц</div>
              </div>
              <div className={styles.statCardLarge}>
                <MdBarChart className={styles.statIcon} />
                <div className={styles.statValue}>24.5M ₸</div>
                <div className={styles.statLabel}>{t('admin.totalRevenue')}</div>
                <div className={styles.statTrend}>+15% за месяц</div>
              </div>
              <div className={styles.statCardLarge}>
                <MdStars className={styles.statIcon} />
                <div className={styles.statValue}>4.7</div>
                <div className={styles.statLabel}>{t('admin.rating')}</div>
                <div className={styles.statTrend}>+0.2 за месяц</div>
              </div>
            </div>
            <div className={styles.chartPlaceholder}>
              <p>Здесь будет график активности</p>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>Обратная связь</h1>
            
            <div className={styles.filtersBar}>
              <select 
                value={feedbackFilter} 
                onChange={(e) => setFeedbackFilter(e.target.value)}
                className={styles.select}
              >
                <option value="all">Все сообщения</option>
                <option value="new">Новые</option>
                <option value="in_progress">В обработке</option>
                <option value="resolved">Решено</option>
                <option value="closed">Закрыто</option>
              </select>
            </div>

            {loadingFeedback ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : feedbacks.length === 0 ? (
              <div className={styles.emptyState}>
                <MdFeedback />
                <p>Нет сообщений обратной связи</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Имя</th>
                      <th>Email</th>
                      <th>Тема</th>
                      <th>Дата</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((feedback) => (
                      <tr key={feedback.id}>
                        <td>#{feedback.id}</td>
                        <td>{feedback.name}</td>
                        <td>{feedback.email}</td>
                        <td>{feedback.subject}</td>
                        <td>{formatDate(feedback.created_at)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles['status' + feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1).replace('_', '')]}`}>
                            {feedback.status === 'new' && 'Новое'}
                            {feedback.status === 'in_progress' && 'В обработке'}
                            {feedback.status === 'resolved' && 'Решено'}
                            {feedback.status === 'closed' && 'Закрыто'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewFeedbackDetails(feedback)}
                            className={styles.actionButton}
                          >
                            Просмотр
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className={styles.content}>
            <h1 className={styles.pageTitle}>{t('admin.notifications')}</h1>
            <div className={styles.notificationsList}>
              <div className={`${styles.notification} ${styles.notificationNew}`}>
                <MdNotifications className={styles.notificationIcon} />
                <div className={styles.notificationContent}>
                  <h3>{t('admin.newAuction')}</h3>
                  <p>Пользователь Иван Иванов создал новый аукцион "Стол обеденный из ореха"</p>
                  <span className={styles.notificationTime}>5 {t('admin.agoMinutes')}</span>
                </div>
              </div>
              <div className={styles.notification}>
                <MdGavel className={styles.notificationIcon} />
                <div className={styles.notificationContent}>
                  <h3>Аукцион завершен</h3>
                  <p>Аукцион "Кровать двуспальная" завершен. Победитель: Мастерская "Уют"</p>
                  <span className={styles.notificationTime}>2 часа назад</span>
                </div>
              </div>
              <div className={styles.notification}>
                <MdPeople className={styles.notificationIcon} />
                <div className={styles.notificationContent}>
                  <h3>Новый пользователь</h3>
                  <p>Зарегистрирован новый мебельщик: ИП Сидоров А.А.</p>
                  <span className={styles.notificationTime}>5 часов назад</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'models3d':
        return <Admin3DModels onShowToast={showToast} />;

      default:
        return null;
    }
  };

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>{t('admin.title')}</h2>
          <button 
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${activeSection === item.id ? styles.navItemActive : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navText}>{item.name}</span>
              </button>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <MdLogout className={styles.navIcon} />
            <span className={styles.navText}>{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <button 
            className={styles.menuToggleMobile}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MdMenu />
          </button>
          <h1 className={styles.appTitle}>{t('admin.appTitle')}</h1>
          <div className={styles.adminInfo}>
            <span>{t('admin.adminRole')}</span>
          </div>
        </div>
        {renderContent()}
      </main>

      {/* Modal for Create/Edit User */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? t('admin.edit') + ' ' + t('admin.users').toLowerCase() : t('admin.createUser')}
              </h2>
              <button className={styles.modalCloseBtn} onClick={() => setShowForm(false)}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('admin.name')}</label>
                <input 
                  className={styles.input} 
                  value={form.name} 
                  onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} 
                  placeholder={t('admin.name')}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('admin.email')}</label>
                <input 
                  className={styles.input} 
                  type="email"
                  value={form.email} 
                  onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))} 
                  placeholder={t('admin.email')}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('admin.password')}
                  {editingId && <span style={{ fontSize: '0.85em', color: '#6b7280' }}> (оставьте пустым, если не меняете)</span>}
                </label>
                <input 
                  className={styles.input} 
                  type="password"
                  value={form.password} 
                  onChange={(e) => setForm(s => ({ ...s, password: e.target.value }))} 
                  placeholder={editingId ? t('admin.newPassword') : t('admin.password')}
                  required={!editingId}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('admin.phone')}</label>
                <input 
                  className={styles.input} 
                  type="tel"
                  value={form.phone} 
                  onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))} 
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('admin.address')}</label>
                <textarea 
                  className={styles.textarea} 
                  value={form.address} 
                  onChange={(e) => setForm(s => ({ ...s, address: e.target.value }))} 
                  placeholder={t('admin.address')}
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('admin.role')}</label>
                <select 
                  className={styles.select} 
                  value={form.role} 
                  onChange={(e) => setForm(s => ({ ...s, role: e.target.value }))}
                  required
                >
                  <option value="customer">{t('admin.customer')}</option>
                  <option value="master">{t('admin.master')}</option>
                  <option value="admin">{t('admin.admin')}</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowForm(false)}>
                {t('admin.cancel')}
              </button>
              <button className={styles.btnPrimary} onClick={async () => { await saveForm(); }}>
                {editingId ? t('admin.save') : t('admin.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {confirmDeleteId && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <h3>Подтверждение удаления</h3>
            </div>
            <div className={styles.confirmBody}>
              <p>Вы уверены, что хотите удалить этого пользователя?</p>
              <p style={{ fontSize: '0.9em', color: '#6b7280' }}>Это действие нельзя отменить.</p>
            </div>
            <div className={styles.confirmFooter}>
              <button className={styles.btnSecondary} onClick={cancelDelete}>
                Отмена
              </button>
              <button className={`${styles.btnPrimary} ${styles.btnDanger}`} onClick={confirmDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auction Details Modal */}
      {showAuctionModal && selectedAuction && (
        <div className={styles.modalOverlay} onClick={() => setShowAuctionModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Детали аукциона #{selectedAuction.id}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setShowAuctionModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Информация о заказе</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Название:</span>
                    <span className={styles.detailValue}>{selectedAuction.title}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Статус:</span>
                    <span className={`${styles.statusBadge} ${getStatusBadge(selectedAuction.status).className}`}>
                      {getStatusBadge(selectedAuction.status).label}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Категория:</span>
                    <span className={styles.detailValue}>{selectedAuction.category}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Тип мебели:</span>
                    <span className={styles.detailValue}>{selectedAuction.furniture_type || '—'}</span>
                  </div>
                  <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.detailLabel}>Описание:</span>
                    <span className={styles.detailValue}>{selectedAuction.description}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Финансовая информация</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Бюджет:</span>
                    <span className={styles.detailValue}>
                      {formatPrice(selectedAuction.budget_min)}
                      {selectedAuction.budget_max ? ` - ${formatPrice(selectedAuction.budget_max)}` : '+'}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Количество ставок:</span>
                    <span className={styles.detailValue}>{selectedAuction.bids_count}</span>
                  </div>
                  {selectedAuction.avg_bid_price && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Средняя ставка:</span>
                      <span className={styles.detailValue}>{formatPrice(parseFloat(selectedAuction.avg_bid_price.toString()))}</span>
                    </div>
                  )}
                  {selectedAuction.min_bid_price && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Мин. ставка:</span>
                      <span className={styles.detailValue}>{formatPrice(parseFloat(selectedAuction.min_bid_price.toString()))}</span>
                    </div>
                  )}
                  {selectedAuction.max_bid_price && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Макс. ставка:</span>
                      <span className={styles.detailValue}>{formatPrice(parseFloat(selectedAuction.max_bid_price.toString()))}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Информация о клиенте</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Имя:</span>
                    <span className={styles.detailValue}>{selectedAuction.customer_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{selectedAuction.customer_email}</span>
                  </div>
                  {selectedAuction.customer_phone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Телефон:</span>
                      <span className={styles.detailValue}>{selectedAuction.customer_phone}</span>
                    </div>
                  )}
                  {selectedAuction.customer_address && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Адрес:</span>
                      <span className={styles.detailValue}>{selectedAuction.customer_address}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedAuction.assigned_master_name && (
                <div className={styles.detailSection}>
                  <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Информация об исполнителе</h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Имя:</span>
                      <span className={styles.detailValue}>{selectedAuction.assigned_master_name}</span>
                    </div>
                    {selectedAuction.assigned_master_email && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Email:</span>
                        <span className={styles.detailValue}>{selectedAuction.assigned_master_email}</span>
                      </div>
                    )}
                    {selectedAuction.assigned_master_phone && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Телефон:</span>
                        <span className={styles.detailValue}>{selectedAuction.assigned_master_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Дополнительная информация</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Дата создания:</span>
                    <span className={styles.detailValue}>{formatDate(selectedAuction.created_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Дедлайн:</span>
                    <span className={styles.detailValue}>{formatDate(selectedAuction.deadline)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Доставка требуется:</span>
                    <span className={styles.detailValue}>{selectedAuction.delivery_required ? 'Да' : 'Нет'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Сборка требуется:</span>
                    <span className={styles.detailValue}>{selectedAuction.assembly_required ? 'Да' : 'Нет'}</span>
                  </div>
                  {selectedAuction.delivery_address && (
                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.detailLabel}>Адрес доставки:</span>
                      <span className={styles.detailValue}>{selectedAuction.delivery_address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowAuctionModal(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Details Modal */}
      {showFeedbackModal && selectedFeedback && (
        <div className={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Обратная связь #{selectedFeedback.id}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setShowFeedbackModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Информация об отправителе</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Имя:</span>
                    <span className={styles.detailValue}>{selectedFeedback.name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>
                      <a href={`mailto:${selectedFeedback.email}`}>{selectedFeedback.email}</a>
                    </span>
                  </div>
                  {selectedFeedback.phone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Телефон:</span>
                      <span className={styles.detailValue}>
                        <a href={`tel:${selectedFeedback.phone}`}>{selectedFeedback.phone}</a>
                      </span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Тема:</span>
                    <span className={styles.detailValue}>{selectedFeedback.subject}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Дата отправки:</span>
                    <span className={styles.detailValue}>{formatDate(selectedFeedback.created_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Текущий статус:</span>
                    <span className={`${styles.statusBadge} ${styles['status' + selectedFeedback.status.charAt(0).toUpperCase() + selectedFeedback.status.slice(1).replace('_', '')]}`}>
                      {selectedFeedback.status === 'new' && 'Новое'}
                      {selectedFeedback.status === 'in_progress' && 'В обработке'}
                      {selectedFeedback.status === 'resolved' && 'Решено'}
                      {selectedFeedback.status === 'closed' && 'Закрыто'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Сообщение</h3>
                <div className={styles.messageBox}>
                  {selectedFeedback.message}
                </div>
              </div>

              {selectedFeedback.attachments && selectedFeedback.attachments.length > 0 && (
                <div className={styles.detailSection}>
                  <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Прикрепленные файлы</h3>
                  <div className={styles.attachmentsList}>
                    {selectedFeedback.attachments.map((attachment: any, index: number) => (
                      <div key={index} className={styles.attachmentItem}>
                        <span className={styles.attachmentName}>
                          📎 {attachment.originalname}
                        </span>
                        <span className={styles.attachmentSize}>
                          ({(attachment.size / 1024).toFixed(1)} KB)
                        </span>
                        <a
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feedback/${selectedFeedback.id}/download/${attachment.filename}`}
                          download
                          className={styles.downloadBtn}
                          onClick={(e) => {
                            e.preventDefault();
                            const token = localStorage.getItem('token');
                            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feedback/${selectedFeedback.id}/download/${attachment.filename}`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            })
                            .then(res => res.blob())
                            .then(blob => {
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = attachment.originalname;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            })
                            .catch(err => console.error('Download error:', err));
                          }}
                        >
                          Скачать
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeedback.admin_notes && (
                <div className={styles.detailSection}>
                  <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Заметки администратора</h3>
                  <div className={styles.messageBox}>
                    {selectedFeedback.admin_notes}
                  </div>
                </div>
              )}

              <div className={styles.detailSection}>
                <h3 style={{ marginBottom: '16px', color: '#667eea' }}>Изменить статус</h3>
                <div className={styles.statusActions}>
                  <button 
                    className={styles.statusButton}
                    onClick={() => {
                      updateFeedbackStatus(selectedFeedback.id, 'in_progress');
                      setShowFeedbackModal(false);
                    }}
                  >
                    В обработке
                  </button>
                  <button 
                    className={styles.statusButton}
                    onClick={() => {
                      updateFeedbackStatus(selectedFeedback.id, 'resolved');
                      setShowFeedbackModal(false);
                    }}
                  >
                    Решено
                  </button>
                  <button 
                    className={styles.statusButton}
                    onClick={() => {
                      updateFeedbackStatus(selectedFeedback.id, 'closed');
                      setShowFeedbackModal(false);
                    }}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setShowFeedbackModal(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Container */}
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

export default Admin;
