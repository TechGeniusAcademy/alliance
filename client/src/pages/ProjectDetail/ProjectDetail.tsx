import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import {
  FiHome,
  FiChevronRight,
  FiChevronLeft,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiStar,
  FiCheckCircle,
  FiMessageSquare,
  FiX,
  FiFileText,
  FiTool,
  FiLayers,
  FiDollarSign,
  FiUser,
  FiArrowRight,
  FiImage,
  FiBox
} from 'react-icons/fi';
import styles from './ProjectDetail.module.css';

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
  client_name?: string;
  location?: string;
  price?: number;
  warranty_period?: string;
  assembly_included?: boolean;
  delivery_included?: boolean;
  created_at: string;
  master_name: string;
  profilePicture?: string;
  specialty?: string;
  rating?: number;
}

// Mock project data
const projectData = {
  id: 1,
  title: 'Современная кухня в стиле минимализм',
  category: 'Кухни на заказ',
  description: `Проект современной кухни в стиле минимализм для квартиры-студии в Алматы.

Основная задача — создать функциональное и эстетичное пространство с максимальным использованием полезной площади. Заказчик хотел получить кухню с чистыми линиями, без ручек, с интегрированной техникой.

Особенности проекта:
• П-образная планировка с полуостровом
• Система открывания push-to-open
• Встроенное LED-освещение рабочей зоны
• Скрытые розетки в столешнице
• Полностью встроенная техника premium-класса

Проект выполнен за 35 рабочих дней от замера до финальной установки.`,
  location: 'Алматы, Бостандыкский район',
  completedAt: 'Декабрь 2024',
  duration: '35 дней',
  budget: '320 000 ₸',
  tags: ['Минимализм', 'Белая кухня', 'П-образная', 'Push-to-open', 'LED подсветка'],
  images: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop'
  ],
  details: [
    { icon: <FiLayers />, label: 'Площадь', value: '12 м²' },
    { icon: <FiBox />, label: 'Погонных метров', value: '4.5 м' },
    { icon: <FiClock />, label: 'Срок выполнения', value: '35 дней' },
    { icon: <FiDollarSign />, label: 'Стоимость', value: '320 000 ₸' }
  ],
  materials: [
    { name: 'Фасады МДФ с покраской', brand: 'Матовая эмаль RAL 9010' },
    { name: 'Столешница кварц', brand: 'Caesarstone, 30мм' },
    { name: 'Корпус ЛДСП', brand: 'EGGER, 18мм' },
    { name: 'Фурнитура', brand: 'Blum (Австрия)' },
    { name: 'Мойка', brand: 'Franke, нержавеющая сталь' },
    { name: 'Смеситель', brand: 'Grohe, с выдвижным изливом' }
  ],
  beforeAfter: {
    before: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop',
    after: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'
  },
  review: {
    author: 'Айгуль К.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    rating: 5,
    date: '20 декабря 2024',
    text: 'Превосходная работа! Алексей полностью оправдал наши ожидания. Кухня получилась именно такой, как мы хотели — современной, функциональной и очень стильной. Отдельное спасибо за внимание к деталям и соблюдение сроков. Рекомендую!'
  },
  master: {
    id: 1,
    name: 'Алексей Петров',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    specialty: 'Мастер корпусной мебели',
    rating: 4.9,
    reviewsCount: 127,
    projectsCount: 89,
    experience: 12,
    verified: true
  },
  stats: {
    views: 1245,
    likes: 89,
    shares: 23
  },
  relatedProjects: [
    {
      id: 2,
      title: 'Угловая кухня в классическом стиле',
      image: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=200&h=150&fit=crop',
      category: 'Кухни'
    },
    {
      id: 3,
      title: 'Кухня-гостиная с барной стойкой',
      image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=200&h=150&fit=crop',
      category: 'Кухни'
    },
    {
      id: 4,
      title: 'Встроенный шкаф-купе',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=200&h=150&fit=crop',
      category: 'Шкафы'
    }
  ]
};

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/master/public/portfolio`);
        const foundProject = response.data.find((p: any) => p.id === Number(id));
        if (foundProject) {
          // Маппинг snake_case к camelCase
          setProject({
            ...foundProject,
            profilePicture: foundProject.profile_picture
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки проекта:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        Загрузка проекта...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        Проект не найден
      </div>
    );
  }

  const nextImage = () => {
    if (project && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
    }
  };

  const prevImage = () => {
    if (project && project.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        style={{
          fill: i < Math.floor(rating) ? '#f39c12' : 'none',
          color: '#f39c12'
        }}
      />
    ));
  };

  return (
    <div className={styles.page}>
      {/* Hero Gallery */}
      <section className={styles.heroGallery}>
        <div className={styles.galleryContainer}>
          <img
            src={project.images && project.images.length > 0 
              ? project.images[currentImageIndex] 
              : 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop'
            }
            alt={project.title}
            className={styles.mainImage}
            onClick={() => setLightboxOpen(true)}
          />
          {project.images && project.images.length > 1 && (
            <>
              <button className={`${styles.galleryNav} ${styles.galleryNavPrev}`} onClick={prevImage}>
                <FiChevronLeft />
              </button>
              <button className={`${styles.galleryNav} ${styles.galleryNavNext}`} onClick={nextImage}>
                <FiChevronRight />
              </button>
              <div className={styles.imageCounter}>
                {currentImageIndex + 1} / {project.images.length}
              </div>
            </>
          )}
          <div className={styles.thumbnails}>
            {project.images && project.images.map((img, index) => (
              <div
                key={index}
                className={`${styles.thumbnail} ${currentImageIndex === index ? styles.thumbnailActive : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img src={img} alt={`Фото ${index + 1}`} className={styles.thumbnailImage} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles.breadcrumbLink}>
            <FiHome /> Главная
          </Link>
          <FiChevronRight className={styles.breadcrumbSeparator} />
          <Link to="/projects" className={styles.breadcrumbLink}>
            Проекты
          </Link>
          <FiChevronRight className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{project.title}</span>
        </nav>

        <div className={styles.content}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Project Header */}
            <div className={styles.projectHeader}>
              {project.category && <span className={styles.projectCategory}>{project.category}</span>}
              <h1 className={styles.projectTitle}>{project.title}</h1>
              <div className={styles.projectMeta}>
                {project.location && (
                  <div className={styles.metaItem}>
                    <FiMapPin /> {project.location}
                  </div>
                )}
                {project.created_at && (
                  <div className={styles.metaItem}>
                    <FiCalendar /> {new Date(project.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                  </div>
                )}
                {project.execution_time && (
                  <div className={styles.metaItem}>
                    <FiClock /> {project.execution_time}
                  </div>
                )}
              </div>
              {project.style && (
                <div className={styles.projectTags}>
                  <span className={styles.projectTag}>{project.style}</span>
                  {project.color && <span className={styles.projectTag}>{project.color}</span>}
                  {project.furniture_type && <span className={styles.projectTag}>{project.furniture_type}</span>}
                </div>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <FiFileText /> О проекте
                </h2>
                <p className={styles.descriptionText}>{project.description}</p>
              </section>
            )}

            {/* Details */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <FiTool /> Характеристики
              </h2>
              <div className={styles.detailsGrid}>
                {project.dimensions && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}><FiLayers /></div>
                    <div className={styles.detailText}>
                      <span className={styles.detailLabel}>Размеры</span>
                      <span className={styles.detailValue}>{project.dimensions}</span>
                    </div>
                  </div>
                )}
                {project.execution_time && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}><FiClock /></div>
                    <div className={styles.detailText}>
                      <span className={styles.detailLabel}>Срок выполнения</span>
                      <span className={styles.detailValue}>{project.execution_time}</span>
                    </div>
                  </div>
                )}
                {project.price && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}><FiDollarSign /></div>
                    <div className={styles.detailText}>
                      <span className={styles.detailLabel}>Стоимость</span>
                      <span className={styles.detailValue}>{project.price.toLocaleString()} ₸</span>
                    </div>
                  </div>
                )}
                {project.warranty_period && (
                  <div className={styles.detailItem}>
                    <div className={styles.detailIcon}><FiCheckCircle /></div>
                    <div className={styles.detailText}>
                      <span className={styles.detailLabel}>Гарантия</span>
                      <span className={styles.detailValue}>{project.warranty_period}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Materials */}
            {project.materials && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <FiLayers /> Использованные материалы
                </h2>
                <div className={styles.materialsList}>
                  <div className={styles.materialItem}>
                    <span className={styles.materialName}>Материалы</span>
                    <span className={styles.materialBrand}>{project.materials}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Client Name */}
            {project.client_name && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <FiUser /> Заказчик
                </h2>
                <p className={styles.descriptionText}>{project.client_name}</p>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Master Card */}
            <div className={styles.masterCard}>
              <h3 className={styles.masterTitle}>Мастер проекта</h3>
              <div className={styles.masterInfo}>
                {project.profilePicture ? (
                  <img src={project.profilePicture} alt={project.master_name} className={styles.masterAvatar} />
                ) : (
                  <div className={styles.masterAvatar} style={{ background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiUser size={32} />
                  </div>
                )}
                <div className={styles.masterDetails}>
                  <h4 className={styles.masterName}>
                    {project.master_name}
                  </h4>
                  {project.specialty && (
                    <p className={styles.masterSpecialty}>{project.specialty}</p>
                  )}
                  {project.rating && (
                    <div className={styles.masterRating}>
                      <div className={styles.stars}>{renderStars(project.rating)}</div>
                      <span className={styles.ratingValue}>{project.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.masterButtons}>
                <button className={styles.contactButton}>
                  <FiMessageSquare /> Написать мастеру
                </button>
                <Link to={`/masters/${project.master_id}`} className={styles.profileButton}>
                  Смотреть профиль
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div className={styles.cta}>
              <h3 className={styles.ctaTitle}>Нужен похожий проект?</h3>
              <p className={styles.ctaText}>Разместите заказ и получите предложения от проверенных мастеров</p>
              <Link to="/orders/create" className={styles.ctaButton}>
                Создать заказ <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && project && project.images && project.images.length > 0 && (
        <div className={styles.lightbox} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>
            <FiX />
          </button>
          {project.images.length > 1 && (
            <>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <FiChevronLeft />
              </button>
              <button
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <FiChevronRight />
              </button>
            </>
          )}
          <img
            src={project.images[currentImageIndex]}
            alt={project.title}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
