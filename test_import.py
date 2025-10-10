import sys
import os

# 添加backend目录到Python路径
base_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(base_dir, 'backend')
sys.path.insert(0, backend_dir)

from app.services.inspection_service import InspectionService
print("导入成功！")