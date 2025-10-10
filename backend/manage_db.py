#!/usr/bin/env python3
"""
数据库管理脚本
支持初始化、迁移管理等操作
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description=""):
    """运行命令并处理输出"""
    print(f"🔄 {description}")
    print(f"执行命令: {command}")

    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            print(f"✅ 成功!")
            if result.stdout:
                print(f"输出: {result.stdout}")
        else:
            print(f"❌ 失败!")
            if result.stderr:
                print(f"错误: {result.stderr}")

        return result.returncode == 0

    except Exception as e:
        print(f"❌ 执行异常: {str(e)}")
        return False

def init_alembic():
    """初始化Alembic（如果尚未初始化）"""
    if Path("migrations/env.py").exists():
        print("✅ Alembic已经初始化")
        return True

    print("🔧 初始化Alembic迁移环境...")
    return run_command("alembic init migrations", "初始化Alembic")

def create_initial_migration():
    """创建初始迁移文件"""
    print("📝 创建初始数据库迁移...")
    return run_command(
        'alembic revision --autogenerate -m "Initial migration"',
        "生成初始迁移脚本"
    )

def upgrade_database():
    """升级数据库到最新版本"""
    print("⬆️ 升级数据库结构...")
    return run_command("alembic upgrade head", "应用所有迁移")

def show_migration_history():
    """显示迁移历史"""
    print("📋 迁移历史:")
    run_command("alembic history", "查看迁移历史")

def show_current_version():
    """显示当前数据库版本"""
    print("📌 当前数据库版本:")
    run_command("alembic current", "查看当前版本")

def create_migration():
    """创建新的迁移文件"""
    message = input("请输入迁移描述: ").strip()
    if not message:
        message = "Update database schema"

    command = f'alembic revision --autogenerate -m "{message}"'
    return run_command(command, f"创建迁移: {message}")

def downgrade_database():
    """回滚数据库"""
    print("⚠️ 回滚数据库操作有风险!")
    confirm = input("确认要回滚吗? (y/N): ").strip().lower()

    if confirm not in ['y', 'yes']:
        print("取消回滚操作")
        return True

    steps = input("回滚步数 (默认1): ").strip()
    if not steps:
        steps = "1"

    command = f"alembic downgrade -{steps}"
    return run_command(command, f"回滚 {steps} 个版本")

def simple_init():
    """简单初始化（当前使用的方法）"""
    print("🚀 使用简单方式初始化数据库...")
    return run_command("python init_db.py", "运行数据库初始化脚本")

def main():
    """主菜单"""
    while True:
        print("\n" + "="*50)
        print("🗄️  数据库管理工具")
        print("="*50)
        print("1. 简单初始化数据库 (推荐)")
        print("2. 使用Alembic管理迁移")
        print("   2.1 初始化Alembic")
        print("   2.2 创建初始迁移")
        print("   2.3 应用迁移")
        print("   2.4 创建新迁移")
        print("   2.5 回滚迁移")
        print("   2.6 查看迁移历史")
        print("   2.7 查看当前版本")
        print("0. 退出")

        choice = input("\n请选择 (0-2.7): ").strip()

        if choice == "0":
            print("👋 退出数据库管理工具")
            break
        elif choice == "1":
            simple_init()
        elif choice == "2.1":
            init_alembic()
        elif choice == "2.2":
            create_initial_migration()
        elif choice == "2.3":
            upgrade_database()
        elif choice == "2.4":
            create_migration()
        elif choice == "2.5":
            downgrade_database()
        elif choice == "2.6":
            show_migration_history()
        elif choice == "2.7":
            show_current_version()
        else:
            print("❌ 无效选择")

if __name__ == "__main__":
    # 确保在正确的目录
    if not Path("alembic.ini").exists():
        print("❌ 请在backend目录下运行此脚本")
        sys.exit(1)

    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 程序被中断")