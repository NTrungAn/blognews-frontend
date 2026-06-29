import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import blogApi from '../api/blogApi';

const EDITORIAL_LINKS = [
  { label: 'Về NewsFlow', to: '/' },
  { label: 'Ban biên tập', to: '/blog' },
  { label: 'Quy chế hoạt động', to: '/blog' },
  { label: 'Hợp tác quảng cáo', to: '/blog' },
  { label: 'Tuyển dụng', to: '/blog' },
];

const LEGAL_LINKS = [
  { label: 'Chính sách bảo mật', to: '/blog' },
  { label: 'Điều khoản sử dụng', to: '/blog' },
  { label: 'Bản quyền hình ảnh', to: '/blog' },
  { label: 'RSS', to: '/blog' },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'public', href: 'https://facebook.com' },
  { label: 'YouTube', icon: 'play_circle', href: 'https://youtube.com' },
  { label: 'X / Twitter', icon: 'tag', href: 'https://x.com' },
  { label: 'Email', icon: 'mail', href: 'mailto:contact@newsflow.vn' },
];

function Footer() {
  const { isAuthenticated } = useAuth();
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => blogApi.getCategories().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <footer className="mt-auto border-t-2 border-[#0058be] bg-white text-[#424754]">
      {/* Dải đầu */}
      <div className="border-b border-[#0058be]/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-4 py-2 sm:flex-row sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0058be]">
            Ấn bản số · {today}
          </p>
          <p className="news-serif text-center text-xs italic text-[#727785] sm:text-right">
            Thông tin nhanh — Góc nhìn sâu — Trách nhiệm từng dòng chữ
          </p>
        </div>
      </div>

      {/* Bản tin sáng */}
      <div className="border-b border-[#0058be]/30 bg-[#f8faff]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:flex-row sm:justify-between sm:px-6">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0058be]">
              Bản tin sáng
            </p>
            <p className="news-serif mt-0.5 text-base font-bold text-[#191c1d]">Nhận tin nóng mỗi sáng</p>
          </div>
          <form
            className="flex w-full max-w-sm gap-2 sm:w-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Email của bạn"
              className="min-w-0 flex-1 border border-[#0058be]/40 bg-white px-3 py-1.5 text-xs text-[#191c1d] placeholder:text-[#727785] focus:border-[#0058be] focus:outline-none focus:ring-1 focus:ring-[#0058be] sm:w-48"
            />
            <button
              type="submit"
              className="shrink-0 bg-[#0058be] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#2170e4]"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Cột chính */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          <div className="lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border border-[#0058be] bg-[#0058be]">
                <span className="material-symbols-outlined text-lg text-white">newspaper</span>
              </div>
              <div>
                <span className="news-serif block text-lg font-bold leading-none text-[#191c1d] transition-colors group-hover:text-[#0058be]">
                  NewsFlow
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#727785]">
                  Báo điện tử
                </span>
              </div>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-[#727785]">
              Tòa soạn báo điện tử độc lập — tin tức chính xác, khách quan và đa chiều.
            </p>
            <div className="mt-3 flex gap-1.5">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-7 w-7 items-center justify-center border border-[#0058be]/35 text-[#727785] transition-all hover:border-[#0058be] hover:bg-[#0058be] hover:text-white"
                >
                  <span className="material-symbols-outlined text-[15px]">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Chủ đề</FooterHeading>
            <ul className="mt-2 space-y-1.5">
              <FooterLink to="/">Trang chủ</FooterLink>
              <FooterLink to="/?sort=trending">Tin thịnh hành</FooterLink>
              <FooterLink to="/blog">Tất cả bài viết</FooterLink>
              {categories.slice(0, 4).map((cat) => (
                <FooterLink key={cat.id} to={`/?category=${cat.slug}`}>
                  {cat.name}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>Tòa soạn</FooterHeading>
            <ul className="mt-2 space-y-1.5">
              {EDITORIAL_LINKS.map((link) => (
                <FooterLink key={link.label} to={link.to}>
                  {link.label}
                </FooterLink>
              ))}
              {isAuthenticated ? (
                <>
                  <FooterLink to="/my-bookmarks">Bài viết đã lưu</FooterLink>
                  <FooterLink to="/profile">Tài khoản của tôi</FooterLink>
                </>
              ) : (
                <>
                  <FooterLink to="/login">Đăng nhập</FooterLink>
                  <FooterLink to="/register">Đăng ký đọc giả</FooterLink>
                </>
              )}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>Liên hệ</FooterHeading>
            <address className="mt-2 space-y-1.5 text-xs not-italic leading-relaxed text-[#727785]">
              <p className="flex items-start gap-1.5">
                <span className="material-symbols-outlined mt-px shrink-0 text-[15px] text-[#0058be]">
                  location_on
                </span>
                123 Đường Láng, Đống Đa, Hà Nội
              </p>
              <p className="flex items-center gap-1.5">
                <span className="material-symbols-outlined shrink-0 text-[15px] text-[#0058be]">
                  call
                </span>
                <a href="tel:+842438567890" className="transition-colors hover:text-[#0058be]">
                  (024) 3856 7890
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="material-symbols-outlined shrink-0 text-[15px] text-[#0058be]">
                  mail
                </span>
                <a href="mailto:contact@newsflow.vn" className="transition-colors hover:text-[#0058be]">
                  contact@newsflow.vn
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#0058be]/30 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row sm:px-6">
          <p className="text-center text-[10px] text-[#727785] sm:text-left">
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-[#424754]">NewsFlow</span>
            {' · '}
            GP-BTTTT số 123/GP-BTTTT
          </p>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-0.5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[10px] text-[#727785] transition-colors hover:text-[#0058be] hover:underline hover:decoration-[#0058be] hover:underline-offset-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="h-0.5 bg-[#0058be]" aria-hidden />
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="border-b border-[#0058be] pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#191c1d]">
      {children}
    </h4>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="text-xs text-[#727785] decoration-[#0058be] transition-colors hover:text-[#0058be] hover:underline hover:underline-offset-2"
      >
        {children}
      </Link>
    </li>
  );
}

export default Footer;
