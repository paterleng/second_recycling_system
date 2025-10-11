import uuid
import asyncio
from pathlib import Path
from typing import Dict, Any
from celery import current_task

from app.tasks.celery_app import celery_app
from config.database import SessionLocal
from app.models.inspection import TaskStatus
# OCR服务已移除，使用Gemini VLM替代
from app.services.vlm.gemini_service import gemini_vlm
from app.services.valuation.valuation_service import valuation_service
from config.settings import settings


@celery_app.task(bind=True)
def process_inspection_task(self, task_id_str: str):
    """
    任务来了之后会到这个地方
    处理质检任务的主函数

    Args:
        task_id_str: 任务ID字符串
    """
    # 延迟导入以避免循环依赖
    from app.services.inspection_service import InspectionService
    
    task_id = uuid.UUID(task_id_str)
    db = SessionLocal()


    try:
        # 更新任务状态为处理中
        inspection_service = InspectionService(db)
        inspection_service.update_inspection_status(task_id, TaskStatus.PROCESSING)

        # 获取任务信息
        inspection = inspection_service.get_inspection(task_id)
        if not inspection:
            raise Exception("任务不存在")

        user_inputs = inspection.user_inputs
        uploaded_files = user_inputs["uploaded_files"]
        basic_info = user_inputs["basic_info"]
        user_inputs_text = user_inputs["user_text_inputs"]

        # 构建文件完整路径 - 使用相对于backend目录的路径
        upload_base = Path('../uploads')

        # 1. VLM文字识别和信息提取
        current_task.update_state(state='PROGRESS', meta={'step': 'VLM信息提取', 'progress': 20})


        # 使用Gemini提取"关于本机"信息
        about_machine_path = upload_base / uploaded_files["about_machine_image"]
        print(about_machine_path)
        device_info_result = asyncio.run(
            gemini_vlm.extract_device_info(str(about_machine_path))
        )
        print("本机信息结果",device_info_result)

        # 使用Gemini提取手机类型信息
        machine_type_path = upload_base / uploaded_files["machine_type_image"]
        print(machine_type_path)
        machine_type_result = asyncio.run(
            gemini_vlm.machine_type_info(str(machine_type_path))
        )
        print("类型结果", machine_type_result)

        # 提取生产时间信息
        product_date_path = upload_base / uploaded_files["product_date_image"]
        print(product_date_path)
        product_date_result = asyncio.run(
            gemini_vlm.product_date_info(str(product_date_path))
        )
        print("生产时间结果", product_date_result)

        # 使用Gemini提取"电池健康"信息
        battery_health_path = upload_base / uploaded_files["battery_health_image"]
        battery_info_result = asyncio.run(
            gemini_vlm.extract_battery_info(str(battery_health_path))
        )
        print("电池健康结果",battery_info_result)

        # 2. VLM外观和功能分析
        current_task.update_state(state='PROGRESS', meta={'step': 'VLM外观和功能分析', 'progress': 40})

        # 分析外观
        appearance_paths = [
            str(upload_base / path) for path in uploaded_files["appearance_images"]
        ]
        appearance_result = asyncio.run(
            gemini_vlm.analyze_appearance(appearance_paths)
        )
        print("外观分析结果",appearance_result)

        # 分析屏幕
        screen_path = upload_base / uploaded_files["screen_image"]
        screen_result = asyncio.run(
            gemini_vlm.analyze_screen(str(screen_path))
        )
        print("屏幕分析结果",screen_result)

        # 分析摄像头镜片
        camera_lens_paths = [
            str(upload_base / path) for path in uploaded_files["camera_lens_images"]
        ]
        camera_result = asyncio.run(
            gemini_vlm.analyze_camera_lens(camera_lens_paths)
        )
        print("摄像头分析结果",camera_result)

        # 分析闪光灯
        flashlight_path = upload_base / uploaded_files["flashlight_image"]
        flashlight_result = asyncio.run(
            gemini_vlm.analyze_flashlight(str(flashlight_path))
        )
        print("闪光灯分析结果",flashlight_result)

        # 3. 整合分析结果
        current_task.update_state(state='PROGRESS', meta={'step': '生成质检报告', 'progress': 70})

        analysis_results = {
            "device_info": device_info_result,
            "machine_type": machine_type_result,
            "product_date": product_date_result,
            "battery_info": battery_info_result,
            "appearance": appearance_result,
            "screen": screen_result,
            "camera": camera_result,
            "flashlight": flashlight_result,
            "basic_info" :basic_info,
            "user_inputs_text": user_inputs_text,
        }
        print("综合结果",analysis_results)

        # 提取结果，组合成字符串总结
        descriptive_report_string = extract_and_format_report(analysis_results)

        print(descriptive_report_string)
        re_results = asyncio.run(
            gemini_vlm.final_report(descriptive_report_string)
        )
        print("价格预测", re_results)

        # 组合到一起返回
        final_report = extract_information(analysis_results)
        print("价格",re_results.get("result_text",{}).get("price","需要人工定价"))
        # 加上价格存储到数据库中

        final_report["user_input"] = basic_info
        final_report["user_inputs_text"] = user_inputs_text
        print("最终结果",final_report)

        # # 4. 估价计算
        # current_task.update_state(state='PROGRESS', meta={'step': '计算估价', 'progress': 85})
        #
        # valuation_result = valuation_service.calculate_price(
        #     brand=basic_info["brand"],
        #     model=basic_info["model"],
        #     storage=basic_info["storage"],
        #     analysis_results=analysis_results
        # )

        # # 5. 生成最终报告
        # current_task.update_state(state='PROGRESS', meta={'step': '生成最终报告', 'progress': 95})
        #
        # final_report = _generate_final_report(
        #     basic_info, analysis_results, valuation_result
        # )
        # print("最终报告",final_report)

        # 6. 保存结果
        inspection_service.save_inspection_result(task_id, final_report)

        current_task.update_state(state='SUCCESS', meta={'step': '完成', 'progress': 100})

        return {
            "status": "success",
            "task_id": task_id_str,
            "message": "质检任务完成"
        }

    except Exception as e:
        # 更新任务状态为失败
        error_message = f"质检任务处理失败: {str(e)}"
        inspection_service.update_inspection_status(
            task_id, TaskStatus.FAILED, error_message
        )

        current_task.update_state(
            state='FAILURE',
            meta={'error': error_message}
        )

        return {
            "status": "failed",
            "task_id": task_id_str,
            "error": error_message
        }

    finally:
        db.close()


