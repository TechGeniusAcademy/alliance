import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiHeart,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiArrowRight,
  FiUser
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import RegisterModal from '../../components/RegisterModal';
import styles from './Projects.module.css';

const ITEMS_PER_PAGE = 20;

interface PortfolioProject {
  id: number;
  master_id: number;
  title: string;
  description?: string;
  category?: string;
  images: string[];
  execution_time?: string;
  materials?: string;
  price?: number;
  location?: string;
  created_at: string;
  master_name: string;
  profile_picture?: string;
}

export const ProjectsPage = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  // Загрузка проектов из БД
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/master/public/portfolio`);
        setProjects(response.data);
      } catch (error) {
        console.error('Ошибка загрузки проектов:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const categories = [
    { id: 'all', label: t('projectsPage.filters.all') },
    { id: 'kitchen', label: t('projectsPage.filters.kitchen') },
    { id: 'bedroom', label: t('projectsPage.filters.bedroom') },
    { id: 'living', label: t('projectsPage.filters.living') },
    { id: 'office', label: t('projectsPage.filters.office') },
    { id: 'children', label: t('projectsPage.filters.children') },
    { id: 'bathroom', label: t('projectsPage.filters.bathroom') }
  ];

  // Маппинг категорий с ключевыми словами для фильтрации
  const categoryKeywords: Record<string, string[]> = {
    'kitchen': ['кухн', 'kitchen', 'кухонная мебель'],
    'bedroom': ['спальн', 'bedroom', 'спальная мебель'],
    'living': ['гостин', 'living', 'зал', 'гостиная мебель'],
    'office': ['офис', 'office', 'кабинет', 'офисная мебель'],
    'children': ['детск', 'children', 'детская мебель'],
    'hallway': ['прихож', 'hallway', 'коридор', 'прихожая мебель'],
    'bathroom': ['ванн', 'bathroom', 'санузел', 'ванная мебель'],
  };

  // Фильтрация проектов по категории
  const filteredProjects = projects.filter(project => {
    if (activeCategory === 'all') return true;
    
    const keywords = categoryKeywords[activeCategory] || [];
    if (keywords.length === 0) return true;
    
    const categoryLower = project.category?.toLowerCase() || '';
    return keywords.some(keyword => categoryLower.includes(keyword.toLowerCase()));
  });

  // Сортировка проектов
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'popular':
        return 0; // TODO: добавить поле популярности
      case 'budget-high':
        return (b.price || 0) - (a.price || 0);
      case 'budget-low':
        return (a.price || 0) - (b.price || 0);
      default:
        return 0;
    }
  });

  return (
    <div className={styles.projects}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.breadcrumbs}>
            <Link to="/">{t('projectsPage.breadcrumb.home')}</Link>
            <span>/</span>
            <span>{t('projectsPage.breadcrumb.projects')}</span>
          </div>
          
          <h1>{t('projectsPage.hero.title')}</h1>
          <p>
            {t('projectsPage.hero.subtitle')}
          </p>
          
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <span>{projects.length}</span>
              <span>{t('projectsPage.stats.projects')}</span>
            </div>
            <div className={styles.statItem}>
              <span>{new Set(projects.map(p => p.master_id)).size}</span>
              <span>{t('projectsPage.stats.masters')}</span>
            </div>
            <div className={styles.statItem}>
              <span>{new Set(projects.map(p => p.category).filter(Boolean)).size}</span>
              <span>{t('projectsPage.stats.categories')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filterCategories}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.active : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          
          <select 
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">{t('projectsPage.filters.sortNewest')}</option>
            <option value="popular">{t('projectsPage.filters.sortPopular')}</option>
            <option value="budget-high">{t('projectsPage.filters.sortBudgetHigh')}</option>
            <option value="budget-low">{t('projectsPage.filters.sortBudgetLow')}</option>
          </select>
        </div>
      </section>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.resultsHeader}>
          <div className={styles.resultsInfo}>
            {t('projectsPage.results.found')} <strong>{sortedProjects.length}</strong> {t('projectsPage.results.projects')}
          </div>
          
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className={viewMode === 'grid' ? styles.projectsGrid : styles.projectsList}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              {t('projectsPage.loading')}
            </div>
          ) : sortedProjects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              {t('projectsPage.noProjects')}
            </div>
          ) : (
            sortedProjects
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((project) => (
              <article key={project.id} className={styles.projectCard}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={project.images && project.images.length > 0 
                      ? project.images[0] 
                      : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop'
                    } 
                    alt={project.title}
                    className={styles.projectImage}
                  />
                  {project.category && (
                    <span className={styles.categoryBadge}>{project.category}</span>
                  )}
                  <div className={styles.imageOverlay}>
                    <div className={styles.overlayActions}>
                      <button className={styles.actionBtn}>
                        <FiHeart />
                      </button>
                      <button className={styles.actionBtn}>
                        <FiExternalLink />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className={styles.projectContent}>
                  <h3>
                    <Link to={`/projects/${project.id}`}>{project.title}</Link>
                  </h3>
                  
                  <div className={styles.projectMeta}>
                    {project.location && (
                      <span>
                        <FiMapPin />
                        {project.location}
                      </span>
                    )}
                    {project.created_at && (
                      <span>
                        <FiCalendar />
                        {new Date(project.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    {project.price && (
                      <span>
                        <FiDollarSign />
                        {project.price.toLocaleString()} ₸
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.projectFooter}>
                    <div className={styles.masterInfo}>
                      <div className={styles.masterAvatar}>
                        {project.profile_picture ? (
                          <img src={project.profile_picture} alt={project.master_name} />
                        ) : (
                          <FiUser />
                        )}
                      </div>
                      <div className={styles.masterDetails}>
                        <span className={styles.masterName}>{project.master_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Pagination */}
        {sortedProjects.length > ITEMS_PER_PAGE && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <FiChevronLeft />
            </button>
            {(() => {
              const totalPages = Math.ceil(sortedProjects.length / ITEMS_PER_PAGE);
              const pages = [];
              const maxVisible = 5;
              
              let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
              let endPage = Math.min(totalPages, startPage + maxVisible - 1);
              
              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }
              
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button 
                    key={i}
                    className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i}
                  </button>
                );
              }
              
              return pages;
            })()}
            <button 
              className={styles.pageBtn}
              disabled={currentPage === Math.ceil(sortedProjects.length / ITEMS_PER_PAGE)}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaText}>
            <h2>{t('projectsPage.cta.title')}</h2>
            <p>
              {t('projectsPage.cta.text')}
            </p>
          </div>
          
          <div className={styles.ctaButtons}>
            <button 
              className={`${styles.ctaBtn} ${styles.ctaBtnPrimary}`}
              onClick={() => setRegisterModalOpen(true)}
            >
              {t('projectsPage.cta.becomeMaster')}
              <FiArrowRight />
            </button>
            <Link to="/masters" className={`${styles.ctaBtn} ${styles.ctaBtnOutline}`}>
              {t('projectsPage.cta.mastersCatalog')}
            </Link>
          </div>
        </div>
      </section>

      {/* Register Modal */}
      <RegisterModal 
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
};
