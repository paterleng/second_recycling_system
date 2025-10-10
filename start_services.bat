@echo off
echo 正在启动AI二手手机智能质检评估系统...

echo.
echo 1. 启动 Redis (请确保Redis已安装并配置)
echo 请在另一个终端中运行: redis-server

echo.
echo 2. 启动 PostgreSQL (请确保PostgreSQL已安装并配置)
echo 请确保PostgreSQL服务正在运行

echo.
echo 3. 初始化数据库
cd backend
python init_db.py

echo.
echo 4. 启动 Celery Worker
start "Celery Worker" cmd /k "python celery_worker.py"

echo.
echo 5. 启动 FastAPI 服务器
start "FastAPI Server" cmd /k "python run.py"

echo.
echo 服务启动完成！
echo FastAPI文档: http://localhost:8000/docs
echo 健康检查: http://localhost:8000/health

pause