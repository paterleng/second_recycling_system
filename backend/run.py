#!/usr/bin/env python3
"""
AI二手手机智能质检评估系统 - 主启动文件
"""

import uvicorn
from config.settings import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else 4
    )