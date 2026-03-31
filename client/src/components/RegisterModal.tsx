import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaHammer, FaClipboardList } from 'react-icons/fa';
import ReCAPTCHA from 'react-google-recaptcha';
import { API_BASE_URL } from '../config/api';
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
  const [becomeMaster, setBecomeMaster] = useState(false);
  
  // Дополнительные поля для мастера
  const [lastName, setLastName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [iin, setIin] = useState('');
  const [agreedToContract, setAgreedToContract] = useState(false);
  const [iinError, setIinError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Проверка авторизации пользователя
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!isOpen) return null;

  // Функция проверки подлинности ИИН
  const validateIIN = (iin: string): boolean => {
    if (iin.length !== 12) return false;

    // Проверка даты рождения в ИИН
    const year = parseInt(iin.substring(0, 2));
    const month = parseInt(iin.substring(2, 4));
    const day = parseInt(iin.substring(4, 6));
    
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }

    // Проверка контрольной суммы
    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const weights2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(iin[i]) * weights1[i];
    }
    
    let checkDigit = sum % 11;
    
    if (checkDigit === 10) {
      sum = 0;
      for (let i = 0; i < 11; i++) {
        sum += parseInt(iin[i]) * weights2[i];
      }
      checkDigit = sum % 11;
    }
    
    return checkDigit === parseInt(iin[11]);
  };

  const handleIinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 12) {
      setIin(numericValue);
      
      if (numericValue.length === 12) {
        if (!validateIIN(numericValue)) {
          setIinError(t('auth.iinInvalid'));
        } else {
          setIinError('');
        }
      } else if (numericValue.length > 0) {
        setIinError(t('auth.iinLength'));
      } else {
        setIinError('');
      }
    }
  };

  // Функция проверки надежности пароля
  const validatePassword = (password: string) => {
    let strength = 0;
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push(t('auth.passwordMinLength'));
    } else {
      strength += 20;
    }

    if (!/[a-z]/.test(password)) {
      errors.push(t('auth.passwordLowercase'));
    } else {
      strength += 20;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push(t('auth.passwordUppercase'));
    } else {
      strength += 20;
    }

    if (!/[0-9]/.test(password)) {
      errors.push(t('auth.passwordNumber'));
    } else {
      strength += 20;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push(t('auth.passwordSpecial'));
    } else {
      strength += 20;
    }

    setPasswordStrength(strength);

    if (errors.length > 0) {
      setPasswordError(`${t('auth.passwordRequirements')} ${errors.join(', ')}`);
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0) {
      validatePassword(value);
    } else {
      setPasswordError('');
      setPasswordStrength(0);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#e53e3e';
    if (passwordStrength < 60) return '#ed8936';
    if (passwordStrength < 80) return '#ecc94b';
    return '#38a169';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return t('auth.passwordWeak');
    if (passwordStrength < 60) return t('auth.passwordMedium');
    if (passwordStrength < 80) return t('auth.passwordGood');
    return t('auth.passwordExcellent');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка CAPTCHA
    if (!captchaToken) {
      alert(t('auth.captchaRequired'));
      return;
    }
    
    // Дополнительная проверка ИИН при отправке формы
    if (becomeMaster && !validateIIN(iin)) {
      alert(t('auth.iinRequired'));
      return;
    }
    
    try {
      const requestBody: {
        name: string;
        email: string;
        password: string;
        role: string;
        captchaToken: string;
        lastName?: string;
        birthDate?: string;
        iin?: string;
      } = {
        name,
        email,
        password,
        role: becomeMaster ? 'master' : 'customer',
        captchaToken
      };

      // Если регистрация как мастер, добавляем дополнительные данные
      if (becomeMaster) {
        requestBody.lastName = lastName;
        requestBody.birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
        requestBody.iin = iin;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        onClose();
        onSwitchToLogin();
      } else {
        console.error('Registration error:', data.message);
        alert(data.message || t('auth.registerError'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(t('auth.registerError'));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <h2 className={styles.modalTitle}>{t('auth.register')}</h2>
        
        {/* Проверка авторизации */}
        {token && userRole === 'client' && (
          <div style={{ 
            padding: '16px', 
            marginBottom: '20px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '8px',
            color: '#856404'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {t('auth.clientLoggedInWarning') || 'Вы авторизованы как клиент. Чтобы стать мастером, сначала выйдите из своего аккаунта.'}
            </p>
            <button 
              type="button"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                window.location.href = '/';
              }}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#ffc107',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {t('auth.logout') || 'Выйти из аккаунта'}
            </button>
          </div>
        )}

        {token && userRole === 'master' && (
          <div style={{ 
            padding: '16px', 
            marginBottom: '20px', 
            backgroundColor: '#d1ecf1', 
            border: '1px solid #0dcaf0', 
            borderRadius: '8px',
            color: '#055160'
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
              {t('auth.alreadyMaster') || 'Вы уже являетесь мастером! Вы можете управлять своим профилем в личном кабинете.'}
            </p>
            <button 
              type="button"
              onClick={() => {
                onClose();
                window.location.href = '/master';
              }}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#0dcaf0',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {t('auth.goToDashboard') || 'Перейти в кабинет'}
            </button>
          </div>
        )}
        
        {/* Форма регистрации - скрыта если пользователь уже мастер */}
        {(!token || userRole !== 'master') && (
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
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={styles.input}
              required
              minLength={8}
              style={passwordError && password.length > 0 ? { borderColor: '#ed8936' } : {}}
            />
            {password.length > 0 && (
              <>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ 
                    height: '4px', 
                    background: '#e2e8f0', 
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${passwordStrength}%`, 
                      height: '100%', 
                      background: getStrengthColor(),
                      transition: 'all 0.3s ease'
                    }} />
                  </div>
                  <small style={{ 
                    color: getStrengthColor(), 
                    fontSize: '0.85rem', 
                    marginTop: '4px', 
                    display: 'block',
                    fontWeight: '600'
                  }}>
                    {t('auth.passwordStrength')} {getStrengthText()}
                  </small>
                </div>
                {passwordError && (
                  <small style={{ color: '#ed8936', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    {passwordError}
                  </small>
                )}
              </>
            )}
          </div>

          {/* Переключатель "Стать исполнителем" */}
          <div className={styles.checkboxGroup} style={{ marginBottom: '20px', padding: '15px', background: '#f7fafc', borderRadius: '8px', border: '2px solid #e2e8f0' }}>
            <input
              type="checkbox"
              id="become-master"
              checked={becomeMaster}
              onChange={(e) => setBecomeMaster(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="become-master" className={styles.checkboxLabel} style={{ fontWeight: '600', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaHammer /> {t('auth.becomeMaster')}
            </label>
          </div>

          {/* Дополнительные поля для мастера */}
          {becomeMaster && (
            <div style={{ padding: '20px', background: '#edf2f7', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaClipboardList /> {t('auth.masterInfo')}
              </h3>

              <div className={styles.formGroup}>
                <label htmlFor="lastName" className={styles.label}>
                  {t('auth.lastName')} *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={styles.input}
                  required={becomeMaster}
                  placeholder={t('auth.lastNamePlaceholder')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>{t('auth.birthDate')} *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className={styles.input}
                    placeholder={t('auth.yearPlaceholder')}
                    required={becomeMaster}
                    min="1950"
                    max={new Date().getFullYear() - 18}
                  />
                  <input
                    type="number"
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className={styles.input}
                    placeholder={t('auth.monthPlaceholder')}
                    required={becomeMaster}
                    min="1"
                    max="12"
                  />
                  <input
                    type="number"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className={styles.input}
                    placeholder={t('auth.dayPlaceholder')}
                    required={becomeMaster}
                    min="1"
                    max="31"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="iin" className={styles.label}>
                  {t('auth.iin')} *
                </label>
                <input
                  type="text"
                  id="iin"
                  value={iin}
                  onChange={(e) => handleIinChange(e.target.value)}
                  className={styles.input}
                  required={becomeMaster}
                  placeholder={t('auth.iinPlaceholder')}
                  maxLength={12}
                  style={iinError ? { borderColor: '#e53e3e' } : {}}
                />
                {iinError && (
                  <small style={{ color: '#e53e3e', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    {iinError}
                  </small>
                )}
                {iin.length === 12 && !iinError && (
                  <small style={{ color: '#38a169', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    {t('auth.iinValid')}
                  </small>
                )}
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="master-contract"
                  checked={agreedToContract}
                  onChange={(e) => setAgreedToContract(e.target.checked)}
                  className={styles.checkbox}
                  required={becomeMaster}
                />
                <label htmlFor="master-contract" className={styles.checkboxLabel}>
                  {t('auth.masterContract')}{' '}
                  <a 
                    href="/master-contract" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {t('auth.masterContractLink')}
                  </a>
                </label>
              </div>
            </div>
          )}

          {/* Google reCAPTCHA */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
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

          <button 
            type="submit" 
            className={styles.submitButton} 
            disabled={
              !agreedToPolicy || 
              !captchaToken ||
              passwordStrength < 100 || 
              (becomeMaster && (!agreedToContract || iin.length !== 12 || !!iinError))
            }
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {becomeMaster ? (
              <>
                <FaHammer /> {t('auth.registerAsMaster')}
              </>
            ) : (
              t('auth.registerSubmit')
            )}
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
        )}
      </div>
    </div>
  );
};

export default RegisterModal;
