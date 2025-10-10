#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
针对性屏幕问题检测
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

async def analyze_specific_screen_image(image_path):
    """分析特定的屏幕图片"""
    print(f"分析图片: {image_path}")
    print("=" * 60)

    try:
        import google.generativeai as genai
        from PIL import Image

        api_key = os.getenv('GOOGLE_API_KEY')
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        # 加载图片
        img = Image.open(image_path)

        # 超详细的屏幕问题检测提示词
        detailed_prompt = """
        请极其仔细地检查这张手机屏幕图片，查找任何可能的问题：

        **必须检查的问题类型：**

        1. **屏幕物理损伤**：
           - 任何裂纹、裂缝（即使很细微）
           - 玻璃破损、碎片
           - 边缘缺口或损坏
           - 屏幕凹陷或变形

        2. **显示异常**：
           - 黑点、亮点、死像素
           - 色彩不正常的区域
           - 显示不均匀、亮度不一致
           - 竖线、横线、条纹
           - 花屏、闪烁迹象
           - 色块、渐变异常

        3. **屏幕功能问题**：
           - 部分区域无法显示
           - 触摸响应异常的迹象
           - 界面显示不完整

        4. **其他问题**：
           - 液体渗入痕迹
           - 烧屏或残影
           - 异常反光或暗区

        **分析要求：**
        - 仔细观察图片的每个角落
        - 注意细微的异常
        - 如果发现任何问题，详细描述位置和特征
        - 如果真的没有问题，明确说明

        请给出详细的分析报告。
        """

        response = model.generate_content([detailed_prompt, img])
        print("详细分析结果:")
        print("-" * 40)
        print(response.text)
        print("-" * 40)

        return True

    except Exception as e:
        print(f"分析异常: {str(e)}")
        return False

async def main():
    """主函数"""
    print("针对性屏幕问题检测")
    print("请指定要分析的图片")
    print("=" * 60)

    # 列出所有图片
    test_image_path = Path("../../test_images")
    image_files = list(test_image_path.glob("*.jpg")) + list(test_image_path.glob("*.png"))

    if not image_files:
        print("未找到测试图片")
        return

    print("可用的图片:")
    for i, img in enumerate(image_files, 1):
        print(f"{i}. {img.name}")

    # 你可以修改这里指定要分析的图片
    # 比如分析所有图片或特定的几张

    print(f"\n开始分析所有图片...")

    for i, image_file in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}]")
        await analyze_specific_screen_image(image_file)

        if i < len(image_files):
            print("\n" + "="*50)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n测试被中断")
    except Exception as e:
        print(f"\n测试异常：{str(e)}")