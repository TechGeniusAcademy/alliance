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
  MdAdd
} from 'react-icons/md';
import styles from './Admin.module.css';
import adminService from '../services/adminService';
import type { User } from '../services/adminService';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';

type AdminSection = 'users' | 'auctions' | 'ratings' | 'statistics' | 'notifications';

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
  }, [activeSection]);

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
                <div className={styles.statValue}>45</div>
                <div className={styles.statLabel}>{t('admin.activeAuctions')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>320</div>
                <div className={styles.statLabel}>{t('admin.completedAuctions')}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>12</div>
                <div className={styles.statLabel}>{t('admin.pending')}</div>
              </div>
            </div>
            <div className={styles.auctionGrid}>
              <div className={styles.auctionCard}>
                <div className={styles.auctionHeader}>
                  <h3>Кровать из дуба</h3>
                  <span className={`${styles.auctionStatus} ${styles.statusActive}`}>{t('admin.active')}</span>
                </div>
                <div className={styles.auctionDetails}>
                  <p><strong>{t('admin.client')}:</strong> Иван Иванов</p>
                  <p><strong>Бюджет:</strong> 50,000 - 100,000 ₸</p>
                  <p><strong>{t('admin.bidsCount')}:</strong> 8</p>
                  <p><strong>Срок:</strong> до 20.11.2024</p>
                </div>
                <div className={styles.auctionActions}>
                  <button className={styles.btnSmall}>{t('admin.viewDetails')}</button>
                  <button className={`${styles.btnSmall} ${styles.btnDanger}`}>Отклонить</button>
                </div>
              </div>
              <div className={styles.auctionCard}>
                <div className={styles.auctionHeader}>
                  <h3>Диван 3-местный</h3>
                  <span className={`${styles.auctionStatus} ${styles.statusPending}`}>{t('admin.pending')}</span>
                </div>
                <div className={styles.auctionDetails}>
                  <p><strong>{t('admin.client')}:</strong> Мария Сидорова</p>
                  <p><strong>Бюджет:</strong> 80,000 - 150,000 ₸</p>
                  <p><strong>{t('admin.bidsCount')}:</strong> 0</p>
                  <p><strong>Срок:</strong> до 25.11.2024</p>
                </div>
                <div className={styles.auctionActions}>
                  <button className={styles.btnSmall}>Одобрить</button>
                  <button className={`${styles.btnSmall} ${styles.btnDanger}`}>Отклонить</button>
                </div>
              </div>
            </div>
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
