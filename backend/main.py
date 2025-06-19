from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlmodel import Session, create_engine, SQLModel
from contextlib import asynccontextmanager
from typing import List, Optional
import os
from datetime import datetime, timedelta
import uuid

from .models import (
    User, UserCreate, UserPublic, UserUpdate,
    Prediction, PredictionCreate, PredictionPublic,
    Payment, PaymentCreate, PaymentPublic,
    ZodiacSign
)
from .database import get_session, create_db_and_tables
from .auth import get_current_user
from .predictions import generate_prediction_for_sign
from .config import settings

security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Создаем таблицы при запуске
    create_db_and_tables()
    yield

app = FastAPI(
    title="🔮 Prediction Bot API",
    description="API для веб-приложения ежедневных предсказаний",
    version="1.0.0",
    lifespan=lifespan
)

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене настроить конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Главная страница API"""
    return {"message": "🔮 Prediction Bot API", "status": "active"}

# === ПОЛЬЗОВАТЕЛИ ===
@app.post("/users/", response_model=UserPublic)
async def create_user(
    user: UserCreate,
    session: Session = Depends(get_session)
):
    """Создание нового пользователя"""
    # Проверяем, существует ли пользователь
    existing_user = session.query(User).filter(User.telegram_id == user.telegram_id).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким Telegram ID уже существует"
        )
    
    db_user = User.model_validate(user)
    db_user.id = str(uuid.uuid4())
    db_user.created_at = datetime.utcnow()
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user

@app.get("/users/me", response_model=UserPublic)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Получение профиля текущего пользователя"""
    return current_user

@app.patch("/users/me", response_model=UserPublic)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Обновление профиля пользователя"""
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user

@app.get("/users/rankings", response_model=List[UserPublic])
async def get_user_rankings(
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Получение рейтинга пользователей по количеству покупок"""
    users = session.query(User).order_by(User.predictions_count.desc()).limit(limit).all()
    return users

# === ПРЕДСКАЗАНИЯ ===
@app.get("/predictions/", response_model=List[PredictionPublic])
async def get_user_predictions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Получение всех предсказаний пользователя"""
    predictions = session.query(Prediction).filter(
        Prediction.user_id == current_user.id
    ).order_by(Prediction.created_at.desc()).all()
    
    return predictions

@app.get("/predictions/today", response_model=Optional[PredictionPublic])
async def get_today_prediction(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Получение предсказания на сегодня"""
    today = datetime.utcnow().date()
    
    prediction = session.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.prediction_date == today
    ).first()
    
    return prediction

@app.get("/predictions/can-purchase")
async def can_purchase_prediction(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Проверка, может ли пользователь купить предсказание"""
    today = datetime.utcnow().date()
    
    # Проверяем, есть ли уже предсказание на сегодня
    existing_prediction = session.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.prediction_date == today
    ).first()
    
    if existing_prediction:
        # Вычисляем время до следующего дня
        tomorrow = datetime.combine(today + timedelta(days=1), datetime.min.time())
        time_until_tomorrow = tomorrow - datetime.utcnow()
        
        return {
            "can_purchase": False,
            "reason": "already_purchased_today",
            "next_available_in_seconds": int(time_until_tomorrow.total_seconds())
        }
    
    return {"can_purchase": True}

# === ПЛАТЕЖИ ===
@app.post("/payments/create-invoice")
async def create_payment_invoice(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Создание инвойса для оплаты предсказания в XTR Stars"""
    # Проверяем, может ли пользователь купить предсказание
    can_purchase = await can_purchase_prediction(current_user, session)
    if not can_purchase["can_purchase"]:
        raise HTTPException(
            status_code=400,
            detail="Нельзя купить предсказание: " + can_purchase["reason"]
        )
    
    # Создаем запись о платеже для XTR Stars
    payment = Payment(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        amount=1,  # 1 XTR Star (минимальная единица платежа)
        currency="XTR",  # Telegram Stars
        status="pending",
        created_at=datetime.utcnow()
    )
    
    session.add(payment)
    session.commit()
    session.refresh(payment)
    
    # Для XTR Stars не нужен provider_token - инвойс отправляется ботом
    # Telegram Bot создаст invoice с помощью send_invoice()
    return {
        "payment_id": payment.id,
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status
    }

@app.post("/payments/{payment_id}/confirm")
async def confirm_payment(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Подтверждение платежа и создание предсказания"""
    # Получаем платеж
    payment = session.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
    
    if payment.status != "pending":
        raise HTTPException(status_code=400, detail="Платеж уже обработан")
    
    # Обновляем статус платежа
    payment.status = "completed"
    payment.updated_at = datetime.utcnow()
    
    # Создаем предсказание
    today = datetime.utcnow().date()
    prediction_text = generate_prediction_for_sign(current_user.zodiac_sign)
    
    prediction = Prediction(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        zodiac_sign=current_user.zodiac_sign,
        prediction_text=prediction_text,
        prediction_date=today,
        created_at=datetime.utcnow()
    )
    
    # Увеличиваем счетчик предсказаний пользователя
    current_user.predictions_count += 1
    current_user.updated_at = datetime.utcnow()
    
    session.add(payment)
    session.add(prediction)
    session.add(current_user)
    session.commit()
    
    session.refresh(prediction)
    
    return {
        "message": "Платеж подтвержден, предсказание создано",
        "prediction": prediction
    }

# === ЗОДИАКАЛЬНЫЕ ЗНАКИ ===
@app.get("/zodiac-signs")
async def get_zodiac_signs():
    """Получение списка всех зодиакальных знаков"""
    signs = [
        {"name": "aries", "title": "Овен", "emoji": "♈"},
        {"name": "taurus", "title": "Телец", "emoji": "♉"},
        {"name": "gemini", "title": "Близнецы", "emoji": "♊"},
        {"name": "cancer", "title": "Рак", "emoji": "♋"},
        {"name": "leo", "title": "Лев", "emoji": "♌"},
        {"name": "virgo", "title": "Дева", "emoji": "♍"},
        {"name": "libra", "title": "Весы", "emoji": "♎"},
        {"name": "scorpio", "title": "Скорпион", "emoji": "♏"},
        {"name": "sagittarius", "title": "Стрелец", "emoji": "♐"},
        {"name": "capricorn", "title": "Козерог", "emoji": "♑"},
        {"name": "aquarius", "title": "Водолей", "emoji": "♒"},
        {"name": "pisces", "title": "Рыбы", "emoji": "♓"}
    ]
    return signs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 