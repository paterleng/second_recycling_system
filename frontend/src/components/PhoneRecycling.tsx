import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Smartphone,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle,
  Star,
  Camera,
  Video,
  Upload as UploadIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  Battery,
  Settings,
  Info,
  Flashlight,
  RotateCcw,
  AlertCircle,
  X,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import logo from "../assets/logo.avif?url";
import { useLanguage } from "./LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import {
  Button as ArcoButton,
  Message,
  Modal,
  Upload,
  Collapse,
} from "@arco-design/web-react";
import {
  submitInspection,
  getInspectionResult,
  PhoneInspectionRequest,
} from "../api";
const CollapseItem = Collapse.Item;
// 文件类型验证函数 - 仅支持 JPG、PNG、WEBP
const isAcceptFile = (file: File, accept: string) => {
  if (accept && file) {
    const accepts = Array.isArray(accept)
      ? accept
      : accept
          .split(",")
          .map((x) => x.trim())
          .filter((x) => x);
    const fileExtension =
      file.name.indexOf(".") > -1 ? file.name.split(".").pop() : "";
    return accepts.some((type) => {
      const text = type && type.toLowerCase();
      const fileType = (file.type || "").toLowerCase();

      // 检查具体的文件类型
      if (fileType === "image/jpeg" || fileType === "image/jpg") {
        return true;
      }
      if (fileType === "image/png") {
        return true;
      }
      if (fileType === "image/webp") {
        return true;
      }

      // 检查文件扩展名
      const ext = fileExtension && fileExtension.toLowerCase();
      if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") {
        return true;
      }

      return false;
    });
  }
  return !!file;
};

type DetectionMethod = "photo" | "video" | "";
type Step =
  | "method"
  | "basic-info"
  | "photo-guide"
  | "video-guide"
  | "ai-analysis"
  | "result";

interface PhotoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  examples?: string[];
  completed: boolean;
  uploadedFiles: File[];
  fieldName: string; // 对应接口字段名
  maxFiles: number; // 最大文件数量
}

