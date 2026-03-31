import { useState } from 'react';
import styles from './ChatRulesModal.module.css';

interface ChatRulesModalProps {
  onAccept: () => void;
  userType: 'client' | 'master';
}

const ChatRulesModal = ({ onAccept, userType }: ChatRulesModalProps) => {
  const [accepted, setAccepted] = useState(false);

  const rules = [
    {
      title: 'Уважение и вежливость',
      description: 'Общайтесь уважительно, без оскорблений и грубости'
    },
    {
      title: 'Профессионализм',
      description: 'Обсуждайте только вопросы, связанные с заказом'
    },
    {
      title: 'Четкость и ясность',
      description: 'Формулируйте требования и вопросы четко и понятно'
    },
    {
      title: 'Своевременность',
      description: 'Отвечайте на сообщения в разумные сроки'
    },
    {
      title: 'Конфиденциальность',
      description: 'Не передавайте личные данные третьим лицам'
    },
    {
      title: 'Оплата через платформу',
      description: 'Все финансовые операции проводите только через платформу'
    },
    {
      title: 'Доказательства',
      description: 'При спорных ситуациях предоставляйте фото/видео материалы'
    },
    {
      title: 'Запрещено',
      description: 'Спам, реклама, мошенничество, обман клиентов/мастеров'
    }
  ];

  const handleSubmit = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Правила общения в чате</h2>
          <p>Пожалуйста, ознакомьтесь с правилами перед началом общения</p>
        </div>

        <div className={styles.content}>
          <div className={styles.rulesGrid}>
            {rules.map((rule, index) => (
              <div key={index} className={styles.ruleCard}>
                <div className={styles.ruleTitle}>{rule.title}</div>
                <div className={styles.ruleDescription}>{rule.description}</div>
              </div>
            ))}
          </div>

          <div className={styles.warning}>
            <strong>Внимание:</strong> Нарушение правил может привести к блокировке аккаунта и 
            {userType === 'master' ? ' потере комиссионных' : ' отмене заказов'}
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>Я ознакомился(лась) с правилами и обязуюсь их соблюдать</span>
          </label>
        </div>

        <div className={styles.footer}>
          <button
            onClick={handleSubmit}
            disabled={!accepted}
            className={styles.acceptButton}
          >
            Принять и начать общение
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRulesModal;
