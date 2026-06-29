import axiosInstance from './axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: 'ADMIN' | 'EDITOR' | 'USER' | 'READER';
    avatarUrl?: string;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

const authApi = {
  /**
   * Đăng nhập và nhận access + refresh token.
   */
  login: (data: LoginRequest) =>
    axiosInstance.post<LoginResponse>('/auth/login', data),

  /**
   * Đăng ký tài khoản mới.
   */
  register: (data: RegisterRequest) =>
    axiosInstance.post<RegisterResponse>('/auth/register', data),

  /**
   * Làm mới access token bằng refresh token.
   * Gọi trực tiếp không qua interceptor để tránh vòng lặp.
   */
  refreshToken: (data: RefreshTokenRequest) =>
    axiosInstance.post<RefreshTokenResponse>('/auth/refresh', data),

  /**
   * Đăng xuất phía server (invalidate refresh token).
   */
  logout: () => axiosInstance.post('/auth/logout'),
};

export default authApi;
