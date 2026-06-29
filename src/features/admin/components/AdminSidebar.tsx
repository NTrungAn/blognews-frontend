import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard', end: true },
    { name: 'Bài viết', path: '/admin', icon: 'article', end: true }, // AdminDashboard currently handles posts too. Or we could separate them. For now Dashboard is posts. Let's just have Dashboard.
    { name: 'Người dùng', path: '/admin/users', icon: 'group' },
    { name: 'Danh mục', path: '/admin/categories', icon: 'category' },
    { name: 'Thẻ', path: '/admin/tags', icon: 'tag' },
    { name: 'Phân tích', path: '/admin/analytics', icon: 'monitoring' },
    { name: 'Cài đặt', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[#E5E7EB] bg-white flex flex-col h-screen sticky top-0">
      <div className="flex h-16 items-center px-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0058be]">
            <span className="material-symbols-outlined text-lg text-white">article</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#191c1d]">NewsFlow Admin</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#0058be] border-l-4 border-[#0058be]'
                  : 'text-[#424754] hover:bg-[#f8f9fa] hover:text-[#191c1d] border-l-4 border-transparent'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-[#E5E7EB] space-y-1">
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f8f9fa] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          Trang chủ Frontend
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
