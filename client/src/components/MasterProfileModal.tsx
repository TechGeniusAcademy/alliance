import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdStar, MdLocationOn, MdEmail, MdChat, MdVerified, MdWork, MdBusiness, MdLanguage, MdCheckCircle, MdLocalShipping, MdBuild, MdDesignServices, MdQuestionAnswer, MdWeb } from 'react-icons/md';
import { FaInstagram, FaFacebook, FaTelegram, FaWhatsapp } from 'react-icons/fa';
import axios from 'axios';
import styles from './MasterProfileModal.module.css';

interface MasterInfo {
  id?: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  address: string;
  profile_photo: string;
  user_created_at: string;
  portfolio_count: number;
  rating: number;
  reviews_count: number;
  completed_orders: number;
  company_name?: string;
  bio?: string;
  specializations?: string[];
  years_of_experience?: number;
  education?: string;
  certifications?: string[];
  work_schedule?: string;
  min_order_amount?: number;
  max_projects_simultaneously?: number;
  services_offered?: string[];
  materials_work_with?: string[];
  equipment?: string;
  workspace_size?: string;
  has_showroom?: boolean;
  showroom_address?: string;
  payment_methods?: string[];
  warranty_terms?: string;
  return_policy?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  telegram?: string;
  whatsapp?: string;
  languages?: string[];
  delivery_available?: boolean;
  assembly_available?: boolean;
  design_services?: boolean;
  consultation_free?: boolean;
}

interface MasterProfileModalProps {
  masterId: number;
  onClose: () => void;
}

