# 🚀 PowerShell скрипт автоматического деплоя Предикшн Бота
# Использование: .\deploy.ps1 [backend|frontend|bot|all]

param(
    [string]$Target = "all"
)

# Функции для красивого вывода
function Write-Step {
    param([string]$Message)
    Write-Host "🔄 $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Проверка зависимостей
function Test-Dependencies {
    Write-Step "Проверка зависимостей..."
    
    # Проверка Git
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "Git не установлен!"
        exit 1
    }
    
    # Проверка Node.js для frontend
    if ($Target -eq "frontend" -or $Target -eq "all") {
        if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
            Write-Error "Node.js/npm не установлен!"
            exit 1
        }
    }
    
    # Проверка Firebase CLI для frontend
    if ($Target -eq "frontend" -or $Target -eq "all") {
        if (!(Get-Command firebase -ErrorAction SilentlyContinue)) {
            Write-Warning "Firebase CLI не установлен. Устанавливаю..."
            npm install -g firebase-tools
        }
    }
    
    # Проверка Python для бота
    if ($Target -eq "bot" -or $Target -eq "all") {
        if (!(Get-Command python -ErrorAction SilentlyContinue)) {
            Write-Error "Python не установлен!"
            exit 1
        }
    }
    
    Write-Success "Все зависимости установлены"
}

# Проверка переменных окружения
function Test-Environment {
    Write-Step "Проверка переменных окружения..."
    
    if (-not $env:TELEGRAM_BOT_TOKEN) {
        Write-Error "TELEGRAM_BOT_TOKEN не установлен!"
        Write-Warning "Создайте .env файл или установите переменную окружения"
        exit 1
    }
    
    Write-Success "Переменные окружения проверены"
}

# Деплой Backend на GitHub
function Deploy-Backend {
    Write-Step "Деплой Backend на GitHub..."
    
    try {
        git add backend/
        git commit -m "🚀 Deploy backend updates"
    }
    catch {
        Write-Warning "Нет изменений для коммита"
    }
    
    git push origin main
    
    Write-Success "Backend отправлен на GitHub. Проверьте GitHub Actions для автоматического деплоя"
    Write-Warning "URL будет доступен после завершения деплоя в GitHub Actions"
}

# Деплой Frontend на Firebase
function Deploy-Frontend {
    Write-Step "Деплой Frontend на Firebase..."
    
    Push-Location frontend
    
    try {
        # Установка зависимостей
        Write-Step "Установка зависимостей..."
        npm install
        
        # Сборка проекта
        Write-Step "Сборка React приложения..."
        npm run build
        
        # Проверка авторизации Firebase
        Write-Step "Проверка авторизации Firebase..."
        try {
            firebase projects:list | Out-Null
        }
        catch {
            Write-Warning "Необходима авторизация в Firebase"
            firebase login
        }
        
        # Деплой на Firebase
        Write-Step "Деплой на Firebase Hosting..."
        firebase deploy --only hosting
        
        # Получение URL
        $projectId = firebase use --current 2>$null
        if ($projectId -match "prediction-bot-[a-z0-9]*") {
            $frontendUrl = "https://$($matches[0]).web.app"
        } else {
            $frontendUrl = "https://your-project.web.app"
        }
        
        Write-Success "Frontend задеплоен на Firebase!"
        Write-Success "URL: $frontendUrl"
        
        # Сохранение URL для бота
        "WEBAPP_URL=$frontendUrl" | Out-File -FilePath "../.env.temp" -Encoding UTF8
    }
    finally {
        Pop-Location
    }
}

# Запуск Telegram бота
function Deploy-Bot {
    Write-Step "Настройка и запуск Telegram бота..."
    
    Push-Location telegram-bot
    
    try {
        # Создание виртуального окружения если не существует
        if (!(Test-Path "venv")) {
            Write-Step "Создание виртуального окружения..."
            python -m venv venv
        }
        
        # Активация виртуального окружения
        Write-Step "Активация виртуального окружения..."
        & "venv\Scripts\Activate.ps1"
        
        # Установка зависимостей
        Write-Step "Установка зависимостей Python..."
        pip install -r requirements.txt
        
        # Проверка .env файла
        if (!(Test-Path ".env")) {
            Write-Step "Создание .env файла для бота..."
            $envContent = @"
TELEGRAM_BOT_TOKEN=$env:TELEGRAM_BOT_TOKEN
API_BASE_URL=$($env:API_BASE_URL ?? "http://localhost:8000")
WEBAPP_URL=$($env:WEBAPP_URL ?? "http://localhost:3000")
"@
            $envContent | Out-File -FilePath ".env" -Encoding UTF8
        }
        
        # Обновление .env с новыми URL если есть
        if (Test-Path "../.env.temp") {
            Get-Content "../.env.temp" | Add-Content ".env"
            Remove-Item "../.env.temp"
        }
        
        Write-Success "Telegram бот настроен!"
        Write-Warning "Для запуска бота выполните:"
        Write-Warning "cd telegram-bot; .\venv\Scripts\Activate.ps1; python main.py"
    }
    finally {
        Pop-Location
    }
}

# Основная функция
function Main {
    Write-Host "🚀 =====================================" -ForegroundColor Blue
    Write-Host "   Предикшн Бот - Автодеплой" -ForegroundColor Blue
    Write-Host "===================================== 🚀" -ForegroundColor Blue
    
    switch ($Target) {
        "backend" {
            Write-Step "Деплой только Backend..."
            Test-Dependencies
            Deploy-Backend
        }
        "frontend" {
            Write-Step "Деплой только Frontend..."
            Test-Dependencies
            Deploy-Frontend
        }
        "bot" {
            Write-Step "Настройка только Telegram бота..."
            Test-Dependencies
            Test-Environment
            Deploy-Bot
        }
        "all" {
            Write-Step "Полный деплой всех компонентов..."
            Test-Dependencies
            Test-Environment
            Deploy-Backend
            Deploy-Frontend
            Deploy-Bot
        }
        default {
            Write-Error "Неизвестная команда: $Target"
            Write-Host "Использование: .\deploy.ps1 [backend|frontend|bot|all]"
            exit 1
        }
    }
    
    Write-Host "🎉 =====================================" -ForegroundColor Green
    Write-Host "   Деплой завершен успешно!" -ForegroundColor Green
    Write-Host "===================================== 🎉" -ForegroundColor Green
    
    # Финальные инструкции
    Write-Warning "📋 Следующие шаги:"
    Write-Host "1. ✅ Backend: проверьте GitHub Actions"
    Write-Host "2. ✅ Frontend: откройте URL Firebase"
    Write-Host "3. ✅ Bot: запустите бота командой выше"
    Write-Host "4. 🔧 Настройте @BotFather с новым WEBAPP_URL"
}

# Загрузка переменных окружения если есть .env
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Запуск основной функции
Main 