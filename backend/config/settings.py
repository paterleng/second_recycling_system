from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "AI二手手机智能质检评估系统"
    VERSION: str = "1.1.0"
    DEBUG: bool = True

    # 数据库配置
    DATABASE_URL: str = "postgresql://postgres:your_strong_password@localhost:5432/phone_inspection"

    # Redis配置
    REDIS_URL: str = "redis://localhost:6379/0"

    # 阿里云OSS配置
    ALIYUN_ACCESS_KEY_ID: str = ""
    ALIYUN_ACCESS_KEY_SECRET: str = ""
    ALIYUN_OSS_ENDPOINT: str = ""
    ALIYUN_OSS_BUCKET: str = ""

    # Google Gemini配置 (替代OCR功能)
    GOOGLE_API_KEY: str = "AIzaSyCmwOrFUUZB_PSzxghpjJFrX5nhrHL82P0"
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # JWT配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # 文件上传配置
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".bmp", ".gif"}
    UPLOAD_PATH: str = "uploads"

    # Celery配置
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"


settings = Settings()