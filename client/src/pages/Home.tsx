import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Home = () => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>{t('nav.home')}</h1>
      <p>Добро пожаловать на главную страницу!</p>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link 
          to="/dashboard" 
          style={{ 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Личный кабинет клиента
        </Link>
        
        <Link 
          to="/master" 
          style={{ 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Личный кабинет мастера
        </Link>
        
        <Link 
          to="/admin" 
          style={{ 
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Админ панель
        </Link>
      </div>
    </div>
  );
};

export default Home;
