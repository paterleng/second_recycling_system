from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class InspectionCreate(BaseModel):
    brand: str = Field(..., description="手机品牌")
    model: str = Field(..., description="手机型号")
    storage: str = Field(..., description="存储容量")
    accessory_condition: str = Field(..., description="配件完好度")
    user_text_inputs: Optional[Dict[str, Any]] = Field(None, description="用户文本输入")


class DeviceInfo(BaseModel):
    brand: str
    model: str
    storage: str


class Valuation(BaseModel):
    price: str
    currency: str = "CNY"


class SummaryItem(BaseModel):
    item: str
    grade: str
    issue: Optional[str] = None
    suggestion: Optional[str] = None


class DetailedTag(BaseModel):
    tag_category: str
    result: str
    source: str


class InspectionReport(BaseModel):
    device_info: DeviceInfo
    valuation: Valuation
    summary: List[SummaryItem]
    detailed_tags: List[DetailedTag]


class InspectionResponse(BaseModel):
    task_id: str
    status: TaskStatus
    report: Optional[InspectionReport] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class InspectionListResponse(BaseModel):
    inspections: List[InspectionResponse]
    total: int