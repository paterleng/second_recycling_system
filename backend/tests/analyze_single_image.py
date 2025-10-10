#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
分析单张图片的屏幕问题
使用方法: python analyze_single_image.py 图片文件名
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

async def analyze_single_image(image_name):
    """分析单张图片"""
    test_image_path = Path("../../test_images/phone_1")
    image_file = test_image_path / image_name

    if not image_file.exists():
        print(f"图片不存在: {image_file}")
        return False

    print(f"深度分析图片: {image_name}")
    print("=" * 60)

    try:
        import google.generativeai as genai
        from PIL import Image

        api_key = os.getenv('GOOGLE_API_KEY')
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        # 加载图片
        img = Image.open(image_file)

        # 专门的屏幕问题检测提示词
        prompt = """
        这张图片显示的是手机屏幕。请用放大镜般的细致程度检查以下问题：

        1. **屏幕裂纹检测**：
           - 仔细查看是否有任何裂纹，包括很细的发丝裂纹
           - 检查屏幕边缘是否有缺口
           - 注意玻璃表面是否有破损

        2. **显示问题检测**：
           - 是否有黑色或白色的点（死像素）
           - 是否有显示不正常的区域
           - 是否有条纹、线条或异常图案
           - 颜色是否均匀，有无色差

        3. **屏幕状态评估**：
           - 整体显示质量如何
           - 是否有任何异常现象

        **重要**: 即使是非常细微的问题也要指出。如果这是一个有问题的屏幕，
        请详细描述你看到的所有异常，包括位置、大小、特征等。

        请提供详细的检测报告。
        """

        response = model.generate_content([prompt, img])
        print("检测报告:")
        print("-" * 40)
        print(response.text)
        print("-" * 40)

        return True

    except Exception as e:
        print(f"分析失败: {str(e)}")
        return False

async def main():
    """主函数"""
    image_name = "front_screen.jpg"
    if len(sys.argv) > 1:
        # 从命令行参数获取图片名
        print("<UNK>")
        # image_name = sys.argv[1]
    else:
        # 列出所有图片让用户选择
        test_image_path = Path("../../test_images/phone_1")
        print("path",test_image_path)
        image_files = list(test_image_path.glob("*.jpg")) + list(test_image_path.glob("*.png"))

        if not image_files:
            print("未找到测试图片")
            return

        print("可用的图片:")
        for i, img in enumerate(image_files, 1):
            print(f"{i}. {img.name}")

        print("\n请告诉我你想分析哪张图片（输入文件名）:")
        print("或者直接运行: python analyze_single_image.py 文件名")
        # return
    await analyze_single_image(image_name)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n分析被中断")
    except Exception as e:
        print(f"\n分析异常：{str(e)}")