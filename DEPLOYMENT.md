# Инструкция по развертыванию проекта Alliance на VPS

## Системные требования
- Ubuntu 20.04 / 22.04 или Debian 11+
- Минимум 2GB RAM
- 20GB свободного места на диске
- Root или sudo доступ

---

## 1. Обновление системы и установка базового ПО

```bash
# Обновление пакетов
sudo apt update && sudo apt upgrade -y

# Установка базовых утилит
sudo apt install -y curl wget git build-essential
```

---

## 2. Установка Node.js 18+

```bash
# Добавление репозитория Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Установка Node.js и npm
sudo apt install -y nodejs

# Проверка версий
node -v
npm -v
```

**Ожидаемый результат:**
```
v18.x.x
9.x.x
```

---

## 3. Установка и настройка PostgreSQL

```bash
# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Запуск и автозапуск
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Вход в PostgreSQL
sudo -u postgres psql
```

### Внутри PostgreSQL выполнить:

```sql
CREATE DATABASE alliance_db;
CREATE USER alliance_user WITH PASSWORD '00000000';
GRANT ALL PRIVILEGES ON DATABASE alliance_db TO alliance_user;
ALTER DATABASE alliance_db OWNER TO alliance_user;
\q
```

**⚠️ ВАЖНО:** Запомните пароль, он понадобится в .env файле!

---

## 4. Клонирование проекта из GitHub

```bash
# Создание директории для проектов
sudo mkdir -p /var/www
cd /var/www

# Клонирование репозитория (замените на ваш URL)
sudo git clone https://github.com/TechGeniusAcademy/alliance.git

# ВАЖНО! Установка прав доступа на весь проект
sudo chown -R $USER:$USER alliance
cd alliance
```

---

## 5. Настройка Backend (Server)

```bash
cd /var/www/alliance/server

# ВАЖНО: Исправляем права доступа (если клонировали с sudo)
sudo chown -R $USER:$USER /var/www/alliance

# Создание .env файла
nano .env
```

### Содержимое файла .env:

```env
PORT=5000
DB_USER=alliance_user
DB_HOST=localhost
DB_NAME=alliance_db
DB_PASSWORD=00000000
DB_PORT=5432
JWT_SECRET=f79a46e7f26b363c8b07b18111f44b285f930d51ce86a033640a0133f8d3d062
```

**Для генерации JWT_SECRET можно использовать:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Сохранить файл:** `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Установка зависимостей
npm install

# Сборка TypeScript
npm run build

# Проверка, что все скомпилировалось
ls dist/
```

---

## 6. Установка PM2 для управления Node.js процессом

```bash
# Глобальная установка PM2
sudo npm install -g pm2

# Запуск сервера через PM2
cd /var/www/alliance/server
pm2 start dist/index.js --name alliance-server

# Просмотр логов
pm2 logs alliance-server --lines 50

# Если все OK, сохраняем конфигурацию
pm2 save

# Настройка автозапуска при перезагрузке сервера
pm2 startup
```

**⚠️ ВАЖНО:** PM2 выведет команду типа:
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```
**Скопируйте и выполните эту команду!**

---

## 7. Настройка Frontend (Client)

```bash
cd /var/www/alliance/client

# Создание .env файла
nano .env
```

### Содержимое .env:

```env
VITE_API_URL=http://YOUR_SERVER_IP:5000
```

**⚠️ Замените YOUR_SERVER_IP на:**
- IP адрес сервера: `VITE_API_URL=http://123.45.67.89:5000`
- Или домен: `VITE_API_URL=http://alliancemebel.kz:5000`

**Сохранить:** `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Установка зависимостей
npm install

# Сборка production версии
npm run build

# Проверка, что сборка прошла успешно
ls dist/
```

---

## 8. Установка и настройка Nginx

```bash
# Установка Nginx
sudo apt install -y nginx

# Создание конфигурации для проекта
sudo nano /etc/nginx/sites-available/alliance
```

### Содержимое конфигурации Nginx:

```nginx
server {
    listen 80;
    server_name alliancemebel.kz www.alliancemebel.kz;
    # Если используете только IP, замените на: server_name ваш_IP_адрес;

    client_max_body_size 50M;

    # Frontend - React приложение
    location / {
        root /var/www/alliance/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads (3D модели, изображения)
    location /uploads {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Сохранить:** `Ctrl+O`, `Enter`, `Ctrl+X`

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/alliance /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации на ошибки
sudo nginx -t

# Если все OK, перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 9. Настройка Firewall (UFW)

```bash
# Установка UFW (обычно уже установлен)
sudo apt install -y ufw

# ОБЯЗАТЕЛЬНО! Разрешение SSH перед включением firewall
sudo ufw allow OpenSSH
sudo ufw allow 22/tcp

# Разрешение HTTP и HTTPS
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включение firewall
sudo ufw enable

# Проверка статуса
sudo ufw status
```

**Ожидаемый вывод:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
```

---

## 10. Проверка работы всех сервисов

```bash
# Проверка PostgreSQL
sudo systemctl status postgresql

# Проверка Nginx
sudo systemctl status nginx

# Проверка Node.js сервера через PM2
pm2 status
pm2 logs alliance-server --lines 20

# Проверка открытых портов
sudo netstat -tulpn | grep -E ':(80|5000|5432)'
```

### Ручное тестирование:

```bash
# Тест API локально
curl http://localhost:5000/api/health

# Тест фронтенда локально
curl http://localhost/

# Проверка, что база данных создалась
sudo -u postgres psql -d alliance_db -c "\dt"
```

---

## 11. Тестирование из браузера

