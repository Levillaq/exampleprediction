# 🔮 Telegram Bot - Предикшн Бот

Telegram бот для обработки платежей в XTR Stars и выдачи предсказаний.

## Особенности XTR Stars

### Что такое XTR Stars?
- **XTR Stars** - нативная валюта Telegram для платежей в боте
- Пользователи покупают Stars в настройках Telegram
- Боты принимают Stars без сторонних платежных провайдеров

### Преимущества XTR Stars
- ✅ **Без комиссий** для разработчиков
- ✅ **Простая интеграция** - не нужен `provider_token`
- ✅ **Мгновенные платежи** через Telegram
- ✅ **Безопасность** - обработка платежей Telegram

## Настройка

### 1. Создание бота
```bash
# Создайте бота через @BotFather
# Получите TOKEN и добавьте в .env
```

### 2. Переменные окружения
Создайте файл `.env`:

```env
# Обязательные
TELEGRAM_BOT_TOKEN=your_bot_token_here
API_BASE_URL=http://localhost:8000

# Опциональные
WEBAPP_URL=https://your-webapp-url.com
```

### 3. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 4. Запуск бота
```bash
python main.py
```

## Интеграция XTR Stars

### Создание инвойса
```python
await context.bot.send_invoice(
    chat_id=chat_id,
    title="🔮 Персональное предсказание",
    description="Получите уникальное предсказание на сегодня",
    payload=f"prediction_payment_{payment_id}",
    provider_token="",  # Пустой для XTR Stars!
    currency="XTR",     # Telegram Stars
    prices=[LabeledPrice("Предсказание", 1)],  # 1 XTR Star
)
```

### Обработка платежа
```python
async def successful_payment_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    payment = update.message.successful_payment
    # payment.telegram_payment_charge_id - ID транзакции
    # payment.invoice_payload - payload для идентификации
```

## Команды бота

- `/start` - Запуск бота и регистрация
- `/help` - Справка по использованию
- `/profile` - Просмотр профиля пользователя
- `/prediction` - Получить предсказание (с оплатой)
- `/rankings` - Рейтинг пользователей

## API Integration

Бот взаимодействует с FastAPI backend:

- `POST /users/` - Регистрация пользователя
- `GET /users/by-telegram-id/{user_id}` - Получение данных пользователя
- `GET /predictions/can-purchase` - Проверка возможности покупки
- `POST /payments/create-invoice` - Создание платежа
- `POST /payments/{payment_id}/confirm` - Подтверждение платежа

## Безопасность

### Проверка платежей
- Проверяйте `payload` в `pre_checkout_query`
- Валидируйте существование платежа в базе данных
- Сверяйте сумму и валюту

### Пример проверки
```python
async def pre_checkout_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.pre_checkout_query
    
    # Проверяем payload
    if not query.invoice_payload.startswith("prediction_payment_"):
        await query.answer(ok=False, error_message="Неверный тип платежа")
        return
    
    # Проверяем существование платежа
    payment_id = query.invoice_payload.replace("prediction_payment_", "")
    payment_exists = await self.verify_payment(payment_id)
    
    if not payment_exists:
        await query.answer(ok=False, error_message="Платеж не найден")
        return
    
    await query.answer(ok=True)
```

## Отладка

### Логирование
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

### Обработка ошибок
- Все ошибки логируются в `error_handler`
- API ошибки обрабатываются в try-catch блоках
- Пользователю показываются понятные сообщения

## Деплой

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  telegram-bot:
    build: .
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - API_BASE_URL=${API_BASE_URL}
    restart: unless-stopped
``` 