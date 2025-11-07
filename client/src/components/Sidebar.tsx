import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MdDashboard, 
  MdShoppingCart, 
  MdAddCircleOutline, 
  MdNotifications, 
  MdChat, 
  MdPerson, 
  MdLogout,
  MdHistory,
  MdFavorite,
  MdLocalShipping,
  MdPayment,
  MdReceipt,
  MdStars,
  MdHelp,
  MdSettings,
  MdAutoAwesome,
  MdTrendingUp,
  MdCardGiftcard,
  MdLocalOffer,
  MdViewModule
} from 'react-icons/md';
import { useState } from 'react';
import styles from './Sidebar.module.css';

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  badge?: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const menuCategories: MenuCategory[] = [
    {
      title: t('sidebar.main'),
      items: [
        { path: '/dashboard', icon: MdDashboard, label: t('sidebar.dashboard') },
        { path: '/dashboard/create-order', icon: MdAddCircleOutline, label: t('sidebar.createOrder'), isNew: true },
        { path: '/dashboard/browse-portfolio', icon: MdViewModule, label: 'Работы мебельщиков', isNew: true },
        { path: '/dashboard/ai-designer', icon: MdAutoAwesome, label: t('sidebar.aiDesigner'), isPremium: true },
      ]
    },
    {
      title: t('sidebar.orders'),
      items: [
        { path: '/dashboard/orders', icon: MdShoppingCart, label: t('sidebar.myOrders'), badge: '3' },
        { path: '/dashboard/orders/active', icon: MdTrendingUp, label: t('sidebar.activeOrders') },
        { path: '/dashboard/orders/history', icon: MdHistory, label: t('sidebar.orderHistory') },
        { path: '/dashboard/favorites', icon: MdFavorite, label: t('sidebar.favorites') },
      ]
    },
    {
      title: t('sidebar.financial'),
      items: [
        { path: '/dashboard/payments', icon: MdPayment, label: t('sidebar.payments') },
        { path: '/dashboard/invoices', icon: MdReceipt, label: t('sidebar.invoices') },
        { path: '/dashboard/delivery', icon: MdLocalShipping, label: t('sidebar.delivery') },
        { path: '/dashboard/promocodes', icon: MdCardGiftcard, label: t('sidebar.promocodes'), isNew: true },
      ]
    },
    {
      title: t('sidebar.communication'),
      items: [
        { path: '/dashboard/chats', icon: MdChat, label: t('sidebar.chats'), badge: '2' },
        { path: '/dashboard/notifications', icon: MdNotifications, label: t('sidebar.notifications'), badge: '5' },
        { path: '/dashboard/reviews', icon: MdStars, label: t('sidebar.reviews') },
        { path: '/dashboard/offers', icon: MdLocalOffer, label: t('sidebar.specialOffers'), isNew: true },
      ]
    },
    {
      title: t('sidebar.account'),
      items: [
        { path: '/dashboard/profile', icon: MdPerson, label: t('sidebar.profile') },
        { path: '/dashboard/settings', icon: MdSettings, label: t('sidebar.settings') },
        { path: '/dashboard/help', icon: MdHelp, label: t('sidebar.help') },
      ]
    }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🪑</div>
          <div>
            <div className={styles.logoText}>Furniture</div>
            <div className={styles.logoSubtext}>Auction</div>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuCategories.map((category) => (
          <div key={category.title} className={styles.menuCategory}>
            <button 
              className={styles.categoryHeader}
              onClick={() => toggleCategory(category.title)}
            >
              <span className={styles.categoryTitle}>{category.title}</span>
              <span className={styles.categoryArrow}>
                {collapsedCategories.has(category.title) ? '▶' : '▼'}
              </span>
            </button>
            
            {!collapsedCategories.has(category.title) && (
              <div className={styles.categoryItems}>
                {category.items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                      <span className={styles.icon}>
                        <IconComponent size={20} />
                      </span>
                      <span className={styles.label}>{item.label}</span>
                      
                      {item.badge && (
                        <span className={styles.badge}>{item.badge}</span>
                      )}
                      
                      {item.isNew && (
                        <span className={styles.newBadge}>NEW</span>
                      )}
                      
                      {item.isPremium && (
                        <span className={styles.premiumBadge}>⭐</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {JSON.parse(localStorage.getItem('user') || '{}').name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {JSON.parse(localStorage.getItem('user') || '{}').name || 'User'}
            </div>
            <div className={styles.userEmail}>
              {JSON.parse(localStorage.getItem('user') || '{}').email || 'user@example.com'}
            </div>
          </div>
        </div>
        
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span className={styles.icon}>
            <MdLogout size={20} />
          </span>
          <span className={styles.label}>{t('sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
