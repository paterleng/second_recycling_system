#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试特定功能 - 设备信息和电池信息提取
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

async def test_device_info_extraction():
    """测试设备信息提取"""
    print("测试设备信息提取功能")
    print("=" * 50)

    # 查找测试图片
    test_image_path = Path("../../test_images")
    image_files = list(test_image_path.glob("*.jpg")) + list(test_image_path.glob("*.png"))

    if not image_files:
        print("未找到测试图片")
        return False

    # 使用第一张图片测试设备信息提取
    test_image = image_files[0]
    print(f"使用图片: {test_image.name}")

    try:
        result = await gemini_vlm.extract_device_info(str(test_image))

        if result["success"]:
            print("\n设备信息提取成功:")
            device_info = result["device_info"]

            for key, value in device_info.items():
                if key != "raw_response":
                    print(f"  {key}: {value}")

            return True
        else:
            print(f"设备信息提取失败: {result['error']}")
            return False

    except Exception as e:
        print(f"测试异常: {str(e)}")
        return False

async def test_battery_info_extraction():
    """测试电池信息提取"""
    print("\n测试电池信息提取功能")
    print("=" * 50)

    # 查找测试图片
    test_image_path = Path("../../test_images")
    image_files = list(test_image_path.glob("*.jpg")) + list(test_image_path.glob("*.png"))

    if not image_files:
        print("未找到测试图片")
        return False

    # 使用包含电池信息的图片
    for test_image in image_files:
        print(f"测试图片: {test_image.name}")

        try:
            result = await gemini_vlm.extract_battery_info(str(test_image))

            if result["success"]:
                print("\n电池信息提取成功:")
                battery_info = result["battery_info"]

                for key, value in battery_info.items():
                    if key != "raw_response":
                        print(f"  {key}: {value}")

                return True
            else:
                print(f"电池信息提取失败: {result['error']}")

        except Exception as e:
            print(f"测试异常: {str(e)}")

        print("-" * 30)

    return False

async def test_appearance_analysis():
    """测试外观分析"""
    print("\n测试外观分析功能")
    print("=" * 50)

    # 查找测试图片
    test_image_path = Path("../../test_images")
    image_files = list(test_image_path.glob("*.jpg")) + list(test_image_path.glob("*.png"))

    if not image_files:
        print("未找到测试图片")
        return False

    # 使用前3张图片测试外观分析
    test_images = [str(img) for img in image_files[:3]]
    print(f"使用 {len(test_images)} 张图片进行外观分析")

    try:
        result = await gemini_vlm.analyze_appearance(test_images)

        if result["success"]:
            print("\n外观分析成功:")
            analysis = result["analysis"]

            print(f"  整体状况: {analysis.get('overall_condition', '未知')}")

            issues = analysis.get('issues', [])
            if issues:
                print(f"  发现问题: {', '.join(issues)}")
            else:
                print(f"  发现问题: 无")

            suggestions = analysis.get('suggestions', [])
            if suggestions:
                print(f"  建议: {', '.join(suggestions)}")

            detailed = analysis.get('detailed_analysis', {})
            if detailed:
                print("\n  详细分析:")
                for part, desc in detailed.items():
                    print(f"    {part}: {desc}")

            return True
        else:
            print(f"外观分析失败: {result['error']}")
            return False

    except Exception as e:
        print(f"测试异常: {str(e)}")
        return False

async def main():
    """主测试函数"""
    print("开始测试特定功能...")
    print("=" * 60)

    results = []

    # 测试设备信息提取
    device_ok = await test_device_info_extraction()
    results.append(("设备信息提取", device_ok))

    # 测试电池信息提取
    battery_ok = await test_battery_info_extraction()
    results.append(("电池信息提取", battery_ok))

    # 测试外观分析
    appearance_ok = await test_appearance_analysis()
    results.append(("外观分析", appearance_ok))

    # 输出测试结果
    print("\n" + "=" * 60)
    print("功能测试结果")
    print("=" * 60)

    for test_name, success in results:
        status = "成功" if success else "失败"
        print(f"{test_name}: {status}")

    success_count = sum(1 for _, success in results if success)
    print(f"\n总体结果: {success_count}/{len(results)} 项功能正常")

    if success_count == len(results):
        print("所有功能测试通过！系统工作正常。")
    else:
        print("部分功能需要检查。")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n测试被中断")
    except Exception as e:
        print(f"\n测试异常：{str(e)}")