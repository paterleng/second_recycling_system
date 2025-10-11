import base64
import google.generativeai as genai
from typing import Dict, Any, List
from pathlib import Path
import json

from config.settings import settings


class GeminiVLMService:
    """Google Gemini Pro Vision服务"""

    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def _load_image(self, image_path: str) -> Dict[str, str]:
        """加载图片"""
        try:
            with open(image_path, 'rb') as f:
                image_data = f.read()

            # 获取文件扩展名来确定MIME类型
            suffix = Path(image_path).suffix.lower()
            mime_type_map = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.bmp': 'image/bmp'
            }
            mime_type = mime_type_map.get(suffix, 'image/jpeg')

            return {
                'mime_type': mime_type,
                'data': base64.b64encode(image_data).decode('utf-8')
            }
        except Exception as e:
            raise Exception(f"图片加载失败: {str(e)}")

    async def analyze_appearance(self, image_paths: List[str]) -> Dict[str, Any]:
        """
        分析手机外观状况

        Args:
            image_paths: 外观图片路径列表（正面、背面、各边框）

        Returns:
            外观分析结果
        """
        try:
            # 构建提示词
            prompt = """
            请仔细分析这些手机外观照片，使用中文回答，重点检查以下方面：

            1. 机身外壳状况：
               - 是否有划痕、磕碰、凹陷
               - 边框磨损程度
               - 后盖状况

            2. 整体成色评估：
               - 优秀：几乎无使用痕迹
               - 良好：轻微使用痕迹
               - 一般：明显使用痕迹但不影响功能
               - 较差：严重磨损或损坏

            请以JSON格式返回分析结果：
            {
                "overall_condition": "评估等级",
                "issues": ["发现的问题列表"],
                "detailed_analysis": {
                    "front": "正面状况描述",
                    "back": "背面状况描述",
                    "edges": "边框状况描述"
                },
                "suggestions": ["建议列表"]
            }
            """

            # 准备图片数据
            images = []
            for image_path in image_paths:
                image_data = self._load_image(image_path)
                images.append(image_data)

            # 调用Gemini API
            response = self.model.generate_content([prompt] + images)

            # 解析响应
            result_text = response.text.strip()

            # 尝试提取JSON部分
            if "```json" in result_text:
                json_start = result_text.find("```json") + 7
                json_end = result_text.find("```", json_start)
                result_text = result_text[json_start:json_end].strip()
            elif "{" in result_text and "}" in result_text:
                json_start = result_text.find("{")
                json_end = result_text.rfind("}") + 1
                result_text = result_text[json_start:json_end]

            try:
                analysis_result = json.loads(result_text)
            except json.JSONDecodeError:
                # 如果JSON解析失败，返回基础结构
                analysis_result = {
                    "overall_condition": "一般",
                    "issues": ["需要人工检查"],
                    "detailed_analysis": {
                        "front": "AI分析中遇到问题",
                        "back": "AI分析中遇到问题",
                        "edges": "AI分析中遇到问题"
                    },
                    "suggestions": ["建议人工复检"],
                    "raw_response": result_text
                }

            return {
                "success": True,
                "analysis": analysis_result
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"外观分析失败: {str(e)}"
            }

    async def analyze_screen(self, image_path: str) -> Dict[str, Any]:
        """
        分析屏幕状况

        Args:
            image_path: 屏幕点亮照片路径

        Returns:
            屏幕分析结果
        """
        try:
            prompt = """
            请极其仔细地分析这张手机屏幕照片，用放大镜级别的细致程度检查所有可能的问题，使用中文回答：

            1. 屏幕物理损伤（重点检查）：
               - 任何裂痕、裂缝（包括发丝般细微的裂纹）
               - 碎屏、玻璃破损
               - 屏幕边缘缺口或损坏
               - 摄像头周围的放射状裂纹
               - 屏幕角落的蛛网状裂纹

            2. 显示异常（仔细观察）：
               - 黑点、亮点、死像素（即使很小）
               - 色彩异常、显示不均匀
               - 条纹、线条、花屏
               - 色块、渐变异常

            3. 其他问题：
               - 液体渗入痕迹
               - 烧屏现象
               - 触摸功能异常迹象

            重要：即使是非常细微的问题也必须指出。如果发现裂纹，请详细描述位置、大小和形状。

            请以JSON格式返回：
            {
                "screen_condition": "优秀/良好/一般/较差/严重损坏",
                "issues": ["发现的所有问题，包括位置和特征"],
                "display_quality": "显示质量评估",
                "functionality": "功能性评估"
            }
            """

            image_data = self._load_image(image_path)
            response = self.model.generate_content([prompt, image_data])

            result_text = response.text.strip()

            # 解析JSON
            if "```json" in result_text:
                json_start = result_text.find("```json") + 7
                json_end = result_text.find("```", json_start)
                result_text = result_text[json_start:json_end].strip()

            try:
                analysis_result = json.loads(result_text)
            except json.JSONDecodeError:
                analysis_result = {
                    "screen_condition": "需要人工检查",
                    "issues": ["AI解析异常"],
                    "display_quality": "未知",
                    "functionality": "未知",
                    "raw_response": result_text
                }

            return {
                "success": True,
                "analysis": analysis_result
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"屏幕分析失败: {str(e)}"
            }

    async def analyze_camera_lens(self, image_paths: List[str]) -> Dict[str, Any]:
        """
        分析摄像头镜片状况

        Args:
            image_paths: 摄像头镜片照片路径列表

        Returns:
            镜片分析结果
        """
        try:
            prompt = """
            请仔细检查这些摄像头镜片的照片，使用中文回答，重点分析：

            1. 镜片清洁度：
               - 是否有灰尘、污渍
               - 镜片透明度

            2. 物理损伤：
               - 是否有划痕
               - 是否有裂纹
               - 是否有破损

            3. 进灰情况：
               - 镜片内部是否有灰尘
               - 密封性如何

            请以JSON格式返回：
            {
                "lens_condition": "评估等级",
                "issues": ["发现的问题"],
                "cleanliness": "清洁度评估",
                "physical_damage": "物理损伤评估"
            }
            """

            images = []
            for image_path in image_paths:
                image_data = self._load_image(image_path)
                images.append(image_data)

            response = self.model.generate_content([prompt] + images)
            result_text = response.text.strip()

            if "```json" in result_text:
                json_start = result_text.find("```json") + 7
                json_end = result_text.find("```", json_start)
                result_text = result_text[json_start:json_end].strip()

            try:
                analysis_result = json.loads(result_text)
            except json.JSONDecodeError:
                analysis_result = {
                    "lens_condition": "需要人工检查",
                    "issues": ["AI解析异常"],
                    "cleanliness": "未知",
                    "physical_damage": "未知",
                    "raw_response": result_text
                }

            return {
                "success": True,
                "analysis": analysis_result
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"镜片分析失败: {str(e)}"
            }

    async def analyze_flashlight(self, image_path: str) -> Dict[str, Any]:
        """
        分析闪光灯功能

        Args:
            image_path: 闪光灯点亮照片路径

        Returns:
            闪光灯分析结果
        """
        try:
            prompt = """
            请分析这张闪光灯点亮的照片，使用中文回答：

            1. 功能性：
               - 闪光灯是否正常点亮
               - 亮度是否正常

            2. 外观状况：
               - 灯罩是否完整
               - 是否有损坏

            请以JSON格式返回：
            {
                "flashlight_condition": "评估等级",
                "functionality": "功能性评估",
                "brightness": "亮度评估",
                "issues": ["发现的问题"]
            }
            """

            image_data = self._load_image(image_path)
            response = self.model.generate_content([prompt, image_data])

            result_text = response.text.strip()

            if "```json" in result_text:
                json_start = result_text.find("```json") + 7
                json_end = result_text.find("```", json_start)
                result_text = result_text[json_start:json_end].strip()

            try:
                analysis_result = json.loads(result_text)
            except json.JSONDecodeError:
                analysis_result = {
                    "flashlight_condition": "需要人工检查",
                    "functionality": "未知",
                    "brightness": "未知",
                    "issues": ["AI解析异常"],
                    "raw_response": result_text
                }

            return {
                "success": True,
                "analysis": analysis_result
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"闪光灯分析失败: {str(e)}"
            }

    async def extract_text_from_image(self, image_path: str) -> Dict[str, Any]:
        """
        从图片中提取文字内容 (替代OCR功能)

        Args:
            image_path: 图片路径

        Returns:
            文字提取结果
        """
        try:
            prompt = """
            请仔细识别并提取这张图片中的所有文字内容，使用中文回答。

            要求：
            1. 保持原始的文字布局和层次
            2. 准确识别所有可见的文字、数字、符号
            3. 如果是表格或列表，请保持格式
            4. 标注文字的位置（顶部、中部、底部等）

            请直接返回识别的文字内容，不需要额外的说明。
            """

            image_data = self._load_image(image_path)
            response = self.model.generate_content([prompt, image_data])

            content = response.text.strip()

            return {
                "success": True,
                "content": content,
                "source": "Gemini_VLM"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"文字提取失败: {str(e)}"
            }

    async def extract_device_info(self, image_path: str) -> Dict[str, Any]:
        """
        从手机"关于本机"截图中提取设备信息 (替代OCR功能)

        Args:
            image_path: 关于本机截图路径

        Returns:
            提取的设备信息
        """
        try:
            prompt = """
            请分析这张手机"关于本机"或"设备信息"的截图，使用中文回答，提取以下关键信息：

            1. 设备型号和品牌
            2. 系统版本
            3. 存储容量信息
            4. 序列号或IMEI
            5. 其他重要的设备参数

            请以JSON格式返回：
            {
                "device_brand": "设备品牌",
                "device_model": "具体型号",
                "system_version": "系统版本",
                "storage_info": "存储容量",
                "serial_number": "序列号",
                "imei": "IMEI号码",
                "other_info": "其他重要信息"
            }
            """

            image_data = self._load_image(image_path)
            response = self.model.generate_content([prompt, image_data])

            result_text = response.text.strip()

            # 尝试提取JSON部分
            if "```json" in result_text:
                json_start = result_text.find("```json") + 7
                json_end = result_text.find("```", json_start)
                result_text = result_text[json_start:json_end].strip()
            elif "{" in result_text and "}" in result_text:
                json_start = result_text.find("{")
                json_end = result_text.rfind("}") + 1
                result_text = result_text[json_start:json_end]

            try:
                device_info = json.loads(result_text)
            except json.JSONDecodeError:
                # 如果JSON解析失败，从原始文本中提取信息
                device_info = {
                    "device_brand": "未知",
                    "device_model": "未知",
                    "system_version": "未知",
                    "storage_info": "未知",
                    "serial_number": "未知",
                    "imei": "未知",
                    "other_info": "AI解析异常",
                    "raw_response": result_text
                }

            return {
                "success": True,
                "device_info": device_info,
                "source": "Gemini_VLM"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"设备信息提取失败: {str(e)}"
            }

    async def machine_type_info(self, image_path: str) -> Dict[str, Any]:
            """
            从手机"关于本机"截图中提取设备信息 (替代OCR功能)

            Args:
                image_path: 关于本机截图路径

            Returns:
                提取的设备信息
            """
            try:
                prompt = """
                请分析这张手机"关于本机"或"设备信息"的截图，使用中文回答，提取以下关键信息：

                1. 设备型号和品牌
                2. 系统版本
                3. 存储容量信息

                请以JSON格式返回：
                {
                    "device_brand": "设备品牌",
                    "device_model": "具体型号",
                    "system_version": "系统版本",
                    "storage_info": "存储容量",
                    "other_info": "其他重要信息"
                }
                """

                image_data = self._load_image(image_path)
                response = self.model.generate_content([prompt, image_data])

                result_text = response.text.strip()

                # 尝试提取JSON部分
                if "```json" in result_text:
                    json_start = result_text.find("```json") + 7
                    json_end = result_text.find("```", json_start)
                    result_text = result_text[json_start:json_end].strip()
                elif "{" in result_text and "}" in result_text:
                    json_start = result_text.find("{")
                    json_end = result_text.rfind("}") + 1
                    result_text = result_text[json_start:json_end]

                try:
                    device_info = json.loads(result_text)
                except json.JSONDecodeError:
                    # 如果JSON解析失败，从原始文本中提取信息
                    device_info = {
                        "device_brand": "未知",
                        "device_model": "未知",
                        "system_version": "未知",
                        "storage_info": "未知",
                        "other_info": "AI解析异常",
                        "raw_response": result_text
                    }

                return {
                    "success": True,
                    "device_info": device_info,
                    "source": "Gemini_VLM"
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": f"设备信息提取失败: {str(e)}"
                }

    async def product_date_info(self, image_path: str) -> Dict[str, Any]:
            """
           提取第一次使用时间图片

            Args:
                image_path: 关于本机截图路径

            Returns:
                提取的设备信息
            """
            try:
                prompt = """
                请分析这张手机"关于本机"或"设备信息"的截图，使用中文回答，提取以下关键信息：

                1. 生产日期
                2. 首次使用日期

                请以JSON格式返回：
                {
                    "product_date": "生产日期",
                    "first_use_date": "首次使用日期",
                    "other_info": "其他重要信息"
                }
                """

                image_data = self._load_image(image_path)
                response = self.model.generate_content([prompt, image_data])

                result_text = response.text.strip()

                # 尝试提取JSON部分
                if "```json" in result_text:
                    json_start = result_text.find("```json") + 7
                    json_end = result_text.find("```", json_start)
                    result_text = result_text[json_start:json_end].strip()
                elif "{" in result_text and "}" in result_text:
                    json_start = result_text.find("{")
                    json_end = result_text.rfind("}") + 1
                    result_text = result_text[json_start:json_end]

                try:
                    device_info = json.loads(result_text)
                except json.JSONDecodeError:
                    # 如果JSON解析失败，从原始文本中提取信息
                    device_info = {
                        "product_date": "未知",
                        "first_use_date": "未知",
                        "other_info": "AI解析异常",
                        "raw_response": result_text
                    }

                return {
                    "success": True,
                    "device_info": device_info,
                    "source": "Gemini_VLM"
                }

            except Exception as e:
                return {
                    "success": False,
                    "error": f"设备信息提取失败: {str(e)}"
                }

    async def extract_battery_info(self, image_path: str) -> Dict[str, Any]:
        """
        从"电池健康"截图中提取电池信息 (替代OCR功能)

        Args:
            image_path: 电池健康截图路径

        Returns:
            提取的电池信息
        """
        try:
            prompt = """
            请分析这张电池健康或电池信息的截图，使用中文回答，提取以下信息：

            1. 电池最大容量百分比
            2. 电池健康状态
            3. 峰值性能能力
            4. 充电次数（如果显示）
            5. 其他电池相关信息

            请以JSON格式返回：
            {
                "maximum_capacity": "最大容量百分比",
                "battery_health": "健康状态评估",
                "peak_performance": "峰值性能状态",
                "charge_cycles": "充电次数",
                "recommendations": "建议"
            }
            """

            image_data = self._load_image(image_path)
            response = self.model.generate_content([prompt, image_data])

            result_text = response.text.strip()

            if "```json" in result_text:
                json_start = result_text.find("```json") + 7
                json_end = result_text.find("```", json_start)
                result_text = result_text[json_start:json_end].strip()

            try:
                battery_info = json.loads(result_text)
            except json.JSONDecodeError:
                battery_info = {
                    "maximum_capacity": "未知",
                    "battery_health": "无法检测",
                    "peak_performance": "未知",
                    "charge_cycles": "未知",
                    "recommendations": "需要人工检查",
                    "raw_response": result_text
                }

            return {
                "success": True,
                "battery_info": battery_info,
                "source": "Gemini_VLM"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"电池信息提取失败: {str(e)}"
            }

    async def final_report(self, content: str) -> Dict[str, Any]:
        try:
            prompt = """
            **请扮演一位专业的二手设备回收估价师。**

            **任务目标：**
            根据以下提供的质检信息，进行详细评估，并给出最终的回收估价。即使报告中的某些信息缺失或不完整，也请基于已有数据做出最合理的判断。
            
            **评估要求：**
            1.  **确定价格区间：** 给出该设备**合理的回收价格区间（人民币）**。
            2.  **核心依据：** 必须优先考虑**主要缺陷**，这是最大的价格扣减项。
            3.  **最终总结：** 以专业、简洁的语言生成最终的估价报告。
            请以JSON格式返回：
            {
                "price": "价格区间",
                "other_info": "其他重要信息"
            }
            """

            response = self.model.generate_content([prompt, content])

            result_text = response.text.strip()

            if "```json" in result_text:
                json_start = result_text.find("```json") + 7
                json_end = result_text.find("```", json_start)
                result_text = result_text[json_start:json_end].strip()

            try:
                analysis_result = json.loads(result_text)
            except json.JSONDecodeError:
                analysis_result = {
                    "price": "需要人工解析",
                    "other_info":"解析异常",
                    "raw_response": result_text
                }

            return {
                "success": True,
                "result_text": analysis_result
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"最终报告生成失败: {str(e)}"
            }




# 全局实例
gemini_vlm = GeminiVLMService()