import { useState, useEffect } from 'react';
import { MdPerson, MdSave, MdBusiness, MdWork, MdLanguage, MdSettings, MdAttachMoney, MdVerifiedUser } from 'react-icons/md';
import axios from 'axios';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './MasterProfile.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface MasterProfileData {
  // Основные данные
  name: string;
  phone: string;
  address: string;
  profile_photo: string;
  
  // Данные профиля мастера
  company_name: string;
  bio: string;
  specializations: string[];
  years_of_experience: number;
  education: string;
  certifications: string[];
  
  work_schedule: string;
  min_order_amount: number;
  max_projects_simultaneously: number;
  
  services_offered: string[];
  materials_work_with: string[];
  equipment: string;
  workspace_size: string;
  has_showroom: boolean;
  showroom_address: string;
  
  payment_methods: string[];
  warranty_terms: string;
  return_policy: string;
  
  website: string;
  instagram: string;
  facebook: string;
  telegram: string;
  whatsapp: string;
  
  languages: string[];
  delivery_available: boolean;
  assembly_available: boolean;
  design_services: boolean;
  consultation_free: boolean;
}

const MasterProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const [formData, setFormData] = useState<MasterProfileData>({
    name: '',
    phone: '',
    address: '',
    profile_photo: '',
    company_name: '',
    bio: '',
    specializations: [],
    years_of_experience: 0,
    education: '',
    certifications: [],
    work_schedule: '',
    min_order_amount: 0,
    max_projects_simultaneously: 3,
    services_offered: [],
    materials_work_with: [],
    equipment: '',
    workspace_size: '',
    has_showroom: false,
    showroom_address: '',
    payment_methods: [],
    warranty_terms: '',
    return_policy: '',
    website: '',
    instagram: '',
    facebook: '',
    telegram: '',
    whatsapp: '',
    languages: [],
    delivery_available: true,
    assembly_available: true,
    design_services: false,
    consultation_free: true,
  });

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/master-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const profile = response.data.profile;
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        profile_photo: profile.profile_photo || '',
        company_name: profile.company_name || '',
        bio: profile.bio || '',
        specializations: profile.specializations || [],
        years_of_experience: profile.years_of_experience || 0,
        education: profile.education || '',
        certifications: profile.certifications || [],
        work_schedule: profile.work_schedule || '',
        min_order_amount: profile.min_order_amount || 0,
        max_projects_simultaneously: profile.max_projects_simultaneously || 3,
        services_offered: profile.services_offered || [],
        materials_work_with: profile.materials_work_with || [],
        equipment: profile.equipment || '',
        workspace_size: profile.workspace_size || '',
        has_showroom: profile.has_showroom || false,
        showroom_address: profile.showroom_address || '',
        payment_methods: profile.payment_methods || [],
        warranty_terms: profile.warranty_terms || '',
        return_policy: profile.return_policy || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        telegram: profile.telegram || '',
        whatsapp: profile.whatsapp || '',
        languages: profile.languages || [],
        delivery_available: profile.delivery_available !== false,
        assembly_available: profile.assembly_available !== false,
        design_services: profile.design_services || false,
        consultation_free: profile.consultation_free !== false,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Ошибка при загрузке профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put('http://localhost:5000/api/master-profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showToast('Профиль успешно обновлен', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Ошибка при сохранении профиля', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayInput = (field: keyof MasterProfileData, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdPerson size={32} />
          Профиль мастера
        </h1>
        <p className={styles.pageSubtitle}>
          Заполните информацию о себе для привлечения клиентов
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Основная информация */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdPerson size={24} />
            Основная информация
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Имя *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Название компании</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder="ИП Мебельщик"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Телефон</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+7 (777) 123-45-67"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Адрес</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Город, улица, дом"
              />
            </div>
            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
              <label>Ссылка на фото профиля</label>
              <input
                type="url"
                value={formData.profile_photo}
                onChange={(e) => setFormData({...formData, profile_photo: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
              <label>О себе</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                placeholder="Расскажите о своем опыте, достижениях и подходе к работе..."
              />
            </div>
          </div>
        </div>

        {/* Профессиональная информация */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdWork size={24} />
            Профессиональная информация
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Опыт работы (лет)</label>
              <input
                type="number"
                min="0"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Специализации (через запятую)</label>
              <input
                type="text"
                value={formData.specializations.join(', ')}
                onChange={(e) => handleArrayInput('specializations', e.target.value)}
                placeholder="Кухни, Шкафы-купе, Корпусная мебель"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Образование</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                placeholder="Учебное заведение, специальность"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Сертификаты (через запятую)</label>
              <input
                type="text"
                value={formData.certifications.join(', ')}
                onChange={(e) => handleArrayInput('certifications', e.target.value)}
                placeholder="Сертификат 1, Сертификат 2"
              />
            </div>
          </div>
        </div>

        {/* Условия работы */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdSettings size={24} />
            Условия работы
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>График работы</label>
              <input
                type="text"
                value={formData.work_schedule}
                onChange={(e) => setFormData({...formData, work_schedule: e.target.value})}
                placeholder="Пн-Пт 9:00-18:00"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Минимальная сумма заказа (₸)</label>
              <input
                type="number"
                min="0"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Макс. проектов одновременно</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_projects_simultaneously}
                onChange={(e) => setFormData({...formData, max_projects_simultaneously: parseInt(e.target.value) || 3})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Услуги (через запятую)</label>
              <input
                type="text"
                value={formData.services_offered.join(', ')}
                onChange={(e) => handleArrayInput('services_offered', e.target.value)}
                placeholder="Изготовление, Ремонт, Реставрация"
              />
            </div>
          </div>
        </div>

        {/* Материалы и оборудование */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdBusiness size={24} />
            Материалы и оборудование
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Материалы (через запятую)</label>
              <input
                type="text"
                value={formData.materials_work_with.join(', ')}
                onChange={(e) => handleArrayInput('materials_work_with', e.target.value)}
                placeholder="ЛДСП, МДФ, Массив, Шпон"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Оборудование</label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                placeholder="ЧПУ станок, Кромкооблицовочный станок"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Размер мастерской</label>
              <input
                type="text"
                value={formData.workspace_size}
                onChange={(e) => setFormData({...formData, workspace_size: e.target.value})}
                placeholder="50 кв.м"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.has_showroom}
                  onChange={(e) => setFormData({...formData, has_showroom: e.target.checked})}
                />
                Есть шоурум
              </label>
            </div>
            {formData.has_showroom && (
              <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                <label>Адрес шоурума</label>
                <input
                  type="text"
                  value={formData.showroom_address}
                  onChange={(e) => setFormData({...formData, showroom_address: e.target.value})}
                  placeholder="Город, улица, дом"
                />
              </div>
            )}
          </div>
        </div>

        {/* Финансовые условия */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdAttachMoney size={24} />
            Финансовые условия
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Способы оплаты (через запятую)</label>
              <input
                type="text"
                value={formData.payment_methods.join(', ')}
                onChange={(e) => handleArrayInput('payment_methods', e.target.value)}
                placeholder="Наличные, Kaspi, Банковский перевод"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Условия гарантии</label>
              <input
                type="text"
                value={formData.warranty_terms}
                onChange={(e) => setFormData({...formData, warranty_terms: e.target.value})}
                placeholder="12 месяцев на изделие"
              />
            </div>
            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
              <label>Политика возврата</label>
              <textarea
                value={formData.return_policy}
                onChange={(e) => setFormData({...formData, return_policy: e.target.value})}
                rows={3}
                placeholder="Условия возврата и обмена..."
              />
            </div>
          </div>
        </div>

        {/* Социальные сети */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdLanguage size={24} />
            Контакты и соцсети
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>Веб-сайт</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder="https://mysite.com"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                placeholder="@username"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Facebook</label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                placeholder="facebook.com/page"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Telegram</label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                placeholder="@username"
              />
            </div>
            <div className={styles.formGroup}>
              <label>WhatsApp</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                placeholder="+7 777 123 45 67"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Языки (через запятую)</label>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={(e) => handleArrayInput('languages', e.target.value)}
                placeholder="Русский, Казахский, Английский"
              />
            </div>
          </div>
        </div>

        {/* Дополнительные услуги */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdVerifiedUser size={24} />
            Дополнительные услуги
          </h2>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.delivery_available}
                onChange={(e) => setFormData({...formData, delivery_available: e.target.checked})}
              />
              Доставка доступна
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.assembly_available}
                onChange={(e) => setFormData({...formData, assembly_available: e.target.checked})}
              />
              Сборка доступна
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.design_services}
                onChange={(e) => setFormData({...formData, design_services: e.target.checked})}
              />
              Услуги дизайна
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.consultation_free}
                onChange={(e) => setFormData({...formData, consultation_free: e.target.checked})}
              />
              Бесплатная консультация
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            <MdSave size={20} />
            {saving ? 'Сохранение...' : 'Сохранить профиль'}
          </button>
        </div>
      </form>

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

export default MasterProfile;
