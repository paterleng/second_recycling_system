#!/usr/bin/env python3
"""
测试OCR和VLM服务的脚本
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

# 验证路径设置
print(f"当前脚本路径: {current_dir}")
print(f"添加到Python路径的backend目录: {backend_dir}")

# OCR服务已移除，使用Gemini VLM替代
from app.services.vlm.gemini_service import gemini_vlm
from config.settings import settings


async def test_ocr_service():
    """OCR服务已移除，使用VLM替代"""
    print("=" * 50)
    print("OCR服务已移除，使用Gemini VLM替代所有功能")
    print("=" * 50)
    print("✅ 跳过OCR测试")
    return True


async def test_vlm_service():
    """测试VLM服务"""
    print("\n" + "=" * 50)
    print("测试Google Gemini VLM服务")
    print("=" * 50)

    # 检查VLM配置
    if not settings.GOOGLE_API_KEY:
        print("VLM配置缺失！请在.env文件中配置以下变量：")
        print("   GOOGLE_API_KEY")
        return False

    print(f"VLM配置已加载")
    print(f"   API Key: {settings.GOOGLE_API_KEY[:8]}...")
    print(f"   模型: gemini-2.0-flash")

    # 创建测试图片路径
    test_image_path = Path("../test_images")
    test_image_path.mkdir(exist_ok=True)

    # 检查测试图片
    image_files = list(test_image_path.glob("*.jpg")) + \
                 list(test_image_path.glob("*.jpeg")) + \
                 list(test_image_path.glob("*.png"))

    if not image_files:
        print(f"\n请将测试图片放置在以下位置：")
        print(f"   {test_image_path.absolute()}")
        print(f"   建议使用手机外观照片进行测试")
        print(f"   支持格式：.jpg, .jpeg, .png")
        return False

    test_image = image_files[0]
    print(f"\n使用测试图片：{test_image.name}")

    try:
        # 测试外观分析
        print(f"\n正在分析手机外观...")
        appearance_result = await gemini_vlm.analyze_appearance([str(test_image)])

        if appearance_result["success"]:
            print(f"外观分析成功！")
            analysis = appearance_result["analysis"]

            print(f"分析结果：")
            print(f"   整体状况: {analysis.get('overall_condition', '未知')}")

            issues = analysis.get('issues', [])
            if issues:
                print(f"   发现问题: {', '.join(issues)}")
            else:
                print(f"   发现问题: 无")

            suggestions = analysis.get('suggestions', [])
            if suggestions:
                print(f"   建议: {', '.join(suggestions)}")

            return True

        else:
            print(f"外观分析失败：{appearance_result['error']}")
            return False

    except Exception as e:
        print(f"VLM服务测试异常：{str(e)}")
        return False


async def test_all_services():
    """测试所有服务"""
    print("开始测试AI服务连接性...")

    # 检查基础配置
    print(f"\n当前配置概览：")
    print(f"   DEBUG模式: {settings.DEBUG}")
    print(f"   上传路径: {settings.UPLOAD_PATH}")
    print(f"   最大文件大小: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB")

    # ocr_success = await test_ocr_service()
    vlm_success = await test_vlm_service()

    print("\n" + "=" * 50)
    print("测试结果汇总")
    print("=" * 50)
    print(f"阿里云OCR服务: 已移除（使用VLM替代）")
    print(f"Google VLM服务: {'正常' if vlm_success else '异常'}")

    if vlm_success:
        print(f"\n所有服务测试通过！系统可以正常运行。")
        return True
    else:
        print(f"\nVLM服务测试失败，请检查配置和网络连接。")
        return False


def print_troubleshooting():
    """打印故障排除指南"""
    print("\n" + "=" * 50)
    print(" 故障排除指南")
    print("=" * 50)
    print("1. VLM服务问题：")
    print("   - 检查Google API Key是否有效")
    print("   - 确认是否开启了Gemini 2.0 Flash API")
    print("   - 检查是否有API配额限制")
    print("   - 确认网络能访问Google API服务")

    print("\n2. OCR功能说明：")
    print("   - OCR服务已移除，所有文字识别由Gemini VLM完成")
    print("   - VLM提供更准确的图像分析和文字提取")
    print("   - 支持设备信息提取、电池信息提取等功能")

    print("\n3. 测试图片要求：")
    print("   - 图片格式：JPG、JPEG、PNG")
    print("   - 图片大小：小于10MB")
    print("   - 图片内容：清晰的手机相关图片")
    print("   - 建议：使用真实的手机截图或照片")


if __name__ == "__main__":
    try:
        # 运行测试
        success = asyncio.run(test_all_services())

        if not success:
            print_troubleshooting()

    except KeyboardInterrupt:
        print("\n\n测试被用户中断")
    except Exception as e:
        print(f"\n测试脚本运行异常：{str(e)}")
        print_troubleshooting()