// API配置模块
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// 获取API基础URL
export function getApiBaseUrl(): string {
  // 在开发环境中使用代理路径
  if ((import.meta as any).env?.DEV) {
    return '/api/v1';
  }
  
  // 在生产环境中，可以根据环境变量或部署配置来设置
  // 这里可以根据实际部署情况调整
  return (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';
}

// 默认API配置
export const defaultApiConfig: ApiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
  },
};

// 获取完整的API配置
export function getApiConfig(): ApiConfig {
  return {
    ...defaultApiConfig,
    baseURL: getApiBaseUrl(),
  };
}
