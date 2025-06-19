#!/bin/bash

# 🚀 Скрипт автоматического деплоя Предикшн Бота
# Использование: ./deploy.sh [backend|frontend|bot|all]

set -e  # Остановка при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для красивого вывода
print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка зависимостей
check_dependencies() {
    print_step "Проверка зависимостей..."
    
    # Проверка Git
    if ! command -v git &> /dev/null; then
        print_error "Git не установлен!"
        exit 1
    fi
    
    # Проверка Node.js для frontend
    if [[ $DEPLOY_TARGET == "frontend" || $DEPLOY_TARGET == "all" ]]; then
        if ! command -v npm &> /dev/null; then
            print_error "Node.js/npm не установлен!"
            exit 1
        fi
    fi
    
    # Проверка Firebase CLI для frontend
    if [[ $DEPLOY_TARGET == "frontend" || $DEPLOY_TARGET == "all" ]]; then
        if ! command -v firebase &> /dev/null; then
            print_warning "Firebase CLI не установлен. Устанавливаю..."
            npm install -g firebase-tools
        fi
    fi
    
    # Проверка Python для бота
    if [[ $DEPLOY_TARGET == "bot" || $DEPLOY_TARGET == "all" ]]; then
        if ! command -v python3 &> /dev/null; then
            print_error "Python 3 не установлен!"
            exit 1
        fi
    fi
    
    print_success "Все зависимости установлены"
}

# Проверка переменных окружения
check_env() {
    print_step "Проверка переменных окружения..."
    
    if [[ -z "$TELEGRAM_BOT_TOKEN" ]]; then
        print_error "TELEGRAM_BOT_TOKEN не установлен!"
        print_warning "Создайте .env файл или установите переменную окружения"
        exit 1
    fi
    
    print_success "Переменные окружения проверены"
}

# Деплой Backend на GitHub
deploy_backend() {
    print_step "Деплой Backend на GitHub..."
    
    # Коммит и пуш изменений
    git add backend/
    git commit -m "🚀 Deploy backend updates" || print_warning "Нет изменений для коммита"
    git push origin main
    
    print_success "Backend отправлен на GitHub. Проверьте GitHub Actions для автоматического деплоя"
    print_warning "URL будет доступен после завершения деплоя в GitHub Actions"
}

# Деплой Frontend на Firebase
deploy_frontend() {
    print_step "Деплой Frontend на Firebase..."
    
    cd frontend
    
    # Установка зависимостей
    print_step "Установка зависимостей..."
    npm install
    
    # Сборка проекта
    print_step "Сборка React приложения..."
    npm run build
    
    # Проверка авторизации Firebase
    print_step "Проверка авторизации Firebase..."
    if ! firebase projects:list &> /dev/null; then
        print_warning "Необходима авторизация в Firebase"
        firebase login
    fi
    
    # Деплой на Firebase
    print_step "Деплой на Firebase Hosting..."
    firebase deploy --only hosting
    
    # Получение URL
    PROJECT_ID=$(firebase use --current 2>/dev/null | grep -o "prediction-bot-[a-z0-9]*" || echo "your-project")
    FRONTEND_URL="https://${PROJECT_ID}.web.app"
    
    cd ..
    
    print_success "Frontend задеплоен на Firebase!"
    print_success "URL: $FRONTEND_URL"
    
    # Сохранение URL для бота
    echo "WEBAPP_URL=$FRONTEND_URL" >> .env.temp
}

# Запуск Telegram бота
deploy_bot() {
    print_step "Настройка и запуск Telegram бота..."
    
    cd telegram-bot
    
    # Создание виртуального окружения если не существует
    if [ ! -d "venv" ]; then
        print_step "Создание виртуального окружения..."
        python3 -m venv venv
    fi
    
    # Активация виртуального окружения
    print_step "Активация виртуального окружения..."
    source venv/bin/activate || source venv/Scripts/activate  # Windows compatibility
    
    # Установка зависимостей
    print_step "Установка зависимостей Python..."
    pip install -r requirements.txt
    
    # Проверка .env файла
    if [ ! -f ".env" ]; then
        print_step "Создание .env файла для бота..."
        cat > .env << EOF
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
API_BASE_URL=${API_BASE_URL:-http://localhost:8000}
WEBAPP_URL=${WEBAPP_URL:-http://localhost:3000}
EOF
    fi
    
    # Обновление .env с новыми URL если есть
    if [ -f "../.env.temp" ]; then
        cat ../.env.temp >> .env
        rm ../.env.temp
    fi
    
    print_success "Telegram бот настроен!"
    print_warning "Для запуска бота выполните:"
    print_warning "cd telegram-bot && source venv/bin/activate && python main.py"
    
    cd ..
}

# Основная функция
main() {
    echo -e "${BLUE}"
    echo "🚀 ====================================="
    echo "   Предикшн Бот - Автодеплой"
    echo "===================================== 🚀"
    echo -e "${NC}"
    
    DEPLOY_TARGET=${1:-all}
    
    case $DEPLOY_TARGET in
        backend)
            print_step "Деплой только Backend..."
            check_dependencies
            deploy_backend
            ;;
        frontend)
            print_step "Деплой только Frontend..."
            check_dependencies
            deploy_frontend
            ;;
        bot)
            print_step "Настройка только Telegram бота..."
            check_dependencies
            check_env
            deploy_bot
            ;;
        all)
            print_step "Полный деплой всех компонентов..."
            check_dependencies
            check_env
            deploy_backend
            deploy_frontend
            deploy_bot
            ;;
        *)
            print_error "Неизвестная команда: $DEPLOY_TARGET"
            echo "Использование: ./deploy.sh [backend|frontend|bot|all]"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}"
    echo "🎉 ====================================="
    echo "   Деплой завершен успешно!"
    echo "===================================== 🎉"
    echo -e "${NC}"
    
    # Финальные инструкции
    echo -e "${YELLOW}📋 Следующие шаги:${NC}"
    echo "1. ✅ Backend: проверьте GitHub Actions"
    echo "2. ✅ Frontend: откройте URL Firebase"
    echo "3. ✅ Bot: запустите бота командой выше"
    echo "4. 🔧 Настройте @BotFather с новым WEBAPP_URL"
}

# Загрузка переменных окружения если есть .env
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Запуск основной функции
main "$@" 