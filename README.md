# AI二手手机智能质检评估系统

一个集智能质检与实时估价于一体的自动化二手手机回收平台。通过结合成熟的OCR技术和前沿的视觉多模态大模型（VLM），为用户和平台提供客观、准确、可信的手机状况评估报告，并即时生成具有市场竞争力的回收估价。
- python -m celery -A app.tasks.celery_app worker --loglevel=info
- python3 backend/run.py
## 🎯 核心功能

- **智能质检流程**: 引导用户上传手机各角度照片和系统截图
- **OCR文字识别**: 自动识别"关于本机"和"电池健康"信息
- **VLM视觉分析**: 使用Google Gemini Pro Vision分析手机外观、屏幕、摄像头等
- **智能估价引擎**: 基于质检结果和定价规则自动计算回收价格
- **异步任务处理**: 使用Celery处理耗时的AI分析任务
- **实时结果查询**: 支持轮询获取分析进度和结果

## 🏗️ 技术架构

### 后端技术栈
- **框架**: FastAPI (Python)
- **数据库**: PostgreSQL
- **缓存/队列**: Redis
- **任务队列**: Celery
- **OCR服务**: 阿里云OCR API
- **VLM服务**: Google Gemini Pro Vision API
- **文件存储**: 本地存储 (支持扩展至阿里云OSS)

### 系统架构图
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   前端应用   │───▶│  FastAPI    │───▶│ PostgreSQL  │
│  (Vue/React)│    │   后端API   │    │    数据库    │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │    Redis    │
                   │  缓存/队列   │
                   └─────────────┘
                          │
                          ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 阿里云OCR   │◀───│   Celery    │───▶│  Gemini     │
│   服务      │    │  异步任务    │    │  VLM服务    │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📦 项目结构

```
second_recycling_system/
├── backend/                    # 后端代码
│   ├── app/
│   │   ├── api/               # API路由
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── inspections.py
│   │   ├── models/            # 数据模型
│   │   │   ├── __init__.py
│   │   │   ├── inspection.py
│   │   │   ├── device.py
│   │   │   └── schemas.py
│   │   ├── services/          # 业务服务
│   │   │   ├── ocr/           # OCR服务
│   │   │   ├── vlm/           # VLM服务
│   │   │   ├── valuation/     # 估价服务
│   │   │   ├── storage/       # 存储服务
│   │   │   └── inspection_service.py
│   │   ├── tasks/             # Celery任务
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py
│   │   │   └── inspection_tasks.py
│   │   └── main.py           # 主应用文件
│   ├── config/               # 配置文件
│   │   ├── settings.py
│   │   └── database.py
│   ├── uploads/              # 文件上传目录
│   ├── run.py               # 启动脚本
│   ├── celery_worker.py     # Celery Worker启动
│   ├── init_db.py           # 数据库初始化
│   └── .env.example         # 环境变量模板
├── requirements.txt          # Python依赖
├── start_services.bat       # Windows启动脚本
├── start_services.sh        # Linux/Mac启动脚本
└── README.md               # 项目文档
```

## 🚀 快速开始

### 1. 环境要求
- Python 3.8+
- PostgreSQL 12+
- Redis 6+

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 配置环境变量
复制环境变量模板并填写配置：
```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env` 文件，填写以下关键配置：
```env
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/phone_inspection

# Redis配置
REDIS_URL=redis://localhost:6379/0

# 阿里云OCR配置
ALIYUN_OCR_ACCESS_KEY_ID=your_access_key_id
ALIYUN_OCR_ACCESS_KEY_SECRET=your_access_key_secret

# Google Gemini配置
GOOGLE_API_KEY=your_google_api_key
```

### 4. 初始化数据库
```bash
cd backend
python init_db.py
```

### 5. 启动服务

#### Windows
```bash
start_services.bat
```

#### Linux/Mac
```bash
chmod +x start_services.sh
./start_services.sh
```

#### 手动启动
```bash
# 启动 Redis
redis-server

# 启动 PostgreSQL (确保服务运行)

# 启动 Celery Worker
cd backend
python -m celery -A app.tasks.celery_app worker --loglevel=info

# 启动 FastAPI 服务器 (新终端)
cd backend
python run.py
```

### 6. 测试服务 (可选)
在启动完整服务前，可以先测试OCR和VLM服务：
```bash
cd backend/tests
python run_tests.py
```

### 7. 访问API文档
- API文档: http://localhost:8000/docs
- 健康检查: http://localhost:8000/health

## 📖 API 使用说明

### 创建质检任务
```bash
POST /api/v1/inspections/
Content-Type: multipart/form-data

# 表单数据
brand: Apple
model: iPhone 13 mini
storage: 128GB
accessory_condition: 完好
user_text_inputs: {"repair_history": "无"}

# 文件上传
about_machine_image: [关于本机截图]
battery_health_image: [电池健康截图]
appearance_images: [外观照片数组]
screen_image: [屏幕点亮照片]
camera_lens_images: [摄像头镜片照片数组]
flashlight_image: [闪光灯照片]
```

### 查询质检结果
```bash
GET /api/v1/inspections/{task_id}
```

### 响应示例
```json
{
  "task_id": "c4a7f9a3-1b1e-4b8a-9e0a-6a2d9c1b7f0d",
  "status": "COMPLETED",
  "report": {
    "device_info": {
      "brand": "Apple",
      "model": "iPhone 13 mini",
      "storage": "128GB"
    },
    "valuation": {
      "price": "2479",
      "currency": "CNY"
    },
    "summary": [
      {
        "item": "整体成色",
        "grade": "良好",
        "issue": "边框功能性磨损",
        "suggestion": "建议更换保护壳"
      }
    ],
    "detailed_tags": [
      {
        "tag_category": "机身外壳",
        "result": "有划痕小磕碰",
        "source": "VLM"
      }
    ]
  }
}
```

## 🔧 系统配置

### 定价规则配置
系统支持灵活的定价规则配置，包括：
- 设备基础价格 (按品牌、型号、容量)
- 扣款规则 (按质检标签)
- 扣款类型 (固定金额/百分比)

### 添加新设备型号
```python
from app.services.valuation.valuation_service import valuation_service

# 添加设备型号
valuation_service.add_device_model(
    brand="Apple",
    model="iPhone 14",
    storage_capacity="128GB",
    base_price=5000.0
)
```

### 添加定价规则
```python
# 添加扣款规则
valuation_service.add_pricing_rule(
    tag_category="屏幕状况",
    tag_result="屏幕破裂",
    deduction_type="AMOUNT",  # 或 "PERCENTAGE"
    deduction_value=800.0
)
```

## 📊 监控和日志

### 查看Celery任务状态
```bash
# 查看活跃任务
celery -A app.tasks.celery_app inspect active

# 查看已注册任务
celery -A app.tasks.celery_app inspect registered
```

### 查看Redis队列
```bash
redis-cli
> LLEN celery  # 查看队列长度
> KEYS *       # 查看所有keys
```

## 🛠️ 开发指南

### 添加新的AI服务
1. 在 `app/services/` 下创建新的服务目录
2. 实现服务类，遵循现有的接口约定
3. 在 `inspection_tasks.py` 中集成新服务
4. 更新配置文件添加必要的API密钥

### 扩展分析功能
1. 在VLM服务中添加新的分析方法
2. 更新 `_generate_final_report` 函数处理新的分析结果
3. 在定价规则中添加对应的扣款项

### 部署建议
- 使用Docker容器化部署
- 配置Nginx作为反向代理
- 使用Redis Cluster提高可用性
- 配置数据库主从复制
- 设置定期备份策略

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请联系开发团队。