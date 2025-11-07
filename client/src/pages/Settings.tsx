import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdSettings, 
  MdSave, 
  MdNotifications as MdNotificationsIcon,
  MdLock,
  MdLanguage,
  MdPalette
} from 'react-icons/md';
import { appService } from '../services/appService';
import type { UserSettings } from '../types/app';
import styles from './Settings.module.css';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await appService.getSettings();
      // Синхронизируем язык из настроек с i18next
      if (data.language && data.language !== i18n.language) {
        i18n.changeLanguage(data.language);
      }
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      // Синхронизируем язык с i18next при сохранении
      if (settings.language) {
        await i18n.changeLanguage(settings.language);
        localStorage.setItem('language', settings.language);
      }
      await appService.updateSettings(settings);
      alert(t('settings.saved'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(t('settings.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (newLanguage: 'ru' | 'kk' | 'en') => {
    if (!settings) return;
    
    // Мгновенно меняем язык без сохранения
    await i18n.changeLanguage(newLanguage);
    setSettings({ ...settings, language: newLanguage });
  };

  const updateNotificationSettings = (key: keyof UserSettings['notifications'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const updatePrivacySettings = (key: keyof UserSettings['privacy'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  };

  if (loading || !settings) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <MdSettings className={styles.titleIcon} />
          {t('settings.title')}
        </h1>
        <button 
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          <MdSave size={20} />
          {saving ? t('settings.saving') : t('settings.saveButton')}
        </button>
      </div>

      <div className={styles.settingsContent}>
        {/* Notifications */}
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
                <strong>{t('settings.smsNotifications')}</strong>
                <p>{t('settings.smsNotificationsDesc')}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => updateNotificationSettings('sms', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.orderUpdates')}</strong>
                <p>{t('settings.orderUpdatesDesc')}</p>
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
                <strong>{t('settings.promotions')}</strong>
                <p>{t('settings.promotionsDesc')}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notifications.promotions}
                  onChange={(e) => updateNotificationSettings('promotions', e.target.checked)}
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
          </div>
        </div>

        {/* Privacy */}
        <div className={styles.settingsSection}>
          <h2>
            <MdLock style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            {t('settings.privacyTitle')}
          </h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.showProfile')}</strong>
                <p>{t('settings.showProfileDesc')}</p>
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
                <strong>{t('settings.showOrders')}</strong>
                <p>{t('settings.showOrdersDesc')}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.privacy.showOrders}
                  onChange={(e) => updatePrivacySettings('showOrders', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div>
                <strong>{t('settings.showReviews')}</strong>
                <p>{t('settings.showReviewsDesc')}</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.privacy.showReviews}
                  onChange={(e) => updatePrivacySettings('showReviews', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </div>

        {/* Language */}
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

        {/* Theme */}
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
    </div>
  );
};

export default Settings;
