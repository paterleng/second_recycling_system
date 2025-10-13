from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import uuid
from datetime import datetime

from config.database import get_db
from app.models.inspection import Inspection, TaskStatus
from app.models.schemas import (
    InspectionCreate, InspectionResponse, InspectionListResponse
)
from app.services.inspection_service import InspectionService

router = APIRouter()


@router.post("/", response_model=dict)
async def create_inspection(
    brand: str = Form(...),
    model: str = Form(...),
    storage: str = Form(...),
    accessory_condition: str = Form(...),
    about_machine_image: UploadFile = File(...),
    machine_type_image: UploadFile = File(...),
    product_date_image: UploadFile = File(...),
    battery_health_image: UploadFile = File(...),
    appearance_images: List[UploadFile] = File(...),
    screen_image: UploadFile = File(...),
    camera_lens_images: List[UploadFile] = File(...),
    flashlight_image: UploadFile = File(...),
    user_text_inputs: str = Form(...),
    db: Session = Depends(get_db)
):

    """
    brand: 设备品牌名
    model: 设备的型号
    storage: 设备的存储容量
    accessory_condition: 配件的状况（例如：原装, 良好, 缺失等）。
    about_machine_image: 整机图片
    machine_type_image: 手机类型
    product_date_image: 生产日期
    battery_health_image: 电池健康截图或相关图片
    appearance_images: 机身外观的多张图片
    screen_image: 屏幕图片
    camera_lens_images: 摄像头/镜头组的多张图片
    flashlight_image: 闪光灯图片
    user_text_inputs: 用户输入的额外文本说明或备注。
    db: Session = Depends(get_db)
    """
    """
    创建质检任务

    接收用户上传的所有图片和基础信息，创建质检任务并返回任务ID
    """

    try:
        # 解析用户文本输入
        # text_inputs = {}
        # if user_text_inputs:
        #     # 用户不能输入
        #     try:
        #         text_inputs = json.loads(user_text_inputs)
        #     except json.JSONDecodeError:
        #         raise HTTPException(status_code=400, detail="user_text_inputs must be valid JSON")
        # return {"task_id": "成功"}
        # 创建质检服务实例
        inspection_service = InspectionService(db)

        # 处理文件上传和创建质检任务
        task_id = await inspection_service.create_inspection_task(
            brand=brand,
            model=model,
            storage=storage,
            accessory_condition=accessory_condition,
            about_machine_image=about_machine_image,
            machine_type_image=machine_type_image,
            product_date_image=product_date_image,
            battery_health_image=battery_health_image,
            appearance_images=appearance_images,
            screen_image=screen_image,
            camera_lens_images=camera_lens_images,
            flashlight_image=flashlight_image,
            user_text_inputs=user_text_inputs
        )

        return {"task_id": str(task_id), "message": "质检任务已创建，正在处理中..."}

    except Exception as e:

        # 打印详细错误信息，以便诊断
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"创建质检任务失败: {str(e)}")


# http://localhost:8000/api/v1/inspections/89eb7227-f236-4f36-ab55-14a637216730
@router.get("/{task_id}")
async def get_inspection(task_id: str, db: Session = Depends(get_db)):
    """
    获取质检结果

    根据任务ID获取质检结果和估价信息
    """

    # 查询数据库
    inspection = db.query(Inspection).filter(Inspection.id == task_id).first()


    if not inspection:
        raise HTTPException(status_code=404, detail="未找到指定的质检任务")

    # 构建响应
    response_data = {
        "task_id": str(inspection.id),
        "status": inspection.status,
        "created_at": inspection.created_at,
        "completed_at": inspection.completed_at
    }

    if inspection.status == TaskStatus.COMPLETED and inspection.final_report:
        response_data["report"] = inspection.final_report
    elif inspection.status == TaskStatus.FAILED:
        response_data["error_message"] = inspection.error_message

    return response_data


# http://localhost:8000/api/v1/inspections/
@router.get("/", response_model=InspectionListResponse)
async def list_inspections(
    skip: int = 0,
    limit: int = 20,
    status: Optional[TaskStatus] = None,
    db: Session = Depends(get_db)
):
    """
    获取质检任务列表

    支持分页和状态过滤
    """
    query = db.query(Inspection)

    if status:
        query = query.filter(Inspection.status == status)

    total = query.count()
    inspections = query.offset(skip).limit(limit).all()

    inspection_list = []
    for inspection in inspections:
        item = {
            "task_id": str(inspection.id),
            "status": inspection.status,
            "created_at": inspection.created_at,
            "completed_at": inspection.completed_at
        }

        if inspection.status == TaskStatus.COMPLETED and inspection.final_report:
            item["report"] = inspection.final_report
        elif inspection.status == TaskStatus.FAILED:
            item["error_message"] = inspection.error_message

        inspection_list.append(item)

    return {
        "inspections": inspection_list,
        "total": total
    }