export function PhoneRecycling() {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>("method");
  const [detectionMethod, setDetectionMethod] = useState<DetectionMethod>("");
  const [visible, setVisible] = useState(false);
  const [customBrand, setCustomBrand] = useState<string>("");
  const [customModel, setCustomModel] = useState<string>("");
  const [storage, setStorage] = useState<string>("");
  const [accessories, setAccessories] = useState<string>("");
  const [currentPhotoStep, setCurrentPhotoStep] = useState<number>(0);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>({
    // brand: "Apple iPhone 15 Pro",
    // storage_total: "256GB",
    // storage_use: "128GB",
    // product_date: "2024年9月",
    // first_use_date: "2024年10月",
    // maximum_capacity: "100%",
    // battery_health: "100%",
    // charge_cycles: "15次",
    // overall_condition: "优秀",
    // appearance_result: [
    //   "- **正面分析:** 屏幕完好无损，无划痕和磕碰，**显示效果优秀**",
    //   "- **背面分析:** 后盖干净光滑，苹果标志清晰可见，*无明显磨损*",
    //   "- **侧边分析:** 边框完整，无磨损痕迹，**按键功能正常**",
    //   "- **整体评价:** 设备外观**优秀**，符合*准新机*标准",
    // ],
    // screen_condition: "优秀",
    // screen_result: [
    //   "- **主要问题:** 无",
    //   "- **显示质量:** 清晰，色彩鲜艳，**无明显异常**",
    //   "- **触摸功能:** *响应灵敏*，无断触现象",
    //   "- **亮度调节:** **正常工作**，自动亮度功能正常",
    // ],
    // camera_lens: "全新/良好",
    // physical_damage: "无",
    // flashlight_line: "正常",
    // other_info: "设备状态良好",
    // price: 3500,
    // user_input: {
    //   brand: "Apple",
    //   model: "iPhone 15 Pro",
    //   storage: "256GB",
    //   accessory_condition: accessories || "complete",
    // },
    // user_inputs_text: "设备保养良好，无任何问题",
  });
  const [estimatedPrice, setEstimatedPrice] = useState<string | number | null>(
    3500
  );
  const [userTextInputs, setUserTextInputs] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState<number>(0);

  const [photoSteps, setPhotoSteps] = useState<PhotoStep[]>([]);

  // 创建初始的 photoSteps 数据
  const createPhotoSteps = (): PhotoStep[] => [
    {
      id: "machine_type",
      title: t("photo.machineType.title"),
      description: t("photo.machineType.desc"),
      icon: Settings,
      examples: [
        t("photo.machineType.tips"),
        t("photo.machineType.ensureVisible"),
        t("photo.machineType.avoidReflection"),
      ],
      completed: false,
      uploadedFiles: [],
      fieldName: "machine_type_image",
      maxFiles: 6, // 第一步：6张
    },
    {
      id: "product_date",
      title: t("photo.productDate.title"),
      description: t("photo.productDate.desc"),
      icon: Calendar,
      examples: [
        t("photo.productDate.tips"),
        t("photo.productDate.ensureReadable"),
        t("photo.productDate.avoidDamage"),
      ],
      completed: false,
      uploadedFiles: [],
      fieldName: "product_date_image",
      maxFiles: 1, // 第二步：1张
    },
    {
      id: "appearance",
      title: t("photo.appearance.title"),
      description: t("photo.appearance.desc"),
      icon: Smartphone,
      examples: [
        t("photo.appearance.sixSides"),
        t("photo.appearance.watchWear"),
        t("photo.appearance.checkScratches"),
      ],
      completed: false,
      uploadedFiles: [],
      fieldName: "appearance_images",
      maxFiles: 6, // 第三步：6张
    },
    {
      id: "screen",
      title: t("photo.screen.title"),
      description: t("photo.screen.desc"),
      icon: Eye,
      examples: [
        t("photo.screen.tips1"),
        t("photo.screen.tips2"),
        t("photo.screen.tips3"),
      ],
      completed: false,
      uploadedFiles: [],
      fieldName: "screen_image",
      maxFiles: 2, // 第四步：2张
    },
    {
      id: "camera",
      title: t("photo.camera.title"),
      description: t("photo.camera.desc"),
      icon: Camera,
      examples: [
        t("photo.camera.closeUp"),
        t("photo.camera.multiAngle"),
        t("photo.camera.checkFlashlight"),
      ],
      completed: false,
      uploadedFiles: [],
      fieldName: "camera_lens_images",
      maxFiles: 1, // 第五步：1张
    },
    {
      id: "flashlight",
      title: t("photo.flashlight.title"),
      description: t("photo.flashlight.desc"),
      icon: Flashlight,
      examples: [
        t("photo.flashlight.turnOn"),
        t("photo.flashlight.observeBrightness"),
        t("photo.flashlight.checkDamage"),
      ],
      completed: false,
      uploadedFiles: [],
      fieldName: "flashlight_image",
      maxFiles: 1, // 第六步：1张
    },
    {
      id: "battery_health",
      title: t("photo.batteryHealth.title"),
      description: t("photo.batteryHealth.desc"),
      icon: Battery,
      examples: [
        t("photo.batteryHealth.goToSettings"),
        t("photo.batteryHealth.screenshot"),
        t("photo.batteryHealth.ensureClear"),
      ],
      completed: false,
      uploadedFiles: [],
      fieldName: "battery_health_image",
      maxFiles: 1, // 第七步：1张
    },
  ];

  // 监听语言变化，更新 photoSteps（保留现有文件）
  useEffect(() => {
    setPhotoSteps((prevSteps) => {
      const newSteps = createPhotoSteps();
      // 保留现有步骤的文件和完成状态
      return newSteps.map((newStep, index) => {
        const existingStep = prevSteps[index];
        if (existingStep && existingStep.id === newStep.id) {
          return {
            ...newStep,
            uploadedFiles: existingStep.uploadedFiles,
            completed: existingStep.completed,
          };
        }
        return newStep;
      });
    });
  }, [language]);

  const updatePhotoStepFiles = (stepIndex: number, files: File[]) => {
    const updatedSteps = [...photoSteps];
    updatedSteps[stepIndex].uploadedFiles = files;
    updatedSteps[stepIndex].completed = files.length > 0;
    setPhotoSteps(updatedSteps);
  };

  const handleFileDelete = (stepIndex: number, fileIndex: number) => {
    const updatedSteps = [...photoSteps];
    const deletedFile = updatedSteps[stepIndex].uploadedFiles[fileIndex];
    updatedSteps[stepIndex].uploadedFiles.splice(fileIndex, 1);
    updatedSteps[stepIndex].completed =
      updatedSteps[stepIndex].uploadedFiles.length > 0;
    setPhotoSteps(updatedSteps);
  };

  //接口上传数据
  const prepareApiData = (): PhoneInspectionRequest => {
    const apiData: PhoneInspectionRequest = {
      brand: customBrand || "",
      model: customModel || "",
      storage: storage,
      accessory_condition: accessories,
      machine_type_image:
        photoSteps.find((step) => step.fieldName === "machine_type_image")
          ?.uploadedFiles || [],
      product_date_image:
        photoSteps.find((step) => step.fieldName === "product_date_image")
          ?.uploadedFiles || [],
      battery_health_image:
        photoSteps.find((step) => step.fieldName === "battery_health_image")
          ?.uploadedFiles || [],
      appearance_images:
        photoSteps.find((step) => step.fieldName === "appearance_images")
          ?.uploadedFiles || [],
      screen_image:
        photoSteps.find((step) => step.fieldName === "screen_image")
          ?.uploadedFiles || [],
      camera_lens_images:
        photoSteps.find((step) => step.fieldName === "camera_lens_images")
          ?.uploadedFiles || [],
      flashlight_image:
        photoSteps.find((step) => step.fieldName === "flashlight_image")
          ?.uploadedFiles || [],
      user_text_inputs: userTextInputs || "无备注",
    };

    // 打印每个步骤的文件信息
    photoSteps.forEach((step, index) => {
      if (step.uploadedFiles.length > 0) {
        console.log(`步骤 ${index + 1} (${step.title}):`, {
          fieldName: step.fieldName,
          fileCount: step.uploadedFiles.length,
          files: step.uploadedFiles.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
          })),
        });
      }
    });

    return apiData;
  };

  //上传检测接口
  const startAIAnalysis = async () => {
    // 检查所有步骤是否都已完成
    const allStepsCompleted = photoSteps.every((step) => step.completed);
    if (!allStepsCompleted) {
      Message.error(t("alert.completeAllSteps"));
      return;
    }

    // 准备接口数据
    const apiData = prepareApiData();
    console.log(t("console.apiData"), apiData);

    setCurrentStep("ai-analysis");
    setAnalysisProgress(0);
    setIsSubmitting(true);

    try {
      // 提交检测请求
      const response = await submitInspection(apiData);

      if (response.task_id) {
        // 获取检测结果
        const result = await fetchInspectionResult(response.task_id);
        setAiAnalysisResult(result);
        setIsSubmitting(false);
        return;
      } else {
        throw new Error("提交检测请求失败");
      }
    } catch (error) {
      console.error("提交检测请求失败:", error);
      Message.error(
        error instanceof Error ? error.message : t("detection.submitFailed")
      );
      setIsSubmitting(false);
      setCurrentStep("photo-guide");
    }
  };

  // 获取检测结果（持续轮询直到完成）
  const fetchInspectionResult = async (taskId: string) => {
    const pollInterval = 3000; // 轮询间隔（毫秒）
    const maxPollTime = 80000; // 最大轮询时间（1分钟，原来2分钟，已缩短）
    const startTime = Date.now();

    // 自动进度动画，不受接口轮询影响
    let progressStopped = false;
    let progressTimer: NodeJS.Timeout | null = null;

    // 启动进度动画
    const startProgressAnimation = () => {
      const updateInterval = 100; // 100ms更新一次
      const increment = () => {
        if (progressStopped) return;

        const elapsedTime = Date.now() - startTime;
        // 逐步递增至99%
        const progress = Math.min((elapsedTime / 20000) * 99, 99);
        setAnalysisProgress(progress);
        progressTimer = setTimeout(increment, updateInterval);
      };
      increment();
    };

    // 停止进度动画
    const stopProgressAnimation = () => {
      progressStopped = true;
      if (progressTimer) {
        clearTimeout(progressTimer);
        progressTimer = null;
      }
    };

    // 启动进度动画
    startProgressAnimation();

    try {
      // 接口持续轮询
      while (Date.now() - startTime < maxPollTime) {
        try {
          const result = await getInspectionResult(taskId);

          console.log("检测结果:", result);

          if (result.status === "COMPLETED") {
            // 接口提前返回则进度条先跳到100，再进行后续操作
            stopProgressAnimation();
            setAnalysisProgress(100);

            // 等待进度条显示100%一小段时间，然后再跳转到下一步
            await new Promise((resolve) => setTimeout(resolve, 400));

            calculateFinalPrice(result.report);
            setCurrentStep("result");
            Message.success(t("detection.completed"));

            // 滚动到结果位置
            setTimeout(() => {
              const resultCard = document.querySelector(
                '[data-testid="result-card"]'
              );
              if (resultCard) {
                const cardRect = resultCard.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const cardHeight = cardRect.height;
                const currentScrollTop =
                  window.pageYOffset || document.documentElement.scrollTop;

                const cardCenterFromTop =
                  currentScrollTop + cardRect.top + cardHeight / 2;

                const targetScrollTop = cardCenterFromTop - windowHeight / 2;

                window.scrollTo({
                  top: targetScrollTop,
                  behavior: "smooth",
                });
              }
            }, 200);

            return result.report;
          } else if (result.status === "FAILED") {
            // 接口返回失败
            stopProgressAnimation();
            Message.error(
              t("detection.failed").replace(
                "{error}",
                result.error || "未知错误"
              )
            );
            setCurrentStep("photo-guide");
            throw new Error(result.error || "检测失败");
          }

          // 继续轮询
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
        } catch (error) {
          console.error(`获取检测结果失败，任务ID: ${taskId}`, error);

          if (
            error instanceof Error &&
            error.message.includes("获取检测结果失败")
          ) {
            console.log(`${pollInterval / 1000}秒后重试...`);
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
          } else {
            // 其他错误直接抛出
            stopProgressAnimation();
            throw error;
          }
        }
      }

      // 超时处理
      stopProgressAnimation();
      console.error(`检测超时，任务ID: ${taskId}`);
      setCurrentStep("photo-guide");
      throw new Error(t("detection.timeout"));
    } catch (error) {
      // 确保进度动画被停止
      stopProgressAnimation();
      throw error;
    }
  };

  const calculateFinalPrice = (analysisResult: any) => {
    // 如果API返回了价格，直接使用（支持字符串和数字格式）
    if (analysisResult.price) {
      setEstimatedPrice(analysisResult.price);
      return;
    }

    // 如果没有价格，使用默认价格
    setEstimatedPrice(analysisResult.price || "3000");
  };

  // 重新检测 - 回到最开始的地方，清空所有数据
  const resetProcess = () => {
    setCurrentStep("method");
    setDetectionMethod("");
    setCustomBrand("");
    setCustomModel("");
    setStorage("");
    setAccessories("");
    setCurrentPhotoStep(0);
    setAnalysisProgress(0);
    setAnalysisComplete(false);
    setAiAnalysisResult(null);
    setEstimatedPrice(null);
    setUserTextInputs("");
    setIsSubmitting(false);

    // 重置所有拍照步骤
    setPhotoSteps(createPhotoSteps());
  };

  // 再次检测 - 直接跳转到检测指南最后一步，保留所有参数和上传的文件
  const detectAgain = () => {
    // 保留所有用户输入的基本信息
    // 不重置 customBrand, customModel, storage, accessories, userTextInputs

    // 只重置检测相关的状态
    setCurrentStep("photo-guide"); // 直接跳转到检测指南页面
    setCurrentPhotoStep(photoSteps.length - 1); // 跳转到最后一步
    setAnalysisProgress(0);
    setAnalysisComplete(false);
    setIsSubmitting(false);
    setAiAnalysisResult(null);
    setEstimatedPrice(null);

    // 保留所有拍照步骤的文件和完成状态，不重置
    // photoSteps 保持不变，保留所有上传的文件
  };

  // 视频上传处理
  const handleVideoUpload = (file: File) => {
    // 防止重复处理同一个文件
    if (
      uploadedVideo &&
      uploadedVideo.name === file.name &&
      uploadedVideo.size === file.size
    ) {
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith("video/")) {
      Message.error(t("upload.invalidVideoType"));
      return;
    }

    // 检查文件大小 (限制为100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      Message.error(t("upload.videoTooLarge"));
      return;
    }

    setUploadedVideo(file);
    Message.success(t("upload.videoSuccess"));
  };

  // 视频模拟AI分析
  const startVideoAnalysis = async () => {
    if (!uploadedVideo) {
      Message.error(t("upload.noVideo"));
      return;
    }

    setCurrentStep("ai-analysis");
    setVideoAnalysisProgress(0);
    setIsSubmitting(true);

    try {
      // 模拟15秒的AI分析过程
      const analysisDuration = 20000; // 20秒
      const updateInterval = 100; // 每100ms更新一次进度
      const totalUpdates = analysisDuration / updateInterval;

      for (let i = 0; i <= totalUpdates; i++) {
        const progress = (i / totalUpdates) * 100;
        setVideoAnalysisProgress(progress);

        if (i < totalUpdates) {
          await new Promise((resolve) => setTimeout(resolve, updateInterval));
        }
      }

      // 模拟检测结果 - 使用固定API返回格式
      const mockResult = {
        brand: "XiaomiRedmi K50",
        storage_total: "48.2GB/256GB",
        storage_use: "48.2GB/256GB",
        product_date: "Unknown",
        first_use_date: "Unknown",
        maximum_capacity: "Not Available",
        battery_health: "Normal",
        charge_cycles: "0",
        overall_condition: "Poor",
        appearance_result: [
          "- **positive analysis:** The front screen has noticeable scratches. These are superficial but definitely present. Unable to assess for cracks without closer inspection, but scratches are visible.",
          "- **backside analysis:** The back glass is heavily cracked. The cracking is extensive, suggesting a significant impact.  The top right corner of the back panel near the camera module appears to be particularly damaged and may be chipping.",
          "- **side analysis:** The edges appear to have some wear and tear, possibly scuffs or small dents. More images might reveal more detail, but some edge wear is evident.",
        ],
        screen_condition: "Fair",
        screen_result: [
          "- **main questions:**",
          "    - Scratches: Several scratches are visible on the screen.  One is a longer, more prominent scratch that runs from the upper left quadrant diagonally down towards the center-right of the screen. There are other lighter, shorter scratches scattered across the lower half of the screen.",
          "    - Smudges/Fingerprints: There are noticeable smudges and fingerprints on the screen surface. This makes it difficult to assess the display accurately, but they are present.",
          "    - Possible Chip/Damage: There is a potential small chip or area of damage on the top-left corner of the phone screen where the black frame meets the screen, it is quite minor, but there.",
          "    - Display Off: The display is turned off in the image, which limits assessment of display quality issues like dead pixels, color abnormalities, or screen burn-in.",
          "    - Dust: There might be some visible dust on the top screen area",
          "- **display quality:** Cannot be fully assessed due to the screen being off. However, scratches and smudges are present.",
        ],
        camera_lens: "Poor",
        physical_damage:
          "Likely undamaged lenses, phone surrounding lenses is damaged.",
        flashlight_line: "Fully Functional",
        other_info:
          "Running HyperOS, Processor: Dimensity 8100, RAM: 8GB + 4GB",
        price: "100-300",
        user_input: {
          brand: "redmi",
          model: "k50",
          storage: "256gb",
          accessory_condition: "complete",
        },
        user_inputs_text: "无备注",
      };

      setAiAnalysisResult(mockResult);
      // 价格为字符串直接正常返回
      setEstimatedPrice(mockResult.price);
      setIsSubmitting(false);
      setCurrentStep("result");
      Message.success(t("detection.completed"));

      // 滚动到结果位置
      setTimeout(() => {
        const resultCard = document.querySelector(
          '[data-testid="result-card"]'
        );
        if (resultCard) {
          const cardRect = resultCard.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          const cardHeight = cardRect.height;
          const currentScrollTop =
            window.pageYOffset || document.documentElement.scrollTop;
          const cardCenterFromTop =
            currentScrollTop + cardRect.top + cardHeight / 2;
          const targetScrollTop = cardCenterFromTop - windowHeight / 2;

          window.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });
        }
      }, 200);
    } catch (error) {
      console.error("视频分析失败:", error);
      Message.error(t("detection.failed"));
      setIsSubmitting(false);
      setCurrentStep("video-guide");
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
        radial-gradient(ellipse 80% 50% at 20% -20%, rgba(139, 92, 246, 0.3), transparent),
        radial-gradient(ellipse 60% 50% at 80% 50%, rgba(168, 85, 247, 0.2), transparent),
        radial-gradient(ellipse 60% 80% at 40% 120%, rgba(124, 58, 237, 0.3), transparent),
        linear-gradient(135deg, #1a0d2e 0%, #2d1b69 50%, #1a0d2e 100%)
      `,
      }}
    >
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 via-violet-600/10 to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-600/5 via-violet-500/3 to-transparent blur-3xl"></div>
      </div>

      {/* 导航栏 */}
      <nav className="relative z-10 border-b border-border/50 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="SPR" className=" w-12 h-12" />
            <span className="text-xl font-semibold text-foreground">SPR</span>
          </div>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* 主横幅区域 */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16 relative">
          {/* 背景发光球体效果 */}
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-400/30 via-violet-500/20 to-purple-600/10 blur-2xl animate-pulse"></div>

          <Badge
            variant="secondary"
            className="relative z-10 text-sm px-6 py-3 bg-white/10 border-white/20 text-white backdrop-blur-sm"
          >
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            {t("hero.badge")}
          </Badge>

          <div className="relative z-10 mb-16">
            <h1
              className="text-5xl lg:text-7xl font-bold text-white leading-tight"
              style={{ fontSize: "3rem" }}
            >
              {t("hero.title")}
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent">
                {t("hero.titleHighlight")}
              </span>
            </h1>

            {/* 文字下方发光效果 */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-xl"></div>
          </div>

          <p className="relative z-10 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* 装饰性光点 */}
          <div className="absolute top-20 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-10 right-1/3 w-1 h-1 bg-violet-300 rounded-full animate-ping delay-500"></div>
          <div className="absolute top-32 right-1/4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping delay-1000"></div>
        </div>

        {/* 特色功能 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 relative z-10">
          <Card className="bg-black/20 border-white/10 backdrop-blur-md hover:bg-black/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="relative mb-4">
                <Zap className="h-12 w-12 text-purple-400 mx-auto group-hover:text-purple-300 transition-colors" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg group-hover:bg-purple-300/30 transition-all"></div>
              </div>
              <CardTitle className="text-white">
                {t("features.intelligent.title")}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {t("features.intelligent.desc")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/20 border-white/10 backdrop-blur-md hover:bg-black/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="relative mb-4">
                <Shield className="h-12 w-12 text-violet-400 mx-auto group-hover:text-violet-300 transition-colors" />
                <div className="absolute inset-0 bg-violet-400/20 rounded-full blur-lg group-hover:bg-violet-300/30 transition-all"></div>
              </div>
              <CardTitle className="text-white">
                {t("features.transparent.title")}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {t("features.transparent.desc")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-black/20 border-white/10 backdrop-blur-md hover:bg-black/40 transition-all duration-300 group">
            <CardHeader className="text-center">
              <div className="relative mb-4">
                <TrendingUp className="h-12 w-12 text-indigo-400 mx-auto group-hover:text-indigo-300 transition-colors" />
                <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-lg group-hover:bg-indigo-300/30 transition-all"></div>
              </div>
              <CardTitle className="text-white">
                {t("features.efficient.title")}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {t("features.efficient.desc")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* 估价流程 */}
        <Card className="max-w-4xl mx-auto mb-10 bg-black/40 border-white/20 backdrop-blur-xl relative z-10 shadow-2xl shadow-purple-500/10">
          <CardHeader className="text-center border-b border-white/10">
            <CardTitle className="flex items-center justify-center space-x-2 text-white">
              <Smartphone className="h-6 w-6 text-purple-400" />
              <span>
                {currentStep === "method" && t("steps.method")}
                {currentStep === "basic-info" && t("steps.basicInfo")}
                {currentStep === "photo-guide" && t("steps.photoGuide")}
                {currentStep === "video-guide" && t("steps.videoGuide")}
                {currentStep === "ai-analysis" && t("steps.analysis")}
                {currentStep === "result" && t("steps.result")}
              </span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              {currentStep === "method" && t("steps.method.desc")}
              {currentStep === "basic-info" && t("steps.basicInfo.desc")}
              {currentStep === "photo-guide" && t("steps.photoGuide.desc")}
              {currentStep === "video-guide" && t("steps.videoGuide.desc")}
              {currentStep === "ai-analysis" && t("steps.analysis.desc")}
              {currentStep === "result" && t("steps.result.desc")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 步骤1：选择检测方式 */}
            {currentStep === "method" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {t("detection.title")}
                  </h3>
                  <p className="text-gray-300">{t("detection.subtitle")}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      detectionMethod === "photo"
                        ? "border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                        : "border-white/20 hover:border-purple-400/60 hover:bg-purple-500/5"
                    }`}
                    onClick={() => setDetectionMethod("photo")}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="relative mb-4">
                        <Camera className="h-16 w-16 text-purple-400 mx-auto" />
                        <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
                      </div>
                      <h4 className="text-xl font-semibold mb-2 text-white">
                        {t("detection.photo.title")}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {t("detection.photo.desc")}
                      </p>
                      <div className="space-y-2 text-sm text-left">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-purple-400" />
                          <span className="text-gray-200">
                            {t("detection.photo.feature1")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-purple-400" />
                          <span className="text-gray-200">
                            {t("detection.photo.feature2")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-purple-400" />
                          <span className="text-gray-200">
                            {t("detection.photo.feature3")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all border-2 ${
                      detectionMethod === "video"
                        ? "border-violet-400 bg-violet-500/10 shadow-lg shadow-violet-500/20"
                        : "border-white/20 hover:border-violet-400/60 hover:bg-violet-500/5"
                    }`}
                    onClick={() => setDetectionMethod("video")}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="relative mb-4">
                        <Video className="h-16 w-16 text-violet-400 mx-auto" />
                        <div className="absolute inset-0 bg-violet-400/20 rounded-full blur-lg"></div>
                      </div>
                      <h4 className="text-xl font-semibold mb-2 text-white">
                        {t("detection.video.title")}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {t("detection.video.desc")}
                      </p>
                      <div className="space-y-2 text-sm text-left">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-violet-400" />
                          <span className="text-gray-200">
                            {t("detection.video.feature1")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-violet-400" />
                          <span className="text-gray-200">
                            {t("detection.video.feature2")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-violet-400" />
                          <span className="text-gray-200">
                            {t("detection.video.feature3")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* 注释掉原有的开发中弹框
                <Modal
                  title={
                    <span style={{ color: "#e0e2ff" }}>
                      {t("modal.developing.title")}
                    </span>
                  }
                  visible={visible}
                  footer={null}
                  onOk={() => setVisible(false)}
                  onCancel={() => setVisible(false)}
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(26,0,51,0.9) 0%, rgba(43,0,85,0.9) 100%)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 0 20px rgba(155,92,255,0.25)",
                    backdropFilter: "blur(20px)",
                    color: "#e0e2ff",
                    borderRadius: 16,
                  }}
                >
                  <p style={{ color: "#e0e2ff" }}>
                    {t("modal.developing.content")}
                  </p>
                  <div style={{ textAlign: "right", marginTop: 16 }}>
                    <Button
                      onClick={() => setVisible(false)}
                      className="h-10 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 cursor-pointer"
                      style={{ color: "#fff" }}
                    >
                      {t("modal.developing.confirm")}
                    </Button>
                  </div>
                </Modal>
                */}
                {detectionMethod && (
                  <Button
                    onClick={() => setCurrentStep("basic-info")}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 cursor-pointer"
                  >
                    {t("btn.next")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* 步骤2：基本信息 */}
            {currentStep === "basic-info" && (
              <div className="space-y-6">
                {/* 品牌输入 */}
                <div className="space-y-2">
                  <Label>{t("form.brand")}</Label>
                  <Input
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder={t("form.brandPlaceholder")}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* 型号输入 */}
                {customBrand && (
                  <div className="space-y-2">
                    <Label>{t("form.model")}</Label>
                    <Input
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      placeholder={t("form.modelPlaceholder")}
                      className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* 存储容量 */}
                {customModel && (
                  <div className="space-y-2">
                    <Label>{t("form.storage")}</Label>
                    <Select value={storage} onValueChange={setStorage}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("form.storagePlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="64gb">64GB</SelectItem>
                        <SelectItem value="128gb">128GB</SelectItem>
                        <SelectItem value="256gb">256GB</SelectItem>
                        <SelectItem value="512gb">512GB</SelectItem>
                        <SelectItem value="1tb">1TB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 配件完整度 */}
                {storage && (
                  <div className="space-y-2">
                    <Label>{t("form.accessories")}</Label>
                    <Select value={accessories} onValueChange={setAccessories}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("form.accessoriesPlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complete">
                          {t("form.accessoriesComplete")}
                        </SelectItem>
                        <SelectItem value="partial">
                          {t("form.accessoriesPartial")}
                        </SelectItem>
                        <SelectItem value="none">
                          {t("form.accessoriesNone")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 用户文本输入 */}
                {accessories && (
                  <div className="space-y-2">
                    <Label className="text-white">
                      {t("form.additionalNotes")}
                    </Label>
                    <textarea
                      value={userTextInputs}
                      onChange={(e) => setUserTextInputs(e.target.value)}
                      placeholder={t("form.additionalNotesPlaceholder")}
                      className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
                      rows={3}
                    />
                  </div>
                )}

                {accessories && (
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("method")}
                      className="flex-1 border-white/20 text-white hover:bg-white/10 cursor-pointer"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> {t("btn.prev")}
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentStep(
                          detectionMethod === "photo"
                            ? "photo-guide"
                            : "video-guide"
                        )
                      }
                      className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 cursor-pointer"
                    >
                      {t("btn.startDetection")}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 步骤3：拍照指南 */}
            {currentStep === "photo-guide" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {t("photoGuide.title")}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white border-white/20"
                  >
                    {t("photoGuide.step")} {currentPhotoStep + 1} /{" "}
                    {photoSteps.length}
                  </Badge>
                </div>

                <Progress
                  value={((currentPhotoStep + 1) / photoSteps.length) * 100}
                  className="mb-6"
                />

                <Card className="bg-transparent border-white/10">
                  {/* <Card className="bg-black/20 border-white/10 backdrop-blur-md"> */}
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-500/20 p-3 rounded-lg">
                        {React.createElement(
                          photoSteps[currentPhotoStep].icon,
                          {
                            className: "h-8 w-8 text-purple-400",
                          }
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2 text-white">
                          {photoSteps[currentPhotoStep].title}
                        </h4>
                        <p className="text-gray-300 mb-4">
                          {photoSteps[currentPhotoStep].description}
                        </p>

                        {photoSteps[currentPhotoStep].examples && (
                          <div className="space-y-2">
                            <Label className="text-sm text-white">
                              {t("photoGuide.shootingPoints")}：
                            </Label>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                              {photoSteps[currentPhotoStep].examples.map(
                                (example, index) => (
                                  <li key={index}>{example}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 文件上传区域 - 使用 Arco Upload 组件 */}
                <Card className="bg-transparent border-white/10">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold mb-2 text-white">
                        {t("upload.title")} {photoSteps[currentPhotoStep].title}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {t("upload.singleImage")} (
                        {t("upload.maxFilesText").replace(
                          "{maxFiles}",
                          photoSteps[currentPhotoStep].maxFiles.toString()
                        )}
                        )
                      </p>
                    </div>

                    <Upload
                      className="upload-container"
                      drag
                      multiple={photoSteps[currentPhotoStep].maxFiles > 1}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      action="/"
                      fileList={photoSteps[currentPhotoStep].uploadedFiles.map(
                        (file, index) => ({
                          uid: `${index}`,
                          name: file.name,
                          status: "done",
                          url: URL.createObjectURL(file),
                          size: file.size,
                          type: file.type,
                        })
                      )}
                      onDrop={(e) => {
                        const uploadFile = e.dataTransfer.files[0];
                        if (
                          isAcceptFile(
                            uploadFile,
                            "image/jpeg,image/jpg,image/png,image/webp"
                          )
                        ) {
                          const files = Array.from(e.dataTransfer.files);
                          const currentStep = photoSteps[currentPhotoStep];
                          const maxFiles = currentStep.maxFiles;

                          // 检查文件数量限制
                          if (files.length > maxFiles) {
                            Message.error(
                              t("upload.maxFiles").replace(
                                "{maxFiles}",
                                maxFiles.toString()
                              )
                            );
                            return;
                          }

                          updatePhotoStepFiles(currentPhotoStep, files);
                        } else {
                          Message.info(t("upload.invalidFileType"));
                        }
                      }}
                      onChange={(fileList: any[], file: any) => {
                        // 获取所有文件的原始File对象
                        const files = fileList
                          .map((item) => item.originFile)
                          .filter((file): file is File => file instanceof File);

                        if (files.length > 0) {
                          // 检查文件类型
                          const invalidFiles = files.filter(
                            (file) =>
                              !isAcceptFile(
                                file,
                                "image/jpeg,image/jpg,image/png,image/webp"
                              )
                          );
                          if (invalidFiles.length > 0) {
                            Message.info(t("upload.invalidFileType"));
                            return;
                          }

                          // 检查文件数量限制
                          const currentStep = photoSteps[currentPhotoStep];
                          const maxFiles = currentStep.maxFiles;
                          if (files.length > maxFiles) {
                            Message.error(
                              t("upload.maxFiles").replace(
                                "{maxFiles}",
                                maxFiles.toString()
                              )
                            );
                            return;
                          }

                          updatePhotoStepFiles(currentPhotoStep, files);
                        }
                      }}
                      onRemove={(file) => {
                        const currentFiles =
                          photoSteps[currentPhotoStep].uploadedFiles;
                        const fileIndex = currentFiles.findIndex(
                          (f) => f.name === file.name
                        );
                        if (fileIndex !== -1) {
                          handleFileDelete(currentPhotoStep, fileIndex);
                        }
                      }}
                      tip={t("upload.tip")}
                    />
                  </CardContent>
                </Card>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentPhotoStep > 0) {
                        setCurrentPhotoStep(currentPhotoStep - 1);
                      } else {
                        setCurrentStep("basic-info");
                      }
                    }}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {currentPhotoStep > 0 ? t("btn.previous") : t("btn.back")}
                  </Button>
                  <Button
                    onClick={() => {
                      if (currentPhotoStep < photoSteps.length - 1) {
                        setCurrentPhotoStep(currentPhotoStep + 1);
                      } else {
                        // 所有步骤完成，直接开始AI分析
                        startAIAnalysis();
                      }
                    }}
                    disabled={
                      !photoSteps[currentPhotoStep].completed || isSubmitting
                    }
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {currentPhotoStep < photoSteps.length - 1
                      ? t("btn.next")
                      : t("btn.startAnalysis")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 步骤4：视频检测指南 */}
            {currentStep === "video-guide" && (
              <div className="space-y-6">
                <Card className="bg-transparent border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-violet-500/20 p-3 rounded-lg">
                        <Video className="h-8 w-8 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2 text-white">
                          {t("videoGuide.title")}
                        </h4>
                        <p className="text-gray-300 mb-4">
                          {t("videoGuide.description")}
                        </p>

                        <div className="space-y-4">
                          <div className="border border-white/10 rounded-lg p-4">
                            <h5 className="font-medium mb-2 flex items-center text-white">
                              <Smartphone className="h-4 w-4 mr-2 text-violet-400" />
                              {t("videoGuide.section1.title")}
                            </h5>
                            <p className="text-sm text-gray-300">
                              {t("videoGuide.section1.desc")}
                            </p>
                          </div>

                          <div className="border border-white/10 rounded-lg p-4">
                            <h5 className="font-medium mb-2 flex items-center text-white">
                              <Eye className="h-4 w-4 mr-2 text-violet-400" />
                              {t("videoGuide.section2.title")}
                            </h5>
                            <p className="text-sm text-gray-300">
                              {t("videoGuide.section2.desc")}
                            </p>
                          </div>

                          <div className="border border-white/10 rounded-lg p-4">
                            <h5 className="font-medium mb-2 flex items-center text-white">
                              <Camera className="h-4 w-4 mr-2 text-violet-400" />
                              {t("videoGuide.section3.title")}
                            </h5>
                            <p className="text-sm text-gray-300">
                              {t("videoGuide.section3.desc")}
                            </p>
                          </div>

                          <div className="border border-white/10 rounded-lg p-4">
                            <h5 className="font-medium mb-2 flex items-center text-white">
                              <Flashlight className="h-4 w-4 mr-2 text-violet-400" />
                              {t("videoGuide.section4.title")}
                            </h5>
                            <p className="text-sm text-gray-300">
                              {t("videoGuide.section4.desc")}
                            </p>
                          </div>

                          <div className="border border-white/10 rounded-lg p-4">
                            <h5 className="font-medium mb-2 flex items-center text-white">
                              <Settings className="h-4 w-4 mr-2 text-violet-400" />
                              {t("videoGuide.section5.title")}
                            </h5>
                            <p className="text-sm text-gray-300">
                              {t("videoGuide.section5.desc")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 视频上传区域 */}
                <Card className="bg-transparent border-white/10">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold mb-2 text-white">
                        {t("upload.videoTitle")}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {t("upload.videoDesc")}
                      </p>
                    </div>

                    <Upload
                      className="upload-container"
                      drag
                      accept="video/*"
                      action="/"
                      fileList={
                        uploadedVideo
                          ? [
                              {
                                uid: "1",
                                name: uploadedVideo.name,
                                status: "done",
                                url: URL.createObjectURL(uploadedVideo),
                              },
                            ]
                          : []
                      }
                      onDrop={(e) => {
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          handleVideoUpload(file);
                        }
                      }}
                      onChange={(fileList: any[], file: any) => {
                        if (file.originFile) {
                          handleVideoUpload(file.originFile);
                        }
                      }}
                      onRemove={() => {
                        setUploadedVideo(null);
                      }}
                      tip={t("upload.videoTip")}
                    />

                    {uploadedVideo && (
                      <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                        <div className="flex items-center space-x-2 text-violet-400">
                          <Video className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {uploadedVideo.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {(uploadedVideo.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Alert className="bg-yellow-500/10 border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-300">
                    {t("videoGuide.tips")}
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("basic-info")}
                    className="flex-1 border-white/20 text-white hover:bg-white/10 cursor-pointer"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> {t("btn.back")}
                  </Button>
                  <Button
                    onClick={startVideoAnalysis}
                    disabled={!uploadedVideo || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {t("btn.startAnalysis")}{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 步骤5：AI分析 */}
            {currentStep === "ai-analysis" && (
              <div className="space-y-6 text-center py-8">
                <div className="space-y-4">
                  <div className="bg-violet-500/10 p-6 rounded-full w-32 h-32 mx-auto flex items-center justify-center">
                    <Zap className="h-16 w-16 text-violet-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {detectionMethod === "video"
                      ? t("analysis.videoTitle")
                      : t("analysis.title")}
                  </h3>
                  <p className="text-gray-300">
                    {detectionMethod === "video" ? (
                      <>
                        {videoAnalysisProgress < 30 &&
                          t("analysis.videoProcessing")}
                        {videoAnalysisProgress >= 30 &&
                          videoAnalysisProgress < 60 &&
                          t("analysis.videoAnalysis")}
                        {videoAnalysisProgress >= 60 &&
                          videoAnalysisProgress < 90 &&
                          t("analysis.videoDetection")}
                        {videoAnalysisProgress >= 90 &&
                          t("analysis.videoReport")}
                      </>
                    ) : (
                      <>
                        {analysisProgress < 30 && t("analysis.appearance")}
                        {analysisProgress >= 30 &&
                          analysisProgress < 60 &&
                          t("analysis.screen")}
                        {analysisProgress >= 60 &&
                          analysisProgress < 90 &&
                          t("analysis.hardware")}
                        {analysisProgress >= 90 && t("analysis.report")}
                      </>
                    )}
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <Progress
                    value={
                      detectionMethod === "video"
                        ? videoAnalysisProgress
                        : analysisProgress
                    }
                    className="h-3"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    {Math.round(
                      detectionMethod === "video"
                        ? videoAnalysisProgress
                        : analysisProgress
                    )}
                    %
                  </p>
                </div>

                {(detectionMethod === "video"
                  ? videoAnalysisProgress >= 100
                  : analysisComplete) && (
                  <div className="space-y-4">
                    <CheckCircle className="h-16 w-16 text-violet-400 mx-auto" />
                    <p className="text-violet-400 font-semibold">
                      {t("analysis.complete")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 步骤6：估价结果 */}
            {currentStep === "result" && estimatedPrice !== null && (
              <div className="space-y-6">
                <Card
                  className="bg-primary/10 border-primary/20"
                  data-testid="result-card"
                >
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {t("result.title")}
                        </h3>
                        <p className="text-4xl font-bold text-primary">
                          ¥
                          {typeof estimatedPrice === "string"
                            ? estimatedPrice
                            : estimatedPrice?.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t("result.disclaimer")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {aiAnalysisResult && (
                  <Card className="bg-card/50">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Info className="h-5 w-5 text-primary" />
                        <span>{t("result.reportTitle")}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* 左侧列数据 */}
                        <div className="space-y-3">
                          {[
                            { key: "brand", label: "result.brand" },
                            {
                              key: "storage_total",
                              label: "result.storageTotal",
                            },
                            { key: "storage_use", label: "result.storageUse" },
                            {
                              key: "product_date",
                              label: "result.productDate",
                            },
                            {
                              key: "first_use_date",
                              label: "result.firstUseDate",
                            },
                            {
                              key: "maximum_capacity",
                              label: "result.maximumCapacity",
                            },
                            {
                              key: "battery_health",
                              label: "result.batteryHealth",
                            },
                            {
                              key: "charge_cycles",
                              label: "result.chargeCycles",
                            },
                          ].map((item) => (
                            <div
                              key={item.key}
                              className="flex justify-between"
                            >
                              <span
                                style={{
                                  width: 120,
                                }}
                              >
                                {t(item.label)}
                              </span>
                              <span
                                className="text-sm break-words whitespace-pre-wrap max-w-full"
                                style={{ wordBreak: "break-all" }}
                              >
                                {aiAnalysisResult[item.key]}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* 右侧列数据 */}
                        <div className="space-y-3">
                          {[
                            {
                              key: "overall_condition",
                              label: "result.overallCondition",
                              isBadge: true,
                            },
                            {
                              key: "screen_condition",
                              label: "result.screenCondition",
                              isBadge: true,
                            },
                            {
                              key: "camera_lens",
                              label: "result.cameraLens",
                              isBadge: true,
                            },
                            {
                              key: "physical_damage",
                              label: "result.physicalDamage",
                              isBadge: false,
                            },
                            {
                              key: "flashlight_line",
                              label: "result.flashlightLine",
                              isBadge: false,
                            },
                            {
                              key: "other_info",
                              label: "result.otherInfo",
                              isBadge: false,
                            },
                          ].map((item) => (
                            <div
                              key={item.key}
                              className="flex justify-between"
                            >
                              <span
                                style={{
                                  width: 120,
                                }}
                              >
                                {t(item.label)}
                              </span>
                              {item.isBadge ? (
                                <Badge variant="secondary">
                                  {aiAnalysisResult[item.key]}
                                </Badge>
                              ) : (
                                <span
                                  className="text-sm break-words whitespace-pre-wrap max-w-full"
                                  style={{ wordBreak: "break-all" }}
                                >
                                  {aiAnalysisResult[item.key]}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 分析结果与用户输入信息折叠面板 */}
                      {(aiAnalysisResult.appearance_result?.length > 0 ||
                        aiAnalysisResult.screen_result?.length > 0 ||
                        aiAnalysisResult.user_input) && (
                        <div className="mt-4 collapse-panel">
                          <Collapse
                            bordered={false}
                            defaultActiveKey={[""]}
                            style={{ maxWidth: 1180 }}
                          >
                            {aiAnalysisResult.user_input && (
                              <CollapseItem
                                header={t("result.userInput")}
                                name="3"
                              >
                                <div className="text-sm space-y-1">
                                  <div>
                                    {t("result.userInput.brand")}:{" "}
                                    {aiAnalysisResult.user_input.brand ||
                                      t("common.unknown")}
                                  </div>
                                  <div>
                                    {t("result.userInput.model")}:{" "}
                                    {aiAnalysisResult.user_input.model ||
                                      t("common.unknown")}
                                  </div>
                                  <div>
                                    {t("result.userInput.storage")}:{" "}
                                    {aiAnalysisResult.user_input.storage ||
                                      t("common.unknown")}
                                  </div>
                                  <div>
                                    {t("result.userInput.accessory")}:{" "}
                                    {aiAnalysisResult.user_input
                                      .accessory_condition === "complete"
                                      ? t("accessory.complete")
                                      : aiAnalysisResult.user_input
                                          .accessory_condition === "partial"
                                      ? t("accessory.partial")
                                      : aiAnalysisResult.user_input
                                          .accessory_condition === "none"
                                      ? t("accessory.none")
                                      : aiAnalysisResult.user_input
                                          .accessory_condition ||
                                        t("common.unknown")}
                                  </div>
                                </div>
                              </CollapseItem>
                            )}
                            {aiAnalysisResult.appearance_result &&
                              aiAnalysisResult.appearance_result.length > 0 && (
                                <CollapseItem
                                  header={t("result.appearanceResult")}
                                  name="1"
                                >
                                  <div className="text-sm space-y-2">
                                    {aiAnalysisResult.appearance_result.map(
                                      (item: string, index: number) => (
                                        <div
                                          key={index}
                                          className="prose prose-sm max-w-none"
                                        >
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: item
                                                .replace(
                                                  /\*\*(.*?)\*\*/g,
                                                  "<strong>$1</strong>"
                                                )
                                                .replace(
                                                  /\*(.*?)\*/g,
                                                  "<em>$1</em>"
                                                )
                                                .replace(/^\- /gm, "• ")
                                                .replace(/\n/g, "<br/>"),
                                            }}
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </CollapseItem>
                              )}
                            {aiAnalysisResult.screen_result &&
                              aiAnalysisResult.screen_result.length > 0 && (
                                <CollapseItem
                                  header={t("result.screenResult")}
                                  name="2"
                                >
                                  <div className="text-sm space-y-2">
                                    {aiAnalysisResult.screen_result.map(
                                      (item: string, index: number) => (
                                        <div
                                          key={index}
                                          className="prose prose-sm max-w-none"
                                        >
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: item
                                                .replace(
                                                  /\*\*(.*?)\*\*/g,
                                                  "<strong>$1</strong>"
                                                )
                                                .replace(
                                                  /\*(.*?)\*/g,
                                                  "<em>$1</em>"
                                                )
                                                .replace(/^\- /gm, "• ")
                                                .replace(/\n/g, "<br/>"),
                                            }}
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </CollapseItem>
                              )}
                          </Collapse>
                        </div>
                      )}

                      {/* 备注信息 */}
                      {aiAnalysisResult.user_inputs_text &&
                        aiAnalysisResult.user_inputs_text !== "无备注" &&
                        aiAnalysisResult.user_inputs_text !== "未知" && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">
                              {t("result.userInputsText")}
                            </h4>
                            <p className="text-sm">
                              {aiAnalysisResult.user_inputs_text}
                            </p>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={resetProcess}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {t("btn.reDetect")}
                  </Button>
                  <Button variant="outline" onClick={detectAgain}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("btn.detectAgain")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 底部信息 */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src={logo} alt="SPR" className="h-8 w-8" />
                <span className="font-semibold text-white">SPR</span>
              </div>
              <p className="text-sm text-gray-300">{t("footer.description")}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">
                {t("footer.contact")}
              </h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>{t("footer.hours")}</li>
                <li>{t("footer.email")}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
