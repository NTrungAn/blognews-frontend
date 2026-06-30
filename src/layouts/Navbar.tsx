import { Link, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import blogApi from '../api/blogApi';
import NotificationDropdown from '../features/notifications/components/NotificationDropdown';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavStuck, setIsNavStuck] = useState(false);
  const navSentinelRef = useRef<HTMLDivElement>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => blogApi.getCategories().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });
  const categories = categoriesData || [];

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [],
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Phát hiện khi hàng nav đã dính (sticky) để tăng shadow
  useEffect(() => {
    const sentinel = navSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsNavStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="relative z-40 border-b border-[#0058be]/20 bg-white">
      {/* ── Thanh tiện ích (cuộn theo trang) ── */}
      <div className="border-b border-[#0058be]/15 bg-[#0058be] text-[10px] text-[#d8e2ff]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1 sm:px-6">
          <time dateTime={new Date().toISOString().split('T')[0]} className="capitalize">
            {todayLabel}
          </time>
          <p className="hidden flex-1 text-center uppercase tracking-[0.15em] text-[#adc6ff] sm:block">
            Báo điện tử — Tin nhanh &amp; Phân tích
          </p>
          <Link
            to="/?sort=trending"
            className="shrink-0 font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-80"
          >
            Tin nóng
          </Link>
        </div>
      </div>

      {/* ── Masthead: logo + tài khoản (cuộn theo trang) ── */}
      <div className="border-b border-[#0058be]/15">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2 md:flex-1 md:justify-center">
            <div className="hidden h-4 w-px bg-[#0058be]/40 md:block" aria-hidden />
            <div className="min-w-0 md:text-center">
              <span className="font-serif text-xl font-black leading-none tracking-tight text-[#191c1d] transition-colors group-hover:text-[#0058be] sm:text-[1.35rem]">
                NewsFlow
              </span>
              <p className="mt-0.5 hidden text-[9px] uppercase tracking-[0.22em] text-[#727785] md:block">
                Tin tức · Phân tích · Góc nhìn
              </p>
            </div>
            <div className="hidden h-4 w-px bg-[#0058be]/40 md:block" aria-hidden />
          </Link>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 md:flex-1 md:justify-end">
            {isAuthenticated && user ? (
              <>
                {(user.role === 'ADMIN' || user.role === 'EDITOR' || user.role === 'USER') && (
                  <Link
                    to="/posts/new"
                    className="hidden items-center gap-1 rounded-md border border-[#0058be]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0058be] transition-colors hover:border-[#0058be] hover:bg-[#f0f5ff] sm:flex"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit_square</span>
                    Viết bài
                  </Link>
                )}

                <NotificationDropdown />

                <div className="relative group">
                  <button
                    type="button"
                    aria-label="Menu tài khoản"
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[#0058be]/25 bg-[#f0f5ff] font-serif text-xs font-bold uppercase text-[#0058be] transition-colors hover:border-[#0058be] hover:bg-[#d8e2ff]"
                  >
                    {user.username.charAt(0)}
                  </button>
                  <div className="absolute right-0 top-[calc(100%+4px)] z-50 hidden w-52 rounded-lg border border-[#0058be]/15 bg-white py-1 shadow-lg shadow-[#0058be]/10 group-focus-within:block group-hover:block">
                    <div className="border-b border-[#0058be]/10 px-3 py-2">
                      <p className="font-serif text-sm font-bold text-[#191c1d]">{user.username}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[#727785]">{user.email}</p>
                    </div>
                    <DropdownLink to="/profile">
                      <span className="material-symbols-outlined text-sm">person</span>
                      Hồ sơ cá nhân
                    </DropdownLink>
                    <DropdownLink to="/my-posts">
                      <span className="material-symbols-outlined text-sm">edit_note</span>
                      Bài viết của tôi
                    </DropdownLink>
                    <DropdownLink to="/my-bookmarks">
                      <span className="material-symbols-outlined text-sm">bookmark</span>
                      Bài viết đã lưu
                    </DropdownLink>
                    {user.role === 'ADMIN' && (
                      <div className="my-1 border-t border-[#0058be]/10 pt-1">
                        <p className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#727785]">
                          Quản trị
                        </p>
                        <DropdownLink to="/admin">
                          <span className="material-symbols-outlined text-sm">dashboard</span>
                          Tổng quan (Posts)
                        </DropdownLink>
                        <DropdownLink to="/admin/users">
                          <span className="material-symbols-outlined text-sm">group</span>
                          Người dùng
                        </DropdownLink>
                        <DropdownLink to="/admin/categories">
                          <span className="material-symbols-outlined text-sm">category</span>
                          Danh mục
                        </DropdownLink>
                        <DropdownLink to="/admin/tags">
                          <span className="material-symbols-outlined text-sm">tag</span>
                          Tags
                        </DropdownLink>
                      </div>
                    )}
                    <div className="mt-1 border-t border-[#0058be]/10 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#ba1a1a] transition-colors hover:bg-[#fff4f3]"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#424754] transition-colors hover:bg-[#f0f5ff] hover:text-[#0058be] sm:px-2.5"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-[#0058be] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#2170e4] sm:px-3"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      </header>

      {/* Sentinel: khi cuộn qua điểm này → hàng nav bắt đầu sticky */}
      <div ref={navSentinelRef} className="h-0 w-full" aria-hidden />

      {/* Dải điều hướng + tìm kiếm — sticky riêng, không nằm trong header */}
      <div
        className={`sticky top-0 z-50 border-b bg-[#fafcff]/95 backdrop-blur-md transition-shadow duration-200 ${
          isNavStuck
            ? 'border-[#0058be]/40 shadow-md shadow-[#0058be]/10'
            : 'border-[#0058be]/25 shadow-sm'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-stretch px-4 sm:px-6">
          <nav className="hidden min-w-0 flex-1 items-stretch md:flex">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/?sort=trending">Thịnh hành</NavLink>

            <div className="relative group">
              <button
                type="button"
                className="flex h-full items-center gap-0.5 border-l border-[#0058be]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#424754] transition-colors hover:bg-[#f0f5ff] hover:text-[#0058be]"
              >
                Khám phá
                <span className="material-symbols-outlined text-[15px] text-[#0058be]/70 transition-transform duration-200 group-hover:rotate-180">
                  expand_more
                </span>
              </button>

              <div className="absolute left-0 top-full z-50 hidden w-[440px] rounded-lg border border-[#0058be]/15 bg-white p-3 shadow-lg shadow-[#0058be]/10 group-hover:block before:absolute before:-top-2 before:left-0 before:h-2 before:w-full">
                <div className="mb-2 border-b border-[#0058be]/20 pb-2">
                  <h3 className="font-serif text-sm font-bold text-[#0058be]">Danh mục chủ đề</h3>
                  <p className="mt-0.5 text-[9px] uppercase tracking-widest text-[#727785]">
                    Chọn chuyên mục để đọc
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/?category=${category.slug}`}
                        className="group/item flex items-start gap-2 rounded-md border border-transparent p-2 transition-colors hover:border-[#0058be]/15 hover:bg-[#f0f5ff]"
                      >
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#0058be]/15 bg-[#f8faff] text-[#0058be] transition-colors group-hover/item:border-[#0058be]/40 group-hover/item:bg-[#d8e2ff]">
                          <span className="material-symbols-outlined text-[16px]">label</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#191c1d] transition-colors group-hover/item:text-[#0058be]">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#727785]">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 py-4 text-center text-xs text-[#727785]">
                      Đang tải danh mục...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Tìm kiếm — cùng hàng, căn phải */}
          <form
            onSubmit={handleSearch}
            className="hidden w-64 shrink-0 items-center border-l border-[#0058be]/15 px-4 py-1.5 lg:w-72 md:flex"
          >
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-[#0058be]/60">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-[#0058be]/20 bg-white py-1.5 pl-8 pr-3 text-xs text-[#191c1d] placeholder:text-[#727785] focus:border-[#0058be] focus:outline-none focus:ring-1 focus:ring-[#0058be]/30"
              />
            </div>
          </form>
        </div>

        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#0058be] to-transparent opacity-60" aria-hidden />
      </div>
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center border-l border-[#0058be]/15 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#424754] transition-colors first:border-l-0 hover:bg-[#f0f5ff] hover:text-[#0058be]"
    >
      {children}
    </Link>
  );
}

function DropdownLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 text-sm text-[#424754] transition-colors hover:bg-[#f0f5ff] hover:text-[#0058be]"
    >
      {children}
    </Link>
  );
}

export default Navbar;
