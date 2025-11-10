# Furniture Order Platform

Платформа для заказа мебели с системой аукционов и комиссионных выплат.

## Технологии

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- Stripe Payment Gateway
- JWT Authentication

### Frontend
- React 18 + TypeScript
- Vite
- CSS Modules
- i18next

## Структура проекта

- `/server` - Backend API
- `/client` - Frontend приложение

## Установка

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Основные функции

- Создание и управление заказами мебели
- Система аукционов для мастеров
- Кошелек мастера с интеграцией Stripe
- Комиссионная система (5000₸ первый месяц, затем 3%)
- Автоматическое списание комиссий
- Защита от принятия заказов при неоплаченных комиссиях
- Профили мастеров с портфолио
- Административная панель

## Переменные окружения

### Server
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
```

### Client
```
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## База данных

Основные таблицы:
- users - пользователи
- master_profiles - профили мастеров
- orders - заказы
- order_bids - предложения мастеров
- commission_transactions - комиссии
- wallet_transactions - транзакции кошелька

## Лицензия

Proprietary
