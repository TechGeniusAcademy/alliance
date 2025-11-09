import { useTranslation } from 'react-i18next';
import Footer from '../components/Footer';

const Contact = () => {
  const { t } = useTranslation();
  return (
    <>
      <div style={{ padding: '2rem' }}>
        <h1>{t('nav.contact')}</h1>
        <p>Свяжитесь с нами</p>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
