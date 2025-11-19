import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdSettings, 
  MdSave, 
  MdNotifications as MdNotificationsIcon,
  MdLock,
  MdLanguage,
  MdPalette,
  MdWork,
  MdAttachMoney
} from 'react-icons/md';
import Toast from '../../components/Toast';
import type { ToastType } from '../../components/Toast';
import styles from './MasterSettings.module.css';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface MasterSettingsData {
  // Уведомления
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    newAuctions: boolean;
    bidAccepted: boolean;
    orderUpdates: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
  };
  
  // Приватность
  privacy: {
    showProfile: boolean;
    showPortfolio: boolean;
    showRating: boolean;
    showCompletedOrders: boolean;
    allowDirectMessages: boolean;
  };
  
  // Рабочие настройки
  work: {
    autoAcceptAuctions: boolean;
    maxActiveOrders: number;
    minOrderAmount: number;
    workingDays: string[];
    workingHoursStart: string;
    workingHoursEnd: string;
  };
  
  // Финансы
  finance: {
    currency: 'KZT' | 'USD' | 'RUB';
    taxRate: number;
    paymentMethods: string[];
  };
  
  // Язык и тема
  language: 'ru' | 'kk' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

const MasterSettings = () => {
  const { t, i18n } = useTranslation();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<MasterSettingsData>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      newAuctions: true,
      bidAccepted: true,
      orderUpdates: true,
      messages: true,
      reviews: true,
      payments: true,
    },
    privacy: {
      showProfile: true,
      showPortfolio: true,
      showRating: true,
      showCompletedOrders: true,
      allowDirectMessages: true,
    },
    work: {
      autoAcceptAuctions: false,
      maxActiveOrders: 5,
      minOrderAmount: 10000,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
    },
    finance: {
      currency: 'KZT',
      taxRate: 12,
      paymentMethods: ['cash', 'card', 'transfer'],
    },
    language: (localStorage.getItem('language') as 'ru' | 'kk' | 'en') || 'ru',
    theme: 'light',
  });

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      console.log('=== ЗАГРУЗКА НАСТРОЕК ===');
      
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'существует' : 'отсутствует');
      
      const url = 'http://localhost:5000/api/settings/master';
      console.log('Отправка GET запроса на:', url);
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Ответ сервера - статус:', response.status);
      
      if (!response.ok) throw new Error('Failed to load settings');
      
      const data = await response.json();
      console.log('Полученные настройки с сервера:', JSON.stringify(data, null, 2));
      
      // Объединяем загруженные данные с текущим состоянием
      const mergedSettings = {
        ...settings,
        ...data,
        notifications: { ...settings.notifications, ...data.notifications },
        privacy: { ...settings.privacy, ...data.privacy },
        work: { ...settings.work, ...data.work },
        finance: { ...settings.finance, ...data.finance }
      };
      
      console.log('Объединенные настройки:', JSON.stringify(mergedSettings, null, 2));
      setSettings(mergedSettings);
      
      // Синхронизируем язык
      if (data.language && data.language !== i18n.language) {
        i18n.changeLanguage(data.language);
      }
      
      console.log('=== НАСТРОЙКИ ЗАГРУЖЕНЫ ===');
    } catch (error) {
      console.error('!!! ОШИБКА ПРИ ЗАГРУЗКЕ:', error);
      showToast('Ошибка загрузки настроек', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      alert('Функция handleSave вызвана!');
      console.log('=== СОХРАНЕНИЕ НАСТРОЕК ===');
      console.log('Настройки для сохранения:', JSON.stringify(settings, null, 2));
      
      // Синхронизируем язык
      if (settings.language) {
        await i18n.changeLanguage(settings.language);
        localStorage.setItem('language', settings.language);
      }
      
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'существует' : 'отсутствует');
      
      const url = 'http://localhost:5000/api/settings/master';
      console.log('Отправка PUT запроса на:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      console.log('Ответ сервера - статус:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка сервера:', errorData);
        throw new Error('Failed to save settings');
      }
      
      const result = await response.json();
      console.log('Результат сохранения:', result);
      console.log('=== НАСТРОЙКИ УСПЕШНО СОХРАНЕНЫ ===');
      
      showToast('Настройки успешно сохранены', 'success');
    } catch (error) {
      console.error('!!! ОШИБКА ПРИ СОХРАНЕНИИ:', error);
      showToast('Ошибка сохранения настроек', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (newLanguage: 'ru' | 'kk' | 'en') => {
    await i18n.changeLanguage(newLanguage);
    setSettings({ ...settings, language: newLanguage });
  };

  const updateNotificationSettings = (key: keyof MasterSettingsData['notifications'], value: boolean) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const updatePrivacySettings = (key: keyof MasterSettingsData['privacy'], value: boolean) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  };

  const updateWorkSettings = (
    key: keyof MasterSettingsData['work'], 
    value: boolean | number | string[] | string
  ) => {
    setSettings({
      ...settings,
      work: {
        ...settings.work,
        [key]: value
      }
    });
  };

  const toggleWorkingDay = (day: string) => {
    const days = settings.work.workingDays;
    if (days.includes(day)) {
      updateWorkSettings('workingDays', days.filter(d => d !== day));
    } else {
      updateWorkSettings('workingDays', [...days, day]);
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  const weekDays = [
    { id: 'monday', label: 'Пн' },
    { id: 'tuesday', label: 'Вт' },
    { id: 'wednesday', label: 'Ср' },
    { id: 'thursday', label: 'Чт' },
    { id: 'friday', label: 'Пт' },
    { id: 'saturday', label: 'Сб' },
    { id: 'sunday', label: 'Вс' },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdSettings className={styles.titleIcon} />
          {t('settings.title')}
        </h1>
        <div className={styles.headerButtons}>
          <button 
            className={styles.resetButton}
            onClick={async () => {
              if (window.confirm('Сбросить все настройки к значениям по умолчанию?')) {
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch('http://localhost:5000/api/settings/master/reset', {
                    method: 'POST',
                    headers: { 
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  if (!response.ok) throw new Error('Failed to reset');
                  const data = await response.json();
                  setSettings(data.settings);
                  showToast('Настройки сброшены', 'success');
                } catch (error) {
                  showToast('Ошибка сброса настроек', 'error');
                }
              }
            }}
          >
            Сбросить
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving}
          >
            <MdSave size={20} />
            {saving ? t('settings.saving') : t('settings.saveButton')}
          </button>
        </div>
      </div>

      <div className={styles.settingsContent}>
        {/* Рабочие настройки */}
        <div className={styles.settingsSection}>
          <h2>
            <MdWork style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Рабочие настройки
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <strong>Автопринятие аукционов</strong>
                <p>Автоматически принимать участие в новых аукционах</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.work.autoAcceptAuctions}
                  onChange={(e) => updateWorkSettings('autoAcceptAuctions', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Максимум активных заказов</strong>
                <p>Максимальное количество заказов в работе одновременно</p>
              </div>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.work.maxActiveOrders}
                onChange={(e) => updateWorkSettings('maxActiveOrders', parseInt(e.target.value))}
                className={styles.numberInput}
              />
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Минимальная сумма заказа</strong>
                <p>Не показывать заказы дешевле указанной суммы</p>
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                value={settings.work.minOrderAmount}
                onChange={(e) => updateWorkSettings('minOrderAmount', parseInt(e.target.value))}
                className={styles.numberInput}
              />
            </div>

            <div className={styles.settingItemFull}>
              <strong>Рабочие дни</strong>
              <div className={styles.weekDays}>
                {weekDays.map(day => (
                  <button
                    key={day.id}
                    className={`${styles.dayButton} ${settings.work.workingDays.includes(day.id) ? styles.dayActive : ''}`}
                    onClick={() => toggleWorkingDay(day.id)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.settingItemFull}>
              <strong>Рабочие часы</strong>
              <div className={styles.timeRange}>
                <div>
                  <label>С</label>
                  <input
                    type="time"
                    value={settings.work.workingHoursStart}
                    onChange={(e) => updateWorkSettings('workingHoursStart', e.target.value)}
                    className={styles.timeInput}
                  />
                </div>
                <span>—</span>
                <div>
                  <label>До</label>
                  <input
                    type="time"
                    value={settings.work.workingHoursEnd}
                    onChange={(e) => updateWorkSettings('workingHoursEnd', e.target.value)}
                    className={styles.timeInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Финансовые настройки */}
        <div className={styles.settingsSection}>
          <h2>
            <MdAttachMoney style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Финансовые настройки
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <strong>Валюта</strong>
                <p>Основная валюта для расчетов</p>
              </div>
              <select 
                value={settings.finance.currency} 
                onChange={(e) => setSettings({ ...settings, finance: { ...settings.finance, currency: e.target.value as 'KZT' | 'USD' | 'RUB' } })}
                className={styles.select}
              >
                <option value="KZT">₸ Тенге (KZT)</option>
                <option value="RUB">₸ Рубль (RUB)</option>
                <option value="USD">$ Доллар (USD)</option>
              </select>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Налоговая ставка (%)</strong>
                <p>Процент налога для расчета чистой прибыли</p>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={settings.finance.taxRate}
                onChange={(e) => setSettings({ ...settings, finance: { ...settings.finance, taxRate: parseFloat(e.target.value) } })}
                className={styles.numberInput}
              />
            </div>
          </div>
        </div>

        {/* Уведомления */}
        <div className={styles.settingsSection}>
          <h2>
            <MdNotificationsIcon style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {t('settings.notificationsTitle')}
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.emailNotifications')}</strong>
                <p>{t('settings.emailNotificationsDesc')}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => updateNotificationSettings('email', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.pushNotifications')}</strong>
                <p>{t('settings.pushNotificationsDesc')}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => updateNotificationSettings('push', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Новые аукционы</strong>
                <p>Уведомления о новых аукционах в вашей категории</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.newAuctions}
                  onChange={(e) => updateNotificationSettings('newAuctions', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Принятие ставки</strong>
                <p>Уведомления когда клиент принимает вашу ставку</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.bidAccepted}
                  onChange={(e) => updateNotificationSettings('bidAccepted', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.orderUpdates')}</strong>
                <p>Изменения статуса заказов</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.orderUpdates}
                  onChange={(e) => updateNotificationSettings('orderUpdates', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.messages')}</strong>
                <p>{t('settings.messagesDesc')}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.messages}
                  onChange={(e) => updateNotificationSettings('messages', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Новые отзывы</strong>
                <p>Уведомления о новых отзывах от клиентов</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.reviews}
                  onChange={(e) => updateNotificationSettings('reviews', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Платежи</strong>
                <p>Уведомления о поступлении платежей</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.payments}
                  onChange={(e) => updateNotificationSettings('payments', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Безопасность */}
        <div className={styles.settingsSection}>
          <h2>
            <MdLock style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            Безопасность
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItemFull}>
              <strong>Изменить пароль</strong>
              <div className={styles.passwordForm}>
                <input
                  type="password"
                  placeholder="Текущий пароль"
                  id="currentPassword"
                  className={styles.passwordInput}
                />
                <input
                  type="password"
                  placeholder="Новый пароль (минимум 6 символов)"
                  id="newPassword"
                  className={styles.passwordInput}
                />
                <input
                  type="password"
                  placeholder="Подтвердите новый пароль"
                  id="confirmPassword"
                  className={styles.passwordInput}
                />
                <button
                  className={styles.changePasswordButton}
                  onClick={async () => {
                    const current = (document.getElementById('currentPassword') as HTMLInputElement).value;
                    const newPass = (document.getElementById('newPassword') as HTMLInputElement).value;
                    const confirm = (document.getElementById('confirmPassword') as HTMLInputElement).value;

                    if (!current || !newPass || !confirm) {
                      showToast('Заполните все поля', 'error');
                      return;
                    }

                    if (newPass !== confirm) {
                      showToast('Пароли не совпадают', 'error');
                      return;
                    }

                    if (newPass.length < 6) {
                      showToast('Пароль должен быть не менее 6 символов', 'error');
                      return;
                    }

                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch('http://localhost:5000/api/settings/change-password', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                      });

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(data.error || 'Ошибка изменения пароля');
                      }

                      showToast('Пароль успешно изменён', 'success');
                      (document.getElementById('currentPassword') as HTMLInputElement).value = '';
                      (document.getElementById('newPassword') as HTMLInputElement).value = '';
                      (document.getElementById('confirmPassword') as HTMLInputElement).value = '';
                    } catch (error: any) {
                      showToast(error.message || 'Ошибка изменения пароля', 'error');
                    }
                  }}
                >
                  Изменить пароль
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Приватность */}
        <div className={styles.settingsSection}>
          <h2>
            <MdLock style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {t('settings.privacyTitle')}
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.showProfile')}</strong>
                <p>Ваш профиль будет виден клиентам</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.privacy.showProfile}
                  onChange={(e) => updatePrivacySettings('showProfile', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Показывать портфолио</strong>
                <p>Ваши работы будут видны в публичном профиле</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.privacy.showPortfolio}
                  onChange={(e) => updatePrivacySettings('showPortfolio', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Показывать рейтинг</strong>
                <p>Ваш рейтинг будет виден всем</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.privacy.showRating}
                  onChange={(e) => updatePrivacySettings('showRating', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Показывать выполненные заказы</strong>
                <p>Количество выполненных заказов в профиле</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.privacy.showCompletedOrders}
                  onChange={(e) => updatePrivacySettings('showCompletedOrders', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>Разрешить прямые сообщения</strong>
                <p>Клиенты смогут писать вам напрямую</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.privacy.allowDirectMessages}
                  onChange={(e) => updatePrivacySettings('allowDirectMessages', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Язык */}
        <div className={styles.settingsSection}>
          <h2>
            <MdLanguage style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {t('settings.languageTitle')}
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.languageInterface')}</strong>
                <p>{t('settings.languageInterfaceDesc')}</p>
              </div>
              <select 
                value={settings.language} 
                onChange={(e) => handleLanguageChange(e.target.value as 'ru' | 'kk' | 'en')}
                className={styles.select}
              >
                <option value="ru">{t('settings.russian')}</option>
                <option value="kk">{t('settings.kazakh')}</option>
                <option value="en">{t('settings.english')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Тема */}
        <div className={styles.settingsSection}>
          <h2>
            <MdPalette style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {t('settings.themeTitle')}
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.themeInterface')}</strong>
                <p>{t('settings.themeInterfaceDesc')}</p>
              </div>
              <select 
                value={settings.theme} 
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                className={styles.select}
              >
                <option value="light">{t('settings.light')}</option>
                <option value="dark">{t('settings.dark')}</option>
                <option value="auto">{t('settings.auto')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications Container */}
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

export default MasterSettings;
