import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { 
  FiChevronRight, 
  FiSearch,
  FiArrowRight,
  FiLayers,
  FiPenTool,
  FiLayout,
  FiCpu,
  FiTool,
  FiSettings,
  FiScissors,
  FiTrash2,
  FiX,
  FiAlertCircle
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { ROUTES } from '../../constants';
import { Button } from '../../components/ui/Button';
import styles from './Categories.module.css';

export const CategoriesPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Маппинг категорий для фильтрации мастеров (такой же как в CategoryDetail)
  const categoryKeywords: Record<string, string[]> = {
    'kitchen': ['кухн', 'kitchen'],
    'bedroom': ['спальн', 'bedroom'],
    'living': ['гостин', 'living', 'зал'],
    'office': ['офис', 'office', 'кабинет'],
    'children': ['детск', 'children'],
    'hallway': ['прихож', 'hallway', 'коридор'],
    'bathroom': ['ванн', 'bathroom', 'санузел'],
    'wardrobe': ['шкаф', 'wardrobe', 'гардероб'],
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    // Загружаем мастеров и считаем количество для каждой категории
    const fetchMastersCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/masters/public`);
        const allMasters = response.data;
        
        const counts: Record<string, number> = {};
        
        // Считаем мастеров для каждой категории
        Object.keys(categoryKeywords).forEach(categoryId => {
          const keywords = categoryKeywords[categoryId];
          const count = allMasters.filter((master: any) => {
            if (!master.skills || master.skills.length === 0) {
              return false;
            }
            return master.skills.some((spec: string) => {
              const specLower = spec.toLowerCase();
              return keywords.some(keyword => specLower.includes(keyword.toLowerCase()));
            });
          }).length;
          counts[categoryId] = count;
        });
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error('Error fetching masters:', error);
      }
    };

    fetchMastersCount();
  }, []);

  const handleCreateOrder = () => {
    if (!user) {
      // Не авторизован - перенаправить на авторизацию
      navigate('/login');
      return;
    }

    if (user.role === 'master') {
      // Авторизован как мастер - показать модальное окно
      setShowMasterModal(true);
      return;
    }

    // Авторизован как клиент - перейти к созданию заказа
    navigate(ROUTES.ORDERS);
  };

  const mainCategories = [
    {
      id: 'kitchen',
      image: '/categories/kitchen.jpg',
      name: t('categoriesPage.mainCategories.kitchen'),
      description: t('categoriesPage.mainCategories.kitchenDesc'),
      count: categoryCounts['kitchen'] || 0
    },
    {
      id: 'bedroom',
      image: '/categories/3d-rendering-business-meeting-and-working-room-on-2025-01-07-12-18-14-utc.jpg',
      name: t('categoriesPage.mainCategories.bedroom'),
      description: t('categoriesPage.mainCategories.bedroomDesc'),
      count: categoryCounts['bedroom'] || 0
    },
    {
      id: 'living',
      image: '/categories/living room.jpg',
      name: t('categoriesPage.mainCategories.living'),
      description: t('categoriesPage.mainCategories.livingDesc'),
      count: categoryCounts['living'] || 0
    },
    {
      id: 'office',
      image: '/categories/ofiice.jpg',
      name: t('categoriesPage.mainCategories.office'),
      description: t('categoriesPage.mainCategories.officeDesc'),
      count: categoryCounts['office'] || 0
    },
    {
      id: 'children',
      image: '/categories/childrensroom.jpg',
      name: t('categoriesPage.mainCategories.children'),
      description: t('categoriesPage.mainCategories.childrenDesc'),
      count: categoryCounts['children'] || 0
    },
    {
      id: 'hallway',
      image: '/categories/hallway.jpg',
      name: t('categoriesPage.mainCategories.hallway'),
      description: t('categoriesPage.mainCategories.hallwayDesc'),
      count: categoryCounts['hallway'] || 0
    },
    {
      id: 'bathroom',
      image: '/categories/bathroom.jpg',
      name: t('categoriesPage.mainCategories.bathroom'),
      description: t('categoriesPage.mainCategories.bathroomDesc'),
      count: categoryCounts['bathroom'] || 0
    },
    {
      id: 'wardrobe',
      image: '/categories/wardrobe.jpg',
      name: t('categoriesPage.mainCategories.wardrobe'),
      description: t('categoriesPage.mainCategories.wardrobeDesc'),
      count: categoryCounts['wardrobe'] || 0
    }
  ];

  const designServices = [
    { id: '3d-modeling', icon: FiCpu, name: t('categoriesPage.designServices.3dModeling'), count: 85 },
    { id: 'drawings', icon: FiLayout, name: t('categoriesPage.designServices.drawings'), count: 70 },
    { id: 'interior', icon: FiPenTool, name: t('categoriesPage.designServices.interior'), count: 95 },
    { id: 'materials', icon: FiLayers, name: t('categoriesPage.designServices.materials'), count: 60 }
  ];

  const repairServices = [
    { id: 'assembly', icon: FiTool, name: t('categoriesPage.repairServices.assembly'), count: 320 },
    { id: 'restoration', icon: FiSettings, name: t('categoriesPage.repairServices.restoration'), count: 110 },
    { id: 'repair', icon: FiSettings, name: t('categoriesPage.repairServices.repair'), count: 150 },
    { id: 'upholstery', icon: FiScissors, name: t('categoriesPage.repairServices.upholstery'), count: 90 },
    { id: 'removal', icon: FiTrash2, name: t('categoriesPage.repairServices.removal'), count: 80 }
  ];

  const popularTags = [
    { key: 'wardrobeCustom', label: t('categoriesPage.popularTags.wardrobeCustom') },
    { key: 'kitchenCustom', label: t('categoriesPage.popularTags.kitchenCustom') },
    { key: 'sofaRepair', label: t('categoriesPage.popularTags.sofaRepair') },
    { key: 'ikeaAssembly', label: t('categoriesPage.popularTags.ikeaAssembly') },
    { key: 'kidsBed', label: t('categoriesPage.popularTags.kidsBed') },
    { key: 'officeDesk', label: t('categoriesPage.popularTags.officeDesk') },
    { key: 'dressingRoom', label: t('categoriesPage.popularTags.dressingRoom') },
    { key: 'cornerSofa', label: t('categoriesPage.popularTags.cornerSofa') },
    { key: 'tvStand', label: t('categoriesPage.popularTags.tvStand') },
    { key: 'hallwayCustom', label: t('categoriesPage.popularTags.hallwayCustom') },
    { key: 'barCounter', label: t('categoriesPage.popularTags.barCounter') },
    { key: 'liftBed', label: t('categoriesPage.popularTags.liftBed') }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <nav className={styles.breadcrumbs}>
            <Link to={ROUTES.HOME}>{t('nav.home')}</Link>
            <FiChevronRight className={styles.breadcrumbSeparator} />
            <span>{t('nav.categories')}</span>
          </nav>
          <h1 className={styles.heroTitle}>{t('categoriesPage.heroTitle')}</h1>
          <p className={styles.heroSubtitle}>
            {t('categoriesPage.heroSubtitle')}
          </p>
          <div className={styles.search}>
            <FiSearch className={styles.searchIcon} />
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder={t('categoriesPage.searchPlaceholder')}
            />
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className={styles.categorySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('categoriesPage.productionTitle')}</h2>
            <p className={styles.sectionSubtitle}>{t('categoriesPage.productionSubtitle')}</p>
          </div>
          <div className={styles.categoryGrid}>
            {mainCategories.map((category) => {
              return (
                <Link 
                  key={category.id}
                  to={`${ROUTES.CATEGORIES}/${category.id}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryImage}>
                    <img src={category.image} alt={category.name} />
                  </div>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categoryDescription}>{category.description}</p>
                  <div className={styles.categoryMeta}>
                    <span className={styles.categoryCount}>{category.count}+ {t('categoriesPage.mastersCount')}</span>
                    <div className={styles.categoryArrow}>
                      <FiArrowRight />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Design Services */}
      <section className={styles.categorySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('categoriesPage.designTitle')}</h2>
            <p className={styles.sectionSubtitle}>{t('categoriesPage.designSubtitle')}</p>
          </div>
          <div className={styles.serviceGrid}>
            {designServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link 
                  key={service.id}
                  to={`${ROUTES.CATEGORIES}/${service.id}`}
                  className={styles.serviceCard}
                >
                  <div className={styles.serviceIcon}>
                    <Icon />
                  </div>
                  <div className={styles.serviceInfo}>
                    <div className={styles.serviceName}>{service.name}</div>
                    <div className={styles.serviceCount}>{service.count}+ {t('categoriesPage.mastersCount')}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Repair Services */}
      <section className={styles.categorySection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('categoriesPage.repairTitle')}</h2>
            <p className={styles.sectionSubtitle}>{t('categoriesPage.repairSubtitle')}</p>
          </div>
          <div className={styles.serviceGrid}>
            {repairServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link 
                  key={service.id}
                  to={`${ROUTES.CATEGORIES}/${service.id}`}
                  className={styles.serviceCard}
                >
                  <div className={styles.serviceIcon}>
                    <Icon />
                  </div>
                  <div className={styles.serviceInfo}>
                    <div className={styles.serviceName}>{service.name}</div>
                    <div className={styles.serviceCount}>{service.count}+ {t('categoriesPage.mastersCount')}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Tags */}
      <section className={styles.tagsSection}>
        <div className={styles.container}>
          <div className={styles.tagsHeader}>
            <h2 className={styles.tagsTitle}>{t('categoriesPage.popularTitle')}</h2>
            <p className={styles.tagsSubtitle}>{t('categoriesPage.popularSubtitle')}</p>
          </div>
          <div className={styles.tagsList}>
            {popularTags.map((tag) => (
              <Link 
                key={tag.key}
                to={`${ROUTES.MASTERS}?search=${encodeURIComponent(tag.label)}`}
                className={styles.tag}
              >
                {tag.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>{t('categoriesPage.ctaTitle')}</h2>
          <p className={styles.ctaText}>
            {t('categoriesPage.ctaText')}
          </p>
          <Button 
            variant="primary" 
            size="large" 
            onClick={handleCreateOrder}
            rightIcon={<FiArrowRight />}
            style={{ backgroundColor: 'white', color: '#8B4513' }}
          >
            {t('categoriesPage.ctaButton')}
          </Button>
        </div>
      </section>

      {/* Modal for Master Role */}
      {showMasterModal && (
        <div className={styles.modalOverlay} onClick={() => setShowMasterModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowMasterModal(false)}>
              <FiX />
            </button>
            <div className={styles.modalIcon}>
              <FiAlertCircle />
            </div>
            <h3 className={styles.modalTitle}>{t('modal.accessDenied')}</h3>
            <p className={styles.modalText}>
              {t('modal.clientOnlyMessage')}
            </p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.modalBtnPrimary} 
                onClick={() => {
                  setShowMasterModal(false);
                  // Можно добавить переход на страницу смены роли или выхода
                }}
              >
                {t('modal.understood')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
