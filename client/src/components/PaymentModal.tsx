import { useState, useEffect } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styles from './PaymentModal.module.css';

interface PaymentModalProps {
  orderId: number;
  amount: number;
  orderTitle: string;
  bidId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    const response = await fetch('http://localhost:5000/api/payments/config');
    const { publishableKey } = await response.json();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

const CheckoutForm = ({ orderId, amount, orderTitle, bidId, onSuccess, onClose }: PaymentModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Ошибка при обработке платежа');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Подтверждаем платеж на бэкенде
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/payments/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderId,
            bidId, // Отправляем bidId для принятия заявки после оплаты
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка подтверждения платежа');
        }

        setSucceeded(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при оплате');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.orderInfo}>
        <h3>{orderTitle}</h3>
        <p className={styles.amount}>{amount.toLocaleString('ru-RU')} ₸</p>
      </div>

      <PaymentElement className={styles.paymentElement} />

      {error && <div className={styles.error}>{error}</div>}
      {succeeded && <div className={styles.success}>Платеж успешно обработан!</div>}

      <div className={styles.buttons}>
        <button
          type="button"
          onClick={onClose}
          className={styles.cancelButton}
          disabled={processing || succeeded}
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={!stripe || processing || succeeded}
          className={styles.submitButton}
        >
          {processing ? 'Обработка...' : succeeded ? 'Оплачено' : `Оплатить ${amount.toLocaleString('ru-RU')} ₸`}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = (props: PaymentModalProps) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: props.orderId,
            bidId: props.bidId, // Передаем bidId если он есть
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка создания платежа');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось инициализировать платеж');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.orderId, props.bidId]);

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#667eea',
        colorBackground: '#ffffff',
        colorText: '#1a1a1a',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className={styles.modalOverlay} onClick={props.onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={props.onClose}>
          ×
        </button>

        <h2 className={styles.title}>Оплата заказа</h2>

        {loading && <div className={styles.loader}>Загрузка формы оплаты...</div>}
        
        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.error}>{error}</p>
            <button onClick={props.onClose} className={styles.cancelButton}>
              Закрыть
            </button>
          </div>
        )}

        {!loading && !error && clientSecret && (
          <Elements stripe={getStripe()} options={options}>
            <CheckoutForm {...props} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
