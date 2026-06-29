import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] text-center p-8">
      <div className="mb-6 text-[#0058be]">
        <span className="material-symbols-outlined text-[80px]">search_off</span>
      </div>
      <h1 className="mb-2 text-6xl font-bold text-[#191c1d]">404</h1>
      <p className="mb-2 text-xl font-semibold text-[#191c1d]">Trang không tồn tại</p>
      <p className="mb-8 text-sm text-[#424754]">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[#0058be] px-6 py-3 text-sm font-medium text-white hover:brightness-110 transition-all"
      >
        <span className="material-symbols-outlined text-sm">home</span>
        Về trang chủ
      </Link>
    </div>
  );
}

export default NotFoundPage;
