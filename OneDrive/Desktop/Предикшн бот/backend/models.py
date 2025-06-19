from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# === БАЗОВЫЕ ТИПЫ ===
class ZodiacSign(str, Enum):
    ARIES = "aries"
    TAURUS = "taurus"
    GEMINI = "gemini"
    CANCER = "cancer"
    LEO = "leo"
    VIRGO = "virgo"
    LIBRA = "libra"
    SCORPIO = "scorpio"
    SAGITTARIUS = "sagittarius"
    CAPRICORN = "capricorn"
    AQUARIUS = "aquarius"
    PISCES = "pisces"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# === ПОЛЬЗОВАТЕЛИ ===
class UserBase(SQLModel):
    first_name: str = Field(min_length=1, max_length=100)
    telegram_id: int = Field(unique=True, index=True)
    zodiac_sign: Optional[ZodiacSign] = None
    predictions_count: int = Field(default=0, ge=0)

class User(UserBase, table=True):
    __tablename__ = "users"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
    
    # Связи
    predictions: List["Prediction"] = Relationship(back_populates="user")
    payments: List["Payment"] = Relationship(back_populates="user")

class UserCreate(UserBase):
    pass

class UserUpdate(SQLModel):
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    zodiac_sign: Optional[ZodiacSign] = None

class UserPublic(UserBase):
    id: str
    created_at: datetime

# === ПРЕДСКАЗАНИЯ ===
class PredictionBase(SQLModel):
    zodiac_sign: ZodiacSign
    prediction_text: str = Field(min_length=10, max_length=1000)
    prediction_date: date

class Prediction(PredictionBase, table=True):
    __tablename__ = "predictions"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    created_at: Optional[datetime] = Field(default=None)
    
    # Связи
    user: "User" = Relationship(back_populates="predictions")

class PredictionCreate(PredictionBase):
    pass

class PredictionPublic(PredictionBase):
    id: str
    created_at: datetime

# === ПЛАТЕЖИ ===
class PaymentBase(SQLModel):
    amount: int = Field(ge=1)  # В Telegram Stars (минимум 1)
    currency: str = Field(default="XTR", max_length=10)
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)

class Payment(PaymentBase, table=True):
    __tablename__ = "payments"
    
    id: Optional[str] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    telegram_payment_id: Optional[str] = Field(default=None, index=True)
    created_at: Optional[datetime] = Field(default=None)
    updated_at: Optional[datetime] = Field(default=None)
    
    # Связи
    user: "User" = Relationship(back_populates="payments")

class PaymentCreate(PaymentBase):
    pass

class PaymentPublic(PaymentBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

# === СТАТИСТИКА ===
class UserStats(SQLModel):
    user_id: str
    total_predictions: int
    current_streak: int
    longest_streak: int
    total_spent: int  # В XTR Stars
    last_prediction_date: Optional[date] = None

class GlobalStats(SQLModel):
    total_users: int
    total_predictions: int
    predictions_today: int
    total_revenue: int  # В XTR Stars 