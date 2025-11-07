import { useTranslation } from 'react-i18next';

const Services = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('nav.services')}</h1>
      <p>Наши услуги</p>
    </div>
  );
};

export default Services;
