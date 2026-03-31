# Миграции базы данных

## Проблемы

### 1. wallet_transactions - отсутствующие колонки
Таблица `wallet_transactions` была создана без колонок `order_id`, `payment_intent_id`, `description`, `created_at`, `updated_at`:

```
error: столбец "order_id" в таблице "wallet_transactions" не существует
error: столбец "updated_at" в таблице "wallet_transactions" не существует
```

### 2. chats - отсутствующие колонки для правил
Таблица `chats` была создана без колонок `customer_accepted_rules`, `master_accepted_rules`:

```
error: столбец "customer_accepted_rules" не существует
```

## Решение

### Автоматическая миграция (Рекомендуется)
Миграция теперь встроена в `src/config/database.ts` и применяется автоматически при запуске сервера.

**Просто перезапустите сервер:**
```bash
npm run dev
```

При запуске вы увидите сообщения:
```
✓ Колонка order_id уже существует в wallet_transactions
✓ Колонка payment_intent_id уже существует в wallet_transactions  
✓ Колонка description уже существует в wallet_transactions
```

Или если колонки отсутствовали:
```
 Колонка order_id отсутствует в wallet_transactions. Добавляю...
✓ Колонка order_id добавлена в wallet_transactions
```

### Ручная миграция (Если необходимо)

#### Вариант 1: Через скрипт Node.js
```bash
cd server
node src/database/run-migration.js
```

#### Вариант 2: Через SQL
Подключитесь к PostgreSQL и выполните:
```sql
-- Добавляем order_id
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS order_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id);

-- Добавляем payment_intent_id
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_wallet_payment_intent ON wallet_transactions(payment_intent_id);

-- Добавляем description
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS description TEXT;
```

## Проверка результата

Проверьте структуру таблицы:
```bash
cd server
node check-wallet-table.js
```

Или через psql:
```bash
psql -U postgres -d alliance_db -c "\d wallet_transactions"
```

## Ожидаемые структуры таблиц

### wallet_transactions

| Колонка           | Тип данных    | Описание                                    |
|-------------------|---------------|---------------------------------------------|
| id                | SERIAL        | Первичный ключ                              |
| master_id         | INTEGER       | ID мастера (FK к users)                     |
| amount            | DECIMAL(10,2) | Сумма транзакции                            |
| type              | VARCHAR(50)   | Тип (deposit, withdrawal, commission, etc.) |
| status            | VARCHAR(50)   | Статус (pending, completed, failed)         |
| order_id          | INTEGER       | ID связанного заказа (опционально)          |
| payment_intent_id | VARCHAR(255)  | ID платежного намерения Stripe              |
| description       | TEXT          | Описание транзакции                         |
| created_at        | TIMESTAMP     | Дата создания                               |
| updated_at        | TIMESTAMP     | Дата обновления                             |

### chats

| Колонка                  | Тип данных | Описание                                |
|--------------------------|------------|-----------------------------------------|
| id                       | SERIAL     | Первичный ключ                          |
| order_id                 | INTEGER    | ID заказа (FK к orders)                 |
| customer_id              | INTEGER    | ID клиента (FK к users)                 |
| master_id                | INTEGER    | ID мастера (FK к users)                 |
| status                   | VARCHAR(50)| Статус чата (active, closed)            |
| customer_accepted_rules  | BOOLEAN    | Клиент принял правила чата              |
| master_accepted_rules    | BOOLEAN    | Мастер принял правила чата              |
| created_at               | TIMESTAMP  | Дата создания                           |
| updated_at               | TIMESTAMP  | Дата обновления                         |

## Список миграций

1. `add_order_id_to_wallet_transactions.sql` - Добавление недостающих колонок в wallet_transactions
2. `add_chat_rules_columns.sql` - Добавление колонок для правил чата

## Примечания

- Миграции безопасны и не удаляют существующие данные
- Колонки добавляются только если их нет (идемпотентность)
- Индексы создаются автоматически для оптимизации запросов
- После миграций все функции (`acceptBid`, `acceptChatRules`) будут работать корректно
- Значения по умолчанию: `FALSE` для boolean полей, `CURRENT_TIMESTAMP` для timestamp полей
