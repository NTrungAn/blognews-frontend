import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: 'dashboard', label: 'Tổng quan (Posts)' },
    { path: '/admin/users', icon: 'group', label: 'Người dùng' },
    { path: '/admin/categories', icon: 'category', label: 'Danh mục' },
    { path: '/admin/tags', icon: 'tag', label: 'Thẻ (Tags)' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f3f4f5]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex h-16 items-center border-b border-[#E5E7EB] px-6">
          <Link to="/admin" className="flex items-center gap-2 text-[#0058be]">
            <span className="material-symbols-outlined text-2xl font-bold">admin_panel_settings</span>
            <span className="text-lg font-bold tracking-tight text-[#191c1d]">Quản trị hệ thống</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-2 px-2 text-xs font-semibold text-[#727785]">MENU CHÍNH</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#d8e2ff] text-[#0058be]'
                    : 'text-[#424754] hover:bg-[#f8f9fa] hover:text-[#191c1d]'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'font-variation-settings:\'FILL\'_1' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#E5E7EB] p-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#c2c6d6] px-4 py-2 text-sm font-medium text-[#424754] transition-colors hover:bg-[#f8f9fa]"
          >
            <span className="material-symbols-outlined text-sm">public</span>
            Về trang web
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white/95 px-8 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-[#727785]">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <p className="font-semibold text-[#191c1d]">{user?.username}</p>
                <p className="text-xs text-[#0058be] font-bold">ADMIN</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8e2ff] font-bold uppercase text-[#0058be]">
                {user?.username.charAt(0)}
              </div>
            </div>
            <div className="h-6 w-px bg-[#E5E7EB]"></div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center rounded-full p-2 text-[#727785] transition-colors hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
              title="Đăng xuất"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
