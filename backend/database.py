from sqlmodel import SQLModel, create_engine, Session
from .config import settings

# Создание движка базы данных
engine = create_engine(
    settings.database_url,
    echo=settings.database_echo,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

def create_db_and_tables():
    """Создание всех таблиц в базе данных"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Получение сессии базы данных"""
    with Session(engine) as session:
        yield session 