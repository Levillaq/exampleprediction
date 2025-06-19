import asyncio
import logging
import os
from datetime import datetime
from typing import Optional

from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup, LabeledPrice, PreCheckoutQuery
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, PreCheckoutQueryHandler, filters, ContextTypes
import httpx

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Конфигурация
BOT_TOKEN = os.getenv('8115467392:AAEBC0OjwqL9Lv80eUu6CsqeNzTWJXh-mbA')
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://exampleprediction.web.app')
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8000')
PAYMENT_PROVIDER_TOKEN = os.getenv('TELEGRAM_PAYMENT_PROVIDER_TOKEN')

class PredictionBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
    
    def setup_handlers(self):
        """Настройка обработчиков команд и сообщений"""
        # Команды
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("profile", self.profile_command))
        self.application.add_handler(CommandHandler("prediction", self.prediction_command))
        self.application.add_handler(CommandHandler("rankings", self.rankings_command))
        
        # Callback queries (нажатия на кнопки)
        self.application.add_handler(CallbackQueryHandler(self.button_callback))
        
        # Платежи
        self.application.add_handler(PreCheckoutQueryHandler(self.pre_checkout_callback))
        
        # Обработка успешных платежей
        self.application.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, self.successful_payment_callback))
        
        # Обработка ошибок
        self.application.add_error_handler(self.error_handler)

    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка команды /start"""
        user = update.effective_user
        
        # Регистрируем пользователя в базе данных
        await self.register_user(user)
        
        # Создаем клавиатуру с Web App
        keyboard = [
            [InlineKeyboardButton(
                "🔮 Открыть приложение", 
                web_app=WebAppInfo(url=WEBAPP_URL)
            )],
            [InlineKeyboardButton("💫 Получить предсказание", callback_data="get_prediction")],
            [InlineKeyboardButton("👤 Профиль", callback_data="profile")],
            [InlineKeyboardButton("🏆 Рейтинг", callback_data="rankings")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        welcome_text = f"""
🔮 *Добро пожаловать в Предикшн Бот!*

Привет, {user.first_name}! 

Я помогу тебе получать персональные предсказания каждый день, основанные на твоем знаке зодиака.

✨ *Что я умею:*
• Создавать уникальные предсказания для каждого знака зодиака
• Принимать платежи в Telegram Stars (XTR ⭐️)
• Показывать рейтинг самых активных пользователей
• Сохранять историю всех твоих предсказаний

💰 *Стоимость:* 1 XTR Star за предсказание
⏰ *Ограничение:* 1 предсказание в день

Нажми кнопку ниже, чтобы начать!
        """
        
        await update.message.reply_text(
            welcome_text,
            parse_mode='Markdown',
            reply_markup=reply_markup
        )

    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка команды /help"""
        help_text = """
🔮 *Справка по Предикшн Боту*

*Команды:*
/start - Запуск бота и главное меню
/help - Эта справка
/profile - Посмотреть свой профиль
/prediction - Получить предсказание на сегодня
/rankings - Посмотреть рейтинг пользователей

*Как это работает:*
1. Выбери свой знак зодиака в профиле
2. Купи предсказание за 1 XTR Star
3. Получи персональное предсказание на сегодня
4. Жди до завтра для следующего предсказания

*Оплата:*
Принимаются только Telegram Stars (XTR ⭐️)
Стоимость: 1 XTR за предсказание

*Поддержка:* @your_support_username
        """
        
        await update.message.reply_text(help_text, parse_mode='Markdown')

    async def profile_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показать профиль пользователя"""
        user_id = update.effective_user.id
        user_data = await self.get_user_data(user_id)
        
        if not user_data:
            await update.message.reply_text("❌ Профиль не найден. Используйте /start для регистрации.")
            return
        
        zodiac_emoji = self.get_zodiac_emoji(user_data.get('zodiac_sign'))
        zodiac_title = self.get_zodiac_title(user_data.get('zodiac_sign'))
        
        profile_text = f"""
👤 *Ваш профиль*

🆔 ID: `{user_id}`
👋 Имя: {user_data['first_name']}
{zodiac_emoji} Знак: {zodiac_title}
⭐️ Предсказаний: {user_data['predictions_count']}
📅 Зарегистрирован: {user_data['created_at'][:10]}

