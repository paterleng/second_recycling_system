#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试用户上传的图片
"""

import asyncio
import os
import sys
from pathlib import Path

# 添加父目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置环境变量
env_file = Path("../.env")
if env_file.exists():
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

from app.services.vlm.gemini_service import gemini_vlm

async def analyze_single_image(image_path):
    """分析单张图片"""
    print(f"\n分析图片: {image_path.name}")
    print("-" * 50)

    try:
        # 1. 通用文字识别
        print("1. 提取文字内容...")
        text_result = await gemini_vlm.extract_text_from_image(str(image_path))

        if text_result["success"]:
            content = text_result["content"]
            preview = content[:200] + "..." if len(content) > 200 else content
            print(f"   文字内容: {preview}")
        else:
            print(f"   文字提取失败: {text_result['error']}")

        # 2. 设备信息提取（如果是关于本机截图）
        if "关于" in image_path.name.lower() or "about" in image_path.name.lower():
            print("\n2. 提取设备信息...")
            device_result = await gemini_vlm.extract_device_info(str(image_path))

            if device_result["success"]:
                device_info = device_result["device_info"]
                print("   设备信息:")
                for key, value in device_info.items():
                    if value and value != "未知":
                        print(f"     {key}: {value}")
            else:
                print(f"   设备信息提取失败: {device_result['error']}")

        # 3. 电池信息提取（如果是电池健康截图）
        if "电池" in image_path.name.lower() or "battery" in image_path.name.lower():
            print("\n3. 提取电池信息...")
            battery_result = await gemini_vlm.extract_battery_info(str(image_path))

            if battery_result["success"]:
                battery_info = battery_result["battery_info"]
                print("   电池信息:")
                for key, value in battery_info.items():
                    if value and value != "未知":
                        print(f"     {key}: {value}")
            else:
                print(f"   电池信息提取失败: {battery_result['error']}")

        # 4. 外观分析（如果是手机照片）
        if any(keyword in image_path.name.lower() for keyword in ["外观", "phone", "手机"]):
            print("\n4. 外观分析...")
            appearance_result = await gemini_vlm.analyze_appearance([str(image_path)])

            if appearance_result["success"]:
                analysis = appearance_result["analysis"]
                print(f"   整体状况: {analysis.get('overall_condition', '未知')}")
                issues = analysis.get('issues', [])
                if issues:
                    print(f"   发现问题: {', '.join(issues)}")
                suggestions = analysis.get('suggestions', [])
                if suggestions:
                    print(f"   建议: {', '.join(suggestions)}")
            else:
                print(f"   外观分析失败: {appearance_result['error']}")

        return True

    except Exception as e:
        print(f"   分析异常: {str(e)}")
        return False

async def test_all_images():
    """测试所有图片"""
    print("开始分析测试图片...")
    print("=" * 60)

    # 查找测试图片
    test_image_path = Path("../../test_images")

    if not test_image_path.exists():
        print("测试图片目录不存在")
        return False

    # 获取所有图片文件
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png']:
        image_files.extend(test_image_path.glob(ext))

    if not image_files:
        print("未找到测试图片")
        return False

    print(f"找到 {len(image_files)} 张图片")

    success_count = 0

    for i, image_file in enumerate(image_files[:5], 1):  # 限制测试前5张图片
        print(f"\n[{i}/{min(len(image_files), 5)}]", end="")
        success = await analyze_single_image(image_file)
        if success:
            success_count += 1

    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    print(f"成功分析: {success_count}/{min(len(image_files), 5)} 张图片")

    if success_count > 0:
        print("VLM服务工作正常！")
        return True
    else:
        print("VLM服务可能存在问题")
        return False

if __name__ == "__main__":
    try:
        asyncio.run(test_all_images())
    except KeyboardInterrupt:
        print("\n\n测试被中断")
    except Exception as e:
        print(f"\n测试异常：{str(e)}")