Откройте браузер и перейдите по адресу:
- `http://ваш_IP_адрес` или
- `http://alliancemebel.kz`

Вы должны увидеть главную страницу Alliance.

---

## 12. Установка SSL сертификата (Let's Encrypt) - ОПЦИОНАЛЬНО

**⚠️ Требуется:**
- Зарегистрированный домен
- DNS настроен на ваш сервер
- Порты 80 и 443 открыты

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d alliancemebel.kz -d www.alliancemebel.kz

# Следуйте инструкциям Certbot (введите email, согласитесь с условиями)

# Проверка автоматического обновления
sudo certbot renew --dry-run
```

После установки SSL, сайт будет доступен по `https://alliancemebel.kz`

---

## 13. Обновление .env файла клиента для HTTPS

Если установили SSL, обновите:

```bash
nano /var/www/alliance/client/.env
```

Измените на:
```env
VITE_API_URL=https://alliancemebel.kz/api
```

Затем пересоберите клиент:
```bash
cd /var/www/alliance/client
npm run build
```

---

## 14. Полезные команды для управления

### Управление PM2:
```bash
# Просмотр логов
pm2 logs alliance-server

# Перезапуск сервера
pm2 restart alliance-server

# Остановка сервера
pm2 stop alliance-server

# Запуск сервера
pm2 start alliance-server

# Мониторинг в реальном времени
pm2 monit
```

### Обновление проекта после изменений в Git:
```bash
cd /var/www/alliance

# Получение изменений
git pull origin main

# Обновление backend
cd server
npm install
npm run build
pm2 restart alliance-server

# Обновление frontend
cd ../client
npm install
npm run build
```

### Просмотр логов Nginx:
```bash
# Логи ошибок
sudo tail -f /var/log/nginx/error.log

# Логи доступа
sudo tail -f /var/log/nginx/access.log
```

### Перезапуск Nginx:
```bash
sudo systemctl restart nginx
```

---

## 15. Резервное копирование базы данных

### Создание бэкапа:
```bash
# Создать директорию для бэкапов
mkdir -p ~/backups

# Создать дамп базы данных
sudo -u postgres pg_dump alliance_db > ~/backups/alliance_db_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа:
```bash
# Удалить существующую БД (ОСТОРОЖНО!)
sudo -u postgres psql -c "DROP DATABASE alliance_db;"

# Создать заново
sudo -u postgres psql -c "CREATE DATABASE alliance_db;"

# Восстановить из файла
sudo -u postgres psql alliance_db < ~/backups/alliance_db_YYYYMMDD_HHMMSS.sql
```

---

## Troubleshooting (Решение проблем)

### Проблема: Сервер не запускается
```bash
# Проверить логи
pm2 logs alliance-server --lines 100

# Проверить .env файл
cat /var/www/alliance/server/.env

# Проверить подключение к БД
sudo -u postgres psql -d alliance_db -c "SELECT version();"
```

### Проблема: 502 Bad Gateway в Nginx
```bash
# Проверить, работает ли Node.js сервер
pm2 status

# Проверить логи Nginx
sudo tail -f /var/log/nginx/error.log

# Перезапустить PM2
pm2 restart alliance-server
```

### Проблема: Cannot connect to database
```bash
# Проверить статус PostgreSQL
sudo systemctl status postgresql

# Проверить, слушает ли PostgreSQL на порту 5432
sudo netstat -tulpn | grep 5432

# Перезапустить PostgreSQL
sudo systemctl restart postgresql
```

### Проблема: Permission denied при создании/редактировании файлов
```bash
# Ошибка: [ Error writing .env: Permission denied ]

# Решение: Изменить владельца всей директории проекта
sudo chown -R $USER:$USER /var/www/alliance

# Проверить, что права изменились
ls -la /var/www/alliance

# Теперь можно создавать/редактировать файлы без sudo
nano /var/www/alliance/server/.env
```

### Проблема: Permission denied при загрузке файлов
```bash
# Создать директорию uploads и дать права
cd /var/www/alliance/server
mkdir -p uploads/3d-models
sudo chown -R $USER:$USER uploads
chmod -R 755 uploads
```

### Проблема: Ошибка при клонировании Git (RPC failed, Connection reset)
```bash
# Ошибка: error: RPC failed; curl 56 Recv failure: Connection reset by peer

# Решение 1: Увеличить буфер Git
git config --global http.postBuffer 524288000
sudo git clone https://github.com/TechGeniusAcademy/alliance.git

# Решение 2: Клонировать только последнюю версию (РЕКОМЕНДУЕТСЯ)
sudo git clone --depth 1 https://github.com/TechGeniusAcademy/alliance.git

# Решение 3: Если не помогло, попробуйте несколько раз
sudo git clone https://github.com/TechGeniusAcademy/alliance.git
```

**Примечание:** Клонирование с `--depth 1` создает "мелкую" копию без истории коммитов, что быстрее и надежнее для production деплоя.

---

## Информация о безопасности

1. **Смените пароль PostgreSQL** на сложный
2. **JWT_SECRET** должен быть длинным и случайным
3. **Регулярно обновляйте** систему: `sudo apt update && sudo apt upgrade`
4. **Настройте backup** базы данных (например, через cron)
5. **Используйте SSH ключи** вместо паролей
6. **Включите fail2ban** для защиты от брутфорса:
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   ```

---

## Контакты и поддержка

Если возникли проблемы:
1. Проверьте логи: `pm2 logs`, `sudo tail -f /var/log/nginx/error.log`
2. Убедитесь, что все сервисы запущены: `pm2 status`, `sudo systemctl status nginx postgresql`
3. Проверьте firewall: `sudo ufw status`

---

**Успешного развертывания! 🚀**
