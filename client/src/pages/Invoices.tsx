import { useState, useEffect } from 'react';
import { MdReceipt, MdSearch, MdDownload } from 'react-icons/md';
import { appService } from '../services/appService';
import type { Invoice } from '../types/app';
import styles from './Orders.module.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await appService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.orderTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'sent': return '#3b82f6';
      case 'draft': return '#6b7280';
      case 'overdue': return '#ef4444';
      case 'cancelled': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    // Генерируем простой текстовый файл вместо PDF (для демонстрации)
    // В production можно использовать библиотеку jsPDF или backend endpoint

    const invoiceText = `
════════════════════════════════════════════════════════════════
                              СЧЁТ
                        ${invoice.invoiceNumber}
════════════════════════════════════════════════════════════════

Заказ: ${invoice.orderTitle}
Дата выставления: ${formatDate(invoice.issuedAt)}
Оплатить до: ${formatDate(invoice.dueDate)}
${invoice.paidAt ? `Оплачено: ${formatDate(invoice.paidAt)}` : ''}

────────────────────────────────────────────────────────────────

ПОЗИЦИИ:

${invoice.items.map((item, index) => `
${index + 1}. ${item.description}
   Количество: ${item.quantity}
   Цена за единицу: ${item.unitPrice.toLocaleString()} ${invoice.currency}
   Итого: ${item.total.toLocaleString()} ${invoice.currency}
`).join('\n')}

────────────────────────────────────────────────────────────────

ИТОГО К ОПЛАТЕ: ${invoice.amount.toLocaleString()} ${invoice.currency}

Статус: ${invoice.status === 'paid' ? 'Оплачено' :
        invoice.status === 'sent' ? 'Отправлено' :
          invoice.status === 'draft' ? 'Черновик' :
            invoice.status === 'overdue' ? 'Просрочено' : 'Отменено'}

${invoice.notes ? `\nПримечания:\n${invoice.notes}` : ''}

════════════════════════════════════════════════════════════════
    `;

    // Создаём blob и скачиваем
    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.pageTitle}>
            <MdReceipt className={styles.titleIcon} />
            Счета
          </h1>
        </div>

        <div className={styles.headerStats}>
          <div className={`${styles.statCard} ${styles.total}`}>
            <div className={styles.statValue}>{stats.total}</div>
            <div className={styles.statLabel}>Всего счетов</div>
          </div>
          <div className={`${styles.statCard} ${styles.completed}`}>
            <div className={styles.statValue}>{stats.paid}</div>
            <div className={styles.statLabel}>Оплачено</div>
          </div>
          <div className={`${styles.statCard} ${styles.cancelled}`}>
            <div className={styles.statValue}>{stats.overdue}</div>
            <div className={styles.statLabel}>Просрочено</div>
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <MdSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск по номеру счета..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Все счета</option>
            <option value="paid">Оплачено</option>
            <option value="sent">Отправлено</option>
            <option value="draft">Черновик</option>
            <option value="overdue">Просрочено</option>
            <option value="cancelled">Отменено</option>
          </select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className={styles.emptyState}>
          <MdReceipt size={64} />
          <h3>Счета не найдены</h3>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Номер счета</th>
                <th>Заказ</th>
                <th>Сумма</th>
                <th>Выставлен</th>
                <th>Оплатить до</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className={styles.invoiceNumber}>{invoice.invoiceNumber}</td>
                  <td>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderTitle}>{invoice.orderTitle}</div>
                      <div className={styles.orderDescription}>
                        {invoice.items.length} позиций
                      </div>
                    </div>
                  </td>
                  <td className={styles.amount}>
                    {invoice.amount.toLocaleString()} {invoice.currency}
                  </td>
                  <td className={styles.date}>{formatDate(invoice.issuedAt)}</td>
                  <td className={styles.date}>{formatDate(invoice.dueDate)}</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(invoice.status) }}
                    >
                      {invoice.status === 'paid' && 'Оплачено'}
                      {invoice.status === 'sent' && 'Отправлено'}
                      {invoice.status === 'draft' && 'Черновик'}
                      {invoice.status === 'overdue' && 'Просрочено'}
                      {invoice.status === 'cancelled' && 'Отменено'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.iconButton}
                      title="Скачать PDF"
                      onClick={() => handleDownloadPDF(invoice)}
                    >
                      <MdDownload size={20} />
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
};

export default Invoices;
