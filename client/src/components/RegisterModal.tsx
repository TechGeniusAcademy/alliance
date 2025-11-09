import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AuthModal.module.css';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        onClose();
        onSwitchToLogin();
      } else {
        console.error('Registration error:', data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <h2 className={styles.modalTitle}>{t('auth.register')}</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              {t('auth.name')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
            />
          </div>

          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="privacy-policy"
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              className={styles.checkbox}
              required
            />
            <label htmlFor="privacy-policy" className={styles.checkboxLabel}>
              {t('auth.agreeToPolicy')}{' '}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.link}
              >
                {t('auth.privacyPolicy')}
              </a>
            </label>
          </div>

          <button type="submit" className={styles.submitButton} disabled={!agreedToPolicy}>
            {t('auth.registerSubmit')}
          </button>

          <div className={styles.footer}>
            <span>{t('auth.haveAccount')} </span>
            <a href="#" className={styles.link} onClick={(e) => {
              e.preventDefault();
              onSwitchToLogin();
            }}>
              {t('auth.loginLink')}
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
