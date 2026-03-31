import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdAttachMoney,
  MdWork,
  MdStar,
  MdPeople,
  MdCalendarToday,
  MdShowChart,
  MdTimeline
} from 'react-icons/md';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import Toast, { type ToastType } from '../../components/Toast';
import styles from './MasterStatistics.module.css';

interface Statistics {
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  totalIncome: number;
  averageRating: number;
  totalClients: number;
  completionRate: number;
  responseTime: number;
  monthlyData: {
    month: string;
    orders: number;
    income: number;
  }[];
  topCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  recentActivity: {
    date: string;
    ordersCompleted: number;
    income: number;
  }[];
  performanceMetrics: {
    onTimeDelivery: number;
    customerSatisfaction: number;
    repeatClients: number;
    averageOrderValue: number;
  };
}

const MasterStatistics = () => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/statistics/master`, {
        params: { period },
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setToast({ message: t('masterStatistics.notifications.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !statistics) {
    return <div className={styles.loading}>{t('masterStatistics.loading')}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{t('masterStatistics.title')}</h1>
          <p>{t('masterStatistics.subtitle')}</p>
        </div>
        <div className={styles.periodSelector}>
          <button
            className={period === 'week' ? styles.active : ''}
            onClick={() => setPeriod('week')}
          >
            {t('masterStatistics.periods.week')}
          </button>
          <button
            className={period === 'month' ? styles.active : ''}
            onClick={() => setPeriod('month')}
          >
            {t('masterStatistics.periods.month')}
          </button>
          <button
            className={period === 'quarter' ? styles.active : ''}
            onClick={() => setPeriod('quarter')}
          >
            {t('masterStatistics.periods.quarter')}
          </button>
          <button
            className={period === 'year' ? styles.active : ''}
            onClick={() => setPeriod('year')}
          >
            {t('masterStatistics.periods.year')}
          </button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <MdWork size={28} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>{t('masterStatistics.metrics.totalOrders')}</span>
            <h2>{statistics.totalOrders}</h2>
            <span className={styles.metricSub}>{t('masterStatistics.metrics.completed')} {statistics.completedOrders}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <MdAttachMoney size={28} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>{t('masterStatistics.metrics.totalIncome')}</span>
            <h2>{statistics.totalIncome.toLocaleString('ru-RU')} ₸</h2>
            <span className={styles.metricSub}>
              {t('masterStatistics.metrics.averageCheck')} {statistics.performanceMetrics.averageOrderValue.toLocaleString('ru-RU')} ₸
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <MdStar size={28} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>{t('masterStatistics.metrics.averageRating')}</span>
            <h2>{statistics.averageRating.toFixed(1)}</h2>
            <span className={styles.metricSub}>
              {t('masterStatistics.metrics.satisfaction')} {statistics.performanceMetrics.customerSatisfaction}%
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #e94560 0%, #c81e3c 100%)' }}>
            <MdPeople size={28} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>{t('masterStatistics.metrics.clients')}</span>
            <h2>{statistics.totalClients}</h2>
            <span className={styles.metricSub}>
              {t('masterStatistics.metrics.repeat')} {statistics.performanceMetrics.repeatClients}%
            </span>
          </div>
        </div>
      </div>

      {/* Показатели эффективности */}
      <div className={styles.performanceSection}>
        <h2>{t('masterStatistics.performance.title')}</h2>
        <div className={styles.performanceGrid}>
          <div className={styles.performanceCard}>
            <div className={styles.performanceHeader}>
              <span>{t('masterStatistics.performance.completionRate')}</span>
              <strong>{statistics.completionRate}%</strong>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${statistics.completionRate}%`, background: '#10b981' }}
              />
            </div>
          </div>

          <div className={styles.performanceCard}>
            <div className={styles.performanceHeader}>
              <span>{t('masterStatistics.performance.onTimeDelivery')}</span>
              <strong>{statistics.performanceMetrics.onTimeDelivery}%</strong>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${statistics.performanceMetrics.onTimeDelivery}%`, background: '#667eea' }}
              />
            </div>
          </div>

          <div className={styles.performanceCard}>
            <div className={styles.performanceHeader}>
              <span>{t('masterStatistics.performance.customerSatisfaction')}</span>
              <strong>{statistics.performanceMetrics.customerSatisfaction}%</strong>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${statistics.performanceMetrics.customerSatisfaction}%`, background: '#f59e0b' }}
              />
            </div>
          </div>

          <div className={styles.performanceCard}>
            <div className={styles.performanceHeader}>
              <span>{t('masterStatistics.performance.repeatClients')}</span>
              <strong>{statistics.performanceMetrics.repeatClients}%</strong>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${statistics.performanceMetrics.repeatClients}%`, background: '#e94560' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Графики по месяцам */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><MdShowChart size={24} /> {t('masterStatistics.charts.ordersDynamics')}</h3>
          </div>
          <div className={styles.chartContent}>
            {statistics.monthlyData.map((data, index) => (
              <div key={index} className={styles.chartBar}>
                <div className={styles.barLabel}>{data.month}</div>
                <div className={styles.barContainer}>
                  <div 
                    className={styles.barFill}
                    style={{ 
                      width: `${(data.orders / Math.max(...statistics.monthlyData.map(d => d.orders))) * 100}%`,
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    <span>{data.orders}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3><MdTimeline size={24} /> {t('masterStatistics.charts.incomeDynamics')}</h3>
          </div>
          <div className={styles.chartContent}>
            {statistics.monthlyData.map((data, index) => (
              <div key={index} className={styles.chartBar}>
                <div className={styles.barLabel}>{data.month}</div>
                <div className={styles.barContainer}>
                  <div 
                    className={styles.barFill}
                    style={{ 
                      width: `${(data.income / Math.max(...statistics.monthlyData.map(d => d.income))) * 100}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                    }}
                  >
                    <span>{(data.income / 1000).toFixed(0)}k ₸</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Популярные категории */}
      <div className={styles.categoriesSection}>
        <h2>{t('masterStatistics.categories.title')}</h2>
        <div className={styles.categoriesGrid}>
          {statistics.topCategories.map((category, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryName}>{category.category}</span>
                <span className={styles.categoryCount}>{category.count} {t('masterStatistics.categories.orders')}</span>
              </div>
              <div className={styles.categoryBar}>
                <div 
                  className={styles.categoryFill}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
              <span className={styles.categoryPercent}>{category.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Недавняя активность */}
      <div className={styles.activitySection}>
        <h2><MdCalendarToday size={24} /> {t('masterStatistics.activity.title')}</h2>
        <div className={styles.activityTable}>
          <div className={styles.tableHeader}>
            <div>{t('masterStatistics.activity.date')}</div>
            <div>{t('masterStatistics.activity.ordersCompleted')}</div>
            <div>{t('masterStatistics.activity.income')}</div>
          </div>
          {statistics.recentActivity.map((activity, index) => (
            <div key={index} className={styles.tableRow}>
              <div>{new Date(activity.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</div>
              <div>{activity.ordersCompleted}</div>
              <div className={styles.income}>{activity.income.toLocaleString('ru-RU')} ₸</div>
            </div>
          ))}
        </div>
      </div>

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

export default MasterStatistics;
