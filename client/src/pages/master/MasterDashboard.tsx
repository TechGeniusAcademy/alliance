import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { 
  MdShoppingCart, 
  MdTrendingUp, 
  MdStar, 
  MdAttachMoney,
  MdCheckCircle,
  MdPending
} from 'react-icons/md';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import styles from './Master.module.css';
import { getMasterStatistics, getMasterActivity } from '../../services/statisticsService';
import type { MasterStatistics, Activity } from '../../services/statisticsService';

const MasterDashboard = () => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<MasterStatistics | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          getMasterStatistics('month'),
          getMasterActivity(10)
        ]);
        setStatistics(statsData);
        setActivities(activityData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('masterDashboard.timeAgo.justNow');
    if (diffMins < 60) return `${diffMins} ${t('masterDashboard.timeAgo.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? t('masterDashboard.timeAgo.hourAgo') : t('masterDashboard.timeAgo.hoursAgo')}`;
    if (diffDays === 1) return t('masterDashboard.timeAgo.yesterday');
    return `${diffDays} ${diffDays < 5 ? t('masterDashboard.timeAgo.daysAgo') : t('masterDashboard.timeAgo.manyDaysAgo')}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'newOrder':
      case 'orderStarted':
      case 'orderAccepted':
        return <MdShoppingCart />;
      case 'orderCompleted':
        return <MdCheckCircle />;
      case 'newReview':
        return <MdStar />;
      default:
        return <MdShoppingCart />;
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t('masterDashboard.title')}</h1>
          <p className={styles.pageSubtitle}>{t('masterDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{t('masterDashboard.title')}</h1>
          <p className={styles.pageSubtitle} style={{ color: '#e53e3e' }}>
            {error || t('masterDashboard.loadError')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('masterDashboard.title')}</h1>
        <p className={styles.pageSubtitle}>{t('masterDashboard.subtitle')}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#1D1E24' }}>
            <MdShoppingCart size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.activeOrders}</div>
            <div className={styles.statLabel}>{t('masterDashboard.activeOrders')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#1D1E24' }}>
            <MdCheckCircle size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.completedOrders}</div>
            <div className={styles.statLabel}>{t('masterDashboard.completedOrders')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#1D1E24' }}>
            <MdStar size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.averageRating.toFixed(1)}</div>
            <div className={styles.statLabel}>{t('masterDashboard.rating')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#1D1E24' }}>
            <MdAttachMoney size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {statistics.totalIncome >= 1000000 
                ? `${(statistics.totalIncome / 1000000).toFixed(1)}M ₸`
                : `${(statistics.totalIncome / 1000).toFixed(0)}K ₸`
              }
            </div>
            <div className={styles.statLabel}>{t('masterDashboard.earnings')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#1D1E24' }}>
            <MdPending size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.totalOrders}</div>
            <div className={styles.statLabel}>{t('masterDashboard.totalOrders')}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#1D1E24' }}>
            <MdTrendingUp size={28} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{statistics.completionRate}%</div>
            <div className={styles.statLabel}>{t('masterDashboard.completionRate')}</div>
          </div>
        </div>
      </div>

      {/* Графики и диаграммы */}
      <div className={styles.chartsGrid}>
        {/* График дохода за 6 месяцев */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>{t('masterDashboard.incomeChart')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={statistics.monthlyData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D1E24" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1D1E24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
                formatter={(value: number | undefined) => value ? [`${(value / 1000).toFixed(0)}K ₸`, t('masterDashboard.income')] : ['0K ₸', t('masterDashboard.income')]}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#1D1E24" 
                fillOpacity={1} 
                fill="url(#colorIncome)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* График заказов за 6 месяцев */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>{t('masterDashboard.ordersChart')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#718096" />
              <YAxis stroke="#718096" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
                formatter={(value: number | undefined) => value ? [`${value}`, t('masterDashboard.orders')] : ['0', t('masterDashboard.orders')]}
              />
              <Bar dataKey="orders" fill="#1D1E24" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Круговая диаграмма категорий */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>{t('masterDashboard.categoriesChart')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statistics.topCategories}
                cx="50%"
                cy="50%"
                labelLine={true}
                label
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="category"
              >
                {statistics.topCategories.map((_entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={['#1D1E24', '#4A5568', '#718096', '#A0AEC0', '#CBD5E0'][index % 5]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Показатели эффективности */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>{t('masterDashboard.performanceMetrics')}</h3>
          <div className={styles.metricsContainer}>
            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>{t('masterDashboard.onTimeDelivery')}</div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${statistics.performanceMetrics.onTimeDelivery}%` }}
                >
                  <span className={styles.progressText}>
                    {statistics.performanceMetrics.onTimeDelivery}%
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>{t('masterDashboard.customerSatisfaction')}</div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${statistics.performanceMetrics.customerSatisfaction}%` }}
                >
                  <span className={styles.progressText}>
                    {statistics.performanceMetrics.customerSatisfaction}%
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>{t('masterDashboard.repeatClients')}</div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${statistics.performanceMetrics.repeatClients}%` }}
                >
                  <span className={styles.progressText}>
                    {statistics.performanceMetrics.repeatClients}%
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.metricItem}>
              <div className={styles.metricLabel}>{t('masterDashboard.averageOrderValue')}</div>
              <div className={styles.metricValue}>
                {(statistics.performanceMetrics.averageOrderValue / 1000).toFixed(0)}K ₸
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('masterDashboard.recentActivity')}</h2>
        <div className={styles.activityList}>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>{activity.title}</div>
                  <div className={styles.activityDesc}>
                    {activity.description}
                    {activity.customerName && ` - ${activity.customerName}`}
                  </div>
                  <div className={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.activityItem}>
              <div className={styles.activityContent}>
                <div className={styles.activityDesc}>{t('masterDashboard.noActivity')}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
