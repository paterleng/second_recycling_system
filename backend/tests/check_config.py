#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
检查系统配置的脚本 - VLM Only
"""

import os
from pathlib import Path
import sys

# 添加父目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config.settings import settings
    config_loaded = True
except Exception as e:
    config_loaded = False
    config_error = str(e)


def check_config():
    """检查配置"""
    print("系统配置检查")
    print("=" * 40)

    if not config_loaded:
        print(f"配置加载失败：{config_error}")
        print("\n解决方案：")
        print("1. 确保已安装所有依赖：pip install -r requirements.txt")
        print("2. 检查.env文件是否存在且格式正确")
        return False

    print("配置文件加载成功")

    # 检查环境变量文件
    env_file = Path("../.env")
    if env_file.exists():
        print(".env文件存在")
    else:
        print(".env文件不存在")
        print("   请复制 .env.example 为 .env 并填写配置")

    print(f"\n当前配置：")
    print(f"   应用名称: {settings.APP_NAME}")
    print(f"   版本: {settings.VERSION}")
    print(f"   调试模式: {settings.DEBUG}")

    # 检查关键配置
    print(f"\nAPI密钥配置检查：")

    # VLM配置（替代OCR功能）
    vlm_configured = bool(settings.GOOGLE_API_KEY)
    print(f"   Google VLM: {'已配置' if vlm_configured else '未配置'}")
    if vlm_configured:
        print(f"      API Key: {settings.GOOGLE_API_KEY[:8]}...")
        print(f"      模型: gemini-2.0-flash")

    # OCR功能说明
    print(f"   阿里云OCR: 已移除（使用VLM替代）")

    # 数据库配置
    db_configured = "postgresql://" in settings.DATABASE_URL
    print(f"   数据库: {'已配置' if db_configured else '未配置'}")

    # Redis配置
    redis_configured = "redis://" in settings.REDIS_URL
    print(f"   Redis: {'已配置' if redis_configured else '未配置'}")

    if not vlm_configured:
        print(f"\n警告：VLM服务未配置，测试将失败")
        print("   请在.env文件中设置 GOOGLE_API_KEY")
        return False

    print(f"\n配置检查完成！")
    print(f"提示：现在系统使用 Gemini VLM 替代所有 OCR 功能")
    return True


if __name__ == "__main__":
    check_config()