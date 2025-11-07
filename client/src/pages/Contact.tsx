import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('nav.contact')}</h1>
      <p>Свяжитесь с нами</p>
    </div>
  );
};

export default Contact;
