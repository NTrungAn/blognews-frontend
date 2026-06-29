import { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import type { LoginRequest } from '../../../api/authApi';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';

  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Masthead báo chí ── */}
      <header className="border-b border-[#0058be] bg-white">
        <div className="border-b border-[#0058be]/20 bg-[#0058be] px-4 py-1 text-center text-[9px] font-semibold uppercase tracking-[0.15em] text-[#d8e2ff] sm:px-6">
          Khu vực dành cho độc giả &amp; cộng tác viên
        </div>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <Link to="/" className="group shrink-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#0058be]">
              Báo điện tử
            </p>
            <h1 className="font-serif text-lg font-black leading-none tracking-tight text-neutral-950 transition-colors group-hover:text-[#0058be] sm:text-xl">
              NewsFlow
            </h1>
          </Link>
          <div className="hidden text-right sm:block">
            <p className="text-[9px] uppercase tracking-wider text-neutral-400">Ấn bản số</p>
            <p className="text-[10px] capitalize leading-tight text-neutral-600">{todayLabel}</p>
          </div>
        </div>
      </header>

      {/* ── Nội dung chính ── */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row">
        {/* Cột trái — editorial (desktop) */}
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[#0058be]/20 bg-white text-[#191c1d] lg:flex lg:w-[44%]">
          <div className="relative z-10 p-10 xl:p-12">
            <p className="inline-block border border-[#0058be]/40 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0058be]">
              Đăng nhập độc giả
            </p>
            <h2 className="news-serif mt-6 border-b-2 border-[#0058be] pb-4 text-3xl font-bold leading-snug text-[#191c1d] xl:text-4xl">
              Mở cửa vào tòa soạn số của bạn
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#727785]">
              Lưu bài viết yêu thích, theo dõi tác giả, bình luận và nhận thông báo tin nóng —
              dành riêng cho độc giả đã đăng ký NewsFlow.
            </p>

            <ul className="mt-8 space-y-3 border-t border-[#0058be]/30 pt-8">
              {[
                { icon: 'bookmark', text: 'Lưu & đọc lại bài viết đã đánh dấu' },
                { icon: 'notifications', text: 'Nhận thông báo bình luận và tương tác' },
                { icon: 'edit_square', text: 'Đăng tác phẩm nếu bạn là cộng tác viên' },
              ].map((item) => (
                <li key={item.icon} className="flex items-start gap-3 border-b border-[#0058be]/20 pb-3 text-sm text-[#424754] last:border-b-0 last:pb-0">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-[#0058be]">
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="relative z-10 border-t-2 border-[#0058be]/30 bg-white px-10 py-6 xl:px-12">
            <p className="news-serif text-base italic leading-relaxed text-[#424754]">
              &ldquo;Thông tin nhanh — Góc nhìn sâu — Trách nhiệm từng dòng chữ&rdquo;
            </p>
            <footer className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#0058be]">
              — Ban biên tập NewsFlow
            </footer>
          </blockquote>
        </aside>

        {/* Cột phải — form đăng nhập độc giả */}
        <main className="flex flex-1 flex-col justify-center bg-white px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            {/* Editorial gọn — mobile / tablet */}
            <div className="mb-8 border-b-2 border-[#0058be] pb-6 lg:hidden">
              <p className="inline-block border border-[#0058be]/40 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0058be]">
                Đăng nhập độc giả
              </p>
              <h2 className="news-serif mt-4 text-2xl font-bold leading-snug text-[#191c1d]">
                Mở cửa vào tòa soạn số của bạn
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#727785]">
                Lưu bài viết yêu thích, theo dõi tác giả, bình luận và nhận thông báo tin nóng —
                dành riêng cho độc giả đã đăng ký NewsFlow.
              </p>
            </div>

            <div className="mb-8 border-b-2 border-[#0058be] pb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0058be]">
                Phần I · Xác thực
              </p>
              <h2 className="news-serif mt-1 text-2xl font-bold text-neutral-950">Đăng nhập tài khoản</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Chào mừng trở lại. Nhập thông tin để tiếp tục đọc báo.
              </p>
            </div>

            <div className="border border-[#0058be]/30 border-t-2 border-t-[#0058be] bg-white p-6 sm:p-8">
              {error && (
                <div className="mb-5 border border-[#ba1a1a]/40 border-l-2 border-l-[#ba1a1a] bg-white px-4 py-3 text-sm text-[#ba1a1a]">
                  <span className="flex items-start gap-2">
                    <span className="material-symbols-outlined shrink-0 text-[18px]">error</span>
                    {error}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[#424754]"
                  >
                    Tên người dùng
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="nguyenvana"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full border-0 border-b-2 border-[#0058be]/30 bg-white px-0 py-2.5 text-sm text-[#191c1d] placeholder:text-[#727785] transition-colors focus:border-[#0058be] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-[11px] font-bold uppercase tracking-wider text-[#424754]"
                    >
                      Mật khẩu
                    </label>
                    <a
                      href="#"
                      className="text-[11px] font-semibold text-[#0058be] underline decoration-[#0058be]/40 underline-offset-2 hover:decoration-[#0058be]"
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full border-0 border-b-2 border-[#0058be]/30 bg-white py-2.5 pr-10 text-sm text-[#191c1d] placeholder:text-[#727785] transition-colors focus:border-[#0058be] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[#727785] hover:text-[#0058be]"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-11 w-full items-center justify-center gap-2 border border-[#0058be] bg-[#0058be] text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#004494] disabled:opacity-60"
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  {!isLoading && (
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  )}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#0058be]/30" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 border border-[#0058be]/30 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-[#0058be] hover:bg-[#0058be]/5"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 border border-[#0058be]/30 py-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:border-[#0058be] hover:bg-[#0058be]/5"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-[#727785]">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-bold text-[#0058be] underline decoration-[#0058be]/40 underline-offset-2 hover:decoration-[#0058be]"
              >
                Đăng ký đọc giả
              </Link>
            </p>

            <p className="mt-4 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 transition-colors hover:text-[#0058be]"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Về trang chủ báo
              </Link>
            </p>
          </div>
        </main>
      </div>

      {/* ── Chân trang gọn ── */}
      <footer className="border-t border-[#0058be]/30 bg-white px-4 py-3 text-center text-[10px] text-[#727785] sm:px-6">
        © {new Date().getFullYear()} NewsFlow · Giấy phép báo điện tử số 123/GP-BTTTT
      </footer>
    </div>
  );
}

export default LoginPage;
