import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrivateRouteProps {
  /**
   * Danh sách role được phép truy cập route này.
   * Nếu không truyền → chỉ cần đăng nhập là đủ (không phân biệt role).
   */
  allowedRoles?: UserRole[];
  /** Đường dẫn redirect khi chưa đăng nhập (mặc định: /login) */
  redirectTo?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PrivateRoute bảo vệ các route yêu cầu đăng nhập.
 *
 * Luồng xử lý:
 * 1. Đang khởi tạo auth → hiển thị spinner (tránh flash redirect)
 * 2. Chưa đăng nhập → redirect về /login (kèm state.from để redirect lại sau login)
 * 3. Đăng nhập nhưng không đủ quyền → redirect về /unauthorized
 * 4. Hợp lệ → render <Outlet /> (các route con)
 */
function PrivateRoute({
  allowedRoles,
  redirectTo = '/login',
}: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Đang kiểm tra trạng thái đăng nhập từ localStorage
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  // Đăng nhập nhưng không đủ role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Hợp lệ → render route con
  return <Outlet />;
}

export default PrivateRoute;
