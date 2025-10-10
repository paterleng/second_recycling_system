#!/usr/bin/env python3
import sys
import os

print("当前工作目录:", os.getcwd())
print("\nPython路径设置:")
for path in sys.path:
    print(f"  - {path}")

# 打印当前文件的绝对路径和目录结构
test_file_path = os.path.abspath(__file__)
print(f"\n测试文件路径: {test_file_path}")
parent_dir = os.path.dirname(os.path.dirname(test_file_path))
print(f"父目录: {parent_dir}")

# 尝试手动添加正确的路径
sys.path.append(parent_dir)
print(f"\n添加后的Python路径:")
for path in sys.path:
    print(f"  - {path}")

# 尝试导入模块
try:
    print("\n尝试导入app模块...")
    import app
    print("✅ 成功导入app模块")
    
    print("尝试导入app.services模块...")
    from app import services
    print("✅ 成功导入app.services模块")
    
    print("尝试导入app.services.vlm.gemini_service模块...")
    from app.services.vlm.gemini_service import gemini_vlm
    print("✅ 成功导入app.services.vlm.gemini_service模块")
    
except ImportError as e:
    print(f"❌ 导入失败: {e}")
    
# 检查app目录是否在正确的位置
app_path = os.path.join(parent_dir, 'app')
print(f"\napp目录路径: {app_path}")
print(f"app目录是否存在: {os.path.isdir(app_path)}")

# 检查services目录
if os.path.isdir(app_path):
    services_path = os.path.join(app_path, 'services')
    print(f"services目录路径: {services_path}")
    print(f"services目录是否存在: {os.path.isdir(services_path)}")
    
    # 检查vlm目录
    if os.path.isdir(services_path):
        vlm_path = os.path.join(services_path, 'vlm')
        print(f"vlm目录路径: {vlm_path}")
        print(f"vlm目录是否存在: {os.path.isdir(vlm_path)}")
        
        # 检查gemini_service.py文件
        if os.path.isdir(vlm_path):
            gemini_file = os.path.join(vlm_path, 'gemini_service.py')
            print(f"gemini_service.py文件路径: {gemini_file}")
            print(f"gemini_service.py文件是否存在: {os.path.isfile(gemini_file)}")