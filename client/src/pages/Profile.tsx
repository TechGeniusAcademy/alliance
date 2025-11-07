import { useState, useEffect } from 'react';
import { MdPerson, MdEmail, MdPhone, MdLocationOn, MdLock, MdSave, MdCameraAlt } from 'react-icons/md';
import styles from './Profile.module.css';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profile_photo: string | null;
}

interface ToastMessage {
  message: string;
  type: ToastType;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Поля профиля
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  
  // Модальное окно смены пароля
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Toast уведомления
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setName(data.user.name);
        setPhone(data.user.phone || '');
        setAddress(data.user.address || '');
        setProfilePhoto(data.user.profile_photo || '');
      } else {
        showToast('Ошибка загрузки профиля', 'error');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Ошибка подключения к серверу', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Файл слишком большой. Максимальный размер: 5MB', 'error');
      return;
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      showToast('Пожалуйста, выберите изображение', 'error');
      return;
    }

    // Конвертация в base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setProfilePhoto(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          phone,
          address,
          profile_photo: profilePhoto,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        showToast('Профиль успешно обновлен!', 'success');
      } else {
        showToast(data.message || 'Ошибка обновления профиля', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Ошибка подключения к серверу', 'error');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Профиль пользователя</h1>

      <div className={styles.content}>
        {/* Левая колонка - фото профиля */}
        <div className={styles.photoSection}>
          <div className={styles.photoWrapper}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className={styles.photo} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <MdPerson size={80} />
              </div>
            )}
            <label htmlFor="photoUpload" className={styles.photoButton}>
              <MdCameraAlt size={20} />
            </label>
            <input
              id="photoUpload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
          <p className={styles.photoHint}>Загрузите фото или используйте URL</p>
          <input
            type="text"
            value={profilePhoto}
            onChange={(e) => setProfilePhoto(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className={styles.photoInput}
          />
        </div>

        {/* Правая колонка - форма */}
        <div className={styles.formSection}>
          <form onSubmit={handleSaveProfile} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MdPerson className={styles.labelIcon} />
                ФИО
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MdEmail className={styles.labelIcon} />
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                className={styles.input}
                disabled
              />
              <span className={styles.hint}>Email нельзя изменить</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MdPhone className={styles.labelIcon} />
                Телефон
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <MdLocationOn className={styles.labelIcon} />
                Адрес
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Введите ваш адрес"
                className={styles.textarea}
                rows={3}
              />
            </div>

            <button type="submit" className={styles.saveButton} disabled={saving}>
              <MdSave size={20} />
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>

          {/* Секция смены пароля */}
          <div className={styles.passwordSection}>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className={styles.passwordToggle}
            >
              <MdLock size={20} />
              Изменить пароль
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно смены пароля */}
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Toast уведомление */}
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

export default Profile;
