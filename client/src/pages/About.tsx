import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('nav.about')}</h1>
      <p>Информация о нас</p>
    </div>
  );
};

export default About;
