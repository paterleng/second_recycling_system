import sys
import os
from pathlib import Path

# 设置正确的Python路径
base_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(base_dir, 'backend')
sys.path.insert(0, backend_dir)

# 测试路径计算
from backend.config.settings import settings

# 原始路径计算方式（有问题）
upload_base_original = Path(settings.UPLOAD_PATH)
print(f"原始路径计算: {upload_base_original.absolute()}")

# 修复后的路径计算方式
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
upload_base_fixed = Path(os.path.join(project_root, 'uploads'))
print(f"修复后的路径计算: {upload_base_fixed.absolute()}")

# 检查目录是否存在
print(f"修复后的路径是否存在: {upload_base_fixed.exists()}")