def _generate_final_report(
    basic_info: Dict[str, Any],
    analysis_results: Dict[str, Any],
    valuation_result: Dict[str, Any]
) -> Dict[str, Any]:
    """生成最终报告"""

    # 设备信息
    device_info = {
        "brand": basic_info["brand"],
        "model": basic_info["model"],
        "storage": basic_info["storage"]
    }

    # 估价信息
    valuation = {
        "price": str(valuation_result.get("final_price", 0)),
        "currency": "CNY"
    }

    # 摘要信息
    summary = []

    # 整体成色
    if analysis_results["appearance"]["success"]:
        appearance_analysis = analysis_results["appearance"]["analysis"]
        summary.append({
            "item": "整体成色",
            "grade": appearance_analysis.get("overall_condition", "一般"),
            "issue": ", ".join(appearance_analysis.get("issues", [])) or None,
            "suggestion": ", ".join(appearance_analysis.get("suggestions", [])) or "保持良好使用习惯"
        })

    # 电池健康度
    if analysis_results["battery_info"]["success"]:
        battery_info = analysis_results["battery_info"]["battery_info"]
        summary.append({
            "item": "电池健康度",
            "grade": battery_info.get("maximum_capacity", "未知"),
            "issue": None,
            "suggestion": f"电池健康度{battery_info.get('battery_health', '未知')}"
        })

    # 屏幕状况
    if analysis_results["screen"]["success"]:
        screen_analysis = analysis_results["screen"]["analysis"]
        summary.append({
            "item": "屏幕状况",
            "grade": screen_analysis.get("screen_condition", "一般"),
            "issue": ", ".join(screen_analysis.get("issues", [])) or None,
            "suggestion": "正常使用"
        })

    # 摄像头状况
    if analysis_results["camera"]["success"]:
        camera_analysis = analysis_results["camera"]["analysis"]
        summary.append({
            "item": "摄像头状况",
            "grade": camera_analysis.get("lens_condition", "一般"),
            "issue": ", ".join(camera_analysis.get("issues", [])) or None,
            "suggestion": "保持镜头清洁"
        })

    # 详细标签
    detailed_tags = []

    # 机身外壳标签
    if analysis_results["appearance"]["success"]:
        appearance_analysis = analysis_results["appearance"]["analysis"]
        if appearance_analysis.get("issues"):
            detailed_tags.append({
                "tag_category": "机身外壳",
                "result": ", ".join(appearance_analysis["issues"]),
                "source": "VLM"
            })

    # 屏幕标签
    if analysis_results["screen"]["success"]:
        screen_analysis = analysis_results["screen"]["analysis"]
        if screen_analysis.get("issues"):
            detailed_tags.append({
                "tag_category": "屏幕状况",
                "result": ", ".join(screen_analysis["issues"]),
                "source": "VLM"
            })

    # 电池标签
    if analysis_results["battery_info"]["success"]:
        battery_info = analysis_results["battery_info"]["battery_info"]
        if battery_info.get("maximum_capacity"):
            detailed_tags.append({
                "tag_category": "电池健康",
                "result": f"电池容量{battery_info['maximum_capacity']}",
                "source": "VLM"
            })

    return {
        "device_info": device_info,
        "valuation": valuation,
        "summary": summary,
        "detailed_tags": detailed_tags
    }


