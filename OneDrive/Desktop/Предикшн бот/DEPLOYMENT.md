# 🚀 Деплой Предикшн Бота

## Подготовка к деплою

### 1. ✅ Проверка .env файлов

Убедитесь, что у вас есть файлы:
- `backend/.env`
- `telegram-bot/.env`

### 2. 🔧 Настройка .env файлов

#### backend/.env
```env
DATABASE_URL=postgresql://user:password@localhost:5432/prediction_bot
SECRET_KEY=your-super-secret-key-change-this-in-production
TELEGRAM_BOT_TOKEN=123456789:YOUR_BOT_TOKEN_HERE
API_HOST=0.0.0.0
API_PORT=8000
```

#### telegram-bot/.env
```env
TELEGRAM_BOT_TOKEN=123456789:YOUR_BOT_TOKEN_HERE
API_BASE_URL=http://localhost:8000
WEBAPP_URL=https://your-app.web.app
```

---

## 🐙 Деплой на GitHub

### 1. Инициализация Git репозитория
```bash
# В корне проекта
git init
git add .
git commit -m "🎉 Initial commit: Prediction Bot with XTR Stars"
```

### 2. Создание репозитория на GitHub
1. Идите на [github.com](https://github.com)
2. Нажмите "New repository"
3. Назовите: `prediction-bot`
4. Сделайте публичным или приватным
5. НЕ добавляйте README, .gitignore или лицензию (у нас уже есть)

### 3. Подключение и пуш
```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/prediction-bot.git
git branch -M main
git push -u origin main
```

---

## 🔥 Деплой Frontend на Firebase

### 1. Установка Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Авторизация
```bash
firebase login
```

### 3. Инициализация проекта
```bash
cd frontend
firebase init hosting
```

**Настройки при инициализации:**
- ✅ Use an existing project (если есть) или Create new project
- ✅ Public directory: `build`
- ✅ Configure as single-page app: `Yes`
- ✅ Set up automatic builds with GitHub: `No` (пока)
- ✅ Overwrite index.html: `No`

### 4. Настройка API URL
Создайте `frontend/.env`:
```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
```

### 5. Сборка и деплой
```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Деплой на Firebase
firebase deploy
```

### 6. Получение URL
После деплоя вы получите URL типа:
```
https://your-project-id.web.app
```

---

## ⚡ Деплой Backend на Railway/Render

### Вариант 1: Railway

#### 1. Регистрация на Railway
- Идите на [railway.app](https://railway.app)
- Войдите через GitHub

#### 2. Создание проекта
1. "New Project" → "Deploy from GitHub repo"
2. Выберите ваш репозиторий
3. Выберите папку `backend`

#### 3. Настройка переменных окружения
В Railway dashboard добавьте:
```env
DATABASE_URL=postgresql://user:password@host:port/db
SECRET_KEY=your-super-secret-key-production
TELEGRAM_BOT_TOKEN=123456789:YOUR_BOT_TOKEN
PORT=8000
```

#### 4. Настройка Procfile
Создайте `backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Вариант 2: Render

#### 1. Создание проекта на Render
- Идите на [render.com](https://render.com)
- "New" → "Web Service"
- Подключите GitHub репозиторий

#### 2. Настройки
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 🤖 Деплой Telegram бота

### Вариант 1: VPS/Сервер

#### 1. Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Python и pip
sudo apt install python3 python3-pip python3-venv -y

# Клонирование репозитория
git clone https://github.com/YOUR_USERNAME/prediction-bot.git
cd prediction-bot/telegram-bot
```

#### 2. Настройка окружения
```bash
# Создание виртуального окружения
python3 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt
```

#### 3. Настройка .env
```bash
nano .env
```
Добавьте:
```env
TELEGRAM_BOT_TOKEN=123456789:YOUR_BOT_TOKEN
API_BASE_URL=https://your-backend-url.railway.app
WEBAPP_URL=https://your-frontend.web.app
```

#### 4. Запуск с systemd
Создайте сервис:
```bash
sudo nano /etc/systemd/system/prediction-bot.service
```

```ini
[Unit]
Description=Prediction Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/prediction-bot/telegram-bot
Environment=PATH=/home/ubuntu/prediction-bot/telegram-bot/venv/bin
ExecStart=/home/ubuntu/prediction-bot/telegram-bot/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable prediction-bot
sudo systemctl start prediction-bot
sudo systemctl status prediction-bot
```

### Вариант 2: Docker

#### 1. Создание Dockerfile
`telegram-bot/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

#### 2. Docker Compose
`docker-compose.yml`:
```yaml
version: '3.8'
services:
  telegram-bot:
    build: ./telegram-bot
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - API_BASE_URL=${API_BASE_URL}
      - WEBAPP_URL=${WEBAPP_URL}
    restart: unless-stopped
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    restart: unless-stopped
```

---

## 🗄️ Настройка базы данных

### PostgreSQL (Рекомендуется)

#### 1. Бесплатные провайдеры
- [Supabase](https://supabase.com) - 500MB бесплатно
- [Neon](https://neon.tech) - 512MB бесплатно
- [Railway](https://railway.app) - PostgreSQL в комплекте

#### 2. Получение CONNECTION STRING
После создания БД получите строку типа:
```
postgresql://username:password@host:5432/database_name
```

#### 3. Обновление .env
```env
DATABASE_URL=postgresql://username:password@host:5432/database_name
```

---

## 🚀 Финальная настройка

### 1. Обновление URL в коде

#### Frontend (.env):
```env
REACT_APP_API_URL=https://your-backend.railway.app
```

#### Telegram Bot (.env):
```env
API_BASE_URL=https://your-backend.railway.app
WEBAPP_URL=https://your-frontend.web.app
```

### 2. Настройка Telegram бота

#### 1. BotFather команды:
```
/setdomain
@your_bot_name
your-frontend.web.app

/setmenubutton  
@your_bot_name
🔮 Открыть приложение - https://your-frontend.web.app
```

#### 2. Webhook (опционально):
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-bot-backend.railway.app/webhook"}'
```

---

## ✅ Проверка деплоя

### 1. Frontend
- ✅ Откройте https://your-frontend.web.app
- ✅ Попробуйте демо-вход
- ✅ Проверьте навигацию

### 2. Backend
- ✅ Откройте https://your-backend.railway.app/docs
- ✅ Проверьте API эндпоинты
- ✅ Тест подключения к БД

### 3. Telegram Bot
- ✅ Найдите бота в Telegram
- ✅ Отправьте /start
- ✅ Проверьте Web App кнопку
- ✅ Тест платежей (если есть тестовые XTR)

---

## 🐛 Отладка

### Логи Backend (Railway):
```bash
# В Railway dashboard
View Logs → Build Logs / Deploy Logs
```

### Логи Telegram Bot:
```bash
# На сервере
sudo journalctl -u prediction-bot -f

# Или в коде добавьте:
import logging
logging.basicConfig(level=logging.INFO)
```

### Частые ошибки:

#### ❌ CORS ошибки
Добавьте в backend/main.py:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.web.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### ❌ 404 на Firebase
Проверьте `firebase.json` rewrites

#### ❌ Bot не отвечает  
Проверьте TELEGRAM_BOT_TOKEN и логи

---

## 🎉 Готово!

После выполнения всех шагов у вас будет:

- 🌐 **Frontend**: https://your-project.web.app
- 🔗 **Backend API**: https://your-backend.railway.app  
- 🤖 **Telegram Bot**: @your_bot в Telegram
- 💾 **Database**: PostgreSQL в облаке

### Тестирование:
1. Откройте бота в Telegram
2. Нажмите /start
3. Откройте Web App
4. Выберите знак зодиака
5. Купите предсказание за 1 XTR Star
6. Проверьте рейтинг и историю

**Поздравляем! 🎊 Ваш Предикшн Бот готов к использованию!** 