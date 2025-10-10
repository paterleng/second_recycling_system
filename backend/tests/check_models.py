#!/usr/bin/env python3
"""
检查可用的Gemini模型
"""

import os
import sys
from pathlib import Path

# 设置环境变量
env_file = Path(".env")
if env_file.exists():
    with open(env_file, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

try:
    import google.generativeai as genai

    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        print("No Google API key found")
        sys.exit(1)

    genai.configure(api_key=api_key)

    print("Available Gemini models:")
    print("=" * 40)

    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"Name: {model.name}")
            print(f"Display Name: {model.display_name}")
            print(f"Description: {model.description}")
            print("-" * 40)

except Exception as e:
    print(f"Error checking models: {str(e)}")