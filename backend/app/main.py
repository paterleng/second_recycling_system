from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from config.settings import settings
from config.database import engine
from app.models import inspection, device
from app.api.v1 import router as api_v1_router

# 创建数据库表
inspection.Base.metadata.create_all(bind=engine)
device.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI二手手机智能质检评估系统后端API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件
if not os.path.exists(settings.UPLOAD_PATH):
    os.makedirs(settings.UPLOAD_PATH)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_PATH), name="uploads")

# API路由
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": f"欢迎使用 {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}