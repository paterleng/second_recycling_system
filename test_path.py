
def abc():
    a = {
        'device_info': {'brand': 'iphone', 'model': '15', 'storage': '256'},
        'valuation': {'price': '0', 'currency': 'CNY'},
        'summary': [
            {'item': '整体成色', 'grade': '良好', 'issue': None, 'suggestion': '提供正面照片以便更全面评估。, 使用镜头纸清洁相机镜头。'},
        ]}

    print(a["device_info"]["brand"])

if __name__ == '__main__':
    abc()