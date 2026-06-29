import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fa] text-center p-8">
      <div className="mb-6 text-[#ba1a1a]">
        <span className="material-symbols-outlined text-[80px]">lock</span>
      </div>
      <h1 className="mb-2 text-6xl font-bold text-[#191c1d]">403</h1>
      <p className="mb-2 text-xl font-semibold text-[#191c1d]">Không có quyền truy cập</p>
      <p className="mb-8 text-sm text-[#424754]">
        Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0058be] px-6 py-3 text-sm font-medium text-white hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          Về trang chủ
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-[#c2c6d6] bg-white px-6 py-3 text-sm font-medium text-[#191c1d] hover:bg-[#f3f4f5] transition-all"
        >
          Đăng nhập lại
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
