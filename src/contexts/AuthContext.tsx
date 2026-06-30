import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { tokenService } from '../api/axiosConfig';
import authApi, { type LoginRequest } from '../api/authApi';
import { useQueryClient } from '@tanstack/react-query';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'EDITOR' | 'USER' | 'READER';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider cung cấp trạng thái xác thực cho toàn bộ ứng dụng.
 * Khởi tạo từ localStorage để duy trì session sau khi refresh trang.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true, // true trong lúc khởi tạo
  });

  // Khởi tạo user từ localStorage khi mount
  useEffect(() => {
    const token = tokenService.getAccessToken();
    if (token) {
      // Nếu có token → cố parse user từ localStorage
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as AuthUser;
          setState({ user, isAuthenticated: true, isLoading: false });
          return;
        } catch {
          // Dữ liệu bị corrupt → clear
          localStorage.removeItem('authUser');
        }
      }
    }
    setState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const setUser = useCallback((user: AuthUser | null) => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    } else {
      localStorage.removeItem('authUser');
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await authApi.login(credentials);
      const { accessToken, refreshToken, user } = response.data;

      tokenService.setTokens(accessToken, refreshToken);
      setUser(user);
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    try {
      // Thông báo server invalidate refresh token
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi network khi logout, vẫn clear local state
    } finally {
      tokenService.clearTokens();
      setUser(null);
      queryClient.clear();
    }
  }, [setUser, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook để truy cập AuthContext.
 * Phải được dùng bên trong <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
