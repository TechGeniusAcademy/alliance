import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '../../../context/LanguageContext';
import { ROUTES } from '../../../constants';
import { Button } from '../../ui/Button';
import styles from './Portfolio.module.css';

interface PortfolioProject {
  id: number;
  master_id: number;
  title: string;
  description?: string;
  category?: string;
  images: string[];
  execution_time?: string;
  materials?: string;
  dimensions?: string;
  furniture_type?: string;
  style?: string;
  color?: string;
  location?: string;
  price?: number;
  warranty_period?: string;
  assembly_included?: boolean;
  delivery_included?: boolean;
  created_at: string;
  master_name: string;
  master_phone?: string;
}

export const Portfolio = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка портфолио из базы данных
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/master/public/portfolio`);
        console.log('Portfolio API response:', response.data);
        // Берем только первые 6 работ для отображения на главной
        setProjects(response.data.slice(0, 6));
      } catch (error) {
        console.error('Ошибка загрузки портфолио:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t('portfolio.title')}</h2>
            <p className={styles.subtitle}>{t('portfolio.subtitle')}</p>
          </div>
          <Button 
            variant="outline" 
            as={Link} 
            to={ROUTES.PROJECTS}
            rightIcon={<FiArrowRight />}
          >
            {t('portfolio.viewAll')}
          </Button>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              {t('portfolio.loading') || 'Загрузка...'}
            </div>
          ) : projects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              {t('portfolio.noProjects') || 'Работы не найдены'}
            </div>
          ) : (
            projects.map((project, index) => (
              <Link
                key={project.id}
                to={`${ROUTES.PROJECTS}/${project.id}`}
                className={`${styles.card} ${index === 0 ? styles.large : ''}`}
              >
                <div className={styles.imageWrapper}>
                  <img 
                    src={project.images && project.images.length > 0 
                      ? project.images[0] 
                      : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'
                    } 
                    alt={project.title}
                    className={styles.projectImage}
                  />
                  <div className={styles.overlay}>
                    <span className={styles.viewProject}>{t('portfolio.viewProject')}</span>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  {project.category && (
                    <span className={styles.category}>{project.category}</span>
                  )}
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  {project.price && (
                    <div className={styles.views}>
                      <span>{project.price.toLocaleString()} ₸</span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
