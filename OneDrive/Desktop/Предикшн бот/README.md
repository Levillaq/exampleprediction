# 🔮 Предикшн бот - Веб-приложение для ежедневных предсказаний

## Описание проекта
Веб-приложение для получения ежедневных предсказаний с интеграцией платежей через Telegram с использованием валюты XTR⭐️ (Telegram Stars).

## Архитектура
- **Backend**: Python (FastAPI) + PostgreSQL
- **Frontend**: React.js + Firebase Hosting
- **Telegram Bot**: Python-Telegram-Bot с поддержкой XTR Stars
- **Payments**: Telegram Stars (XTR⭐️) - нативная валюта Telegram
- **Design**: Темно-фиолетовая тема с кристальным шаром 🔮

## Функциональность
- ✅ Профили пользователей с зодиакальными знаками
- ✅ Система платежей через Telegram Stars (XTR)
- ✅ Генерация предсказаний с привязкой к дате
- ✅ 24-часовой кулдаун после оплаты
- ✅ Рейтинговая система пользователей
- ✅ Адаптивный дизайн для desktop и mobile

## Особенности платежей XTR Stars
- **Без провайдера**: XTR Stars не требует `provider_token` - используется пустая строка
- **Минимальная цена**: 1 XTR Star за предсказание
- **Нативная интеграция**: Полная поддержка в Telegram Bot API
- **Безопасность**: Платежи обрабатываются непосредственно Telegram

## Структура проекта
```
Предикшн бот/
├── backend/              # FastAPI backend
│   ├── main.py          # Основное приложение FastAPI
│   ├── models.py        # SQLModel модели данных
│   ├── config.py        # Конфигурация приложения
│   ├── database.py      # Настройка базы данных
│   ├── auth.py          # Аутентификация JWT
│   ├── predictions.py   # Генерация предсказаний
│   ├── requirements.txt # Зависимости Python
│   └── README.md        # Документация backend
├── frontend/            # React.js приложение  
│   ├── src/
│   │   ├── pages/       # Страницы приложения
│   │   ├── components/  # React компоненты
│   │   ├── contexts/    # Context API
│   │   ├── services/    # API клиенты
│   │   └── index.css    # Темно-фиолетовые стили
│   ├── package.json     # Зависимости Node.js
│   └── firebase.json    # Конфигурация Firebase
├── telegram-bot/        # Telegram бот
│   ├── main.py          # Основной файл бота
│   ├── requirements.txt # Зависимости для бота
│   └── README.md        # Документация XTR Stars
└── README.md            # Этот файл

## Быстрый старт

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
```

### 3. Telegram Bot
```bash
cd telegram-bot
pip install -r requirements.txt
# Создайте .env с TELEGRAM_BOT_TOKEN
python main.py
```

## Ключевые технические решения

### XTR Stars Integration
- **Нет токена провайдера**: `provider_token=""` для XTR
- **Валюта**: `currency="XTR"` 
- **Цена**: Минимум 1 XTR Star
- **API**: Используется стандартный `send_invoice()`

### Backend API
- **FastAPI** с автоматической документацией OpenAPI
- **SQLModel** для типобезопасной работы с БД
- **JWT** аутентификация для Web App
- **PostgreSQL** для продакшена, SQLite для разработки

### Frontend
- **React 18** с хуками и Context API
- **React Query** для кеширования API запросов
- **Tailwind CSS** классы в пользовательских стилях
- **React Router** для навигации

### Design System
- **Цветовая палитра**: 9 оттенков фиолетового (purple-50 до purple-950)
- **Компоненты**: Карточки с blur эффектом и градиентами
- **Анимации**: Пульсация кристального шара, hover эффекты
- **Адаптивность**: Mobile-first подход

## Развертывание

### Backend
```bash
# Heroku
git push heroku main

# Docker
docker build -t prediction-bot-api .
docker run -p 8000:8000 prediction-bot-api
```

### Frontend
```bash
# Firebase
npm run build
firebase deploy

# Netlify
npm run build
# Drag & drop build/ folder
```

### Telegram Bot
```bash
# VPS/Cloud
python main.py

# Docker
docker build -t prediction-bot .
docker run -d prediction-bot
```

## Конфигурация

### Переменные окружения Backend
```env
DATABASE_URL=postgresql://user:pass@localhost/prediction_bot
SECRET_KEY=your-jwt-secret-key
TELEGRAM_BOT_TOKEN=your-bot-token
```

### Переменные окружения Frontend
```env
REACT_APP_API_URL=https://your-api.herokuapp.com
```

### Переменные окружения Bot
```env
TELEGRAM_BOT_TOKEN=123456789:YOUR_BOT_TOKEN
API_BASE_URL=https://your-api.herokuapp.com
WEBAPP_URL=https://your-app.web.app
```

## Мониторинг и логи

### Backend
- FastAPI автоматически создает `/docs` с Swagger UI
- Логирование через стандартный `logging` модуль
- Метрики через Prometheus (опционально)

### Telegram Bot
- Логирование всех платежей и ошибок
- Webhook для получения обновлений (продакшн)
- Polling для разработки

## Безопасность

### XTR Stars
- Проверка `payload` перед подтверждением платежа
- Валидация суммы и валюты
- Уникальные `payment_id` для каждой транзакции

### API
- JWT токены с истечением
- CORS настройки для фронтенда
- Rate limiting (рекомендуется)

### Данные
- Хеширование паролей (если используются)
- Шифрование чувствительных данных
- Регулярные бэкапы базы данных

## Лицензия
MIT License - см. LICENSE файл для деталей.иложение
├── telegram-bot/     # Telegram бот
├── database/         # SQL схемы и миграции
└── docs/            # Документация
```

## Быстрый старт
1. Клонируйте репозиторий
2. Настройте backend (см. backend/README.md)
3. Настройте frontend (см. frontend/README.md) 
4. Настройте Telegram бот (см. telegram-bot/README.md)
5. Запустите все сервисы

## Технологии
- **Backend**: FastAPI, SQLModel, PostgreSQL, Uvicorn
- **Frontend**: React.js, Firebase, Axios
- **Bot**: python-telegram-bot
- **Styling**: CSS3 с темно-фиолетовой темой 