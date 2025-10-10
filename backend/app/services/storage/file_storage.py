import os
import uuid
import aiofiles
from pathlib import Path
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from config.settings import settings


class FileStorageService:
    """文件存储服务"""

    def __init__(self):
        self.upload_path = Path(settings.UPLOAD_PATH)
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS

    def _validate_file(self, file: UploadFile) -> None:
        """验证文件"""
        # 检查文件扩展名
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件格式: {file_extension}. 支持的格式: {', '.join(self.allowed_extensions)}"
            )

    def _generate_filename(self, original_filename: str) -> str:
        """生成唯一文件名"""
        file_extension = Path(original_filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{file_extension}"

    async def save_file(self, file: UploadFile, subfolder: str = "") -> str:
        """
        保存单个文件

        Args:
            file: 上传的文件
            subfolder: 子文件夹名称

        Returns:
            文件相对路径
        """
        try:
            # 验证文件
            self._validate_file(file)

            # 创建子文件夹
            save_dir = self.upload_path / subfolder
            save_dir.mkdir(parents=True, exist_ok=True)

            # 生成唯一文件名
            filename = self._generate_filename(file.filename)
            file_path = save_dir / filename

            # 保存文件
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()

                # 检查文件大小
                if len(content) > self.max_file_size:
                    raise HTTPException(
                        status_code=400,
                        detail=f"文件过大，最大允许 {self.max_file_size / (1024*1024):.1f}MB"
                    )

                await f.write(content)

            # 返回相对路径
            relative_path = str(Path(subfolder) / filename) if subfolder else filename
            return relative_path

        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")

    async def save_files(self, files: List[UploadFile], subfolder: str = "") -> List[str]:
        """
        保存多个文件

        Args:
            files: 上传的文件列表
            subfolder: 子文件夹名称

        Returns:
            文件相对路径列表
        """
        file_paths = []
        for file in files:
            file_path = await self.save_file(file, subfolder)
            file_paths.append(file_path)
        return file_paths

    def get_file_url(self, file_path: str) -> str:
        """获取文件访问URL"""
        return f"/uploads/{file_path}"

    def delete_file(self, file_path: str) -> bool:
        """删除文件"""
        try:
            full_path = self.upload_path / file_path
            if full_path.exists():
                full_path.unlink()
                return True
            return False
        except Exception:
            return False

    def file_exists(self, file_path: str) -> bool:
        """检查文件是否存在"""
        full_path = self.upload_path / file_path
        return full_path.exists()


# 全局实例
file_storage = FileStorageService()