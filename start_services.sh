#!/bin/bash

echo "正在启动AI二手手机智能质检评估系统..."

echo ""
echo "1. 检查 Redis 服务状态"
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Redis 未运行，请先启动 Redis 服务"
    echo "命令: redis-server"
    exit 1
fi

echo ""
echo "2. 检查 PostgreSQL 服务状态"
if ! pgrep -x "postgres" > /dev/null; then
    echo "PostgreSQL 未运行，请先启动 PostgreSQL 服务"
    exit 1
fi

echo ""
echo "3. 初始化数据库"
cd backend
python init_db.py

echo ""
echo "4. 启动 Celery Worker"
nohup python -m celery -A app.tasks.celery_app worker --loglevel=info > celery.log 2>&1 &
CELERY_PID=$!
echo "Celery Worker 已启动 (PID: $CELERY_PID)"

echo ""
echo "5. 启动 FastAPI 服务器"
python run.py &
FASTAPI_PID=$!
echo "FastAPI 服务器已启动 (PID: $FASTAPI_PID)"

echo ""
echo "服务启动完成！"
echo "FastAPI文档: http://localhost:8000/docs"
echo "健康检查: http://localhost:8000/health"
echo ""
echo "要停止服务，请运行: kill $CELERY_PID $FASTAPI_PID"

# 等待用户输入
read -p "按回车键停止所有服务..."

echo "正在停止服务..."
kill $CELERY_PID $FASTAPI_PID
echo "服务已停止"