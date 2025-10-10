#!/usr/bin/env python3
"""
数据库初始化脚本
"""

from sqlalchemy import create_engine
from config.database import Base
from config.settings import settings
from app.models import inspection, device
from app.services.valuation.valuation_service import valuation_service

def init_database():
    """初始化数据库"""
    print("正在初始化数据库...")

    # 创建数据库引擎
    engine = create_engine(settings.DATABASE_URL)

    # 创建所有表
    Base.metadata.create_all(bind=engine)

    print("数据库表创建完成!")

    # 初始化一些基础数据
    init_sample_data()

    print("数据库初始化完成!")

def init_sample_data():
    """初始化示例数据"""
    print("正在添加示例设备型号...")

    # 添加一些示例设备型号
    sample_devices = [
        ("Apple", "iPhone 13 mini", "128GB", 3500.0),
        ("Apple", "iPhone 13 mini", "256GB", 4000.0),
        ("Apple", "iPhone 13", "128GB", 4500.0),
        ("Apple", "iPhone 13", "256GB", 5000.0),
        ("Apple", "iPhone 13 Pro", "128GB", 6000.0),
        ("Apple", "iPhone 13 Pro", "256GB", 6500.0),
        ("Apple", "iPhone 13 Pro Max", "128GB", 6800.0),
        ("Apple", "iPhone 13 Pro Max", "256GB", 7300.0),
        ("Samsung", "Galaxy S21", "128GB", 3000.0),
        ("Samsung", "Galaxy S21", "256GB", 3500.0),
        ("Huawei", "P40 Pro", "128GB", 2800.0),
        ("Xiaomi", "Mi 11", "128GB", 2200.0),
    ]

    for brand, model, storage, price in sample_devices:
        valuation_service.add_device_model(brand, model, storage, price)

    print("示例设备型号添加完成!")

    print("正在添加示例定价规则...")

    # 添加一些示例定价规则
    sample_rules = [
        ("机身外壳", "有划痕小磕碰", "AMOUNT", 150.0),
        ("机身外壳", "严重磨损", "AMOUNT", 400.0),
        ("屏幕状况", "屏幕划痕", "AMOUNT", 300.0),
        ("屏幕状况", "屏幕破裂", "AMOUNT", 800.0),
        ("电池健康", "电池容量低于80%", "PERCENTAGE", 5.0),
        ("摄像头状况", "镜头划痕", "AMOUNT", 200.0),
    ]

    for category, result, deduction_type, value in sample_rules:
        valuation_service.add_pricing_rule(category, result, deduction_type, value)

    print("示例定价规则添加完成!")

if __name__ == "__main__":
    init_database()