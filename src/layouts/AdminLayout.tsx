import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

// ─── Menu items ───────────────────────────────────────────────────────────────

const menuItems = [
  { path: '/admin',              icon: 'dashboard',          label: 'Tổng quan',     end: true },
  { path: '/admin/users',        icon: 'group',              label: 'Người dùng',    end: false },
  { path: '/admin/categories',   icon: 'category',           label: 'Danh mục',      end: false },
  { path: '/admin/tags',         icon: 'tag',                label: 'Thẻ (Tags)',    end: false },
  { path: '/admin/comments',     icon: 'chat',               label: 'Bình luận',     end: false },
  { path: '/admin/analytics',    icon: 'monitoring',         label: 'Phân tích',     end: false },
  { path: '/admin/settings',     icon: 'settings',           label: 'Cài đặt',       end: false },
];

// ─── Sidebar Component ────────────────────────────────────────────────────────

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#191c1d]/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E5E7EB] bg-white shadow-lg
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:shadow-sm
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[#E5E7EB] px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0058be]">
            <span className="material-symbols-outlined text-lg text-white">shield_person</span>
          </div>
          <span className="text-base font-bold tracking-tight text-[#191c1d]">NewsFlow Admin</span>
          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-[#727785] hover:bg-[#f3f4f5] transition-colors lg:hidden"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <p className="mb-2 mt-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[#727785]">
            Quản lý
          </p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#0058be] shadow-sm'
                    : 'text-[#424754] hover:bg-[#f8f9fa] hover:text-[#191c1d]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="my-2 border-t border-[#E5E7EB]" />
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[#727785]">
            Điều hướng
          </p>
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f8f9fa] hover:text-[#191c1d] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            <span>Về trang chính</span>
          </Link>
        </nav>

        {/* Admin info footer */}
        <div className="border-t border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#f8f9fa] px-3 py-2.5">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d8e2ff] text-sm font-bold uppercase text-[#0058be]">
              {user?.avatarUrl ? (
                <img src={getImageUrl(user.avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                user?.username?.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-[#191c1d]">{user?.username}</p>
              <span className="inline-block rounded-full bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold uppercase text-[#ba1a1a]">
                Admin
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#727785] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f3f4f5]">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content (offset on desktop) */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white/95 px-4 backdrop-blur-md md:px-6">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#424754] hover:bg-[#f3f4f5] transition-colors lg:hidden"
            aria-label="Mở menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          {/* Breadcrumb / date */}
          <div className="flex items-center gap-2 text-sm text-[#727785]">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span className="hidden sm:inline">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 rounded-lg border border-[#c2c6d6] px-3 py-1.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Xem trang web
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
