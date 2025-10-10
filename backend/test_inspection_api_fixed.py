import requests
import json
from pathlib import Path

# 测试API的URL
base_url = "http://localhost:8000/api/v1"
inspection_url = f"{base_url}/inspections/"

# 准备测试数据
def test_create_inspection():
    try:
        # 测试文件路径 - 替换为你实际的测试图片路径
        # 注意：这些路径需要存在实际的图片文件
        test_files_dir = Path("../../test_images/phone_1")
        
        # 准备表单数据
        data = {
            "brand": "Apple",
            "model": "iPhone 13 Pro",
            "storage": "256GB",
            "accessory_condition": "原装",
            "user_text_inputs": json.dumps({"notes": "测试手机"})
        }
        
        # 准备文件数据
        files = {
            "about_machine_image": open(test_files_dir / "about_machine.jpg", "rb"),
            "battery_health_image": open(test_files_dir / "battery_health.jpg", "rb"),
            "screen_image": open(test_files_dir / "screen.jpg", "rb"),
            "flashlight_image": open(test_files_dir / "flashlight.jpg", "rb")
        }
        
        # 添加多张外观图片
        appearance_images = [
            open(test_files_dir / "appearance_1.jpg", "rb"),
            open(test_files_dir / "appearance_2.jpg", "rb")
        ]
        files["appearance_images"] = appearance_images
        
        # 添加多张摄像头图片
        camera_images = [
            open(test_files_dir / "camera_1.jpg", "rb"),
            open(test_files_dir / "camera_2.jpg", "rb")
        ]
        files["camera_lens_images"] = camera_images
        
        # 发送请求
        print("发送质检任务请求...")
        response = requests.post(inspection_url, data=data, files=files)
        
        # 关闭所有文件
        for f in files.values():
            if isinstance(f, list):
                for img in f:
                    img.close()
            else:
                f.close()
        
        # 检查响应
        if response.status_code == 200:
            result = response.json()
            print(f"测试成功! 任务ID: {result['task_id']}")
            print(f"消息: {result['message']}")
            
            # 可以选择查询任务状态
            task_id = result['task_id']
            status_url = f"{inspection_url}{task_id}"
            print(f"可以通过此URL查询任务状态: {status_url}")
        else:
            print(f"测试失败! 状态码: {response.status_code}")
            print(f"错误信息: {response.text}")
            
    except Exception as e:
        print(f"测试过程中发生错误: {str(e)}")

if __name__ == "__main__":
    test_create_inspection()