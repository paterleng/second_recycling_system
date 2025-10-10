# 测试文档

这个文件夹包含了AI二手手机智能质检评估系统的所有测试文件。

## 📁 文件结构

```
tests/
├── __init__.py                # 测试包初始化
├── README.md                  # 本文档
├── run_tests.py              # 测试运行器 (推荐使用)
├── check_config.py           # 配置检查
├── check_models.py           # 模型检查工具
├── test_vlm_only.py          # VLM连接测试
└── test_services.py          # 完整功能测试
```

## 🧪 测试类型

### 1. 配置检查
**文件**: `check_config.py`
**用途**: 检查系统配置是否正确
**运行**: `python check_config.py`

### 2. VLM连接测试
**文件**: `test_vlm_only.py`
**用途**: 测试Google Gemini VLM服务连接性
**运行**: `python test_vlm_only.py`
**要求**: Google API Key配置

### 3. 完整功能测试
**文件**: `test_services.py`
**用途**: 测试VLM的实际功能（包括OCR功能）
**运行**: `python test_services.py`
**要求**: API密钥 + 测试图片

### 4. 模型检查
**文件**: `check_models.py`
**用途**: 查看可用的Gemini模型
**运行**: `python check_models.py`

## 🚀 快速开始

### 方法一：使用测试运行器 (推荐)
```bash
cd backend/tests
python run_tests.py
```

### 方法二：手动运行测试

1. **首次使用 - 配置检查**:
   ```bash
   cd backend/tests
   python check_config.py
   ```

2. **VLM连接测试**:
   ```bash
   python test_vlm_only.py
   ```

3. **准备测试图片** (可选):
   ```bash
   mkdir -p ../../test_images
   # 将手机相关图片放入 test_images 文件夹
   ```

4. **完整功能测试**:
   ```bash
   python test_services.py
   ```

## 📋 测试前准备

### 1. 安装依赖
```bash
pip install -r ../../requirements.txt
```

### 2. 配置环境变量
复制并编辑配置文件：
```bash
cp ../.env.example ../.env
```

在 `.env` 文件中设置：
```env
# 必需配置 - VLM替代OCR功能
GOOGLE_API_KEY=your_google_api_key
GEMINI_MODEL=gemini-2.0-flash

# 可选配置
DATABASE_URL=postgresql://user:pass@localhost/db
REDIS_URL=redis://localhost:6379/0
```

### 3. 准备测试图片 (完整测试需要)
在项目根目录创建 `test_images` 文件夹，放入以下类型的图片：
- 手机"关于本机"截图
- 手机"电池健康"截图
- 手机外观照片
- 手机屏幕点亮照片
- 摄像头镜片照片
- 闪光灯照片

支持格式：JPG, JPEG, PNG
建议大小：< 10MB

## 🔧 故障排除

### API密钥问题
- **Google VLM**: 确保API Key有效，Gemini 2.0 Flash API已启用
- **OCR功能**: 现在由VLM提供，无需单独的OCR API

### 网络问题
- 确保网络可以访问Google API
- 如有代理，请正确配置

### 依赖问题
- 运行 `pip install -r ../../requirements.txt` 安装所有依赖
- 确保Python版本 >= 3.8
- 主要依赖：`google-generativeai`, `PIL`

### 图片问题
- 确保图片格式正确（JPG/PNG）
- 确保图片大小 < 10MB
- 使用真实的手机相关图片效果更好

## 📊 测试结果解读

### ✅ 成功标志
- "连接正常" - VLM API可以正常访问
- "分析成功" - VLM能正确分析图片和提取文字
- "模型创建成功" - Gemini客户端正常初始化

### ❌ 失败原因
- "配置缺失" - 检查.env文件中的Google API Key
- "连接失败" - 检查网络和Google API服务状态
- "识别失败" - 检查图片质量和内容
- "权限不足" - 检查API密钥权限和配额

## 🔄 系统架构更新说明

**重要变更**: 系统已从 OCR+VLM 架构更新为纯 VLM 架构

### 之前架构：
- 阿里云OCR：文字识别
- Google Gemini：图像分析

### 现在架构：
- Google Gemini VLM：统一处理所有功能
  - 文字识别（替代OCR）
  - 图像分析
  - 设备信息提取
  - 电池信息提取

### 优势：
- 更统一的处理逻辑
- 更好的上下文理解
- 减少API依赖
- 更准确的分析结果

## 🎯 最佳实践

1. **按顺序测试**: 配置检查 → VLM连接 → 完整功能
2. **使用真实图片**: 手机截图和照片效果最好
3. **检查日志**: 注意测试输出中的错误信息
4. **网络环境**: 确保稳定的网络连接到Google服务

## 📞 支持

如果测试遇到问题：
1. 检查Google API Key配置是否正确
2. 确认Gemini API访问权限
3. 查看错误日志信息
4. 参考故障排除指南
5. 联系开发团队