def extract_information(data: dict) -> dict:
    # 由于存在 'device_info' 和 'machine_type' 两个信息源，以更准确的 'machine_type' 为准
    machine_type_data = data.get('machine_type', {}).get('device_info', {})

    brand = machine_type_data.get('device_brand', '未知')
    model = machine_type_data.get('device_model', '未知')
    storage_total = machine_type_data.get('storage_info', '未知容量').split(',')[0].replace('总容量 ', '')
    storage_use = machine_type_data.get('storage_info', '未知容量').split(',')[0].replace('可用容量', '')

    # --- 2. 电池信息 ---
    battery_data = data.get('battery_info', {}).get('battery_info', {})

    # --- 3. 外观检查 ---
    appearance_analysis = data.get('appearance', {}).get('analysis', {})
    appearance = []
    detailed_app_analysis = appearance_analysis.get('detailed_analysis', {})
    appearance.append(f"- **正面分析:** {detailed_app_analysis.get('front', '无记录')}")
    appearance.append(f"- **背面分析:** {detailed_app_analysis.get('back', '无记录')}")
    appearance.append(f"- **侧边分析:** {detailed_app_analysis.get('edges', '无记录')}")
    # --- 4. 屏幕检查 ---
    screen_analysis = data.get('screen', {}).get('analysis', {})
    screen_result = []
    issues = screen_analysis.get('issues', [])
    if issues:
        screen_result.append(f"- **主要问题:**")
        for issue in issues:
            screen_result.append(f"    - {issue}")
    else:
        screen_result.append(f"- **主要问题:** 无")

    screen_result.append(f"- **显示质量:** {screen_analysis.get('display_quality', '未知')}")
    # --- 5. 摄像头检查 ---
    camera_analysis = data.get('camera', {}).get('analysis', {})
    # --- 6. 闪光灯检查 ---
    flashlight_analysis = data.get('flashlight', {}).get('analysis', {})


    # ---6. 时间 ---
    product_date_data = data.get('product_date', {}).get('device_info', {})

    product_date = product_date_data.get('product_date', 'N/A')
    first_use_date = product_date_data.get('first_use_date', 'N/A')

    device_info = data.get("device_info", {}).get("device_info", {})

    result = {
        # 品牌型号
        "brand": brand + model,
        # 存储容量
        "storage_total": storage_total,
        # 可用容量
        "storage_use": storage_use,
        # 生产日期
        "product_date": product_date,
        # 第一次使用时间日期
        "first_use_date": first_use_date,
        # 电池健康百分比
        "maximum_capacity": battery_data.get('maximum_capacity', '未知'),
        # 电池状态
        "battery_health": battery_data.get('battery_health', '未知'),
        # 充放电次数
        "charge_cycles": battery_data.get('charge_cycles', '未知'),
        # 机身整体成色
        "overall_condition": appearance_analysis.get('overall_condition', '未知'),
        # 外观的分析结果
        "appearance_result": appearance,
        # 屏幕成色
        "screen_condition": screen_analysis.get('screen_condition', '未知'),
        # 屏幕分析结果
        "screen_result": screen_result,
        # 镜头状态
        "camera_lens": camera_analysis.get('lens_condition', '未知'),
        # 是否有物理损坏
        "physical_damage": camera_analysis.get('physical_damage', '未知'),
        "flashlight_line": flashlight_analysis.get('functionality', '未知'),
        "other_info": device_info.get("other_info", '无')
    }
    return result

