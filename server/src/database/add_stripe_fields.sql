-- Добавление полей для Stripe в таблицу transactions

-- Добавляем поле для хранения Stripe Payment Intent ID
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- Добавляем индекс для быстрого поиска по payment intent
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent 
ON transactions(stripe_payment_intent_id);

-- Добавляем поле для способа оплаты
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'balance';

-- Комментарии к новым полям
COMMENT ON COLUMN transactions.stripe_payment_intent_id IS 'Stripe Payment Intent ID для отслеживания платежей';
COMMENT ON COLUMN transactions.payment_method IS 'Способ оплаты: balance, stripe, cash, etc.';
