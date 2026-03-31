import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import styles from './NotFound.module.css';

export const NotFoundPage = () => {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>{t('notFound.title')}</h2>
        <p className={styles.description}>{t('notFound.description')}</p>
        <div className={styles.actions}>
          <Button variant="primary" as={Link} to={ROUTES.HOME} leftIcon={<FiHome />}>
            {t('notFound.home')}
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} leftIcon={<FiArrowLeft />}>
            {t('notFound.back')}
          </Button>
        </div>
      </div>
    </div>
  );
};