def extract_and_format_report(data: dict) -> str:
    """
    将 VLM 提取的嵌套字典转换为易于模型分析的描述性字符串。
    """
    report_lines = ["# 质检结果综合报告", ""]

    # --- 1. 基础信息提取 ---
    # 由于存在 'device_info' 和 'machine_type' 两个信息源，以更准确的 'machine_type' 为准
    machine_type_data = data.get('machine_type', {}).get('device_info', {})

    brand = machine_type_data.get('device_brand', '未知')
    model = machine_type_data.get('device_model', '未知')
    storage = machine_type_data.get('storage_info', '未知容量').split(',')[0].replace('总容量 ', '')

    report_lines.append(f"## 基础设备信息")
    report_lines.append(f"- **品牌/型号:** {brand} {model}")
    report_lines.append(f"- **存储容量:** {storage}")

    # --- 2. 电池信息 ---
    battery_data = data.get('battery_info', {}).get('battery_info', {})
    report_lines.append(f"\n## 电池健康状况")
    report_lines.append(f"- **最大容量:** {battery_data.get('maximum_capacity', 'N/A')}")
    report_lines.append(f"- **循环次数:** {battery_data.get('charge_cycles', 'N/A')}")
    report_lines.append(f"- **性能状态:** {battery_data.get('battery_health', 'N/A')}")
    report_lines.append(f"- **建议/备注:** {battery_data.get('recommendations', '无')}")

    # --- 3. 外观检查 ---
    appearance_analysis = data.get('appearance', {}).get('analysis', {})
    report_lines.append(f"\n## 外观/机身检查 (Appearance)")
    report_lines.append(f"- **整体成色:** {appearance_analysis.get('overall_condition', '未知')}")

    detailed_app_analysis = appearance_analysis.get('detailed_analysis', {})
    report_lines.append(f"- **正面分析:** {detailed_app_analysis.get('front', '无记录')}")
    report_lines.append(f"- **背面分析:** {detailed_app_analysis.get('back', '无记录')}")
    report_lines.append(f"- **侧边分析:** {detailed_app_analysis.get('edges', '无记录')}")

    # --- 4. 屏幕检查 ---
    screen_analysis = data.get('screen', {}).get('analysis', {})
    report_lines.append(f"\n## 屏幕状况检查 (Screen)")
    report_lines.append(f"- **屏幕评分:** {screen_analysis.get('screen_condition', '未知')}")


    issues = screen_analysis.get('issues', [])
    if issues:
        report_lines.append(f"- **主要问题:**")
        for issue in issues:
            report_lines.append(f"    - {issue}")
    else:
        report_lines.append(f"- **主要问题:** 无")

    report_lines.append(f"- **显示质量:** {screen_analysis.get('display_quality', '未知')}")

    # --- 5. 摄像头检查 ---
    camera_analysis = data.get('camera', {}).get('analysis', {})
    report_lines.append(f"\n## 摄像头检查 (Camera)")
    report_lines.append(f"- **镜头状态:** {camera_analysis.get('lens_condition', '未知')}")
    report_lines.append(f"- **清洁度:** {camera_analysis.get('cleanliness', '未知')}")
    report_lines.append(f"- **物理损坏:** {camera_analysis.get('physical_damage', '未知')}")

    # --- 6. 闪光灯检查 ---
    flashlight_analysis = data.get('flashlight', {}).get('analysis', {})
    report_lines.append(f"\n## 闪光灯检查 (Flashlight)")
    report_lines.append(f"- **功能性评估:** {flashlight_analysis.get('functionality', '无法评估')}")
    report_lines.append(f"- **问题记录:** {', '.join(flashlight_analysis.get('issues', ['无']))}")

    # ---6. 时间 ---
    product_date_data = data.get('product_date', {}).get('device_info', {})

    product_date = product_date_data.get('product_date', 'N/A')
    first_use_date = product_date_data.get('first_use_date', 'N/A')

    report_lines.append(f"\n## 使用历史 (Usage)")
    report_lines.append(f"- **出厂日期:** {product_date}")
    report_lines.append(f"- **首次激活/使用日期:** {first_use_date}")

    # 7. 用户描述
    report_lines.append(f"\n## 用户描述")
    report_lines.append(f"- **用户文本描述:** {data.get('user_inputs_text')}")

    return "\n".join(report_lines)


