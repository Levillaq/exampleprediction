from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Настройки базы данных
    database_url: str = "postgresql://user:password@localhost/prediction_bot"
    database_echo: bool = False
    
    # Настройки API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_reload: bool = True
    
    # Настройки безопасности
    secret_key: str = "your-super-secret-key-change-this-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 дней
    
    # Настройки Telegram Bot
    telegram_bot_token: Optional[str] = None
    telegram_webhook_url: Optional[str] = None
    telegram_payment_provider_token: Optional[str] = None
    
    # Настройки приложения
    app_name: str = "🔮 Prediction Bot"
    app_version: str = "1.0.0"
    
    # Настройки платежей
    prediction_price_xtr: int = 1  # Цена в Telegram Stars
    
    # Настройки CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Режим разработки
    debug: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Создаем глобальный экземпляр настроек
settings = Settings() 