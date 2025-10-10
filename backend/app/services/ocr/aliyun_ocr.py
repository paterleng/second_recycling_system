import base64
import json
from typing import Dict, Any, Optional
from pathlib import Path

from alibabacloud_ocr_api20210707.client import Client as OcrApiClient
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_ocr_api20210707 import models as ocr_models
from alibabacloud_tea_util import models as util_models

from config.settings import settings


class AliyunOCRService:
    """阿里云OCR服务"""

    def __init__(self):
        self.client = self._create_client()

    def _create_client(self) -> OcrApiClient:
        """创建OCR客户端"""
        config = open_api_models.Config(
            access_key_id=settings.ALIYUN_OCR_ACCESS_KEY_ID,
            access_key_secret=settings.ALIYUN_OCR_ACCESS_KEY_SECRET
        )
        config.endpoint = 'ocr-api.cn-hangzhou.aliyuncs.com'
        return OcrApiClient(config)

    def _encode_image_to_base64(self, image_path: str) -> str:
        """将图片编码为base64"""
        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            return base64.b64encode(image_data).decode('utf-8')
        except Exception as e:
            raise Exception(f"图片编码失败: {str(e)}")

    async def recognize_general_text(self, image_path: str) -> Dict[str, Any]:
        """
        通用文字识别

        Args:
            image_path: 图片路径

        Returns:
            识别结果
        """
        try:
            # 检查文件是否存在
            if not Path(image_path).exists():
                raise FileNotFoundError(f"图片文件不存在: {image_path}")

            # 编码图片
            image_base64 = self._encode_image_to_base64(image_path)

            # 构建请求
            recognize_general_request = ocr_models.RecognizeGeneralRequest(
                body=image_base64
            )

            runtime = util_models.RuntimeOptions()

            # 调用API
            response = self.client.recognize_general_with_options(
                recognize_general_request, runtime
            )

            if response.status_code == 200:
                result = response.body.data
                return {
                    "success": True,
                    "content": result.content,
                    "angle": result.angle,
                    "height": result.height,
                    "width": result.width,
                    "original_height": result.original_height,
                    "original_width": result.original_width
                }
            else:
                return {
                    "success": False,
                    "error": f"OCR识别失败，状态码: {response.status_code}"
                }

        except Exception as e:
            return {
                "success": False,
                "error": f"OCR识别异常: {str(e)}"
            }

    async def extract_device_info(self, image_path: str) -> Dict[str, Any]:
        """
        从"关于本机"截图中提取设备信息

        Args:
            image_path: 关于本机截图路径

        Returns:
            提取的设备信息
        """
        ocr_result = await self.recognize_general_text(image_path)

        if not ocr_result["success"]:
            return ocr_result

        try:
            # 解析OCR结果，提取关键信息
            content = ocr_result["content"]
            device_info = {
                "model_name": None,
                "system_version": None,
                "storage_info": None,
                "serial_number": None
            }

            # 简单的关键词匹配提取（可根据实际需求优化）
            for line in content.split('\n'):
                line = line.strip()
                if '型号' in line or 'Model' in line:
                    device_info["model_name"] = line
                elif '系统版本' in line or 'iOS' in line or 'Android' in line:
                    device_info["system_version"] = line
                elif '存储空间' in line or 'Storage' in line or 'GB' in line:
                    device_info["storage_info"] = line
                elif '序列号' in line or 'Serial' in line:
                    device_info["serial_number"] = line

            return {
                "success": True,
                "device_info": device_info,
                "raw_content": content
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"设备信息提取失败: {str(e)}"
            }

    async def extract_battery_info(self, image_path: str) -> Dict[str, Any]:
        """
        从"电池健康"截图中提取电池信息

        Args:
            image_path: 电池健康截图路径

        Returns:
            提取的电池信息
        """
        ocr_result = await self.recognize_general_text(image_path)

        if not ocr_result["success"]:
            return ocr_result

        try:
            content = ocr_result["content"]
            battery_info = {
                "maximum_capacity": None,
                "peak_performance": None,
                "battery_health": None
            }

            # 提取电池健康度数据
            import re

            # 匹配百分比
            percentage_pattern = r'(\d+)%'
            percentages = re.findall(percentage_pattern, content)

            if percentages:
                # 通常电池健康度是第一个百分比
                battery_info["maximum_capacity"] = f"{percentages[0]}%"

            # 匹配电池健康相关文本
            if '峰值性能' in content or 'Peak Performance' in content:
                battery_info["peak_performance"] = "正常" if '正常' in content else "可能受影响"

            # 健康度评估
            if percentages:
                health_percentage = int(percentages[0])
                if health_percentage >= 90:
                    battery_info["battery_health"] = "优秀"
                elif health_percentage >= 80:
                    battery_info["battery_health"] = "良好"
                elif health_percentage >= 70:
                    battery_info["battery_health"] = "一般"
                else:
                    battery_info["battery_health"] = "较差"

            return {
                "success": True,
                "battery_info": battery_info,
                "raw_content": content
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"电池信息提取失败: {str(e)}"
            }


# 全局实例
aliyun_ocr = AliyunOCRService()