import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdCalendarToday, 
  MdAccessTime, 
  MdCheckCircle, 
  MdWarning,
  MdWork
} from 'react-icons/md';
import scheduleService, { type ScheduleItem } from '../../services/scheduleService';
import Toast, { type ToastType } from '../../components/Toast';
import styles from './MasterSchedule.module.css';

const MasterSchedule = () => {
  const { t } = useTranslation();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'reminder' as 'deadline' | 'reminder' | 'meeting' | 'other',
    priority: 'medium' as 'low' | 'medium' | 'high',
    order_id: undefined as number | undefined
  });

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const items = await scheduleService.getScheduleItems();
      setScheduleItems(items);
    } catch (error) {
      console.error('Ошибка загрузки расписания:', error);
      setToast({ message: t('masterSchedule.notifications.loadError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingItem) {
        await scheduleService.updateScheduleItem(editingItem.id, formData);
        setToast({ message: t('masterSchedule.notifications.updateSuccess'), type: 'success' });
      } else {
        await scheduleService.createScheduleItem(formData);
        setToast({ message: t('masterSchedule.notifications.createSuccess'), type: 'success' });
      }

      await loadSchedule();
      resetForm();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setToast({ message: t('masterSchedule.notifications.saveError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'reminder',
      priority: 'medium',
      order_id: undefined
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date,
      time: item.time,
      type: item.type,
      priority: item.priority,
      order_id: item.order_id
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('masterSchedule.confirmDelete'))) return;
    
    try {
      setLoading(true);
      await scheduleService.deleteScheduleItem(id);
      setToast({ message: t('masterSchedule.notifications.deleteSuccess'), type: 'success' });
      await loadSchedule();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setToast({ message: t('masterSchedule.notifications.deleteError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const item = scheduleItems.find(i => i.id === id);
      if (!item) return;
      
      const newStatus = item.status === 'completed' ? 'pending' : 'completed';
      await scheduleService.toggleStatus(id, newStatus);
      
      setScheduleItems(items =>
        items.map(i => i.id === id ? { ...i, status: newStatus } : i)
      );
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      setToast({ message: t('masterSchedule.notifications.statusError'), type: 'error' });
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      deadline: t('masterSchedule.types.deadline'),
      reminder: t('masterSchedule.types.reminder'),
      meeting: t('masterSchedule.types.meeting'),
      other: t('masterSchedule.types.other')
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      deadline: '#e94560',
      reminder: '#667eea',
      meeting: '#10b981',
      other: '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      high: '#e94560',
      medium: '#f9ca24',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const isOverdue = (item: ScheduleItem) => {
    if (item.status === 'completed') return false;
    const itemDate = new Date(`${item.date}T${item.time}`);
    return itemDate < new Date();
  };

  const filteredItems = scheduleItems
    .filter(item => filterType === 'all' || item.type === filterType)
    .filter(item => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'overdue') return isOverdue(item);
      return item.status === filterStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return t('masterSchedule.time.today');
    if (date.toDateString() === tomorrow.toDateString()) return t('masterSchedule.time.tomorrow');
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{t('masterSchedule.title')}</h1>
          <p>{t('masterSchedule.subtitle')}</p>
        </div>
        <button className={styles.addButton} onClick={() => setShowModal(true)}>
          <MdAdd size={20} />
          {t('masterSchedule.addEvent')}
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>{t('masterSchedule.filters.type')}</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">{t('masterSchedule.types.all')}</option>
            <option value="deadline">{t('masterSchedule.types.deadlines')}</option>
            <option value="reminder">{t('masterSchedule.types.reminders')}</option>
            <option value="meeting">{t('masterSchedule.types.meetings')}</option>
            <option value="other">{t('masterSchedule.types.other')}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>{t('masterSchedule.filters.status')}</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">{t('masterSchedule.statuses.all')}</option>
            <option value="pending">{t('masterSchedule.statuses.pending')}</option>
            <option value="completed">{t('masterSchedule.statuses.completed')}</option>
            <option value="overdue">{t('masterSchedule.statuses.overdue')}</option>
          </select>
        </div>
      </div>

      <div className={styles.scheduleList}>
        {filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <MdCalendarToday size={64} />
            <p>{t('masterSchedule.noEvents')}</p>
            <span>{t('masterSchedule.noEventsHint')}</span>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`${styles.scheduleItem} ${item.status === 'completed' ? styles.completed : ''} ${
                isOverdue(item) ? styles.overdue : ''
              }`}
            >
              <div className={styles.itemCheckbox}>
                <button
                  className={`${styles.checkbox} ${item.status === 'completed' ? styles.checked : ''}`}
                  onClick={() => toggleStatus(item.id)}
                >
                  {item.status === 'completed' && <MdCheckCircle size={20} />}
                </button>
              </div>

              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <h3>{item.title}</h3>
                  <div className={styles.itemBadges}>
                    <span
                      className={styles.typeBadge}
                      style={{ backgroundColor: getTypeColor(item.type) }}
                    >
                      {getTypeLabel(item.type)}
                    </span>
                    <span
                      className={styles.priorityBadge}
                      style={{ borderColor: getPriorityColor(item.priority) }}
                    />
                  </div>
                </div>

                {item.description && (
                  <p className={styles.itemDescription}>{item.description}</p>
                )}

                {item.order_title && (
                  <div className={styles.orderInfo}>
                    <MdWork size={16} /> {t('masterSchedule.order')} {item.order_title} #{item.order_id}
                  </div>
                )}

                <div className={styles.itemFooter}>
                  <div className={styles.itemDateTime}>
                    <MdCalendarToday size={16} />
                    <span>{formatDate(item.date)}</span>
                    <MdAccessTime size={16} />
                    <span>{item.time}</span>
                  </div>

                  {isOverdue(item) && (
                    <div className={styles.overdueWarning}>
                      <MdWarning size={16} />
                      {t('masterSchedule.overdue')}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.itemActions}>
                <button onClick={() => handleEdit(item)} className={styles.editButton}>
                  <MdEdit size={20} />
                </button>
                <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modal} onClick={resetForm}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? t('masterSchedule.modal.editTitle') : t('masterSchedule.modal.newTitle')}</h2>
              <button onClick={resetForm} className={styles.closeButton}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>{t('masterSchedule.form.title')}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder={t('masterSchedule.form.titlePlaceholder')}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label>{t('masterSchedule.form.description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder={t('masterSchedule.form.descriptionPlaceholder')}
                  disabled={loading}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t('masterSchedule.form.date')}</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('masterSchedule.form.time')}</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t('masterSchedule.form.type')}</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    required
                    disabled={loading}
                  >
                    <option value="reminder">{t('masterSchedule.types.reminder')}</option>
                    <option value="deadline">{t('masterSchedule.types.deadline')}</option>
                    <option value="meeting">{t('masterSchedule.types.meeting')}</option>
                    <option value="other">{t('masterSchedule.types.other')}</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>{t('masterSchedule.form.priority')}</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    required
                    disabled={loading}
                  >
                    <option value="low">{t('masterSchedule.priorities.low')}</option>
                    <option value="medium">{t('masterSchedule.priorities.medium')}</option>
                    <option value="high">{t('masterSchedule.priorities.high')}</option>
                  </select>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={styles.cancelButton} disabled={loading}>
                  {t('masterSchedule.form.cancel')}
                </button>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? t('masterSchedule.form.saving') : (editingItem ? t('masterSchedule.form.save') : t('masterSchedule.form.add'))}
                </button>
              </div>
            </form>
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

export default MasterSchedule;
