import React, { useState, useEffect } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { walletService } from '../services/walletService';
import styles from './WalletPaymentModal.module.css';

interface WalletPaymentModalProps {
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

let stripePromise: Promise<Stripe | null> | null = null;

const getStripe = async () => {
  if (!stripePromise) {
    const publishableKey = await walletService.getStripePublishableKey();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

const CheckoutForm: React.FC<{ amount: number; onSuccess: () => void; onClose: () => void }> = ({ amount, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        setError(submitError.message || 'Ошибка обработки платежа');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded, confirming on backend...');
        
        // Подтверждаем платеж на бэкенде
        await walletService.confirmPayment(paymentIntent.id);
        
        setSucceeded(true);
        setProcessing(false);
        
        // Задержка перед закрытием для показа успешного сообщения
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError((err as Error).message || 'Произошла ошибка при обработке платежа');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        <h2 className={styles.title}>Пополнение кошелька</h2>
        <button type="button" onClick={onClose} className={styles.closeButton}>
          ✕
        </button>
      </div>

      <div className={styles.amount}>
        <span className={styles.amountLabel}>Сумма:</span>
        <span className={styles.amountValue}>{amount.toFixed(2)} ₸</span>
      </div>

      <div className={styles.paymentElement}>
        <PaymentElement />
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {succeeded && (
        <div className={styles.success}>
          ✓ Платеж успешно обработан!
        </div>
      )}

      <div className={styles.buttons}>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!stripe || processing || succeeded}
        >
          {processing ? 'Обработка...' : succeeded ? 'Завершено' : `Оплатить ${amount.toFixed(2)} ₸`}
        </button>
        <button
          type="button"
          onClick={onClose}
          className={styles.cancelButton}
          disabled={processing}
        >
          Отмена
        </button>
      </div>
    </form>
  );
};

const WalletPaymentModal: React.FC<WalletPaymentModalProps> = ({ amount, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const data = await walletService.createPaymentIntent(amount);
        setClientSecret(data.clientSecret!);
        setLoading(false);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Не удалось создать платеж');
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [amount]);

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>{error}</div>
          <button onClick={onClose} className={styles.cancelButton}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <Elements stripe={getStripe()} options={options}>
          <CheckoutForm amount={amount} onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
};

export default WalletPaymentModal;
