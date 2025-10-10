from sqlalchemy import Column, String, Integer, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid
from config.database import Base


class DeviceModel(Base):
    __tablename__ = "device_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    storage_capacity = Column(String(20), nullable=False)

    # 基础回收价格
    base_price = Column(Float, nullable=False)

    # 是否启用
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<DeviceModel {self.brand} {self.model} {self.storage_capacity}>"


class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # 折旧标签
    tag_category = Column(String(50), nullable=False)  # 如: "机身外壳", "屏幕状况"
    tag_result = Column(String(100), nullable=False)   # 如: "有划痕小磕碰", "屏幕划痕"

    # 扣款金额或百分比
    deduction_type = Column(String(20), nullable=False)  # "AMOUNT" 或 "PERCENTAGE"
    deduction_value = Column(Float, nullable=False)

    # 是否启用
    is_active = Column(Boolean, default=True)

    def __repr__(self):
        return f"<PricingRule {self.tag_category}: {self.tag_result}>"