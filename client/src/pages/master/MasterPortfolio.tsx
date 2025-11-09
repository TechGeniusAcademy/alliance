import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdImage, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { masterService } from '../../services/masterService';
import type { PortfolioItem } from '../../services/masterService';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './MasterPortfolio.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const MasterPortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<PortfolioItem>({
    title: '',
    description: '',
    category: '',
    images: [],
    execution_time: '',
    materials: '',
    dimensions: '',
    furniture_type: '',
    style: '',
    color: '',
    client_name: '',
    location: '',
    price: 0,
    warranty_period: '',
    assembly_included: true,
    delivery_included: false,
    is_public: true,
  });

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPortfolio = async () => {
    try {
      setLoading(true);
      const data = await masterService.getPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      showToast('Ошибка при загрузке портфолио', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      images: [],
      execution_time: '',
      materials: '',
      dimensions: '',
      furniture_type: '',
      style: '',
      color: '',
      client_name: '',
      location: '',
      price: 0,
      warranty_period: '',
      assembly_included: true,
      delivery_included: false,
      is_public: true,
    });
    setShowModal(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || '',
      images: item.images || [],
      execution_time: item.execution_time || '',
      materials: item.materials || '',
      dimensions: item.dimensions || '',
      furniture_type: item.furniture_type || '',
      style: item.style || '',
      color: item.color || '',
      client_name: item.client_name || '',
      location: item.location || '',
      price: item.price || 0,
      warranty_period: item.warranty_period || '',
      assembly_included: item.assembly_included ?? true,
      delivery_included: item.delivery_included ?? false,
      is_public: item.is_public ?? true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Введите название работы', 'error');
      return;
    }

    try {
      if (editingItem && editingItem.id) {
        await masterService.updatePortfolioItem(editingItem.id, formData);
        showToast('Работа успешно обновлена', 'success');
      } else {
        await masterService.createPortfolioItem(formData);
        showToast('Работа успешно добавлена', 'success');
      }
      closeModal();
      loadPortfolio();
    } catch (error) {
      console.error('Error saving portfolio item:', error);
      showToast('Ошибка при сохранении', 'error');
    }
  };

  const confirmDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;

    try {
      await masterService.deletePortfolioItem(confirmDeleteId);
      showToast('Работа удалена', 'success');
      setConfirmDeleteId(null);
      loadPortfolio();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      showToast('Ошибка при удалении', 'error');
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt('Введите URL изображения:');
    if (url) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), url]
      });
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData({
      ...formData,
      images: (formData.images || []).filter((_, i) => i !== index)
    });
  };

  const categories = [
    'Кухонная мебель',
    'Шкафы-купе и гардеробные',
    'Спальная мебель',
    'Гостиная (стенки, тумбы)',
    'Офисная мебель',
    'Детская мебель',
    'Прихожие',
    'Столы (обеденные, письменные)',
    'Стулья и кресла',
    'Корпусная мебель на заказ',
    'Мягкая мебель',
    'Встроенная мебель',
    'Ванная комната',
    'Другое'
  ];

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
        <div>
          <h1 className={styles.pageTitle}>
            <MdImage className={styles.titleIcon} />
            Портфолио
          </h1>
          <p className={styles.subtitle}>
            {portfolio.length} {portfolio.length === 1 ? 'работа' : 'работ'}
          </p>
        </div>
        <button className={styles.addButton} onClick={openAddModal}>
          <MdAdd size={20} />
          Добавить работу
        </button>
      </div>

      {portfolio.length === 0 ? (
        <div className={styles.emptyState}>
          <MdImage size={80} />
          <h2>Портфолио пусто</h2>
          <p>Добавьте свои лучшие работы, чтобы привлечь клиентов</p>
          <button className={styles.addButton} onClick={openAddModal}>
            <MdAdd size={20} />
            Добавить первую работу
          </button>
        </div>
      ) : (
        <div className={styles.portfolioGrid}>
          {portfolio.map(item => (
            <div key={item.id} className={styles.portfolioCard}>
              <div className={styles.cardImage}>
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt={item.title} />
                ) : (
                  <div className={styles.noImage}>
                    <MdImage size={48} />
                    <span>Нет фото</span>
                  </div>
                )}
                {item.images && item.images.length > 1 && (
                  <div className={styles.imageCount}>
                    <MdImage size={16} />
                    {item.images.length}
                  </div>
                )}
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3>{item.title}</h3>
                  <div className={styles.visibilityBadge}>
                    {item.is_public ? (
                      <>
                        <MdVisibility size={16} />
                        <span>Публичная</span>
                      </>
                    ) : (
                      <>
                        <MdVisibilityOff size={16} />
                        <span>Скрытая</span>
                      </>
                    )}
                  </div>
                </div>

                {item.category && (
                  <span className={styles.categoryBadge}>{item.category}</span>
                )}

                {item.description && (
                  <p className={styles.description}>{item.description}</p>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.cardMeta}>
                    {item.price && (
                      <span className={styles.price}>
                        {item.price.toLocaleString()} ₸
                      </span>
                    )}
                    {item.execution_time && (
                      <span className={styles.date}>
                        ⏱ {item.execution_time}
                      </span>
                    )}
                    {item.materials && (
                      <span className={styles.materials}>
                        🪵 {item.materials}
                      </span>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => openEditModal(item)}
                      title="Редактировать"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => item.id && confirmDelete(item.id)}
                      title="Удалить"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно добавления/редактирования */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingItem ? 'Редактировать работу' : 'Добавить работу'}</h2>
              <button className={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Название работы *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Кухонный гарнитур на заказ"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Тип мебели</label>
                  <input
                    type="text"
                    value={formData.furniture_type}
                    onChange={(e) => setFormData({ ...formData, furniture_type: e.target.value })}
                    placeholder="Шкаф-купе, кухонный гарнитур..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Стиль</label>
                  <input
                    type="text"
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    placeholder="Современный, классический..."
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Описание работы</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Подробно опишите проект, особенности изготовления, технические детали..."
                  rows={4}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Материалы</label>
                  <input
                    type="text"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                    placeholder="ЛДСП, МДФ, массив дуба..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Цвет/Отделка</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Белый глянец, орех..."
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Размеры</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="200x150x60 см (ШxВxГ)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Срок выполнения</label>
                  <input
                    type="text"
                    value={formData.execution_time}
                    onChange={(e) => setFormData({ ...formData, execution_time: e.target.value })}
                    placeholder="2 недели, 1 месяц..."
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Стоимость (₸)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    min="0"
                    step="1000"
                    placeholder="150000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Гарантия</label>
                  <input
                    type="text"
                    value={formData.warranty_period}
                    onChange={(e) => setFormData({ ...formData, warranty_period: e.target.value })}
                    placeholder="1 год, 2 года..."
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Имя клиента (опционально)</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Иван Иванов"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Место установки</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Астана, р-н Есиль"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.assembly_included}
                      onChange={(e) => setFormData({ ...formData, assembly_included: e.target.checked })}
                    />
                    <span>Сборка включена в стоимость</span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.delivery_included}
                      onChange={(e) => setFormData({ ...formData, delivery_included: e.target.checked })}
                    />
                    <span>Доставка включена в стоимость</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Изображения</label>
                <div className={styles.imagesList}>
                  {formData.images && formData.images.map((url, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className={styles.removeImageButton}
                        onClick={() => handleImageRemove(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addImageButton}
                    onClick={handleImageUrlAdd}
                  >
                    <MdAdd size={24} />
                    <span>Добавить фото</span>
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                  <span>Показывать в публичном профиле</span>
                </label>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={closeModal}>
                  Отмена
                </button>
                <button type="submit" className={styles.saveButton}>
                  {editingItem ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {confirmDeleteId && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <h3>Подтвердите удаление</h3>
            </div>
            <div className={styles.confirmBody}>
              <p>Вы уверены, что хотите удалить эту работу из портфолио?</p>
              <p className={styles.warning}>Это действие нельзя отменить.</p>
            </div>
            <div className={styles.confirmFooter}>
              <button className={styles.cancelButton} onClick={cancelDelete}>
                Отмена
              </button>
              <button className={styles.confirmDeleteButton} onClick={handleDelete}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
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

export default MasterPortfolio;
