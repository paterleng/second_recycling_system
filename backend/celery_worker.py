#!/usr/bin/env python3
"""
Celery Worker 启动文件
"""

from app.tasks.celery_app import celery_app

if __name__ == "__main__":
    celery_app.start()