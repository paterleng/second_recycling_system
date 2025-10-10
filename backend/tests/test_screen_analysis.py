#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
专门测试屏幕分析功能
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

async def analyze_screen_for_issues(image_path):
    """专门分析屏幕问题"""
    print(f"\n详细分析屏幕图片: {image_path.name}")
    print("-" * 60)

    try:
        # 1. 使用屏幕分析功能
        print("1. 使用专门的屏幕分析功能...")
        screen_result = await gemini_vlm.analyze_screen(str(image_path))

        if screen_result["success"]:
            analysis = screen_result["analysis"]
            print("   屏幕分析结果:")
            print(f"     屏幕状况: {analysis.get('screen_condition', '未知')}")
            print(f"     显示质量: {analysis.get('display_quality', '未知')}")
            print(f"     功能性评估: {analysis.get('functionality', '未知')}")

            issues = analysis.get('issues', [])
            if issues:
                print(f"     发现的问题: {', '.join(issues)}")
            else:
                print(f"     发现的问题: 无")
        else:
            print(f"   屏幕分析失败: {screen_result['error']}")

        # 2. 使用更详细的提示词进行分析
        print("\n2. 使用增强提示词重新分析...")

        import google.generativeai as genai
        api_key = os.getenv('GOOGLE_API_KEY')
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')

        # 加载图片
        from PIL import Image
        img = Image.open(image_path)

        enhanced_prompt = """
        请仔细检查这张手机屏幕图片，重点查找以下问题：

        1. 屏幕裂纹或破损：
           - 是否有任何裂纹、裂缝、碎屏
           - 玻璃是否有破损
           - 边缘是否有缺口

        2. 显示问题：
           - 是否有黑点、亮点、死像素
           - 是否有色彩异常、色块
           - 是否有显示不均匀的区域
           - 是否有条纹、花屏现象

        3. 触摸问题迹象：
           - 屏幕是否响应正常（从界面表现判断）
           - 是否有异常的触摸反应

        4. 其他问题：
           - 屏幕是否变形
           - 是否有液体渗入痕迹
           - 是否有烧屏现象

        请详细描述你看到的所有问题，即使是很小的瑕疵也要指出。
        如果没有问题，也请明确说明屏幕状况良好。
        """

        response = model.generate_content([enhanced_prompt, img])
        print("   增强分析结果:")
        print(f"     {response.text}")

        # 3. 询问用户反馈
        print("\n3. 请您确认:")
        print("   您提到屏幕有问题，具体是什么问题？")
        print("   - 屏幕裂纹？")
        print("   - 显示异常？")
        print("   - 触摸失灵？")
        print("   - 其他问题？")

        return True

    except Exception as e:
        print(f"   分析异常: {str(e)}")
        return False

async def test_all_images_for_screen_issues():
    """测试所有图片的屏幕问题检测"""
    print("开始详细屏幕问题检测...")
    print("=" * 70)

    # 查找测试图片
    test_image_path = Path("../../test_images")
    image_files = list(test_image_path.glob("*.jpg")) + list(test_image_path.glob("*.png"))

    if not image_files:
        print("未找到测试图片")
        return False

    print(f"找到 {len(image_files)} 张图片，逐一进行屏幕问题检测")

    for i, image_file in enumerate(image_files, 1):
        print(f"\n[{i}/{len(image_files)}]", end="")
        await analyze_screen_for_issues(image_file)

        # 每分析一张图片后暂停，让用户查看结果
        if i < len(image_files):
            print("\n" + "="*30 + " 按Enter继续下一张 " + "="*30)
            input()

    return True

if __name__ == "__main__":
    try:
        asyncio.run(test_all_images_for_screen_issues())
    except KeyboardInterrupt:
        print("\n\n测试被中断")
    except Exception as e:
        print(f"\n测试异常：{str(e)}")