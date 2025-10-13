from sqlalchemy.orm import Session
from fastapi import UploadFile
from typing import List, Dict, Any
import uuid
from datetime import datetime

from app.models.inspection import Inspection, TaskStatus
from app.services.storage.file_storage import file_storage

from app.tasks.inspection_tasks import process_inspection_task


class InspectionService:
    """质检服务"""

    def __init__(self, db: Session):
        self.db = db

    async def create_inspection_task(
        self,
        brand: str,
        model: str,
        storage: str,
        accessory_condition: str,
        # about_machine_image: UploadFile,
        machine_type_image: List[UploadFile],
        product_date_image: UploadFile,
        battery_health_image: UploadFile,
        appearance_images: List[UploadFile],
        screen_image: UploadFile,
        camera_lens_images: List[UploadFile],
        flashlight_image: UploadFile,
        user_text_inputs: Dict[str, Any]
    ) -> uuid.UUID:
        """
        创建质检任务

        1. 保存上传的文件
        2. 创建数据库记录
        3. 启动异步处理任务

        Returns:
            任务ID
        """
        # 生成任务ID
        task_id = uuid.uuid4()
        task_folder = f"inspections/{task_id}"

        try:
            # 保存文件
            # about_machine_path = await file_storage.save_file(about_machine_image, task_folder)
            product_date_path = await file_storage.save_file(product_date_image, task_folder)
            battery_health_path = await file_storage.save_file(battery_health_image, task_folder)
            screen_path = await file_storage.save_file(screen_image, task_folder)
            flashlight_path = await file_storage.save_file(flashlight_image, task_folder)

            machine_type_path = await file_storage.save_files(machine_type_image, task_folder)
            appearance_paths = await file_storage.save_files(appearance_images, task_folder)
            camera_lens_paths = await file_storage.save_files(camera_lens_images, task_folder)

            # 构建用户输入数据
            user_inputs = {
                "basic_info": {
                    "brand": brand,
                    "model": model,
                    "storage": storage,
                    "accessory_condition": accessory_condition
                },
                "uploaded_files": {
                    # "about_machine_image": about_machine_path,
                    "machine_type_image": machine_type_path,
                    "product_date_image": product_date_path,
                    "battery_health_image": battery_health_path,
                    "appearance_images": appearance_paths,
                    "screen_image": screen_path,
                    "camera_lens_images": camera_lens_paths,
                    "flashlight_image": flashlight_path
                },
                "user_text_inputs": user_text_inputs,
                "upload_timestamp": datetime.utcnow().isoformat()
            }

            # 创建数据库记录
            inspection = Inspection(
                id=task_id,
                status=TaskStatus.PENDING,
                user_inputs=user_inputs
            )

            self.db.add(inspection)
            self.db.commit()
            self.db.refresh(inspection)

            # 启动异步处理任务
            from app.tasks.inspection_tasks import process_inspection_task
            process_inspection_task.delay(str(task_id))


            return task_id

        except Exception as e:
            # 如果创建失败，尝试清理已上传的文件
            self._cleanup_files(task_folder)
            raise e

    def _cleanup_files(self, task_folder: str) -> None:
        """清理文件"""
        try:
            import shutil
            from pathlib import Path
            folder_path = Path(file_storage.upload_path) / task_folder
            if folder_path.exists():
                shutil.rmtree(folder_path)
        except Exception:
            pass  # 清理失败不影响主流程

    def get_inspection(self, task_id: uuid.UUID) -> Inspection:
        """获取质检结果"""
        return self.db.query(Inspection).filter(Inspection.id == task_id).first()

    def update_inspection_status(self, task_id: uuid.UUID, status: TaskStatus,
                                error_message: str = None) -> None:
        """更新质检状态"""
        inspection = self.db.query(Inspection).filter(Inspection.id == task_id).first()
        if inspection:
            inspection.status = status
            if error_message:
                inspection.error_message = error_message
            if status == TaskStatus.COMPLETED or status == TaskStatus.FAILED:
                inspection.completed_at = datetime.utcnow()
            self.db.commit()

    def save_inspection_result(self, task_id: uuid.UUID, report: Dict[str, Any]) -> None:
        """保存质检结果"""
        inspection = self.db.query(Inspection).filter(Inspection.id == task_id).first()
        if inspection:
            inspection.final_report = report
            inspection.status = TaskStatus.COMPLETED
            inspection.completed_at = datetime.utcnow()
            self.db.commit()