Хотите изменить знак зодиака? Используйте веб-приложение.
        """
        
        keyboard = [
            [InlineKeyboardButton("🔮 Открыть приложение", web_app=WebAppInfo(url=WEBAPP_URL))],
            [InlineKeyboardButton("💫 Получить предсказание", callback_data="get_prediction")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            profile_text,
            parse_mode='Markdown',
            reply_markup=reply_markup
        )

    async def prediction_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Получить предсказание"""
        await self.handle_get_prediction(update, context)

    async def rankings_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Показать рейтинг пользователей"""
        rankings = await self.get_rankings()
        
        if not rankings:
            await update.message.reply_text("📊 Рейтинг пока пуст.")
            return
        
        rankings_text = "🏆 *Топ пользователей:*\n\n"
        
        for i, user in enumerate(rankings[:10], 1):
            medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
            rankings_text += f"{medal} {user['first_name']} - {user['predictions_count']} предсказаний\n"
        
        keyboard = [
            [InlineKeyboardButton("🔮 Открыть приложение", web_app=WebAppInfo(url=WEBAPP_URL))]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            rankings_text,
            parse_mode='Markdown',
            reply_markup=reply_markup
        )

    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка нажатий на кнопки"""
        query = update.callback_query
        await query.answer()
        
        if query.data == "get_prediction":
            await self.handle_get_prediction(update, context)
        elif query.data == "profile":
            await self.profile_command(update, context)
        elif query.data == "rankings":
            await self.rankings_command(update, context)
        elif query.data.startswith("buy_prediction_"):
            payment_id = query.data.replace("buy_prediction_", "")
            await self.send_invoice(update, context, payment_id)

    async def handle_get_prediction(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка запроса предсказания"""
        user_id = update.effective_user.id
        
        # Проверяем, можно ли купить предсказание
        can_purchase = await self.check_can_purchase(user_id)
        
        if not can_purchase['can_purchase']:
            reason = can_purchase.get('reason', 'unknown')
            if reason == 'already_purchased_today':
                next_available = can_purchase.get('next_available_in_seconds', 0)
                hours = next_available // 3600
                minutes = (next_available % 3600) // 60
                
                message = f"⏰ Вы уже получили предсказание сегодня!\n\n"
                message += f"Следующее предсказание будет доступно через: {hours}ч {minutes}м"
                
                await update.effective_message.reply_text(message)
                return
        
        # Проверяем знак зодиака
        user_data = await self.get_user_data(user_id)
        if not user_data or not user_data.get('zodiac_sign'):
            message = """
❗️ Сначала выберите свой знак зодиака в профиле!

Откройте веб-приложение и настройте профиль.
            """
            
            keyboard = [
                [InlineKeyboardButton("🔮 Открыть приложение", web_app=WebAppInfo(url=WEBAPP_URL))]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.effective_message.reply_text(message, reply_markup=reply_markup)
            return
        
        # Создаем платеж
        payment_data = await self.create_payment(user_id)
        if not payment_data:
            await update.effective_message.reply_text("❌ Ошибка создания платежа.")
            return
        
        # Отправляем инвойс
        await self.send_invoice(update, context, payment_data['payment_id'])

    async def send_invoice(self, update: Update, context: ContextTypes.DEFAULT_TYPE, payment_id: str):
        """Отправка инвойса для оплаты в XTR Stars"""
        title = "🔮 Персональное предсказание"
        description = "Получите уникальное предсказание на сегодня, созданное специально для вашего знака зодиака"
        payload = f"prediction_payment_{payment_id}"
        currency = "XTR"  # Telegram Stars
        prices = [LabeledPrice("Предсказание", 1)]  # 1 XTR Star
        
        await context.bot.send_invoice(
            chat_id=update.effective_chat.id,
            title=title,
            description=description,
            payload=payload,
            provider_token="",  # Всегда пустой для XTR Stars
            currency=currency,
            prices=prices,
            start_parameter="prediction_payment",
            photo_url=None,  # Опционально - URL изображения
            need_name=False,
            need_phone_number=False,
            need_email=False,
            need_shipping_address=False,
            is_flexible=False
        )

    async def pre_checkout_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Предварительная проверка платежа"""
        query = update.pre_checkout_query
        
        # Проверяем payload
        if not query.invoice_payload.startswith("prediction_payment_"):
            await query.answer(ok=False, error_message="Неверный тип платежа")
            return
        
        # Извлекаем payment_id
        payment_id = query.invoice_payload.replace("prediction_payment_", "")
        
        # Проверяем существование платежа
        payment_exists = await self.verify_payment(payment_id)
        if not payment_exists:
            await query.answer(ok=False, error_message="Платеж не найден")
            return
        
        await query.answer(ok=True)

    async def successful_payment_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка успешного платежа"""
        payment = update.message.successful_payment
        
        # Извлекаем payment_id из payload
        payment_id = payment.invoice_payload.replace("prediction_payment_", "")
        
        # Подтверждаем платеж на backend
        success = await self.confirm_payment(payment_id, payment.telegram_payment_charge_id)
        
        if success:
            # Получаем предсказание
            prediction = await self.get_today_prediction(update.effective_user.id)
            
            if prediction:
                prediction_text = f"""
🔮 *Ваше предсказание на сегодня*

{self.get_zodiac_emoji(prediction['zodiac_sign'])} *{self.get_zodiac_title(prediction['zodiac_sign'])}*

{prediction['prediction_text']}

📅 {prediction['prediction_date']}

_Следующее предсказание будет доступно завтра!_
                """
                
                await update.message.reply_text(prediction_text, parse_mode='Markdown')
            else:
                await update.message.reply_text("❌ Ошибка получения предсказания.")
        else:
            await update.message.reply_text("❌ Ошибка обработки платежа.")

    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработка ошибок"""
        logger.error(f"Update {update} caused error {context.error}")

    # API методы для взаимодействия с backend
    async def register_user(self, user):
        """Регистрация пользователя"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{API_BASE_URL}/users/", json={
                    "telegram_id": user.id,
                    "first_name": user.first_name,
                    "zodiac_sign": None
                })
                return response.status_code == 201
            except Exception as e:
                logger.error(f"Error registering user: {e}")
                return False

    async def get_user_data(self, user_id: int):
        """Получение данных пользователя"""
        async with httpx.AsyncClient() as client:
            try:
                # Здесь нужна аутентификация по Telegram ID
                response = await client.get(f"{API_BASE_URL}/users/by-telegram-id/{user_id}")
                if response.status_code == 200:
                    return response.json()
                return None
            except Exception as e:
                logger.error(f"Error getting user data: {e}")
                return None

    async def check_can_purchase(self, user_id: int):
        """Проверка возможности покупки"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{API_BASE_URL}/predictions/can-purchase", 
                                          headers={"X-Telegram-User-ID": str(user_id)})
                if response.status_code == 200:
                    return response.json()
                return {"can_purchase": False}
            except Exception as e:
                logger.error(f"Error checking purchase: {e}")
                return {"can_purchase": False}

    async def create_payment(self, user_id: int):
        """Создание платежа"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{API_BASE_URL}/payments/create-invoice",
                                           headers={"X-Telegram-User-ID": str(user_id)})
                if response.status_code == 200:
                    return response.json()
                return None
            except Exception as e:
                logger.error(f"Error creating payment: {e}")
                return None

    async def verify_payment(self, payment_id: str):
        """Проверка существования платежа"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{API_BASE_URL}/payments/{payment_id}")
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Error verifying payment: {e}")
                return False

    async def confirm_payment(self, payment_id: str, telegram_charge_id: str):
        """Подтверждение платежа"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(f"{API_BASE_URL}/payments/{payment_id}/confirm", 
                                           json={"telegram_payment_charge_id": telegram_charge_id})
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Error confirming payment: {e}")
                return False

    async def get_today_prediction(self, user_id: int):
        """Получение предсказания на сегодня"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{API_BASE_URL}/predictions/today",
                                          headers={"X-Telegram-User-ID": str(user_id)})
                if response.status_code == 200:
                    return response.json()
                return None
            except Exception as e:
                logger.error(f"Error getting prediction: {e}")
                return None

    async def get_rankings(self):
        """Получение рейтинга"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"{API_BASE_URL}/users/rankings")
                if response.status_code == 200:
                    return response.json()
                return []
            except Exception as e:
                logger.error(f"Error getting rankings: {e}")
                return []

    def get_zodiac_emoji(self, sign):
        """Получение эмодзи знака зодиака"""
        emojis = {
            'aries': '♈', 'taurus': '♉', 'gemini': '♊', 'cancer': '♋',
            'leo': '♌', 'virgo': '♍', 'libra': '♎', 'scorpio': '♏',
            'sagittarius': '♐', 'capricorn': '♑', 'aquarius': '♒', 'pisces': '♓'
        }
        return emojis.get(sign, '❓')

    def get_zodiac_title(self, sign):
        """Получение названия знака зодиака"""
        titles = {
            'aries': 'Овен', 'taurus': 'Телец', 'gemini': 'Близнецы', 'cancer': 'Рак',
            'leo': 'Лев', 'virgo': 'Дева', 'libra': 'Весы', 'scorpio': 'Скорпион',
            'sagittarius': 'Стрелец', 'capricorn': 'Козерог', 'aquarius': 'Водолей', 'pisces': 'Рыбы'
        }
        return titles.get(sign, 'Неизвестный')

    async def run(self):
        """Запуск бота"""
        logger.info("Starting Prediction Bot...")
        await self.application.initialize()
        await self.application.start()
        await self.application.updater.start_polling()
        
        try:
            await asyncio.Future()  # Ждем бесконечно
        except KeyboardInterrupt:
            logger.info("Stopping bot...")
        finally:
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()

def main():
    """Главная функция"""
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN не установлен")
        return
    
    bot = PredictionBot()
    asyncio.run(bot.run())

if __name__ == '__main__':
    main() 