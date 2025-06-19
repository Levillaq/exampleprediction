# 🚀 Деплой на GitHub

## 📋 Быстрый старт

### 1. Подготовка репозитория

```bash
# Инициализация Git (если еще не сделано)
git init
git add .
git commit -m "🎉 Initial commit: Prediction Bot"

# Создание репозитория на GitHub и подключение
git remote add origin https://github.com/YOUR_USERNAME/prediction-bot.git
git branch -M main
git push -u origin main
```

### 2. 🔧 Настройка переменных в GitHub

Перейдите в настройки репозитория:
```
Settings → Secrets and variables → Actions → New repository secret
```

Добавьте следующие секреты:

#### Для Railway:
- `RAILWAY_TOKEN` - получить в Railway Dashboard → Account → Tokens

#### Для Render:
- `RENDER_SERVICE_ID` - ID сервиса из URL в Render Dashboard
- `RENDER_API_KEY` - создать в Render Account Settings → API Keys

#### Для Heroku:
- `HEROKU_API_KEY` - получить в Heroku Account Settings → API Key
- `HEROKU_EMAIL` - ваш email в Heroku

### 3. 🐳 Автоматический деплой

После настройки секретов, каждый push в ветку `main` будет:

1. ✅ **Тестировать** backend код
2. 🐳 **Собирать** Docker образ
3. 📦 **Публиковать** в GitHub Container Registry
4. 🚀 **Деплоить** на выбранную платформу

## 📦 Использование Docker образов

### Локальный запуск

```bash
# Запуск всего проекта
docker-compose up -d

# Только backend
docker-compose up backend db

# Только telegram bot
docker-compose up telegram-bot backend db
```

### Запуск на сервере

```bash
# Скачивание последнего образа
docker pull ghcr.io/YOUR_USERNAME/prediction-bot/backend:latest

# Запуск с переменными окружения
docker run -d \
  --name prediction-bot-backend \
  -p 8000:8000 \
  -e DATABASE_URL="your_db_url" \
  -e SECRET_KEY="your_secret" \
  -e TELEGRAM_BOT_TOKEN="your_token" \
  ghcr.io/YOUR_USERNAME/prediction-bot/backend:latest
```

## 🔄 GitHub Actions Workflows

### deploy-backend.yml
- Тестирует код при каждом PR
- Деплоит на выбранную платформу при push в main
- Поддерживает Railway, Render, Heroku

### docker-backend.yml
- Собирает Docker образ при изменениях в папке backend
- Публикует в GitHub Container Registry
- Создает теги для версий и latest

## 🎯 Платформы деплоя

### 🚀 Railway (Рекомендуется)
- Бесплатный план: $5 в месяц кредитов
- Автоматический SSL
- Простая настройка
- Встроенная PostgreSQL

### 🎨 Render
- Бесплатный план для статических сайтов
- $7/месяц для веб-сервисов
- Автоматический SSL
- Встроенная PostgreSQL

### 🔵 Heroku
- Больше не предоставляет бесплатный план
- $5-7/месяц за dyno
- Множество аддонов
- Хорошая документация

## 📱 Настройка Telegram бота

После деплоя backend обновите настройки бота в BotFather:

```bash
# Установка Menu Button
/setmenubutton
@your_bot_name
🔮 Предсказания - https://your-frontend.web.app

# Установка домена (опционально)
/setdomain
@your_bot_name  
your-frontend.web.app
```

## ✅ Проверка деплоя

1. **Backend API**: `https://your-backend.platform.app/docs`
2. **Frontend**: `https://your-frontend.web.app`
3. **Telegram Bot**: найти бота и проверить команды
4. **Docker образ**: `ghcr.io/YOUR_USERNAME/prediction-bot/backend`

## 🐛 Отладка

### Просмотр логов GitHub Actions
```
Repository → Actions → выберите workflow → View logs
```

### Просмотр логов Docker контейнера
```bash
docker logs prediction-bot-backend
```

### Проверка переменных окружения
```bash
# В контейнере
docker exec -it prediction-bot-backend env

# Локально
echo $DATABASE_URL
```

## 🎉 Готово!

После настройки у вас будет полностью автоматизированный деплой:
- 🔄 Автоматические тесты и сборка
- 🐳 Docker образы в GitHub Registry
- 🚀 Деплой на выбранную платформу
- 📦 Готовый к масштабированию проект 