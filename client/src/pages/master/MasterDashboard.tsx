import { useTranslation } from 'react-i18next';
import { 
  MdShoppingCart, 
  MdTrendingUp, 
  MdStar, 
  MdAttachMoney,
  MdCheckCircle,
  MdPending
} from 'react-icons/md';
import styles from './Master.module.css';

const MasterDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('masterDashboard.title')}</h1>
        <p className={styles.pageSubtitle}>{t('masterDashboard.subtitle')}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <MdShoppingCart size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>24</div>
            <div className={styles.statLabel}>{t('masterDashboard.activeOrders')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <MdCheckCircle size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>156</div>
            <div className={styles.statLabel}>{t('masterDashboard.completedOrders')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <MdStar size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>4.8</div>
            <div className={styles.statLabel}>{t('masterDashboard.rating')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <MdAttachMoney size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>2.4M ₸</div>
            <div className={styles.statLabel}>{t('masterDashboard.earnings')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <MdPending size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>8</div>
            <div className={styles.statLabel}>{t('masterDashboard.pendingBids')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
            <MdTrendingUp size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>+15%</div>
            <div className={styles.statLabel}>{t('masterDashboard.growth')}</div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('masterDashboard.recentActivity')}</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <MdShoppingCart />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>{t('masterDashboard.newOrder')}</div>
              <div className={styles.activityDesc}>Заказ #1234 - Кровать дубовая</div>
              <div className={styles.activityTime}>5 минут назад</div>
            </div>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <MdCheckCircle />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>{t('masterDashboard.orderCompleted')}</div>
              <div className={styles.activityDesc}>Заказ #1200 - Обеденный стол</div>
              <div className={styles.activityTime}>2 часа назад</div>
            </div>
          </div>

          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <MdStar />
            </div>
            <div className={styles.activityContent}>
              <div className={styles.activityTitle}>{t('masterDashboard.newReview')}</div>
              <div className={styles.activityDesc}>Отзыв 5★ от Александр М.</div>
              <div className={styles.activityTime}>3 часа назад</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
