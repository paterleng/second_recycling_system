from sqlalchemy import Column, String, DateTime, Text, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from config.database import Base


class TaskStatus(enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False)

    # 用户提交的全部原始信息
    user_inputs = Column(JSON, nullable=False)

    # 包含质检详情和估价结果的最终报告
    final_report = Column(JSON, nullable=True)

    # 错误信息(如果处理失败)
    error_message = Column(Text, nullable=True)

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Inspection {self.id}: {self.status.value}>"