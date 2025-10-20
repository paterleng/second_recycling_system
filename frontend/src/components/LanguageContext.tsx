import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "zh" | "en" | "ja" | "ko";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translation dictionary
const translations = {
  zh: {
    // Page title
    "page.title": "智能手机回收估价平台",

    // Hero section
    "hero.badge": "AI智能估价 · 秒级出结果",
    "hero.title": "智能手机回收",
    "hero.titleHighlight": "估价平台",
    "hero.subtitle":
      "基于大数据和AI算法，为您的二手手机提供最准确、最透明的市场估价",

    // Features
    "features.intelligent.title": "智能估值",
    "features.intelligent.desc": "AI算法结合市场数据，3秒内给出精准估价",
    "features.transparent.title": "透明回收",
    "features.transparent.desc": "全程透明化处理，让您清楚了解每一个环节",
    "features.efficient.title": "高效交易",
    "features.efficient.desc": "极速检测验收，当天完成交易和款项到账",

    // Steps
    "steps.method": "AI智能估价",
    "steps.basicInfo": "基本信息",
    "steps.photoGuide": "拍照检测指南",
    "steps.videoGuide": "视频检测指南",
    "steps.upload": "上传文件",
    "steps.analysis": "AI分析中",
    "steps.result": "估价完成",

    // Step descriptions
    "steps.method.desc": "选择您的检测方式，让AI为您精准估价",
    "steps.basicInfo.desc": "完善手机基本信息",
    "steps.photoGuide.desc": "按照指南拍摄照片，确保检测准确性",
    "steps.videoGuide.desc": "录制检测视频，全面了解手机状况",
    "steps.upload.desc": "上传您的检测文件",
    "steps.analysis.desc": "AI正在分析您的手机状况",
    "steps.result.desc": "基于AI分析的专业估价结果",

    // Detection methods
    "detection.title": "选择检测方式",
    "detection.subtitle": "AI将根据您提供的照片或视频进行专业分析",
    "detection.photo.title": "拍照检测",
    "detection.photo.desc": "通过拍摄多张照片进行详细检测，适合精确评估",
    "detection.photo.feature1": "6面外观检测",
    "detection.photo.feature2": "屏幕功能测试",
    "detection.photo.feature3": "系统信息检测",
    "detection.video.title": "视频检测",
    "detection.video.desc": "录制完整检测视频，展示手机整体状况",
    "detection.video.feature1": "动态功能展示",
    "detection.video.feature2": "操作流畅度检测",
    "detection.video.feature3": "一次性全面检测",

    // Form labels
    "form.brand": "品牌",
    "form.model": "型号",
    "form.brandPlaceholder": "请输入品牌，如：Apple",
    "form.modelPlaceholder": "请输入型号，如：iPhone 15 Pro",
    "form.storage": "存储容量",
    "form.storagePlaceholder": "请选择存储容量",
    "form.accessories": "配件完整度",
    "form.accessoriesPlaceholder": "请选择配件情况",
    "form.accessoriesComplete": "配件齐全（充电器、数据线、耳机、包装盒等）",
    "form.accessoriesPartial": "配件部分缺失",
    "form.accessoriesNone": "仅手机本体",

    // Buttons
    "btn.next": "下一步",
    "btn.prev": "上一步",
    "btn.back": "返回",
    "btn.startDetection": "开始检测",
    "btn.selectFile": "选择文件",
    "btn.startAnalysis": "开始AI分析",
    "btn.reEstimate": "重新估价",
    "btn.viewReport": "查看详细报告",
    "btn.bookRecycling": "立即预约回收",
    "btn.reDetect": "重新检测",
    "btn.detectAgain": "再次检测",

    // Photo steps
    "photo.machineType.title": "手机类型拍摄",
    "photo.machineType.desc": "请拍摄手机设置页面，显示手机型号信息",
    "photo.machineType.tips": "进入设置→通用→关于本机，确保型号信息清晰可见",
    "photo.productDate.title": "生产日期拍摄",
    "photo.productDate.desc": "请拍摄手机背面标签，显示生产日期信息",
    "photo.productDate.tips":
      "拍摄手机背面或SIM卡槽附近的标签，确保生产日期清晰可读",
    "photo.appearance.title": "机身外观拍摄",
    "photo.appearance.desc":
      "请拍摄手机的6个面：正面、背面、左侧、右侧、顶部、底部",
    "photo.screen.title": "屏幕显示测试",
    "photo.screen.desc": "请拍摄亮屏与息屏状态图片各一张",
    "photo.screen.tips1": "第一张：点亮屏幕，确保屏幕内容清晰可见",
    "photo.screen.tips2": "第二张：息屏状态，展示屏幕外观和边框",
    "photo.screen.tips3": "确保光线充足，避免反光影响判断",
    "photo.camera.title": "摄像头检测",
    "photo.camera.desc":
      "对焦拍摄手机摄像头部分，检查镜头是否有划痕、气泡或裂纹",
    "photo.flashlight.title": "闪光灯测试",
    "photo.flashlight.desc": "打开手机闪光灯并拍摄，确认闪光灯工作状态",
    "photo.batteryHealth.title": "电池健康截图",
    "photo.batteryHealth.desc": "进入设置→电池→电池健康，截图显示电池健康度",

    // Additional form fields
    "form.additionalNotes": "额外说明",
    "form.additionalNotesPlaceholder": "请输入任何额外的说明或备注信息",

    // Photo guidance examples
    "photo.appearance.sixSides":
      "拍摄6个面：正面、背面、左侧、右侧、顶部、底部",
    "photo.appearance.watchWear": "注意边框磨损情况",
    "photo.appearance.checkScratches": "检查是否有划痕或磕碰",
    "photo.camera.closeUp": "近距离清晰拍摄",
    "photo.camera.multiAngle": "多角度观察镜头",
    "photo.camera.checkFlashlight": "检查闪光灯周围",
    "photo.flashlight.turnOn": "开启闪光灯功能",
    "photo.flashlight.observeBrightness": "观察亮度是否正常",
    "photo.flashlight.checkDamage": "检查是否有损坏",
    "photo.batteryHealth.goToSettings": "进入设置→电池→电池健康",
    "photo.batteryHealth.screenshot": "截图显示电池健康度",
    "photo.batteryHealth.ensureClear": "确保信息清晰可见",
    "photo.machineType.ensureVisible": "确保型号信息清晰可见",
    "photo.machineType.avoidReflection": "避免反光和模糊",
    "photo.productDate.ensureReadable": "确保生产日期清晰可读",
    "photo.productDate.avoidDamage": "避免标签损坏或模糊",

    // Alert messages
    "alert.completeAllSteps": "请完成所有检测步骤",
    "console.apiData": "API数据",

    // Analysis
    "analysis.title": "AI正在分析您的手机",
    "analysis.appearance": "正在分析外观状况...",
    "analysis.screen": "正在检测屏幕功能...",
    "analysis.hardware": "正在评估硬件状态...",
    "analysis.report": "正在生成估价报告...",
    "analysis.complete": "分析完成！正在生成估价结果...",

    // Result Display Labels
    "result.brand": "品牌型号",
    "result.storageTotal": "存储容量",
    "result.storageUse": "可用容量",
    "result.productDate": "生产日期",
    "result.firstUseDate": "首次使用",
    "result.maximumCapacity": "电池容量",
    "result.batteryHealth": "电池健康度",
    "result.chargeCycles": "充放电次数",
    "result.overallCondition": "整体成色",
    "result.appearanceResult": "外观分析",
    "result.screenCondition": "屏幕成色",
    "result.screenResult": "屏幕分析",
    "result.cameraLens": "镜头状态",
    "result.physicalDamage": "物理损坏",
    "result.flashlightLine": "闪光灯",
    "result.otherInfo": "其他信息",
    "result.userInput": "用户输入",
    "result.userInput.brand": "品牌",
    "result.userInput.model": "型号",
    "result.userInput.storage": "存储",
    "result.userInput.accessory": "配件",
    "accessory.complete": "配件齐全",
    "accessory.partial": "配件部分缺失",
    "accessory.none": "仅手机本体",
    "result.userInputsText": "备注信息",
    "result.title": "AI估价完成",
    "result.disclaimer": "* 基于AI智能分析，最终价格以实际检测为准",
    "result.reportTitle": "AI检测报告",
    "common.unknown": "未知",

    // Footer
    "footer.description": "专业的AI智能手机回收估价平台，让闲置手机重获新生",
    "footer.contact": "联系我们",
    "footer.hours": "服务时间：9:00-21:00",
    "footer.email": "邮箱：irene666666666666@gmail.com",
    "footer.copyright": "© 2024 SPR. 保留所有权利.",

    // Modal
    "modal.developing.title": "功能正在开发",
    "modal.developing.content": "敬请期待。。。",
    "modal.developing.confirm": "确认",

    // Detection Messages
    "detection.submitSuccess": "检测提交成功，任务ID: {taskId}",
    "detection.completed": "检测完成！",
    "detection.failed": "检测失败: {error}",
    "detection.timeout": "检测超时，请稍后重试",
    "detection.submitFailed": "提交检测请求失败",

    // Upload
    "upload.title": "上传图片",
    "upload.multipleImages": "支持多张图片，JPG、PNG、WEBP格式，单张不超过10MB",
    "upload.singleImage": "支持JPG、PNG、WEBP格式，单张不超过10MB",
    "upload.uploadedFiles": "已上传文件",
    "upload.dragDrop": "或直接拖拽图片到此区域",
    "upload.dragOver": "松开鼠标上传图片",
    "upload.dragError": "请拖拽图片文件",
    "upload.maxFiles": "最多只能上传 {maxFiles} 张图片",
    "upload.maxFilesText": "最多 {maxFiles} 张",
    "upload.invalidFileType":
      "不支持的文件类型，请上传 JPG、PNG 或 WEBP 格式的图片",
    "upload.tip": "点击或拖拽文件到此处上传",

    // Video Upload
    "upload.videoTitle": "上传检测视频",
    "upload.videoDesc": "请上传您的手机检测视频，支持MP4、MOV、AVI等格式",
    "upload.videoTip": "支持拖拽上传视频文件，文件大小不超过100MB",
    "upload.invalidVideoType": "请上传视频格式文件",
    "upload.videoTooLarge": "视频文件过大，请选择小于100MB的文件",
    "upload.videoSuccess": "视频上传成功",
    "upload.noVideo": "请先上传视频文件",

    // Video Analysis
    "analysis.videoTitle": "视频AI分析中",
    "analysis.videoProcessing": "正在处理视频文件...",
    "analysis.videoAnalysis": "正在分析视频内容...",
    "analysis.videoDetection": "正在检测设备状态...",
    "analysis.videoReport": "正在生成检测报告...",

    // Additional Buttons
    "btn.previous": "上一项",

    // Photo Guide
    "photoGuide.title": "检测指南",
    "photoGuide.step": "步骤",
    "photoGuide.shootingPoints": "拍摄要点",

    // Video Guide
    "videoGuide.title": "视频检测指南",
    "videoGuide.description": "请录制一个2-3分钟的完整检测视频，包含以下内容：",
    "videoGuide.section1.title": "1. 外观展示 (20-30秒)",
    "videoGuide.section1.desc":
      "缓慢旋转手机，展示6个面的外观状况，特别注意边框、屏幕、背面的磨损情况",
    "videoGuide.section2.title": "2. 屏幕功能测试 (30-45秒)",
    "videoGuide.section2.desc": "点亮屏幕，显示电量信息，检查屏幕显示效果",
    "videoGuide.section3.title": "3. 摄像头检测 (20-30秒)",
    "videoGuide.section3.desc": "近距离展示前后摄像头外观",
    "videoGuide.section4.title": "4. 功能测试 (20-30秒)",
    "videoGuide.section4.desc": "测试闪光灯功能",
    "videoGuide.section5.title": "5. 系统信息展示 (30-45秒)",
    "videoGuide.section5.desc":
      "进入设置界面，展示账号状态、电池健康、关于本机等重要信息",
    "videoGuide.tips":
      "建议录制横屏视频，保持稳定，确保画面清晰，光线充足。视频文件大小请控制在100MB以内。",
  },

  en: {
    // Page title
    "page.title": "Smart Phone Recycling Estimation Platform",

    // Hero section
    "hero.badge": "AI Smart Valuation · Instant Results",
    "hero.title": "Smart Phone Recycling",
    "hero.titleHighlight": "Estimation Platform",
    "hero.subtitle":
      "Based on big data and AI algorithms, providing the most accurate and transparent market valuation for your used phones",

    // Features
    "features.intelligent.title": "Intelligent Valuation",
    "features.intelligent.desc":
      "AI algorithms combined with market data, accurate pricing in 3 seconds",
    "features.transparent.title": "Transparent Recycling",
    "features.transparent.desc":
      "Fully transparent process, keeping you informed of every step",
    "features.efficient.title": "Efficient Trading",
    "features.efficient.desc":
      "Ultra-fast inspection and verification, complete transaction and payment on the same day",

    // Steps
    "steps.method": "AI Smart Estimation",
    "steps.basicInfo": "Basic Information",
    "steps.photoGuide": "Photo Detection Guide",
    "steps.videoGuide": "Video Detection Guide",
    "steps.upload": "Upload Files",
    "steps.analysis": "AI Analyzing",
    "steps.result": "Estimation Complete",

    // Step descriptions
    "steps.method.desc":
      "Choose your detection method for AI precise estimation",
    "steps.basicInfo.desc": "Complete basic phone information",
    "steps.photoGuide.desc":
      "Follow the guide to take photos for accurate detection",
    "steps.videoGuide.desc":
      "Record detection video to comprehensively understand phone condition",
    "steps.upload.desc": "Upload your detection files",
    "steps.analysis.desc": "AI is analyzing your phone condition",
    "steps.result.desc": "Professional estimation results based on AI analysis",

    // Detection methods
    "detection.title": "Choose Detection Method",
    "detection.subtitle":
      "AI will conduct professional analysis based on the photos or videos you provide",
    "detection.photo.title": "Photo Detection",
    "detection.photo.desc":
      "Detailed detection through multiple photos, suitable for precise evaluation",
    "detection.photo.feature1": "6-sided appearance detection",
    "detection.photo.feature2": "Screen function test",
    "detection.photo.feature3": "System information detection",
    "detection.video.title": "Video Detection",
    "detection.video.desc":
      "Record complete detection video showing overall phone condition",
    "detection.video.feature1": "Dynamic function demonstration",
    "detection.video.feature2": "Operation smoothness detection",
    "detection.video.feature3": "One-time comprehensive detection",

    // Form labels
    "form.brand": "Brand",
    "form.model": "Model",
    "form.brandPlaceholder": "Enter brand, e.g.: Apple",
    "form.modelPlaceholder": "Enter model, e.g.: iPhone 15 Pro",
    "form.storage": "Storage Capacity",
    "form.storagePlaceholder": "Please select storage capacity",
    "form.accessories": "Accessories Completeness",
    "form.accessoriesPlaceholder": "Please select accessories condition",
    "form.accessoriesComplete":
      "Complete accessories (charger, cable, earphones, box, etc.)",
    "form.accessoriesPartial": "Partially missing accessories",
    "form.accessoriesNone": "Phone only",

    // Buttons
    "btn.next": "Next",
    "btn.prev": "Previous",
    "btn.back": "Back",
    "btn.startDetection": "Start Detection",
    "btn.selectFile": "Select File",
    "btn.startAnalysis": "Start AI Analysis",
    "btn.reEstimate": "Re-estimate",
    "btn.viewReport": "View Detailed Report",
    "btn.bookRecycling": "Book Recycling Now",
    "btn.reDetect": "Re-detect",
    "btn.detectAgain": "Detect Again",

    // Photo steps
    "photo.machineType.title": "Phone Type Photography",
    "photo.machineType.desc":
      "Please photograph the phone settings page showing the phone model information",
    "photo.machineType.tips":
      "Go to Settings → General → About, ensure model information is clearly visible",
    "photo.productDate.title": "Production Date Photography",
    "photo.productDate.desc":
      "Please photograph the phone back label showing the production date information",
    "photo.productDate.tips":
      "Photograph the label on the back of the phone or near the SIM card slot, ensure production date is clearly readable",
    "photo.appearance.title": "Phone Body Appearance",
    "photo.appearance.desc":
      "Please photograph 6 sides of the phone: front, back, left, right, top, bottom",
    "photo.screen.title": "Screen Display Test",
    "photo.screen.desc":
      "Please take one photo of screen-on state and one photo of screen-off state",
    "photo.screen.tips1":
      "First photo: Light up the screen, ensure screen content is clearly visible",
    "photo.screen.tips2":
      "Second photo: Screen-off state, showing screen appearance and frame",
    "photo.screen.tips3":
      "Ensure adequate lighting, avoid reflection affecting judgment",
    "photo.camera.title": "Camera Detection",
    "photo.camera.desc":
      "Focus and photograph the phone camera section, check for scratches, bubbles, or cracks on the lens",
    "photo.flashlight.title": "Flashlight Test",
    "photo.flashlight.desc":
      "Turn on phone flashlight and photograph to confirm flashlight working condition",
    "photo.batteryHealth.title": "Battery Health Screenshot",
    "photo.batteryHealth.desc":
      "Go to Settings → Battery → Battery Health, screenshot showing battery health",

    // Additional form fields
    "form.additionalNotes": "Additional Notes",
    "form.additionalNotesPlaceholder":
      "Please enter any additional notes or remarks",

    // Photo guidance examples
    "photo.appearance.sixSides":
      "Photograph 6 sides: front, back, left, right, top, bottom",
    "photo.appearance.watchWear": "Pay attention to frame wear",
    "photo.appearance.checkScratches": "Check for scratches or bumps",
    "photo.camera.closeUp": "Close-up clear photography",
    "photo.camera.multiAngle": "Multi-angle lens observation",
    "photo.camera.checkFlashlight": "Check around flashlight",
    "photo.flashlight.turnOn": "Turn on flashlight function",
    "photo.flashlight.observeBrightness": "Observe if brightness is normal",
    "photo.flashlight.checkDamage": "Check for damage",
    "photo.batteryHealth.goToSettings":
      "Go to Settings → Battery → Battery Health",
    "photo.batteryHealth.screenshot": "Screenshot showing battery health",
    "photo.batteryHealth.ensureClear": "Ensure information is clearly visible",
    "photo.machineType.ensureVisible":
      "Ensure model information is clearly visible",
    "photo.machineType.avoidReflection": "Avoid reflection and blur",
    "photo.productDate.ensureReadable":
      "Ensure production date is clearly readable",
    "photo.productDate.avoidDamage": "Avoid label damage or blur",

    // Alert messages
    "alert.completeAllSteps": "Please complete all detection steps",
    "console.apiData": "API Data",

    // Analysis
    "analysis.title": "AI is analyzing your phone",
    "analysis.appearance": "Analyzing appearance condition...",
    "analysis.screen": "Detecting screen function...",
    "analysis.hardware": "Evaluating hardware status...",
    "analysis.report": "Generating estimation report...",
    "analysis.complete": "Analysis complete! Generating estimation results...",

    // Result Display Labels
    "result.brand": "Brand & Model",
    "result.storageTotal": "Storage Capacity",
    "result.storageUse": "Available Storage",
    "result.productDate": "Production Date",
    "result.firstUseDate": "First Use Date",
    "result.maximumCapacity": "Battery Capacity",
    "result.batteryHealth": "Battery Health",
    "result.chargeCycles": "Charge Cycles",
    "result.overallCondition": "Overall Condition",
    "result.appearanceResult": "Appearance Analysis",
    "result.screenCondition": "Screen Condition",
    "result.screenResult": "Screen Analysis",
    "result.cameraLens": "Camera Lens",
    "result.physicalDamage": "Physical Damage",
    "result.flashlightLine": "Flashlight",
    "result.otherInfo": "Other Info",
    "result.userInput": "User Input",
    "result.userInput.brand": "Brand",
    "result.userInput.model": "Model",
    "result.userInput.storage": "Storage",
    "result.userInput.accessory": "Accessory",
    "accessory.complete": "Complete accessories",
    "accessory.partial": "Partially missing accessories",
    "accessory.none": "Phone only",
    "result.userInputsText": "Notes",
    "result.title": "AI Estimation Complete",
    "result.disclaimer":
      "* Based on AI intelligent analysis, final price subject to actual inspection",
    "result.reportTitle": "AI Detection Report",
    "common.unknown": "Unknown",

    // Footer
    "footer.description":
      "Professional AI smart phone recycling estimation platform, giving new life to idle phones",
    "footer.contact": "Contact Us",
    "footer.hours": "Service Hours: 9:00-21:00",
    "footer.email": "Email: irene666666666666@gmail.com",
    "footer.copyright": "© 2024 SPR. All rights reserved.",

    // Modal
    "modal.developing.title": "Feature Under Development",
    "modal.developing.content": "Coming Soon...",
    "modal.developing.confirm": "Confirm",

    // Detection Messages
    "detection.submitSuccess":
      "Detection submitted successfully, Task ID: {taskId}",
    "detection.completed": "Detection completed!",
    "detection.failed": "Detection failed: {error}",
    "detection.timeout": "Detection timeout, please try again later",
    "detection.submitFailed": "Failed to submit detection request",

    // Upload
    "upload.title": "Upload Images",
    "upload.multipleImages":
      "Support multiple images, JPG, PNG, WEBP format, single file max 10MB",
    "upload.singleImage": "Support JPG, PNG, WEBP format, single file max 10MB",
    "upload.uploadedFiles": "Uploaded Files",
    "upload.dragDrop": "Or drag and drop images directly to this area",
    "upload.dragOver": "Release mouse to upload images",
    "upload.dragError": "Please drag image files",
    "upload.maxFiles": "Maximum {maxFiles} images allowed",
    "upload.maxFilesText": "Max {maxFiles} images",
    "upload.invalidFileType":
      "Unsupported file type, please upload JPG, PNG or WEBP format images",
    "upload.tip": "Click or drag files here to upload",

    // Video Upload
    "upload.videoTitle": "Upload Detection Video",
    "upload.videoDesc":
      "Please upload your phone detection video, supports MP4, MOV, AVI formats",
    "upload.videoTip":
      "Support drag and drop video files, file size not exceeding 100MB",
    "upload.invalidVideoType": "Please upload video format files",
    "upload.videoTooLarge":
      "Video file too large, please select files smaller than 100MB",
    "upload.videoSuccess": "Video uploaded successfully",
    "upload.noVideo": "Please upload video file first",

    // Video Analysis
    "analysis.videoTitle": "Video AI Analysis",
    "analysis.videoProcessing": "Processing video file...",
    "analysis.videoAnalysis": "Analyzing video content...",
    "analysis.videoDetection": "Detecting device status...",
    "analysis.videoReport": "Generating detection report...",

    // Additional Buttons
    "btn.previous": "Previous",

    // Photo Guide
    "photoGuide.title": "Detection Guide",
    "photoGuide.step": "Step",
    "photoGuide.shootingPoints": "Shooting Points",

    // Video Guide
    "videoGuide.title": "Video Detection Guide",
    "videoGuide.description":
      "Please record a 2-3 minute complete detection video including the following content:",
    "videoGuide.section1.title": "1. Appearance Display (20-30 seconds)",
    "videoGuide.section1.desc":
      "Slowly rotate the phone to show the appearance of 6 sides, paying special attention to frame, screen, and back wear",
    "videoGuide.section2.title": "2. Screen Function Test (30-45 seconds)",
    "videoGuide.section2.desc":
      "Light up the screen, display battery information, check screen display effects",
    "videoGuide.section3.title": "3. Camera Detection (20-30 seconds)",
    "videoGuide.section3.desc":
      "Close-up display of front and rear camera appearance",
    "videoGuide.section4.title": "4. Function Test (20-30 seconds)",
    "videoGuide.section4.desc": "Test flashlight function",
    "videoGuide.section5.title":
      "5. System Information Display (30-45 seconds)",
    "videoGuide.section5.desc":
      "Enter settings interface, display account status, battery health, about device and other important information",
    "videoGuide.tips":
      "Recommend recording landscape video, keep stable, ensure clear picture and adequate lighting. Video file size should be controlled within 100MB.",
  },

  ja: {
    // Page title
    "page.title": "スマートフォンリサイクル査定プラットフォーム",

    // Hero section
    "hero.badge": "AIスマート査定・瞬時結果",
    "hero.title": "スマートフォンリサイクル",
    "hero.titleHighlight": "査定プラットフォーム",
    "hero.subtitle":
      "ビッグデータとAIアルゴリズムに基づき、中古スマートフォンに最も正確で透明な市場査定を提供",

    // Features
    "features.intelligent.title": "インテリジェント査定",
    "features.intelligent.desc":
      "AIアルゴリズムと市場データを組み合わせ、3秒で正確な価格を提供",
    "features.transparent.title": "透明なリサイクル",
    "features.transparent.desc":
      "完全に透明なプロセスで、すべてのステップをご理解いただけます",
    "features.efficient.title": "効率的な取引",
    "features.efficient.desc": "超高速検査・検証、当日取引完了・支払い",

    // Steps
    "steps.method": "AIスマート査定",
    "steps.basicInfo": "基本情報",
    "steps.photoGuide": "写真検出ガイド",
    "steps.videoGuide": "ビデオ検出ガイド",
    "steps.upload": "ファイルアップロード",
    "steps.analysis": "AI分析中",
    "steps.result": "査定完了",

    // Step descriptions
    "steps.method.desc": "検出方法を選択し、AIで正確な査定を行います",
    "steps.basicInfo.desc": "スマートフォンの基本情報を完成させます",
    "steps.photoGuide.desc":
      "ガイドに従って写真を撮影し、正確な検出を確保します",
    "steps.videoGuide.desc":
      "検出ビデオを録画し、スマートフォンの状態を包括的に理解します",
    "steps.upload.desc": "検出ファイルをアップロードします",
    "steps.analysis.desc": "AIがスマートフォンの状態を分析中です",
    "steps.result.desc": "AI分析に基づく専門的な査定結果",

    // Detection methods
    "detection.title": "検出方法を選択",
    "detection.subtitle":
      "AIは提供された写真またはビデオに基づいて専門的な分析を行います",
    "detection.photo.title": "写真検出",
    "detection.photo.desc":
      "複数の写真による詳細検出、正確な評価に適しています",
    "detection.photo.feature1": "6面外観検出",
    "detection.photo.feature2": "スクリーン機能テスト",
    "detection.photo.feature3": "システム情報検出",
    "detection.video.title": "ビデオ検出",
    "detection.video.desc":
      "完全な検出ビデオを録画し、スマートフォンの全体的な状態を表示",
    "detection.video.feature1": "動的機能デモンストレーション",
    "detection.video.feature2": "操作スムーズネス検出",
    "detection.video.feature3": "一回で包括的な検出",

    // Form labels
    "form.brand": "ブランド",
    "form.model": "モデル",
    "form.brandPlaceholder": "ブランドを入力してください（例：Apple）",
    "form.modelPlaceholder": "モデルを入力してください（例：iPhone 15 Pro）",
    "form.storage": "ストレージ容量",
    "form.storagePlaceholder": "ストレージ容量を選択してください",
    "form.accessories": "アクセサリーの完全性",
    "form.accessoriesPlaceholder": "アクセサリーの状態を選択してください",
    "form.accessoriesComplete":
      "アクセサリー完備（充電器、ケーブル、イヤホン、箱など）",
    "form.accessoriesPartial": "アクセサリー一部欠品",
    "form.accessoriesNone": "スマートフォン本体のみ",

    // Buttons
    "btn.next": "次へ",
    "btn.prev": "前へ",
    "btn.back": "戻る",
    "btn.startDetection": "検出開始",
    "btn.selectFile": "ファイル選択",
    "btn.startAnalysis": "AI分析開始",
    "btn.reEstimate": "再査定",
    "btn.viewReport": "詳細レポート表示",
    "btn.bookRecycling": "リサイクル予約",
    "btn.reDetect": "再検出",
    "btn.detectAgain": "再度検出",

    // Photo steps
    "photo.machineType.title": "スマートフォンタイプ撮影",
    "photo.machineType.desc":
      "スマートフォンの設定ページを撮影し、スマートフォンモデル情報を表示してください",
    "photo.machineType.tips":
      "設定→一般→このiPhoneについてに移動し、モデル情報が明確に見えることを確認してください",
    "photo.productDate.title": "製造日撮影",
    "photo.productDate.desc":
      "スマートフォンの背面ラベルを撮影し、製造日情報を表示してください",
    "photo.productDate.tips":
      "スマートフォンの背面またはSIMカードスロット近くのラベルを撮影し、製造日が明確に読めることを確認してください",
    "photo.appearance.title": "スマートフォン本体外観",
    "photo.appearance.desc":
      "スマートフォンの6面を撮影してください：正面、背面、左面、右面、上面、下面",
    "photo.screen.title": "スクリーン表示テスト",
    "photo.screen.desc":
      "画面点灯状態と画面消灯状態の写真をそれぞれ1枚撮影してください",
    "photo.screen.tips1":
      "1枚目：画面を点灯し、画面内容が明確に見えることを確認",
    "photo.screen.tips2": "2枚目：画面消灯状態で、画面外観とフレームを表示",
    "photo.screen.tips3": "十分な照明を確保し、反射による判断への影響を避ける",
    "photo.camera.title": "カメラ検出",
    "photo.camera.desc":
      "スマートフォンのカメラ部分にフォーカスして撮影、レンズに傷、気泡、亀裂がないかチェック",
    "photo.flashlight.title": "フラッシュライトテスト",
    "photo.flashlight.desc":
      "スマートフォンのフラッシュライトをオンにして撮影、フラッシュライトの動作状態を確認",
    "photo.batteryHealth.title": "バッテリー健康度スクリーンショット",
    "photo.batteryHealth.desc":
      "設定→バッテリー→バッテリー健康度に移動し、バッテリー健康度を表示するスクリーンショット",

    // Additional form fields
    "form.additionalNotes": "追加の説明",
    "form.additionalNotesPlaceholder": "追加の説明や備考を入力してください",

    // Photo guidance examples
    "photo.appearance.sixSides":
      "6面を撮影：正面、背面、左面、右面、上面、下面",
    "photo.appearance.watchWear": "フレームの摩耗に注意",
    "photo.appearance.checkScratches": "傷や凹みがないかチェック",
    "photo.camera.closeUp": "近距離で鮮明に撮影",
    "photo.camera.multiAngle": "多角度でレンズを観察",
    "photo.camera.checkFlashlight": "フラッシュライト周辺をチェック",
    "photo.flashlight.turnOn": "フラッシュライト機能をオンにする",
    "photo.flashlight.observeBrightness": "明度が正常か観察",
    "photo.flashlight.checkDamage": "損傷がないかチェック",
    "photo.batteryHealth.goToSettings":
      "設定→バッテリー→バッテリー健康度に移動",
    "photo.batteryHealth.screenshot":
      "バッテリー健康度を表示するスクリーンショット",
    "photo.batteryHealth.ensureClear": "情報が明確に見えることを確保",
    "photo.machineType.ensureVisible": "モデル情報が明確に見えることを確保",
    "photo.machineType.avoidReflection": "反射やぼかしを避ける",
    "photo.productDate.ensureReadable": "製造日が明確に読めることを確保",
    "photo.productDate.avoidDamage": "ラベルの損傷やぼかしを避ける",

    // Alert messages
    "alert.completeAllSteps": "すべての検出ステップを完了してください",
    "console.apiData": "APIデータ",

    // Analysis
    "analysis.title": "AIがスマートフォンを分析中",
    "analysis.appearance": "外観状態を分析中...",
    "analysis.screen": "スクリーン機能を検出中...",
    "analysis.hardware": "ハードウェア状態を評価中...",
    "analysis.report": "査定レポートを生成中...",
    "analysis.complete": "分析完了！査定結果を生成中...",

    // Result Display Labels
    "result.brand": "ブランド・モデル",
    "result.storageTotal": "ストレージ容量",
    "result.storageUse": "利用可能容量",
    "result.productDate": "製造日",
    "result.firstUseDate": "初回使用日",
    "result.maximumCapacity": "バッテリー容量",
    "result.batteryHealth": "バッテリー健康度",
    "result.chargeCycles": "充放電回数",
    "result.overallCondition": "全体的な状態",
    "result.appearanceResult": "外観分析",
    "result.screenCondition": "スクリーン状態",
    "result.screenResult": "スクリーン分析",
    "result.cameraLens": "カメラレンズ",
    "result.physicalDamage": "物理的損傷",
    "result.flashlightLine": "フラッシュライト",
    "result.otherInfo": "その他の情報",
    "result.userInput": "ユーザー入力",
    "result.userInput.brand": "ブランド",
    "result.userInput.model": "モデル",
    "result.userInput.storage": "ストレージ",
    "result.userInput.accessory": "アクセサリー",
    "accessory.complete": "アクセサリー完備",
    "accessory.partial": "アクセサリー一部欠品",
    "accessory.none": "スマートフォン本体のみ",
    "result.userInputsText": "備考",
    "result.title": "AI査定完了",
    "result.disclaimer":
      "* AIインテリジェント分析に基づく、最終価格は実際の検査によります",
    "result.reportTitle": "AI検出レポート",
    "common.unknown": "不明",

    // Footer
    "footer.description":
      "専門的なAIスマートスマートフォンリサイクル査定プラットフォーム、アイドルスマートフォンに新しい生命を与える",
    "footer.contact": "お問い合わせ",
    "footer.hours": "サービス時間：9:00-21:00",
    "footer.email": "メール：irene666666666666@gmail.com",
    "footer.copyright": "© 2024 SPR. すべての権利を保有。",

    // Modal
    "modal.developing.title": "機能開発中",
    "modal.developing.content": "お楽しみに。。。",
    "modal.developing.confirm": "確認",

    // Detection Messages
    "detection.submitSuccess": "検出が正常に送信されました、タスクID: {taskId}",
    "detection.completed": "検出完了！",
    "detection.failed": "検出失敗: {error}",
    "detection.timeout": "検出タイムアウト、後でもう一度お試しください",
    "detection.submitFailed": "検出リクエストの送信に失敗しました",

    // Upload
    "upload.title": "画像をアップロード",
    "upload.multipleImages":
      "複数画像対応、JPG、PNG、WEBP形式、単一ファイル最大10MB",
    "upload.singleImage": "JPG、PNG、WEBP形式対応、単一ファイル最大10MB",
    "upload.uploadedFiles": "アップロード済みファイル",
    "upload.dragDrop": "または画像をこのエリアに直接ドラッグ&ドロップ",
    "upload.dragOver": "マウスを離して画像をアップロード",
    "upload.dragError": "画像ファイルをドラッグしてください",
    "upload.maxFiles": "最大 {maxFiles} 枚の画像までアップロード可能",
    "upload.maxFilesText": "最大 {maxFiles} 枚",
    "upload.invalidFileType":
      "サポートされていないファイル形式です。JPG、PNG、WEBP形式の画像をアップロードしてください",
    "upload.tip": "クリックまたはファイルをここにドラッグしてアップロード",

    // Video Upload
    "upload.videoTitle": "検出動画をアップロード",
    "upload.videoDesc":
      "スマートフォン検出動画をアップロードしてください、MP4、MOV、AVI形式をサポート",
    "upload.videoTip":
      "動画ファイルのドラッグ&ドロップをサポート、ファイルサイズは100MB以下",
    "upload.invalidVideoType": "動画形式のファイルをアップロードしてください",
    "upload.videoTooLarge":
      "動画ファイルが大きすぎます、100MB以下のファイルを選択してください",
    "upload.videoSuccess": "動画のアップロードが成功しました",
    "upload.noVideo": "まず動画ファイルをアップロードしてください",

    // Video Analysis
    "analysis.videoTitle": "動画AI分析中",
    "analysis.videoProcessing": "動画ファイルを処理中...",
    "analysis.videoAnalysis": "動画コンテンツを分析中...",
    "analysis.videoDetection": "デバイス状態を検出中...",
    "analysis.videoReport": "検出レポートを生成中...",

    // Additional Buttons
    "btn.previous": "前へ",

    // Photo Guide
    "photoGuide.title": "検出ガイド",
    "photoGuide.step": "ステップ",
    "photoGuide.shootingPoints": "撮影のポイント",

    // Video Guide
    "videoGuide.title": "ビデオ検出ガイド",
    "videoGuide.description":
      "2-3分の完全な検出ビデオを録画してください。以下の内容を含めてください：",
    "videoGuide.section1.title": "1. 外観表示 (20-30秒)",
    "videoGuide.section1.desc":
      "スマートフォンをゆっくり回転させて6面の外観を表示し、フレーム、スクリーン、背面の摩耗に特に注意してください",
    "videoGuide.section2.title": "2. スクリーン機能テスト (30-45秒)",
    "videoGuide.section2.desc":
      "スクリーンを点灯し、バッテリー情報を表示し、スクリーン表示効果をチェックしてください",
    "videoGuide.section3.title": "3. カメラ検出 (20-30秒)",
    "videoGuide.section3.desc":
      "フロントカメラとリアカメラの外観を近距離で表示してください",
    "videoGuide.section4.title": "4. 機能テスト (20-30秒)",
    "videoGuide.section4.desc": "フラッシュライト機能をテストしてください",
    "videoGuide.section5.title": "5. システム情報表示 (30-45秒)",
    "videoGuide.section5.desc":
      "設定インターフェースに入り、アカウント状態、バッテリー健康度、デバイス情報などの重要な情報を表示してください",
    "videoGuide.tips":
      "横画面ビデオの録画を推奨し、安定を保ち、画面を鮮明にし、十分な照明を確保してください。ビデオファイルサイズは100MB以内に制御してください。",
  },

  ko: {
    // Page title
    "page.title": "스마트폰 재활용 견적 플랫폼",

    // Hero section
    "hero.badge": "AI 스마트 평가 · 즉시 결과",
    "hero.title": "스마트폰 재활용",
    "hero.titleHighlight": "견적 플랫폼",
    "hero.subtitle":
      "빅데이터와 AI 알고리즘을 기반으로 중고 스마트폰에 가장 정확하고 투명한 시장 평가를 제공",

    // Features
    "features.intelligent.title": "지능형 평가",
    "features.intelligent.desc":
      "AI 알고리즘과 시장 데이터 결합, 3초 내 정확한 가격 제공",
    "features.transparent.title": "투명한 재활용",
    "features.transparent.desc":
      "완전히 투명한 프로세스로 모든 단계를 명확히 이해할 수 있습니다",
    "features.efficient.title": "효율적인 거래",
    "features.efficient.desc": "초고속 검사 및 검증, 당일 거래 완료 및 지불",

    // Steps
    "steps.method": "AI 스마트 견적",
    "steps.basicInfo": "기본 정보",
    "steps.photoGuide": "사진 검출 가이드",
    "steps.videoGuide": "비디오 검출 가이드",
    "steps.upload": "파일 업로드",
    "steps.analysis": "AI 분석 중",
    "steps.result": "견적 완료",

    // Step descriptions
    "steps.method.desc": "검출 방법을 선택하고 AI로 정확한 견적을 받으세요",
    "steps.basicInfo.desc": "스마트폰 기본 정보를 완성하세요",
    "steps.photoGuide.desc":
      "가이드에 따라 사진을 촬영하여 정확한 검출을 보장하세요",
    "steps.videoGuide.desc":
      "검출 비디오를 녹화하여 스마트폰 상태를 종합적으로 이해하세요",
    "steps.upload.desc": "검출 파일을 업로드하세요",
    "steps.analysis.desc": "AI가 스마트폰 상태를 분석 중입니다",
    "steps.result.desc": "AI 분석 기반 전문적인 견적 결과",

    // Detection methods
    "detection.title": "검출 방법 선택",
    "detection.subtitle":
      "AI는 제공된 사진 또는 비디오를 기반으로 전문적인 분석을 수행합니다",
    "detection.photo.title": "사진 검출",
    "detection.photo.desc": "여러 사진을 통한 상세 검출, 정확한 평가에 적합",
    "detection.photo.feature1": "6면 외관 검출",
    "detection.photo.feature2": "화면 기능 테스트",
    "detection.photo.feature3": "시스템 정보 검출",
    "detection.video.title": "비디오 검출",
    "detection.video.desc":
      "완전한 검출 비디오를 녹화하여 스마트폰 전체 상태 표시",
    "detection.video.feature1": "동적 기능 시연",
    "detection.video.feature2": "작동 부드러움 검출",
    "detection.video.feature3": "한 번의 종합적인 검출",

    // Form labels
    "form.brand": "브랜드",
    "form.model": "모델",
    "form.brandPlaceholder": "브랜드를 입력해주세요 (예: Apple)",
    "form.modelPlaceholder": "모델을 입력해주세요 (예: iPhone 15 Pro)",
    "form.storage": "저장 용량",
    "form.storagePlaceholder": "저장 용량을 선택해주세요",
    "form.accessories": "액세서리 완전성",
    "form.accessoriesPlaceholder": "액세서리 상태를 선택해주세요",
    "form.accessoriesComplete":
      "액세서리 완비 (충전기, 케이블, 이어폰, 박스 등)",
    "form.accessoriesPartial": "액세서리 일부 누락",
    "form.accessoriesNone": "스마트폰 본체만",

    // Buttons
    "btn.next": "다음",
    "btn.prev": "이전",
    "btn.back": "돌아가기",
    "btn.startDetection": "검출 시작",
    "btn.selectFile": "파일 선택",
    "btn.startAnalysis": "AI 분석 시작",
    "btn.reEstimate": "재견적",
    "btn.viewReport": "상세 보고서 보기",
    "btn.bookRecycling": "재활용 예약하기",
    "btn.reDetect": "재검출",
    "btn.detectAgain": "다시 검출",

    // Photo steps
    "photo.machineType.title": "스마트폰 타입 촬영",
    "photo.machineType.desc":
      "스마트폰 설정 페이지를 촬영하여 스마트폰 모델 정보를 표시해주세요",
    "photo.machineType.tips":
      "설정→일반→이 iPhone에 관하여로 이동하여 모델 정보가 명확히 보이는지 확인해주세요",
    "photo.productDate.title": "제조일 촬영",
    "photo.productDate.desc":
      "스마트폰 뒷면 라벨을 촬영하여 제조일 정보를 표시해주세요",
    "photo.productDate.tips":
      "스마트폰 뒷면 또는 SIM 카드 슬롯 근처의 라벨을 촬영하여 제조일이 명확히 읽히는지 확인해주세요",
    "photo.appearance.title": "스마트폰 본체 외관",
    "photo.appearance.desc":
      "스마트폰의 6면을 촬영해주세요: 앞면, 뒷면, 왼쪽면, 오른쪽면, 윗면, 아랫면",
    "photo.screen.title": "화면 표시 테스트",
    "photo.screen.desc":
      "화면 켜진 상태와 화면 꺼진 상태의 사진을 각각 1장씩 촬영해주세요",
    "photo.screen.tips1": "1장: 화면을 켜고 화면 내용이 명확히 보이도록 확인",
    "photo.screen.tips2": "2장: 화면 꺼진 상태로 화면 외관과 프레임 표시",
    "photo.screen.tips3": "충분한 조명을 확보하고 반사로 인한 판단 영향 피하기",
    "photo.camera.title": "카메라 검출",
    "photo.camera.desc":
      "스마트폰 카메라 부분에 포커스하여 촬영, 렌즈에 긁힘, 기포, 균열이 있는지 확인",
    "photo.flashlight.title": "플래시라이트 테스트",
    "photo.flashlight.desc":
      "스마트폰 플래시라이트를 켜고 촬영하여 플래시라이트 작동 상태 확인",
    "photo.batteryHealth.title": "배터리 건강도 스크린샷",
    "photo.batteryHealth.desc":
      "설정→배터리→배터리 건강도로 이동하여 배터리 건강도를 표시하는 스크린샷",

    // Additional form fields
    "form.additionalNotes": "추가 설명",
    "form.additionalNotesPlaceholder": "추가 설명이나 비고를 입력해주세요",

    // Photo guidance examples
    "photo.appearance.sixSides":
      "6면 촬영: 앞면, 뒷면, 왼쪽면, 오른쪽면, 윗면, 아랫면",
    "photo.appearance.watchWear": "프레임 마모에 주의",
    "photo.appearance.checkScratches": "긁힘이나 충돌 흔적이 있는지 확인",
    "photo.camera.closeUp": "근거리에서 선명하게 촬영",
    "photo.camera.multiAngle": "다각도로 렌즈 관찰",
    "photo.camera.checkFlashlight": "플래시라이트 주변 확인",
    "photo.flashlight.turnOn": "플래시라이트 기능 켜기",
    "photo.flashlight.observeBrightness": "밝기가 정상인지 관찰",
    "photo.flashlight.checkDamage": "손상이 있는지 확인",
    "photo.batteryHealth.goToSettings": "설정→배터리→배터리 건강도로 이동",
    "photo.batteryHealth.screenshot": "배터리 건강도를 표시하는 스크린샷",
    "photo.batteryHealth.ensureClear": "정보가 명확히 보이도록 보장",
    "photo.machineType.ensureVisible": "모델 정보가 명확히 보이도록 보장",
    "photo.machineType.avoidReflection": "반사와 흐림을 피하세요",
    "photo.productDate.ensureReadable": "제조일이 명확히 읽히도록 보장",
    "photo.productDate.avoidDamage": "라벨 손상이나 흐림을 피하세요",

    // Alert messages
    "alert.completeAllSteps": "모든 검출 단계를 완료해주세요",
    "console.apiData": "API 데이터",

    // Analysis
    "analysis.title": "AI가 스마트폰을 분석 중입니다",
    "analysis.appearance": "외관 상태 분석 중...",
    "analysis.screen": "화면 기능 검출 중...",
    "analysis.hardware": "하드웨어 상태 평가 중...",
    "analysis.report": "견적 보고서 생성 중...",
    "analysis.complete": "분석 완료! 견적 결과 생성 중...",

    // Result Display Labels
    "result.brand": "브랜드 및 모델",
    "result.storageTotal": "저장 용량",
    "result.storageUse": "사용 가능 용량",
    "result.productDate": "제조일",
    "result.firstUseDate": "최초 사용일",
    "result.maximumCapacity": "배터리 용량",
    "result.batteryHealth": "배터리 건강도",
    "result.chargeCycles": "충방전 횟수",
    "result.overallCondition": "전체 상태",
    "result.appearanceResult": "외관 분석",
    "result.screenCondition": "화면 상태",
    "result.screenResult": "화면 분석",
    "result.cameraLens": "카메라 렌즈",
    "result.physicalDamage": "물리적 손상",
    "result.flashlightLine": "플래시라이트",
    "result.otherInfo": "기타 정보",
    "result.userInput": "사용자 입력",
    "result.userInput.brand": "브랜드",
    "result.userInput.model": "모델",
    "result.userInput.storage": "저장소",
    "result.userInput.accessory": "액세서리",
    "accessory.complete": "액세서리 완비",
    "accessory.partial": "액세서리 일부 누락",
    "accessory.none": "스마트폰 본체만",
    "result.userInputsText": "비고",
    "result.title": "AI 견적 완료",
    "result.disclaimer":
      "* AI 지능형 분석 기반, 최종 가격은 실제 검사에 따릅니다",
    "result.reportTitle": "AI 검출 보고서",
    "common.unknown": "알 수 없음",

    // Footer
    "footer.description":
      "전문적인 AI 스마트 스마트폰 재활용 견적 플랫폼, 유휴 스마트폰에 새로운 생명을 부여",
    "footer.contact": "문의하기",
    "footer.hours": "서비스 시간: 9:00-21:00",
    "footer.email": "이메일: irene666666666666@gmail.com",
    "footer.copyright": "© 2024 SPR. 모든 권리 보유.",

    // Modal
    "modal.developing.title": "기능 개발 중",
    "modal.developing.content": "곧 출시됩니다...",
    "modal.developing.confirm": "확인",

    // Detection Messages
    "detection.submitSuccess":
      "검출이 성공적으로 제출되었습니다, 작업 ID: {taskId}",
    "detection.completed": "검출 완료!",
    "detection.failed": "검출 실패: {error}",
    "detection.timeout": "검출 시간 초과, 나중에 다시 시도해주세요",
    "detection.submitFailed": "검출 요청 제출에 실패했습니다",

    // Upload
    "upload.title": "이미지 업로드",
    "upload.multipleImages":
      "다중 이미지 지원, JPG, PNG, WEBP 형식, 단일 파일 최대 10MB",
    "upload.singleImage": "JPG, PNG, WEBP 형식 지원, 단일 파일 최대 10MB",
    "upload.uploadedFiles": "업로드된 파일",
    "upload.dragDrop": "또는 이미지를 이 영역에 직접 드래그&드롭",
    "upload.dragOver": "마우스를 놓아 이미지 업로드",
    "upload.dragError": "이미지 파일을 드래그해주세요",
    "upload.maxFiles": "최대 {maxFiles}장의 이미지 업로드 가능",
    "upload.maxFilesText": "최대 {maxFiles}장",
    "upload.invalidFileType":
      "지원되지 않는 파일 형식입니다. JPG, PNG 또는 WEBP 형식의 이미지를 업로드해주세요",
    "upload.tip": "클릭하거나 파일을 여기에 드래그하여 업로드",

    // Video Upload
    "upload.videoTitle": "검출 동영상 업로드",
    "upload.videoDesc":
      "스마트폰 검출 동영상을 업로드하세요, MP4, MOV, AVI 형식 지원",
    "upload.videoTip": "동영상 파일 드래그&드롭 지원, 파일 크기는 100MB 이하",
    "upload.invalidVideoType": "동영상 형식 파일을 업로드하세요",
    "upload.videoTooLarge":
      "동영상 파일이 너무 큽니다, 100MB 미만 파일을 선택하세요",
    "upload.videoSuccess": "동영상 업로드 성공",
    "upload.noVideo": "먼저 동영상 파일을 업로드하세요",

    // Video Analysis
    "analysis.videoTitle": "동영상 AI 분석 중",
    "analysis.videoProcessing": "동영상 파일 처리 중...",
    "analysis.videoAnalysis": "동영상 내용 분석 중...",
    "analysis.videoDetection": "기기 상태 검출 중...",
    "analysis.videoReport": "검출 보고서 생성 중...",

    // Additional Buttons
    "btn.previous": "이전",

    // Photo Guide
    "photoGuide.title": "검출 가이드",
    "photoGuide.step": "단계",
    "photoGuide.shootingPoints": "촬영 포인트",

    // Video Guide
    "videoGuide.title": "비디오 검출 가이드",
    "videoGuide.description":
      "2-3분의 완전한 검출 비디오를 녹화해주세요. 다음 내용을 포함해주세요:",
    "videoGuide.section1.title": "1. 외관 표시 (20-30초)",
    "videoGuide.section1.desc":
      "스마트폰을 천천히 회전시켜 6면의 외관을 표시하고, 프레임, 화면, 뒷면의 마모에 특히 주의해주세요",
    "videoGuide.section2.title": "2. 화면 기능 테스트 (30-45초)",
    "videoGuide.section2.desc":
      "화면을 켜고 배터리 정보를 표시하고 화면 표시 효과를 확인해주세요",
    "videoGuide.section3.title": "3. 카메라 검출 (20-30초)",
    "videoGuide.section3.desc":
      "프론트 카메라와 리어 카메라의 외관을 근거리에서 표시해주세요",
    "videoGuide.section4.title": "4. 기능 테스트 (20-30초)",
    "videoGuide.section4.desc": "플래시라이트 기능을 테스트해주세요",
    "videoGuide.section5.title": "5. 시스템 정보 표시 (30-45초)",
    "videoGuide.section5.desc":
      "설정 인터페이스에 들어가서 계정 상태, 배터리 건강도, 디바이스 정보 등 중요한 정보를 표시해주세요",
    "videoGuide.tips":
      "가로 화면 비디오 녹화를 권장하며, 안정을 유지하고, 화면을 선명하게 하고, 충분한 조명을 확보해주세요. 비디오 파일 크기는 100MB 이내로 제어해주세요.",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("zh");

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
