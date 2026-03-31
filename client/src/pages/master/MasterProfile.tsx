import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdPerson, MdSave, MdBusiness, MdWork, MdLanguage, MdSettings, MdAttachMoney, MdVerifiedUser, MdCameraAlt, MdDelete } from 'react-icons/md';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
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
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      const response = await axios.get(`${API_BASE_URL}/api/master-profile`, {
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
      showToast(t('masterProfile.notifications.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/api/master-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showToast(t('masterProfile.notifications.updateSuccess'), 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(t('masterProfile.notifications.updateError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayInput = (field: keyof MasterProfileData, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      showToast(t('masterProfile.notifications.imageNotSelected'), 'error');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(t('masterProfile.notifications.imageTooLarge'), 'error');
      return;
    }

    try {
      setUploading(true);
      
      // Преобразуем файл в Base64 и отображаем локально
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_photo: reader.result as string }));
        showToast(t('masterProfile.notifications.imageSelected'), 'success');
        setUploading(false);
      };
      reader.readAsDataURL(file);
      
      // Примечание: Для настоящей загрузки используйте сервис типа Cloudinary, ImgBB или загрузку на свой сервер
      // Пример с сервисом ImgBB (требуется API ключ):
      // const formDataImg = new FormData();
      // formDataImg.append('image', file);
      // const imgResponse = await axios.post(
      //   'https://api.imgbb.com/1/upload?key=YOUR_API_KEY',
      //   formDataImg
      // );
      // setFormData(prev => ({ ...prev, profile_photo: imgResponse.data.data.url }));
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast(t('masterProfile.notifications.avatarUploadError'), 'error');
      setUploading(false);
    }
  };

  const handleDeleteAvatar = () => {
    setFormData(prev => ({ ...prev, profile_photo: '' }));
    showToast(t('masterProfile.notifications.avatarDeleted'), 'success');
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
          {t('masterProfile.title')}
        </h1>
        <p className={styles.pageSubtitle}>
          {t('masterProfile.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Основная информация */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdPerson size={24} />
            {t('masterProfile.sections.basicInfo')}
          </h2>
          
          {/* Аватар */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {formData.profile_photo ? (
                <img 
                  src={formData.profile_photo} 
                  alt="Аватар" 
                  className={styles.avatar}
                  onError={(e) => {
                    // Если изображение не загрузилось, показываем placeholder
                    (e.target as HTMLImageElement).style.display = 'none';
                    const placeholder = (e.target as HTMLImageElement).nextElementSibling;
                    if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                  }}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <MdPerson size={64} />
                </div>
              )}
              {uploading && (
                <div className={styles.avatarOverlay}>
                  <div className={styles.spinner} />
                </div>
              )}
            </div>
            <div className={styles.avatarActions}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                className={styles.uploadButton}
                disabled={uploading}
              >
                <MdCameraAlt size={20} />
                {formData.profile_photo ? t('masterProfile.avatar.change') : t('masterProfile.avatar.select')}
              </button>
              {formData.profile_photo && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className={styles.deleteButton}
                  disabled={uploading}
                >
                  <MdDelete size={20} />
                  {t('masterProfile.avatar.delete')}
                </button>
              )}
              <p className={styles.avatarHint}>
                {t('masterProfile.avatar.hint')}
              </p>
            </div>
          </div>

          {/* Поле для ввода URL изображения */}
          <div className={styles.formGroup} style={{gridColumn: '1 / -1', marginTop: '-12px'}}>
            <label>{t('masterProfile.avatar.urlLabel')}</label>
            <input
              type="url"
              value={formData.profile_photo}
              onChange={(e) => setFormData({...formData, profile_photo: e.target.value})}
              placeholder={t('masterProfile.avatar.urlPlaceholder')}
            />
          </div>

          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.name')} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.companyName')}</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                placeholder={t('masterProfile.fields.companyPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.phone')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder={t('masterProfile.fields.phonePlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder={t('masterProfile.fields.addressPlaceholder')}
              />
            </div>
            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
              <label>{t('masterProfile.fields.bio')}</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                placeholder={t('masterProfile.fields.bioPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Профессиональная информация */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdWork size={24} />
            {t('masterProfile.sections.professionalInfo')}
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.experience')}</label>
              <input
                type="number"
                min="0"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({...formData, years_of_experience: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.specializations')}</label>
              <input
                type="text"
                value={formData.specializations.join(', ')}
                onChange={(e) => handleArrayInput('specializations', e.target.value)}
                placeholder={t('masterProfile.fields.specializationsPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.education')}</label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                placeholder={t('masterProfile.fields.educationPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.certifications')}</label>
              <input
                type="text"
                value={formData.certifications.join(', ')}
                onChange={(e) => handleArrayInput('certifications', e.target.value)}
                placeholder={t('masterProfile.fields.certificationsPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Условия работы */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdSettings size={24} />
            {t('masterProfile.sections.workConditions')}
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.workSchedule')}</label>
              <input
                type="text"
                value={formData.work_schedule}
                onChange={(e) => setFormData({...formData, work_schedule: e.target.value})}
                placeholder={t('masterProfile.fields.workSchedulePlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.minOrderAmount')}</label>
              <input
                type="number"
                min="0"
                value={formData.min_order_amount}
                onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.maxProjects')}</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_projects_simultaneously}
                onChange={(e) => setFormData({...formData, max_projects_simultaneously: parseInt(e.target.value) || 3})}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.services')}</label>
              <input
                type="text"
                value={formData.services_offered.join(', ')}
                onChange={(e) => handleArrayInput('services_offered', e.target.value)}
                placeholder={t('masterProfile.fields.servicesPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Материалы и оборудование */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdBusiness size={24} />
            {t('masterProfile.sections.materialsEquipment')}
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.materials')}</label>
              <input
                type="text"
                value={formData.materials_work_with.join(', ')}
                onChange={(e) => handleArrayInput('materials_work_with', e.target.value)}
                placeholder={t('masterProfile.fields.materialsPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.equipment')}</label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                placeholder={t('masterProfile.fields.equipmentPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.workspaceSize')}</label>
              <input
                type="text"
                value={formData.workspace_size}
                onChange={(e) => setFormData({...formData, workspace_size: e.target.value})}
                placeholder={t('masterProfile.fields.workspaceSizePlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.has_showroom}
                  onChange={(e) => setFormData({...formData, has_showroom: e.target.checked})}
                />
                {t('masterProfile.fields.hasShowroom')}
              </label>
            </div>
            {formData.has_showroom && (
              <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
                <label>{t('masterProfile.fields.showroomAddress')}</label>
                <input
                  type="text"
                  value={formData.showroom_address}
                  onChange={(e) => setFormData({...formData, showroom_address: e.target.value})}
                  placeholder={t('masterProfile.fields.showroomPlaceholder')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Финансовые условия */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdAttachMoney size={24} />
            {t('masterProfile.sections.financialTerms')}
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.paymentMethods')}</label>
              <input
                type="text"
                value={formData.payment_methods.join(', ')}
                onChange={(e) => handleArrayInput('payment_methods', e.target.value)}
                placeholder={t('masterProfile.fields.paymentPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.warrantyTerms')}</label>
              <input
                type="text"
                value={formData.warranty_terms}
                onChange={(e) => setFormData({...formData, warranty_terms: e.target.value})}
                placeholder={t('masterProfile.fields.warrantyPlaceholder')}
              />
            </div>
            <div className={styles.formGroup} style={{gridColumn: '1 / -1'}}>
              <label>{t('masterProfile.fields.returnPolicy')}</label>
              <textarea
                value={formData.return_policy}
                onChange={(e) => setFormData({...formData, return_policy: e.target.value})}
                rows={3}
                placeholder={t('masterProfile.fields.returnPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Социальные сети */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdLanguage size={24} />
            {t('masterProfile.sections.contactsSocial')}
          </h2>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.website')}</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                placeholder={t('masterProfile.fields.websitePlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.instagram')}</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                placeholder={t('masterProfile.fields.instagramPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.facebook')}</label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                placeholder={t('masterProfile.fields.facebookPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.telegram')}</label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                placeholder={t('masterProfile.fields.telegramPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.whatsapp')}</label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                placeholder={t('masterProfile.fields.whatsappPlaceholder')}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('masterProfile.fields.languages')}</label>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={(e) => handleArrayInput('languages', e.target.value)}
                placeholder={t('masterProfile.fields.languagesPlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Дополнительные услуги */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <MdVerifiedUser size={24} />
            {t('masterProfile.sections.additionalServices')}
          </h2>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.delivery_available}
                onChange={(e) => setFormData({...formData, delivery_available: e.target.checked})}
              />
              {t('masterProfile.fields.deliveryAvailable')}
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.assembly_available}
                onChange={(e) => setFormData({...formData, assembly_available: e.target.checked})}
              />
              {t('masterProfile.fields.assemblyAvailable')}
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.design_services}
                onChange={(e) => setFormData({...formData, design_services: e.target.checked})}
              />
              {t('masterProfile.fields.designServices')}
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.consultation_free}
                onChange={(e) => setFormData({...formData, consultation_free: e.target.checked})}
              />
              {t('masterProfile.fields.consultationFree')}
            </label>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            <MdSave size={20} />
            {saving ? t('masterProfile.actions.saving') : t('masterProfile.actions.save')}
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
