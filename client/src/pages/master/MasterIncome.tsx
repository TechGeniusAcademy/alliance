import { useState, useEffect } from 'react';
import { 
  MdAttachMoney, 
  MdTrendingUp, 
  MdCalendarToday,
  MdDescription,
  MdReceipt,
  MdCheckCircle,
  MdFilterList,
  MdSearch
} from 'react-icons/md';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import Toast, { type ToastType } from '../../components/Toast';
import styles from './MasterIncome.module.css';

interface IncomeOrder {
  id: number;
  order_id: number;
  order_title: string;
  customer_name: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_income: number;
  completed_date: string;
  payment_status: string;
  invoice_generated: boolean;
  act_generated: boolean;
}

interface IncomeSummary {
  totalIncome: number;
  totalCommission: number;
  netIncome: number;
  ordersCount: number;
  averageOrder: number;
  thisMonthIncome: number;
  lastMonthIncome: number;
}

const MasterIncome = () => {
  const [incomeOrders, setIncomeOrders] = useState<IncomeOrder[]>([]);
  const [summary, setSummary] = useState<IncomeSummary>({
    totalIncome: 0,
    totalCommission: 0,
    netIncome: 0,
    ordersCount: 0,
    averageOrder: 0,
    thisMonthIncome: 0,
    lastMonthIncome: 0
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<IncomeOrder | null>(null);

  useEffect(() => {
    loadIncomeData();
  }, [filterPeriod]);

  const loadIncomeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/income/master`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period: filterPeriod }
      });

      setIncomeOrders(response.data.orders || []);
      setSummary(response.data.summary || summary);
    } catch (error) {
      console.error('Ошибка загрузки данных о доходах:', error);
      setToast({ message: 'Не удалось загрузить данные о доходах', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (orderId: number, type: 'invoice' | 'act') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/income/download/${type}/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type === 'invoice' ? 'Счет' : 'Акт'}_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setToast({ 
        message: `${type === 'invoice' ? 'Счет' : 'Акт выполненных работ'} успешно скачан`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Ошибка скачивания документа:', error);
      setToast({ message: 'Не удалось скачать документ', type: 'error' });
    }
  };

  const filteredOrders = incomeOrders.filter(order => {
    if (!searchQuery) return true;
    return (
      order.order_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_id.toString().includes(searchQuery)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getIncomeGrowth = () => {
    if (summary.lastMonthIncome === 0) return '0';
    return ((summary.thisMonthIncome - summary.lastMonthIncome) / summary.lastMonthIncome * 100).toFixed(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Доходы</h1>
          <p>Отчет о доходах с завершенных заказов</p>
        </div>
      </div>

      {/* Сводка */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <MdAttachMoney size={32} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Общий доход</div>
            <div className={styles.summaryValue}>{formatCurrency(summary.totalIncome)}</div>
            <div className={styles.summarySubtext}>
              Комиссия: {formatCurrency(summary.totalCommission)}
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <MdCheckCircle size={32} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Чистый доход</div>
            <div className={styles.summaryValue}>{formatCurrency(summary.netIncome)}</div>
            <div className={styles.summarySubtext}>
              После вычета комиссии
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <MdTrendingUp size={32} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Этот месяц</div>
            <div className={styles.summaryValue}>{formatCurrency(summary.thisMonthIncome)}</div>
            <div className={styles.summarySubtext} style={{ 
              color: Number(getIncomeGrowth()) >= 0 ? '#10b981' : '#e94560' 
            }}>
              {Number(getIncomeGrowth()) >= 0 ? '↑' : '↓'} {Math.abs(Number(getIncomeGrowth()))}% от прошлого
            </div>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon} style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <MdReceipt size={32} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryLabel}>Заказов завершено</div>
            <div className={styles.summaryValue}>{summary.ordersCount}</div>
            <div className={styles.summarySubtext}>
              Средний чек: {formatCurrency(summary.averageOrder)}
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <MdSearch size={20} />
          <input
            type="text"
            placeholder="Поиск по названию, клиенту или номеру..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <MdFilterList size={20} />
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
            <option value="all">Все время</option>
            <option value="today">Сегодня</option>
            <option value="week">Эта неделя</option>
            <option value="month">Этот месяц</option>
            <option value="quarter">Этот квартал</option>
            <option value="year">Этот год</option>
          </select>
        </div>
      </div>

      {/* Список заказов */}
      <div className={styles.ordersSection}>
        <h2>История завершенных заказов</h2>
        
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <MdReceipt size={64} />
            <p>Нет завершенных заказов</p>
            <span>Завершенные заказы будут отображаться здесь</span>
          </div>
        ) : (
          <div className={styles.ordersTable}>
            <table>
              <thead>
                <tr>
                  <th>№ Заказа</th>
                  <th>Название</th>
                  <th>Клиент</th>
                  <th>Дата завершения</th>
                  <th>Сумма заказа</th>
                  <th>Комиссия</th>
                  <th>Чистый доход</th>
                  <th>Документы</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)}>
                    <td>
                      <span className={styles.orderId}>#{order.order_id}</span>
                    </td>
                    <td>
                      <div className={styles.orderTitle}>{order.order_title}</div>
                    </td>
                    <td>{order.customer_name}</td>
                    <td>
                      <div className={styles.dateCell}>
                        <MdCalendarToday size={16} />
                        {formatDate(order.completed_date)}
                      </div>
                    </td>
                    <td>
                      <span className={styles.amount}>{formatCurrency(order.order_amount)}</span>
                    </td>
                    <td>
                      <span className={styles.commission}>
                        -{formatCurrency(order.commission_amount)}
                        <span className={styles.rate}>({order.commission_rate}%)</span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.netIncome}>{formatCurrency(order.net_income)}</span>
                    </td>
                    <td>
                      <div className={styles.documentActions}>
                        <button
                          className={styles.downloadBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDocument(order.order_id, 'invoice');
                          }}
                          title="Скачать счет"
                        >
                          <MdDescription size={18} />
                          Счет
                        </button>
                        <button
                          className={styles.downloadBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDocument(order.order_id, 'act');
                          }}
                          title="Скачать акт"
                        >
                          <MdReceipt size={18} />
                          Акт
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно с деталями */}
      {selectedOrder && (
        <div className={styles.modal} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Детали заказа #{selectedOrder.order_id}</h2>
              <button onClick={() => setSelectedOrder(null)} className={styles.closeButton}>×</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Название заказа:</span>
                <span className={styles.detailValue}>{selectedOrder.order_title}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Клиент:</span>
                <span className={styles.detailValue}>{selectedOrder.customer_name}</span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Дата завершения:</span>
                <span className={styles.detailValue}>{formatDate(selectedOrder.completed_date)}</span>
              </div>

              <div className={styles.incomeBreakdown}>
                <h3>Разбивка дохода</h3>
                
                <div className={styles.breakdownItem}>
                  <span>Сумма заказа:</span>
                  <span className={styles.breakdownAmount}>{formatCurrency(selectedOrder.order_amount)}</span>
                </div>

                <div className={styles.breakdownItem}>
                  <span>Комиссия платформы ({selectedOrder.commission_rate}%):</span>
                  <span className={styles.breakdownCommission}>-{formatCurrency(selectedOrder.commission_amount)}</span>
                </div>

                <div className={styles.breakdownDivider}></div>

                <div className={styles.breakdownItem}>
                  <span><strong>Чистый доход:</strong></span>
                  <span className={styles.breakdownNet}>{formatCurrency(selectedOrder.net_income)}</span>
                </div>
              </div>

              <div className={styles.documentSection}>
                <h3>Документы</h3>
                <div className={styles.documentButtons}>
                  <button
                    className={styles.documentButton}
                    onClick={() => downloadDocument(selectedOrder.order_id, 'invoice')}
                  >
                    <MdDescription size={24} />
                    <span>Скачать счет</span>
                  </button>
                  <button
                    className={styles.documentButton}
                    onClick={() => downloadDocument(selectedOrder.order_id, 'act')}
                  >
                    <MdReceipt size={24} />
                    <span>Скачать акт выполненных работ</span>
                  </button>
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

export default MasterIncome;
