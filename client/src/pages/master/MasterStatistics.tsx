import { useState, useEffect } from 'react';
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
      setToast({ message: 'Не удалось загрузить статистику', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !statistics) {
    return <div className={styles.loading}>Загрузка статистики...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Статистика</h1>
          <p>Анализ вашей работы и производительности</p>
        </div>
        <div className={styles.periodSelector}>
          <button
            className={period === 'week' ? styles.active : ''}
            onClick={() => setPeriod('week')}
          >
            Неделя
          </button>
          <button
            className={period === 'month' ? styles.active : ''}
            onClick={() => setPeriod('month')}
          >
            Месяц
          </button>
          <button
            className={period === 'quarter' ? styles.active : ''}
            onClick={() => setPeriod('quarter')}
          >
            Квартал
          </button>
          <button
            className={period === 'year' ? styles.active : ''}
            onClick={() => setPeriod('year')}
          >
            Год
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
            <span className={styles.metricLabel}>Всего заказов</span>
            <h2>{statistics.totalOrders}</h2>
            <span className={styles.metricSub}>Завершено: {statistics.completedOrders}</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <MdAttachMoney size={28} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Общий доход</span>
            <h2>{statistics.totalIncome.toLocaleString('ru-RU')} ₸</h2>
            <span className={styles.metricSub}>
              Средний чек: {statistics.performanceMetrics.averageOrderValue.toLocaleString('ru-RU')} ₸
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <MdStar size={28} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Средний рейтинг</span>
            <h2>{statistics.averageRating.toFixed(1)}</h2>
            <span className={styles.metricSub}>
              Удовлетворенность: {statistics.performanceMetrics.customerSatisfaction}%
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon} style={{ background: 'linear-gradient(135deg, #e94560 0%, #c81e3c 100%)' }}>
            <MdPeople size={28} />
          </div>
          <div className={styles.metricContent}>
            <span className={styles.metricLabel}>Клиенты</span>
            <h2>{statistics.totalClients}</h2>
            <span className={styles.metricSub}>
              Повторных: {statistics.performanceMetrics.repeatClients}%
            </span>
          </div>
        </div>
      </div>

      {/* Показатели эффективности */}
      <div className={styles.performanceSection}>
        <h2>Показатели эффективности</h2>
        <div className={styles.performanceGrid}>
          <div className={styles.performanceCard}>
            <div className={styles.performanceHeader}>
              <span>Процент завершения</span>
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
              <span>Доставка в срок</span>
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
              <span>Удовлетворенность клиентов</span>
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
              <span>Повторные клиенты</span>
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
            <h3><MdShowChart size={24} /> Динамика заказов</h3>
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
            <h3><MdTimeline size={24} /> Динамика дохода</h3>
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
        <h2>Популярные категории</h2>
        <div className={styles.categoriesGrid}>
          {statistics.topCategories.map((category, index) => (
            <div key={index} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryName}>{category.category}</span>
                <span className={styles.categoryCount}>{category.count} заказов</span>
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
        <h2><MdCalendarToday size={24} /> Недавняя активность</h2>
        <div className={styles.activityTable}>
          <div className={styles.tableHeader}>
            <div>Дата</div>
            <div>Заказов завершено</div>
            <div>Доход</div>
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
