import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../layouts/MainLayout';

// ─── Lazy-loaded Pages ────────────────────────────────────────────────────────

// Public pages (không cần đăng nhập)
const LoginPage     = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage  = lazy(() => import('../features/auth/pages/RegisterPage'));
const NotFoundPage  = lazy(() => import('../features/error/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../features/error/pages/UnauthorizedPage'));

// Public with MainLayout
const HomePage      = lazy(() => import('../features/home/pages/HomePage'));
const BlogDetailPage = lazy(() => import('../features/blog/pages/BlogDetailPage'));
const BlogListPage  = lazy(() => import('../features/blog/pages/BlogListPage'));
const AuthorProfilePage = lazy(() => import('../features/profile/pages/AuthorProfilePage'));

// Protected pages (yêu cầu đăng nhập)
const AdminLayout         = lazy(() => import('../layouts/AdminLayout'));
const AdminDashboardPage  = lazy(() => import('../features/admin/pages/AdminDashboardPage'));
const AdminUsersPage      = lazy(() => import('../features/admin/pages/AdminUsersPage'));
const AdminCategoriesPage = lazy(() => import('../features/admin/pages/AdminCategoriesPage'));
const AdminTagsPage       = lazy(() => import('../features/admin/pages/AdminTagsPage'));
const AdminAnalyticsPage  = lazy(() => import('../features/admin/pages/AdminAnalyticsPage'));
const AdminSettingsPage   = lazy(() => import('../features/admin/pages/AdminSettingsPage'));
const AdminCommentsPage   = lazy(() => import('../features/admin/pages/AdminCommentsPage'));
const ProfilePage         = lazy(() => import('../features/profile/pages/ProfilePage'));
const NotificationPage    = lazy(() => import('../features/notifications/pages/NotificationPage'));

// Author pages
const PostEditorPage = lazy(() => import('../features/blog/pages/PostEditorPage'));
const MyPostsPage    = lazy(() => import('../features/blog/pages/MyPostsPage'));
const MyBookmarksPage = lazy(() => import('../features/blog/pages/MyBookmarksPage'));

// ─── Loading Fallback ─────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
        <p className="text-sm text-[#727785]">Đang tải trang...</p>
      </div>
    </div>
  );
}

// ─── Root Layout (Suspense wrapper) ──────────────────────────────────────────

function RootLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

// ─── Router Configuration ─────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // ── Auth pages (không có Navbar/Footer) ────────────────────────────────
      { path: '/login',        element: <LoginPage /> },
      { path: '/register',     element: <RegisterPage /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },

      // ── Public pages với MainLayout (Navbar + Footer) ─────────────────────
      {
        element: <MainLayout />,
        children: [
          { path: '/',          element: <HomePage /> },
          { path: '/blog',      element: <BlogListPage /> },
          { path: '/blog/:slug', element: <BlogDetailPage /> },
          { path: '/author/:username', element: <AuthorProfilePage /> },
        ],
      },

      // ── Protected Routes (chỉ cần đăng nhập) ──────────────────────────────
      {
        element: <MainLayout />,
        children: [
          {
            element: <PrivateRoute allowedRoles={['ADMIN', 'EDITOR', 'USER', 'READER']} />,
            children: [
              { path: '/my-posts', element: <MyPostsPage /> },
              { path: '/my-bookmarks', element: <MyBookmarksPage /> },
              { path: '/profile',  element: <ProfilePage /> },
              { path: '/notifications', element: <NotificationPage /> },
            ],
          },
          // Author routes
          {
            element: <PrivateRoute allowedRoles={['ADMIN', 'EDITOR', 'USER']} />,
            children: [
              { path: '/posts/new',       element: <PostEditorPage /> },
              { path: '/posts/:id/edit',  element: <PostEditorPage /> },
            ],
          },
        ],
      },

      // ── Admin Routes (với AdminLayout riêng biệt) ─────────────────────────
      {
        element: <PrivateRoute allowedRoles={['ADMIN']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/admin',             element: <AdminDashboardPage /> },
              { path: '/admin/users',       element: <AdminUsersPage /> },
              { path: '/admin/categories',  element: <AdminCategoriesPage /> },
              { path: '/admin/tags',        element: <AdminTagsPage /> },
              { path: '/admin/comments',    element: <AdminCommentsPage /> },
              { path: '/admin/analytics',   element: <AdminAnalyticsPage /> },
              { path: '/admin/settings',    element: <AdminSettingsPage /> },
            ],
          },
        ],
      },

      // ── 404 ───────────────────────────────────────────────────────────────
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

// ─── AppRouter Component ──────────────────────────────────────────────────────

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
