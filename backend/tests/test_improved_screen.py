#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试改进后的屏幕分析功能
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

async def test_improved_screen_analysis():
    """测试改进后的屏幕分析"""
    print("测试改进后的屏幕分析功能")
    print("=" * 50)

    # 测试有问题的屏幕图片
    test_image_path = Path("../../test_images")
    screen_image = test_image_path / "c4a2560034fd242e84b17e3adfb734d9.jpg"

    if not screen_image.exists():
        print(f"图片不存在: {screen_image}")
        return False

    print(f"分析屏幕图片: {screen_image.name}")

    try:
        result = await gemini_vlm.analyze_screen(str(screen_image))

        if result["success"]:
            print("\n改进后的屏幕分析结果:")
            analysis = result["analysis"]

            print(f"屏幕状况: {analysis.get('screen_condition', '未知')}")
            print(f"显示质量: {analysis.get('display_quality', '未知')}")
            print(f"功能性评估: {analysis.get('functionality', '未知')}")

            issues = analysis.get('issues', [])
            if issues:
                print("发现的问题:")
                for i, issue in enumerate(issues, 1):
                    print(f"  {i}. {issue}")
            else:
                print("发现的问题: 无")

            # 显示原始响应（如果有解析错误）
            if "raw_response" in analysis:
                print(f"\n原始响应: {analysis['raw_response']}")

            return True
        else:
            print(f"屏幕分析失败: {result['error']}")
            return False

    except Exception as e:
        print(f"测试异常: {str(e)}")
        return False

async def main():
    """主函数"""
    success = await test_improved_screen_analysis()

    print("\n" + "=" * 50)
    if success:
        print("改进后的屏幕分析功能测试成功！")
        print("现在应该能更准确地检测屏幕问题了。")
    else:
        print("屏幕分析功能需要进一步调试。")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n测试被中断")
    except Exception as e:
        print(f"\n测试异常：{str(e)}")