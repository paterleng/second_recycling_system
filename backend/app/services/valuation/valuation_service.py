from typing import Dict, Any, List
from sqlalchemy.orm import Session
from config.database import SessionLocal
from app.models.device import DeviceModel, PricingRule


class ValuationService:
    """估价服务"""

    def __init__(self):
        self.db = SessionLocal()

    def get_base_price(self, brand: str, model: str, storage: str) -> float:
        """
        获取设备基础价格

        Args:
            brand: 品牌
            model: 型号
            storage: 存储容量

        Returns:
            基础价格
        """
        try:
            device_model = self.db.query(DeviceModel).filter(
                DeviceModel.brand == brand,
                DeviceModel.model == model,
                DeviceModel.storage_capacity == storage,
                DeviceModel.is_active == True
            ).first()

            if device_model:
                return device_model.base_price

            # 如果没有找到精确匹配，返回默认价格
            # 这里可以实现更复杂的价格预估逻辑
            return self._estimate_default_price(brand, model, storage)

        except Exception as e:
            print(f"获取基础价格失败: {str(e)}")
            return self._estimate_default_price(brand, model, storage)

    def _estimate_default_price(self, brand: str, model: str, storage: str) -> float:
        """
        估算默认价格（当数据库中没有对应设备时）

        这里提供一个简单的价格估算逻辑，实际应用中可以接入更复杂的定价模型
        """
        # 品牌基础价格
        brand_base_prices = {
            "Apple": 3000,
            "Samsung": 2000,
            "Huawei": 1800,
            "Xiaomi": 1200,
            "OPPO": 1500,
            "VIVO": 1400,
            "OnePlus": 2200,
            "Honor": 1300
        }

        base_price = brand_base_prices.get(brand, 1000)

        # 存储容量加成
        storage_multiplier = {
            "64GB": 1.0,
            "128GB": 1.2,
            "256GB": 1.4,
            "512GB": 1.7,
            "1TB": 2.0
        }

        multiplier = storage_multiplier.get(storage, 1.0)

        return base_price * multiplier

    def calculate_deductions(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        根据分析结果计算扣款项

        Args:
            analysis_results: AI分析结果

        Returns:
            扣款项列表
        """
        deductions = []

        try:
            # 外观扣款
            if analysis_results["appearance"]["success"]:
                appearance_analysis = analysis_results["appearance"]["analysis"]
                overall_condition = appearance_analysis.get("overall_condition", "一般")

                # 根据整体成色扣款
                condition_deductions = {
                    "优秀": 0,
                    "良好": 100,
                    "一般": 300,
                    "较差": 600
                }

                if overall_condition in condition_deductions:
                    deductions.append({
                        "category": "整体成色",
                        "reason": f"整体成色{overall_condition}",
                        "type": "AMOUNT",
                        "value": condition_deductions[overall_condition]
                    })

                # 具体问题扣款
                issues = appearance_analysis.get("issues", [])
                for issue in issues:
                    if "划痕" in issue:
                        deductions.append({
                            "category": "外观损伤",
                            "reason": issue,
                            "type": "AMOUNT",
                            "value": 150
                        })
                    elif "磕碰" in issue:
                        deductions.append({
                            "category": "外观损伤",
                            "reason": issue,
                            "type": "AMOUNT",
                            "value": 200
                        })

            # 屏幕扣款
            if analysis_results["screen"]["success"]:
                screen_analysis = analysis_results["screen"]["analysis"]
                issues = screen_analysis.get("issues", [])

                for issue in issues:
                    if "裂" in issue or "碎" in issue:
                        deductions.append({
                            "category": "屏幕损伤",
                            "reason": issue,
                            "type": "AMOUNT",
                            "value": 800
                        })
                    elif "划痕" in issue:
                        deductions.append({
                            "category": "屏幕损伤",
                            "reason": issue,
                            "type": "AMOUNT",
                            "value": 300
                        })

            # 电池扣款
            if analysis_results["battery_info"]["success"]:
                battery_info = analysis_results["battery_info"]["battery_info"]
                max_capacity = battery_info.get("maximum_capacity", "")

                if "%" in max_capacity:
                    try:
                        capacity_value = int(max_capacity.replace("%", ""))
                        if capacity_value < 80:
                            deduction_amount = (80 - capacity_value) * 10
                            deductions.append({
                                "category": "电池健康",
                                "reason": f"电池健康度{max_capacity}",
                                "type": "AMOUNT",
                                "value": deduction_amount
                            })
                    except ValueError:
                        pass

            # 摄像头扣款
            if analysis_results["camera"]["success"]:
                camera_analysis = analysis_results["camera"]["analysis"]
                issues = camera_analysis.get("issues", [])

                for issue in issues:
                    if "划痕" in issue or "裂" in issue:
                        deductions.append({
                            "category": "摄像头损伤",
                            "reason": issue,
                            "type": "AMOUNT",
                            "value": 200
                        })

            return deductions

        except Exception as e:
            print(f"计算扣款失败: {str(e)}")
            return []

    def calculate_price(
        self,
        brand: str,
        model: str,
        storage: str,
        analysis_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        计算最终价格

        Args:
            brand: 品牌
            model: 型号
            storage: 存储容量
            analysis_results: AI分析结果

        Returns:
            价格计算结果
        """
        try:
            # 1. 获取基础价格
            base_price = self.get_base_price(brand, model, storage)

            # 2. 计算扣款项
            deductions = self.calculate_deductions(analysis_results)

            # 3. 计算总扣款
            total_deduction = 0
            for deduction in deductions:
                if deduction["type"] == "AMOUNT":
                    total_deduction += deduction["value"]
                elif deduction["type"] == "PERCENTAGE":
                    total_deduction += base_price * (deduction["value"] / 100)

            # 4. 计算最终价格
            final_price = max(0, base_price - total_deduction)

            return {
                "base_price": base_price,
                "total_deduction": total_deduction,
                "final_price": round(final_price, 2),
                "deductions": deductions,
                "calculation_details": {
                    "formula": "基础价格 - 各项扣款 = 最终估价",
                    "base_price_source": "数据库定价规则"
                }
            }

        except Exception as e:
            return {
                "base_price": 0,
                "total_deduction": 0,
                "final_price": 0,
                "deductions": [],
                "error": f"价格计算失败: {str(e)}"
            }

    def add_device_model(
        self,
        brand: str,
        model: str,
        storage_capacity: str,
        base_price: float
    ) -> bool:
        """添加设备型号和基础价格"""
        try:
            device_model = DeviceModel(
                brand=brand,
                model=model,
                storage_capacity=storage_capacity,
                base_price=base_price
            )
            self.db.add(device_model)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"添加设备型号失败: {str(e)}")
            return False

    def add_pricing_rule(
        self,
        tag_category: str,
        tag_result: str,
        deduction_type: str,
        deduction_value: float
    ) -> bool:
        """添加定价规则"""
        try:
            pricing_rule = PricingRule(
                tag_category=tag_category,
                tag_result=tag_result,
                deduction_type=deduction_type,
                deduction_value=deduction_value
            )
            self.db.add(pricing_rule)
            self.db.commit()
            return True
        except Exception as e:
            self.db.rollback()
            print(f"添加定价规则失败: {str(e)}")
            return False

    def __del__(self):
        """关闭数据库连接"""
        if hasattr(self, 'db'):
            self.db.close()


# 全局实例
valuation_service = ValuationService()