#!/bin/bash

# 切换到backend目录
cd backend

# 启动Celery worker
python -m celery -A app.tasks.celery_app worker --loglevel=info