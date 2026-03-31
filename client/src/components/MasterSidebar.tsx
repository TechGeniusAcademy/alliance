import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MdDashboard,
  MdShoppingCart,
  MdHistory,
  MdChat,
  MdStar,
  MdPerson,
  MdLogout,
  MdGavel,
  MdAssignment,
  MdSchedule,
  MdAttachMoney,
  MdReceipt,
  MdAccountBalanceWallet,
  MdNotifications,
  MdSettings,
  MdHelp,
  MdPhotoLibrary,
  MdBarChart,
  MdGroup
} from 'react-icons/md';
import { useUnreadChats } from '../hooks/useUnreadChats';
import { API_BASE_URL } from '../config/api';
import styles from './MasterSidebar.module.css';

interface MasterProfile {
  name: string;
  lastName?: string;
  profile_photo?: string;
}

const MasterSidebar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unreadCount } = useUnreadChats();
  const [profile, setProfile] = useState<MasterProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/master-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Profile data:', response.data);
      // API возвращает { profile: {...} }
      setProfile(response.data.profile || response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const getDisplayName = () => {
    if (!profile) return 'Мастер';
    return profile.lastName 
      ? `${profile.name} ${profile.lastName}` 
      : profile.name;
  };

  const getInitials = () => {
    if (!profile) return 'М';
    const firstInitial = profile.name?.[0] || '';
    const lastInitial = profile.lastName?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || 'М';
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.headerAvatar}>
            {profile?.profile_photo ? (
              <img src={profile.profile_photo} alt={getDisplayName()} />
            ) : (
              <div className={styles.headerAvatarPlaceholder}>{getInitials()}</div>
            )}
          </div>
          <div>
            <h2>{t('masterSidebar.title')}</h2>
            <span className={styles.subtitle}>{t('masterSidebar.subtitle')}</span>
          </div>
        </div>
        
        {/* Аватар и имя в header */}
      </div>

      <nav className={styles.nav}>
        {/* Главное */}
        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>{t('masterSidebar.mainSection')}</div>
          <NavLink
            to="/master"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdDashboard size={22} />
            <span>{t('masterSidebar.dashboard')}</span>
          </NavLink>
        </div>

        {/* Работа с заказами */}
        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>{t('masterSidebar.ordersSection')}</div>
          <NavLink
            to="/master/auctions"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdGavel size={22} />
            <span>{t('masterSidebar.auctions')}</span>
          </NavLink>
          <NavLink
            to="/master/active-orders"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdAssignment size={22} />
            <span>{t('masterSidebar.activeOrders')}</span>
          </NavLink>
          <NavLink
            to="/master/orders"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdShoppingCart size={22} />
            <span>{t('masterSidebar.allOrders')}</span>
          </NavLink>
          <NavLink
            to="/master/history"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdHistory size={22} />
            <span>{t('masterSidebar.history')}</span>
          </NavLink>
          <NavLink
            to="/master/schedule"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdSchedule size={22} />
            <span>{t('masterSidebar.schedule')}</span>
          </NavLink>
        </div>

        {/* Финансы */}
        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>{t('masterSidebar.financeSection')}</div>
          <NavLink
            to="/master/wallet"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdAccountBalanceWallet size={22} />
            <span>{t('masterSidebar.wallet')}</span>
          </NavLink>
          <NavLink
            to="/master/earnings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdAttachMoney size={22} />
            <span>{t('masterSidebar.earnings')}</span>
          </NavLink>
          <NavLink
            to="/master/commissions"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdReceipt size={22} />
            <span>{t('masterSidebar.commissions')}</span>
          </NavLink>
          <NavLink
            to="/master/statistics"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdBarChart size={22} />
            <span>{t('masterSidebar.statistics')}</span>
          </NavLink>
        </div>

        {/* Коммуникация */}
        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>{t('masterSidebar.communicationSection')}</div>
          <NavLink
            to="/master/chats"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdChat size={22} />
            <span>{t('masterSidebar.chats')}</span>
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </NavLink>
          <NavLink
            to="/master/notifications"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdNotifications size={22} />
            <span>{t('masterSidebar.notifications')}</span>
          </NavLink>
        </div>

        {/* Репутация */}
        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>{t('masterSidebar.reputationSection')}</div>
          <NavLink
            to="/master/ratings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdStar size={22} />
            <span>{t('masterSidebar.ratings')}</span>
          </NavLink>
          <NavLink
            to="/master/portfolio"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdPhotoLibrary size={22} />
            <span>{t('masterSidebar.portfolio')}</span>
          </NavLink>
          <NavLink
            to="/master/clients"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdGroup size={22} />
            <span>{t('masterSidebar.clients')}</span>
          </NavLink>
        </div>

        {/* Настройки */}
        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>{t('masterSidebar.settingsSection')}</div>
          <NavLink
            to="/master/profile"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdPerson size={22} />
            <span>{t('masterSidebar.profile')}</span>
          </NavLink>
          <NavLink
            to="/master/settings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdSettings size={22} />
            <span>{t('masterSidebar.settings')}</span>
          </NavLink>
          <NavLink
            to="/master/help"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <MdHelp size={22} />
            <span>{t('masterSidebar.help')}</span>
          </NavLink>
        </div>

        <button onClick={handleLogout} className={styles.logoutButton}>
          <MdLogout size={22} />
          <span>{t('masterSidebar.logout')}</span>
        </button>
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {profile?.profile_photo ? (
              <img src={profile.profile_photo} alt={getDisplayName()} />
            ) : (
              <div className={styles.avatarInitials}>{getInitials()}</div>
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{getDisplayName()}</div>
            <div className={styles.userRole}>{t('masterSidebar.masterRole')}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MasterSidebar;
