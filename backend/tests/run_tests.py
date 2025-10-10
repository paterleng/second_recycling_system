#!/usr/bin/env python3
"""
测试运行器 - 统一运行所有测试
"""

import asyncio
import os
import sys
from pathlib import Path

# 添加父目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def print_header(title):
    """打印标题"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


async def main():
    """主函数"""
    print_header(" AI二手手机质检系统 - 测试套件")

    print("选择要运行的测试：")
    print("1. 配置检查 (快速)")
    print("2. API连接测试 (中等)")
    print("3. 完整功能测试 (需要测试图片)")
    print("4. 运行所有测试")
    print("0. 退出")

    while True:
        try:
            choice = input("\n请选择 (0-4): ").strip()

            if choice == "0":
                print("退出测试")
                break

            elif choice == "1":
                print_header(" 配置检查")
                os.system(f"python {Path(__file__).parent / 'check_config.py'}")

            elif choice == "2":
                print_header("API连接测试")
                os.system(f"python {Path(__file__).parent / 'test_vlm_only.py'}")

            elif choice == "3":
                print_header(" 完整功能测试")
                print(" 此测试需要在 test_images/ 文件夹中放置测试图片")
                confirm = input("是否继续? (y/N): ").strip().lower()
                if confirm in ['y', 'yes']:
                    os.system(f"python {Path(__file__).parent / 'test_services.py'}")
                else:
                    print("测试已取消")

            elif choice == "4":
                print_header(" 运行所有测试")
                print("1️ 配置检查...")
                os.system(f"python {Path(__file__).parent / 'check_config.py'}")

                print("\n2️ API连接测试...")
                os.system(f"python {Path(__file__).parent / 'test_vlm_only.py'}")

                print("\n3️ 完整功能测试...")
                print("  需要测试图片，跳过此步骤")
                print(" 如需运行完整测试，请选择选项 3")

            else:
                print(" 无效选择，请输入 0-4")

            print("\n" + "-" * 40)

        except KeyboardInterrupt:
            print("\n\n👋 测试被中断")
            break
        except Exception as e:
            print(f"\n 运行错误：{str(e)}")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f" 测试运行器错误：{str(e)}")