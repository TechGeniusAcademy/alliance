# Серверная часть - API для аутентификации

## Установка PostgreSQL

1. Установите PostgreSQL на ваш компьютер
2. Убедитесь, что PostgreSQL запущен

⚡ **Автоматическое создание базы данных**

База данных и таблицы создаются автоматически при первом запуске сервера!
Вам нужно только:
- Установить PostgreSQL
- Настроить параметры подключения в `.env`

## Настройка

1. Скопируйте `.env` и настройте параметры подключения к базе данных:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=auth_db
DB_PASSWORD=ваш_пароль
DB_PORT=5432
JWT_SECRET=ваш_секретный_ключ
```

2. Установите зависимости:

```bash
npm install
```

## Запуск

Режим разработки (с автоперезагрузкой):

```bash
npm run dev
```

Продакшн:

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/auth/register
Регистрация нового пользователя

Request body:
```json
{
  "name": "Имя",
  "email": "email@example.com",
  "password": "пароль"
}
```

### POST /api/auth/login
Вход пользователя

Request body:
```json
{
  "email": "email@example.com",
  "password": "пароль"
}
```

### GET /api/health
Проверка состояния сервера и подключения к базе данных
