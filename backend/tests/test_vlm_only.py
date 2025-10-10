#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VLM服务连接测试脚本
只测试Gemini VLM连接性，OCR功能已由VLM替代
"""

import asyncio
import os
from pathlib import Path
import sys

# 添加项目根目录到Python路径，确保无论从哪里运行都能正确导入模块
current_dir = os.path.dirname(os.path.abspath(__file__))
# 获取backend目录的绝对路径
backend_dir = os.path.dirname(current_dir)
# 将backend目录添加到Python路径
sys.path.insert(0, backend_dir)

# 从config模块导入settings（使用与test_services.py相同的方式）
from config.settings import settings


async def test_vlm_connection():
    """测试VLM连接"""
    print("测试Google Gemini VLM连接...")

    # 使用settings模块获取配置（与test_services.py保持一致）
    api_key = settings.GOOGLE_API_KEY
    print(f"从settings模块获取的API Key: {api_key}")

    if not api_key:
        print("缺少Google API Key配置")
        print("   请在 backend/.env 中设置：")
        print("   GOOGLE_API_KEY=your_api_key")
        return False

    print(f"找到VLM配置")
    print(f"   API Key: {api_key[:8]}...")

    try:
        # 尝试配置Gemini
        import google.generativeai as genai

        genai.configure(api_key=api_key)

        # 尝试获取模型信息
        model = genai.GenerativeModel('gemini-2.0-flash')
        print("VLM客户端创建成功")

        # 测试简单的文本生成（不需要图片）
        response = model.generate_content("你好，测试连接")
        print(response.text)
        print("VLM连接测试成功")
        return True

    except ImportError:
        print(f"缺少Google AI依赖库")
        print(f"   请安装：pip install google-generativeai")
        return False
    except Exception as e:
        print(f"VLM连接测试失败：{str(e)}")
        return False


async def main():
    """主函数"""
    print("AI服务连接性测试（仅VLM）")
    print("=" * 40)

    vlm_ok = await test_vlm_connection()

    print("\n" + "=" * 40)
    print("测试结果")
    print("=" * 40)
    print(f"阿里云OCR: 已移除（使用VLM替代）")
    print(f"Google VLM: {'连接正常' if vlm_ok else '连接失败'}")

    if vlm_ok:
        print(f"\n所有服务连接正常！")
        print(f"可以运行完整测试：python backend/tests/test_services.py")
    else:
        print(f"\n请修复VLM配置问题后重新测试")

    return vlm_ok


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n测试被中断")
    except Exception as e:
        print(f"\n测试异常：{str(e)}")