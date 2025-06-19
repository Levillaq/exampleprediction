# 🚀 Быстрый Старт - Предикшн Бот

## 📋 За 5 минут до полного деплоя

### 1. 🔑 Подготовка

#### Получите токен бота:
1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Сохраните токен (выглядит как `123456789:ABC-DEF1234ghIkl...`)

#### Создайте .env файл:
```bash
# В корне проекта
echo "TELEGRAM_BOT_TOKEN=ваш_токен_здесь" > .env
```

### 2. 🚀 Автоматический деплой

#### Вариант A: Полный автодеплой (рекомендуется)
```bash
# Linux/macOS
chmod +x deploy.sh
./deploy.sh all

# Windows
.\deploy.ps1 all
```

#### Вариант B: Пошаговый деплой
```bash
# 1. Backend на GitHub
./deploy.sh backend

# 2. Frontend на Firebase  
./deploy.sh frontend

# 3. Настройка бота
./deploy.sh bot
```

### 3. ✅ Проверка

После деплоя:
1. **Backend**: проверьте GitHub Actions
2. **Frontend**: откройте URL из Firebase
3. **Bot**: запустите команду из вывода скрипта

### 4. 🔧 Настройка бота

В [@BotFather](https://t.me/BotFather):
```
/setmenubutton
@ваш_бот
🔮 Предсказания - https://ваш-проект.web.app
```

## 🛠️ Ручная настройка

### Если что-то пошло не так:

#### Backend (GitHub + Railway/Render):
```bash
# 1. Отправить код на GitHub
git add .
git commit -m "🚀 Deploy"
git push origin main

# 2. Настроить секреты в GitHub:
# Settings → Secrets → RAILWAY_TOKEN
```

#### Frontend (Firebase):
```bash
cd frontend
npm install
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

#### Telegram Bot:
```bash
cd telegram-bot
python -m venv venv
source venv/bin/activate  # Linux/macOS
# или
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python main.py
```

## 🔄 GitHub Secrets

Добавьте в `Settings → Secrets and variables → Actions`:

### Обязательные:
- `TELEGRAM_BOT_TOKEN` - токен вашего бота

### Для Firebase (выберите один способ):
- `FIREBASE_SERVICE_ACCOUNT` - JSON ключ сервисного аккаунта
- `FIREBASE_PROJECT_ID` - ID проекта Firebase

**ИЛИ**
- `FIREBASE_TOKEN` - токен из `firebase login:ci`

### Для Backend (выберите платформу):
- `RAILWAY_TOKEN` - для Railway
- `RENDER_SERVICE_ID` + `RENDER_API_KEY` - для Render
- `HEROKU_API_KEY` + `HEROKU_EMAIL` - для Heroku

### Опционально:
- `BACKEND_URL` - URL вашего backend API

## 🎯 Результат

После успешного деплоя у вас будет:
- 🤖 **Telegram бот** - принимает команды
- 🌐 **Web App** - красивый интерфейс
- 🔗 **API Backend** - обрабатывает запросы
- 💾 **База данных** - хранит данные
- 🚀 **Автодеплой** - обновления по push в GitHub

## 🆘 Помощь

### Частые ошибки:

#### ❌ "Firebase project not found"
```bash
cd frontend
firebase projects:list
firebase use --add
```

#### ❌ "TELEGRAM_BOT_TOKEN not set"
```bash
# Проверьте .env файл
cat .env
# Или установите переменную
export TELEGRAM_BOT_TOKEN="ваш_токен"
```

#### ❌ "Git not found"
Установите [Git](https://git-scm.com/downloads)

#### ❌ "npm not found"  
Установите [Node.js](https://nodejs.org/)

#### ❌ "python not found"
Установите [Python](https://python.org/)

### 📞 Поддержка

1. Проверьте логи GitHub Actions
2. Убедитесь, что все секреты добавлены
3. Перезапустите деплой скрипт
4. Проверьте .env файлы

## 🎉 Готово!

Теперь ваш Предикшн Бот работает в облаке! 
Пользователи могут получать ежедневные предсказания за XTR Stars! ⭐️ 