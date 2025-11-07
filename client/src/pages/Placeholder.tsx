import styles from './Placeholder.module.css';

interface PlaceholderProps {
  title: string;
  icon: string;
  description: string;
}

const Placeholder = ({ title, icon, description }: PlaceholderProps) => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.content}>
        <div className={styles.icon}>{icon}</div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <div className={styles.badge}>Coming Soon</div>
      </div>
    </div>
  );
};

export default Placeholder;
