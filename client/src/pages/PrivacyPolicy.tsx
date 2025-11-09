import { useTranslation } from 'react-i18next';
import styles from './PrivacyPolicy.module.css';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.privacyPage}>
        <div className={styles.container}>
          <h1 className={styles.title}>{t('privacy.title')}</h1>
          <p className={styles.lastUpdated}>{t('privacy.lastUpdated')}: 9 ноября 2025 г.</p>

          <div className={styles.content}>
            {/* Введение */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.intro.title')}</h2>
              <p className={styles.text}>{t('privacy.intro.text1')}</p>
              <p className={styles.text}>{t('privacy.intro.text2')}</p>
            </section>

            {/* Определения */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.definitions.title')}</h2>
              <ul className={styles.list}>
                <li><strong>{t('privacy.definitions.platform')}:</strong> {t('privacy.definitions.platformDesc')}</li>
                <li><strong>{t('privacy.definitions.user')}:</strong> {t('privacy.definitions.userDesc')}</li>
                <li><strong>{t('privacy.definitions.client')}:</strong> {t('privacy.definitions.clientDesc')}</li>
                <li><strong>{t('privacy.definitions.master')}:</strong> {t('privacy.definitions.masterDesc')}</li>
                <li><strong>{t('privacy.definitions.personalData')}:</strong> {t('privacy.definitions.personalDataDesc')}</li>
              </ul>
            </section>

            {/* Роль платформы */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.platformRole.title')}</h2>
              <p className={styles.text}>{t('privacy.platformRole.text1')}</p>
              <div className={styles.highlight}>
                <p className={styles.text}><strong>{t('privacy.platformRole.important')}</strong></p>
                <ul className={styles.list}>
                  <li>{t('privacy.platformRole.point1')}</li>
                  <li>{t('privacy.platformRole.point2')}</li>
                  <li>{t('privacy.platformRole.point3')}</li>
                  <li>{t('privacy.platformRole.point4')}</li>
                </ul>
              </div>
            </section>

            {/* Сбор данных */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.dataCollection.title')}</h2>
              <p className={styles.text}>{t('privacy.dataCollection.text1')}</p>
              
              <h3 className={styles.subsectionTitle}>{t('privacy.dataCollection.registrationTitle')}</h3>
              <ul className={styles.list}>
                <li>{t('privacy.dataCollection.registration1')}</li>
                <li>{t('privacy.dataCollection.registration2')}</li>
                <li>{t('privacy.dataCollection.registration3')}</li>
              </ul>

              <h3 className={styles.subsectionTitle}>{t('privacy.dataCollection.usageTitle')}</h3>
              <ul className={styles.list}>
                <li>{t('privacy.dataCollection.usage1')}</li>
                <li>{t('privacy.dataCollection.usage2')}</li>
                <li>{t('privacy.dataCollection.usage3')}</li>
              </ul>
            </section>

            {/* Использование данных */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.dataUsage.title')}</h2>
              <ul className={styles.list}>
                <li>{t('privacy.dataUsage.purpose1')}</li>
                <li>{t('privacy.dataUsage.purpose2')}</li>
                <li>{t('privacy.dataUsage.purpose3')}</li>
                <li>{t('privacy.dataUsage.purpose4')}</li>
                <li>{t('privacy.dataUsage.purpose5')}</li>
              </ul>
            </section>

            {/* Передача данных */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.dataSharing.title')}</h2>
              <p className={styles.text}>{t('privacy.dataSharing.text1')}</p>
              <ul className={styles.list}>
                <li>{t('privacy.dataSharing.case1')}</li>
                <li>{t('privacy.dataSharing.case2')}</li>
                <li>{t('privacy.dataSharing.case3')}</li>
              </ul>
            </section>

            {/* Ответственность */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.liability.title')}</h2>
              <div className={styles.highlight}>
                <p className={styles.text}>{t('privacy.liability.text1')}</p>
                <p className={styles.text}>{t('privacy.liability.text2')}</p>
                <p className={styles.text}>{t('privacy.liability.text3')}</p>
              </div>
            </section>

            {/* Права пользователей */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.userRights.title')}</h2>
              <p className={styles.text}>{t('privacy.userRights.text1')}</p>
              <ul className={styles.list}>
                <li>{t('privacy.userRights.right1')}</li>
                <li>{t('privacy.userRights.right2')}</li>
                <li>{t('privacy.userRights.right3')}</li>
                <li>{t('privacy.userRights.right4')}</li>
                <li>{t('privacy.userRights.right5')}</li>
              </ul>
            </section>

            {/* Безопасность */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.security.title')}</h2>
              <p className={styles.text}>{t('privacy.security.text1')}</p>
              <p className={styles.text}>{t('privacy.security.text2')}</p>
            </section>

            {/* Cookies */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.cookies.title')}</h2>
              <p className={styles.text}>{t('privacy.cookies.text1')}</p>
            </section>

            {/* Изменения */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.changes.title')}</h2>
              <p className={styles.text}>{t('privacy.changes.text1')}</p>
            </section>

            {/* Контакты */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.contact.title')}</h2>
              <p className={styles.text}>{t('privacy.contact.text1')}</p>
              <div className={styles.contactInfo}>
                <p><strong>Email:</strong> privacy@alliance.kz</p>
                <p><strong>{t('privacy.contact.phone')}:</strong> +7 (777) 123-45-67</p>
                <p><strong>{t('privacy.contact.address')}:</strong> г. Алматы, ул. Абая 123, офис 456</p>
              </div>
            </section>

            {/* Законодательство */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('privacy.law.title')}</h2>
              <p className={styles.text}>{t('privacy.law.text1')}</p>
              <ul className={styles.list}>
                <li>{t('privacy.law.law1')}</li>
                <li>{t('privacy.law.law2')}</li>
                <li>{t('privacy.law.law3')}</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
