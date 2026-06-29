import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ─── Token Helpers ────────────────────────────────────────────────────────────

export const tokenService = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

  setTokens: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ─── Axios Instance ───────────────────────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Tự động đính kèm accessToken vào header Authorization: Bearer

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = tokenService.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Refresh Token Logic ──────────────────────────────────────────────────────

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

let isRefreshing = false;
// Hàng đợi các request bị block trong lúc đang refresh token
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Xử lý hàng đợi sau khi refresh token hoàn tất.
 * Nếu thành công → thực thi lại các request cũ với token mới.
 * Nếu thất bại → reject tất cả.
 */
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

/** Thực hiện logout và điều hướng về /login */
const handleLogout = (): void => {
  tokenService.clearTokens();
  // Dùng window.location để tránh circular dependency với React Router
  window.location.href = '/login';
};

/** Gọi API refresh token */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  // Dùng axios thuần (không qua instance) để tránh vòng lặp interceptor
  const response = await axios.post<RefreshTokenResponse>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data;
  tokenService.setTokens(accessToken, newRefreshToken);
  return accessToken;
};

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Xử lý lỗi 401: refresh token hoặc logout

interface OriginalRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as OriginalRequestConfig;

    // Nếu không phải lỗi 401 hoặc request đã retry rồi → bỏ qua
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Tránh vòng lặp vô tận nếu chính request refresh token bị lỗi 401
    if (originalRequest.url?.includes('/auth/refresh')) {
      handleLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Nếu đang refresh → đưa request vào hàng đợi, chờ token mới
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    // Bắt đầu refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);

      // Retry request gốc với token mới
      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      }
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Tự động "bóc vỏ" (unwrap) ApiResponse từ Backend
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const payload = response.data;
    // Chỉ unwrap khi đúng cấu trúc ApiResponse { code: number, message, data }
    if (
      payload &&
      typeof payload === 'object' &&
      'code' in payload &&
      'message' in payload &&
      'data' in payload &&
      typeof (payload as { code: unknown }).code === 'number'
    ) {
      response.data = (payload as { data: unknown }).data;
    }
    return response;
  },
  (error: AxiosError) => {
    // Nếu backend trả về lỗi có chuẩn ApiResponse
    if (error.response && error.response.data && (error.response.data as any).code) {
      // Trích xuất phần message lỗi từ backend (để UI dễ hiển thị hơn)
      const apiError = error.response.data as any;
      error.message = apiError.message || error.message;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
