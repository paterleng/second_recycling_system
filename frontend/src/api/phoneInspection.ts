import axios, { AxiosProgressEvent } from "axios";
import { getApiConfig } from "./config";

// 获取API配置
const apiConfig = getApiConfig();

// 创建axios实例
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
});

// 手机检测请求数据接口
export interface PhoneInspectionRequest {
  brand: string;
  model: string;
  storage: string;
  accessory_condition: string;
  machine_type_image: File[];
  product_date_image: File[];
  battery_health_image: File[];
  appearance_images: File[];
  screen_image: File[];
  camera_lens_images: File[];
  flashlight_image: File[];
  user_text_inputs: string;
}

// 提交手机检测请求
export async function submitInspection(
  data: PhoneInspectionRequest,
  onProgress?: (progress: number) => void
): Promise<{ task_id: string }> {
  const formData = new FormData();

  // 添加基本信息
  formData.append("brand", data.brand);
  formData.append("model", data.model);
  formData.append("storage", data.storage);
  formData.append("accessory_condition", data.accessory_condition);
  formData.append("user_text_inputs", data.user_text_inputs);

  // 添加图片文件
  const imageFields = [
    "about_machine_image",
    "machine_type_image",
    "product_date_image",
    "battery_health_image",
    "appearance_images",
    "screen_image",
    "camera_lens_images",
    "flashlight_image",
  ];

  imageFields.forEach((field) => {
    const files = data[field as keyof PhoneInspectionRequest] as File[];
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        // 其他图片使用单个文件形式
        formData.append(field, file, file.name);
      });
    }
  });

  // 调试：打印FormData内容
  console.log("FormData内容:");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(
        `${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
      );
    } else {
      console.log(`${key}: ${value}`);
    }
  }

  try {
    const response = await apiClient.post("/inspections/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("API错误详情:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // 处理422错误
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData && typeof errorData === "object") {
          // 提取具体的验证错误信息
          const errorMessages = Object.entries(errorData)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("; ");
          throw new Error(`数据验证失败: ${errorMessages}`);
        }
        throw new Error("数据格式不正确，请检查上传的文件");
      }

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "提交检测请求失败"
      );
    }
    throw new Error("提交检测请求失败");
  }
}

// 获取检测结果
export async function getInspectionResult(taskId: string): Promise<{
  task_id: string;
  status: string;
  created_at: string;
  completed_at: string;
  report?: {
    brand: string;
    storage_total: string;
    storage_use: string;
    product_date: string;
    first_use_date: string;
    maximum_capacity: string;
    battery_health: string;
    charge_cycles: string;
    overall_condition: string;
    appearance_result: string[];
    screen_condition: string;
    screen_result: string[];
    camera_lens: string;
    physical_damage: string;
    flashlight_line: string;
    other_info: string;
    price: string; // 添加价格字段
    user_input?: {
      brand: string;
      model: string;
      storage: string;
      accessory_condition: string;
    };
    user_inputs_text?: string;
  };
  error?: string;
}> {
  try {
    const response = await apiClient.get(`/inspections/${taskId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || error.message || "获取检测结果失败"
      );
    }
    throw new Error("获取检测结果失败");
  }
}
