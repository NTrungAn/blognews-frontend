import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './routes/AppRouter';

// ─── React Query Client ───────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry 1 lần trước khi báo lỗi
      retry: 1,
      // Không refetch khi focus lại tab (tránh spam request)
      refetchOnWindowFocus: false,
      // Cache 5 phút
      staleTime: 5 * 60 * 1_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── App Component ────────────────────────────────────────────────────────────

/**
 * App là root component bọc toàn bộ ứng dụng:
 * 1. QueryClientProvider  → cung cấp React Query cho mọi component
 * 2. AuthProvider         → cung cấp trạng thái auth (user, login, logout)
 * 3. AppRouter            → cấu hình routing với bảo vệ route
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
