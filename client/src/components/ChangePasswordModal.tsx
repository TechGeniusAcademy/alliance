import { useState } from 'react';
import { MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import styles from './ChangePasswordModal.module.css';
import type { ToastType } from './Toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, type: ToastType) => void;
}

const ChangePasswordModal = ({ isOpen, onClose, onShowToast }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      onShowToast?.('Пароли не совпадают', 'error');
      return;
    }

    if (newPassword.length < 6) {
      onShowToast?.('Пароль должен содержать минимум 6 символов', 'error');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onShowToast?.('Пароль успешно изменен!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        onShowToast?.(data.message || 'Ошибка смены пароля', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      onShowToast?.('Ошибка подключения к серверу', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.header}>
          <MdLock size={32} className={styles.headerIcon} />
          <h2 className={styles.title}>Изменить пароль</h2>
          <p className={styles.subtitle}>Введите текущий пароль и новый пароль</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Текущий пароль</label>
            <div className={styles.inputWrapper}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={styles.input}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Новый пароль</label>
            <div className={styles.inputWrapper}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
            <span className={styles.hint}>Минимум 6 символов</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Подтвердите новый пароль</label>
            <div className={styles.inputWrapper}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Изменение...' : 'Изменить пароль'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
