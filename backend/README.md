# 🔮 Backend - Prediction Bot API

FastAPI backend для веб-приложения ежедневных предсказаний с интеграцией платежей через Telegram.

## Технологии
- **FastAPI** - веб-фреймворк
- **SQLModel** - ORM для работы с базой данных
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **python-telegram-bot** - интеграция с Telegram

## Установка и запуск

### 1. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне папки backend:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prediction_bot

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook
TELEGRAM_PAYMENT_PROVIDER_TOKEN=your_payment_provider_token

# Application
APP_NAME=🔮 Prediction Bot
DEBUG=true

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### 3. Настройка базы данных

#### Установка PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
```

#### Создание базы данных
```sql
sudo -u postgres psql
CREATE DATABASE prediction_bot;
CREATE USER prediction_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE prediction_bot TO prediction_user;
\q
```

### 4. Запуск сервера
```bash
# Режим разработки
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Или через Python
python -m uvicorn main:app --reload
```

Сервер будет доступен по адресу: http://localhost:8000

## API Документация

После запуска сервера документация API будет доступна по адресам:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Основные эндпоинты

### Пользователи
- `POST /users/` - Создание пользователя
- `GET /users/me` - Получение профиля
- `PATCH /users/me` - Обновление профиля
- `GET /users/rankings` - Рейтинг пользователей

### Предсказания
- `GET /predictions/` - Все предсказания пользователя
- `GET /predictions/today` - Предсказание на сегодня
- `GET /predictions/can-purchase` - Проверка возможности покупки

### Платежи
- `POST /payments/create-invoice` - Создание инвойса
- `POST /payments/{payment_id}/confirm` - Подтверждение платежа

### Зодиакальные знаки
- `GET /zodiac-signs` - Список всех знаков

## Структура проекта

```
backend/
├── main.py              # Основное приложение FastAPI
├── models.py            # SQLModel модели
├── database.py          # Конфигурация БД
├── config.py            # Настройки приложения
├── auth.py              # Аутентификация
├── predictions.py       # Генерация предсказаний
├── requirements.txt     # Зависимости
└── README.md           # Документация
```

## Аутентификация

API использует JWT токены для аутентификации. Для доступа к защищённым эндпоинтам необходимо:

1. Получить токен через Telegram бота
2. Добавить заголовок: `Authorization: Bearer <token>`

## Модели данных

### User
- `id` - уникальный идентификатор
- `first_name` - имя пользователя
- `telegram_id` - ID в Telegram
- `zodiac_sign` - знак зодиака
- `predictions_count` - количество купленных предсказаний

### Prediction
- `id` - уникальный идентификатор
- `user_id` - ID пользователя
- `zodiac_sign` - знак зодиака
- `prediction_text` - текст предсказания
- `prediction_date` - дата предсказания

### Payment
- `id` - уникальный идентификатор
- `user_id` - ID пользователя
- `amount` - сумма (в XTR Stars)
- `currency` - валюта (XTR)
- `status` - статус платежа

## Разработка

### Запуск в режиме разработки
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Создание миграций (если используете Alembic)
```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Тестирование API
Используйте Swagger UI по адресу http://localhost:8000/docs для тестирования эндпоинтов.

## Деплой

### Переменные окружения для продакшена
- Измените `SECRET_KEY` на криптографически стойкий ключ
- Настройте `DATABASE_URL` для продакшен базы данных
- Укажите реальные `CORS_ORIGINS`
- Установите `DEBUG=false`

### Docker (опционально)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
``` 