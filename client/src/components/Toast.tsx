import { useEffect } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <MdCheckCircle size={24} />,
    error: <MdError size={24} />,
    info: <MdInfo size={24} />,
    warning: <MdWarning size={24} />,
  };

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.iconWrapper}>
        {icons[type]}
      </div>
      <p className={styles.message}>{message}</p>
      <button onClick={onClose} className={styles.closeButton}>
        <MdClose size={20} />
      </button>
    </div>
  );
};

export default Toast;