const MasterProfileModal = ({ masterId, onClose }: MasterProfileModalProps) => {
  const navigate = useNavigate();
  const [master, setMaster] = useState<MasterInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMasterInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterId]);

  const loadMasterInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/master-profile/public/${masterId}`);
      setMaster(response.data.profile);
    } catch (error) {
      console.error('Error loading master info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactMaster = () => {
    navigate('/dashboard/messages', { 
      state: { masterId: master?.user_id || master?.id, masterName: master?.name } 
    });
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
        <div className={styles.modal}>
          <div className={styles.loader} />
        </div>
      </div>
    );
  }

  if (!master) {
    return null;
  }

  const yearsSinceRegistration = new Date().getFullYear() - new Date(master.user_created_at).getFullYear();

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <MdClose size={28} />
        </button>

        <div className={styles.modalContent}>
          {/* Header с аватаром */}
          <div className={styles.header}>
            <div className={styles.avatarSection}>
              <img 
                src={master.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(master.name)}&size=150&background=667eea&color=fff`} 
                alt={master.name} 
                className={styles.avatar} 
              />
              <div className={styles.verifiedBadge}>
                <MdVerified size={18} />
                Проверен
              </div>
            </div>

            <div className={styles.headerInfo}>
              <div className={styles.nameRow}>
                <h2>{master.name}</h2>
                <div className={styles.rating}>
                  <MdStar size={22} />
                  <span className={styles.ratingValue}>{master.rating}</span>
                  <span className={styles.reviewsCount}>({master.reviews_count})</span>
                </div>
              </div>

              {master.company_name && (
                <div className={styles.companyName}>
                  <MdBusiness size={18} />
                  <span>{master.company_name}</span>
                </div>
              )}

              <div className={styles.contactInfo}>
                {master.address && (
                  <div className={styles.contactItem}>
                    <MdLocationOn size={18} />
                    <span>{master.address}</span>
                  </div>
                )}
                {master.email && (
                  <div className={styles.contactItem}>
                    <MdEmail size={18} />
                    <span>{master.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* О мастере */}
          {master.bio && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>О мастере</h3>
              <p className={styles.bioText}>{master.bio}</p>
            </div>
          )}

          {/* Статистика */}
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <MdWork size={28} />
              <div>
                <div className={styles.statValue}>{master.completed_orders}</div>
                <div className={styles.statLabel}>Заказов</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <MdVerified size={28} />
              <div>
                <div className={styles.statValue}>
                  {master.years_of_experience || yearsSinceRegistration}+ лет
                </div>
                <div className={styles.statLabel}>Опыта</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <MdStar size={28} />
              <div>
                <div className={styles.statValue}>{master.portfolio_count}</div>
                <div className={styles.statLabel}>Работ в портфолио</div>
              </div>
            </div>
          </div>

          {/* Специализации */}
          {master.specializations && master.specializations.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Специализации</h3>
              <div className={styles.badges}>
                {master.specializations.map((spec, index) => (
                  <span key={index} className={styles.badge}>{spec}</span>
                ))}
              </div>
            </div>
          )}

          {/* Профессиональная информация */}
          {(master.education || (master.certifications && master.certifications.length > 0)) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Профессиональная информация</h3>
              {master.education && (
                <div className={styles.infoItem}>
                  <strong>Образование:</strong> {master.education}
                </div>
              )}
              {master.certifications && master.certifications.length > 0 && (
                <div className={styles.infoItem}>
                  <strong>Сертификаты:</strong>
                  <ul className={styles.list}>
                    {master.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Услуги */}
          {master.services_offered && master.services_offered.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Услуги</h3>
              <div className={styles.badges}>
                {master.services_offered.map((service, index) => (
                  <span key={index} className={styles.badgeService}>{service}</span>
                ))}
              </div>
            </div>
          )}

          {/* Материалы и оборудование */}
          {(master.materials_work_with || master.equipment || master.workspace_size || master.has_showroom) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Материалы и оборудование</h3>
              {master.materials_work_with && master.materials_work_with.length > 0 && (
                <div className={styles.infoItem}>
                  <strong>Материалы:</strong>
                  <div className={styles.badges}>
                    {master.materials_work_with.map((material, index) => (
                      <span key={index} className={styles.badge}>{material}</span>
                    ))}
                  </div>
                </div>
              )}
              {master.equipment && (
                <div className={styles.infoItem}>
                  <strong>Оборудование:</strong> {master.equipment}
                </div>
              )}
              {master.workspace_size && (
                <div className={styles.infoItem}>
                  <strong>Размер мастерской:</strong> {master.workspace_size}
                </div>
              )}
              {master.has_showroom && (
                <div className={styles.infoItem}>
                  <div className={styles.showroomBadge}>
                    <MdCheckCircle size={18} />
                    Есть шоурум
                  </div>
                  {master.showroom_address && (
                    <p className={styles.showroomAddress}>{master.showroom_address}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Условия работы */}
          {(master.work_schedule || master.min_order_amount || master.max_projects_simultaneously) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Условия работы</h3>
              {master.work_schedule && (
                <div className={styles.infoItem}>
                  <strong>График работы:</strong> {master.work_schedule}
                </div>
              )}
              {master.min_order_amount && (
                <div className={styles.infoItem}>
                  <strong>Минимальная сумма заказа:</strong> {master.min_order_amount} ₸
                </div>
              )}
              {master.max_projects_simultaneously && (
                <div className={styles.infoItem}>
                  <strong>Одновременно проектов:</strong> до {master.max_projects_simultaneously}
                </div>
              )}
            </div>
          )}

          {/* Финансовые условия */}
          {(master.payment_methods || master.warranty_terms) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Оплата и гарантия</h3>
              {master.payment_methods && master.payment_methods.length > 0 && (
                <div className={styles.infoItem}>
                  <strong>Способы оплаты:</strong>
                  <div className={styles.badges}>
                    {master.payment_methods.map((method, index) => (
                      <span key={index} className={styles.badgePayment}>{method}</span>
                    ))}
                  </div>
                </div>
              )}
              {master.warranty_terms && (
                <div className={styles.infoItem}>
                  <strong>Гарантия:</strong> {master.warranty_terms}
                </div>
              )}
            </div>
          )}

          {/* Дополнительные услуги */}
          {(master.delivery_available || master.assembly_available || master.design_services || master.consultation_free) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Дополнительные услуги</h3>
              <div className={styles.features}>
                {master.delivery_available && (
                  <div className={styles.feature}>
                    <MdLocalShipping size={22} />
                    <span>Доставка</span>
                  </div>
                )}
                {master.assembly_available && (
                  <div className={styles.feature}>
                    <MdBuild size={22} />
                    <span>Сборка</span>
                  </div>
                )}
                {master.design_services && (
                  <div className={styles.feature}>
                    <MdDesignServices size={22} />
                    <span>Дизайн</span>
                  </div>
                )}
                {master.consultation_free && (
                  <div className={styles.feature}>
                    <MdQuestionAnswer size={22} />
                    <span>Бесплатная консультация</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Языки */}
          {master.languages && master.languages.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <MdLanguage size={22} />
                Языки
              </h3>
              <div className={styles.badges}>
                {master.languages.map((lang, index) => (
                  <span key={index} className={styles.badge}>{lang}</span>
                ))}
              </div>
            </div>
          )}

          {/* Соцсети */}
          {(master.website || master.instagram || master.facebook || master.telegram || master.whatsapp) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Контакты и соцсети</h3>
              <div className={styles.socialLinks}>
                {master.website && (
                  <a href={master.website} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <MdWeb size={20} />
                    Веб-сайт
                  </a>
                )}
                {master.instagram && (
                  <a href={`https://instagram.com/${master.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <FaInstagram size={20} />
                    Instagram
                  </a>
                )}
                {master.facebook && (
                  <a href={`https://facebook.com/${master.facebook}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <FaFacebook size={20} />
                    Facebook
                  </a>
                )}
                {master.telegram && (
                  <a href={`https://t.me/${master.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <FaTelegram size={20} />
                    Telegram
                  </a>
                )}
                {master.whatsapp && (
                  <a href={`https://wa.me/${master.whatsapp}`} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    <FaWhatsapp size={20} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className={styles.actions}>
            <button className={styles.contactButton} onClick={handleContactMaster}>
              <MdChat size={20} />
              Написать сообщение
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterProfileModal;
