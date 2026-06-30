import { useState } from 'react';
import { useToast, ToastContainer } from '../../../components/Toast';

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'general',     label: 'Cài đặt chung',      icon: 'tune' },
  { id: 'seo',         label: 'Cấu hình SEO',        icon: 'travel_explore' },
  { id: 'email',       label: 'Email (SMTP)',         icon: 'mail' },
  { id: 'permissions', label: 'Phân quyền',           icon: 'admin_panel_settings' },
];

// ─── Reusable input components ────────────────────────────────────────────────

function SettingField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#191c1d]">{label}</label>
      {hint && <p className="mb-2 mt-0.5 text-xs text-[#727785]">{hint}</p>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  );
}

function TextInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
    />
  );
}

function TextareaInput({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-xl border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all resize-none"
    />
  );
}

function SelectInput({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-xl border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
    >
      {children}
    </select>
  );
}

// ─── Info alert ───────────────────────────────────────────────────────────────

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-blue-500">info</span>
      <p>{children}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { toasts, toast, removeToast } = useToast();

  const handleSave = (tabName: string) => {
    toast.success(`Đã lưu ${tabName}!`, 'Cấu hình sẽ được áp dụng sau khi khởi động lại.');
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191c1d]">Cài đặt hệ thống</h1>
          <p className="mt-1 text-sm text-[#727785]">Cấu hình các thông số hoạt động của Blog CMS</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-[#E5E7EB]">
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0058be] text-[#0058be]'
                    : 'border-transparent text-[#727785] hover:border-[#c2c6d6] hover:text-[#424754]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-sm">

          {/* ── General ── */}
          {activeTab === 'general' && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave('cài đặt chung'); }}>
              <SettingField label="Tên website" hint="Tên hiển thị trên thanh tiêu đề trình duyệt.">
                <TextInput type="text" defaultValue="NewsFlow Blog CMS" />
              </SettingField>

              <SettingField label="Logo website" hint="Khuyên dùng kích thước 256×256 px, định dạng PNG/SVG.">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#f3f4f5] border border-dashed border-[#c2c6d6]">
                    <span className="material-symbols-outlined text-2xl text-[#c2c6d6]">image</span>
                  </div>
                  <button type="button" className="rounded-xl border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754] hover:bg-[#f8f9fa] transition-colors">
                    Thay đổi Logo
                  </button>
                </div>
              </SettingField>

              <SettingField label="Mô tả website" hint="Mô tả ngắn gọn về website, hiển thị ở footer và meta description mặc định.">
                <TextareaInput rows={3} defaultValue="Một hệ thống quản trị nội dung mạnh mẽ." />
              </SettingField>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SettingField label="Ngôn ngữ mặc định">
                  <SelectInput defaultValue="vi">
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </SelectInput>
                </SettingField>
                <SettingField label="Múi giờ">
                  <SelectInput defaultValue="Asia/Ho_Chi_Minh">
                    <option value="Asia/Ho_Chi_Minh">(UTC+07:00) Hồ Chí Minh</option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Bangkok">(UTC+07:00) Bangkok</option>
                  </SelectInput>
                </SettingField>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SettingField label="Số bài viết mỗi trang" hint="Số bài hiển thị mặc định trên trang blog.">
                  <TextInput type="number" defaultValue={10} min={1} max={50} />
                </SettingField>
                <SettingField label="Chế độ bảo trì" hint="Tắt website tạm thời khi cần bảo trì.">
                  <div className="flex items-center gap-3 mt-1">
                    <button type="button" className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#c2c6d6] transition-colors focus:outline-none">
                      <span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white shadow transition-transform" />
                    </button>
                    <span className="text-sm text-[#727785]">Đang tắt</span>
                  </div>
                </SettingField>
              </div>

              <div className="flex justify-end border-t border-[#E5E7EB] pt-6">
                <button type="submit" className="rounded-xl bg-[#0058be] px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 transition-all">
                  Lưu cấu hình
                </button>
              </div>
            </form>
          )}

          {/* ── SEO ── */}
          {activeTab === 'seo' && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave('cấu hình SEO'); }}>
              <InfoBanner>
                Các cấu hình SEO dưới đây áp dụng làm giá trị mặc định. Mỗi bài viết có thể ghi đè bằng meta riêng.
              </InfoBanner>

              <SettingField label="Meta Title mặc định" hint="Tiêu đề SEO mặc định khi bài viết không có title riêng (tối đa 60 ký tự).">
                <TextInput type="text" defaultValue="NewsFlow — Tin tức & Blog chuyên sâu" maxLength={60} />
              </SettingField>

              <SettingField label="Meta Description mặc định" hint="Mô tả SEO mặc định (tối đa 160 ký tự).">
                <TextareaInput rows={3} defaultValue="Khám phá các bài viết chuyên sâu về công nghệ, kinh doanh, văn hóa và nhiều chủ đề thú vị khác." maxLength={160} />
              </SettingField>

              <SettingField label="OG Image (Open Graph)" hint="Ảnh mặc định khi chia sẻ lên mạng xã hội. Kích thước khuyến nghị: 1200×630 px.">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-28 items-center justify-center rounded-xl border border-dashed border-[#c2c6d6] bg-[#f3f4f5]">
                    <span className="material-symbols-outlined text-2xl text-[#c2c6d6]">image</span>
                  </div>
                  <button type="button" className="rounded-xl border border-[#c2c6d6] px-4 py-2 text-sm font-medium text-[#424754] hover:bg-[#f8f9fa] transition-colors">
                    Tải ảnh lên
                  </button>
                </div>
              </SettingField>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SettingField label="Google Analytics ID" hint="VD: G-XXXXXXXXXX">
                  <TextInput type="text" placeholder="G-XXXXXXXXXX" />
                </SettingField>
                <SettingField label="Google Search Console" hint="Meta tag xác minh từ GSC.">
                  <TextInput type="text" placeholder="Dán meta content tại đây" />
                </SettingField>
              </div>

              <SettingField label="Canonical URL" hint="URL gốc của website (không có trailing slash).">
                <TextInput type="url" defaultValue="https://newsflow.com" />
              </SettingField>

              <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-4">
                <input type="checkbox" id="sitemap" defaultChecked className="h-4 w-4 rounded text-[#0058be]" />
                <label htmlFor="sitemap" className="text-sm font-medium text-[#191c1d]">
                  Tự động tạo Sitemap XML tại <code className="text-xs bg-[#f3f4f5] px-1.5 py-0.5 rounded">/sitemap.xml</code>
                </label>
              </div>

              <div className="flex justify-end border-t border-[#E5E7EB] pt-6">
                <button type="submit" className="rounded-xl bg-[#0058be] px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 transition-all">
                  Lưu cấu hình SEO
                </button>
              </div>
            </form>
          )}

          {/* ── Email SMTP ── */}
          {activeTab === 'email' && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave('cài đặt email'); }}>
              <InfoBanner>
                Cấu hình SMTP để hệ thống gửi email thông báo (đăng ký, đặt lại mật khẩu, v.v.). Không điền = tắt email.
              </InfoBanner>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SettingField label="SMTP Host" hint="VD: smtp.gmail.com">
                  <TextInput type="text" placeholder="smtp.gmail.com" />
                </SettingField>
                <SettingField label="SMTP Port" hint="Thường là 587 (TLS) hoặc 465 (SSL).">
                  <TextInput type="number" defaultValue={587} />
                </SettingField>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SettingField label="Username / Email gửi">
                  <TextInput type="email" placeholder="noreply@newsflow.com" />
                </SettingField>
                <SettingField label="Password / App Password">
                  <TextInput type="password" placeholder="••••••••••••" />
                </SettingField>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <SettingField label="Tên hiển thị người gửi">
                  <TextInput type="text" defaultValue="NewsFlow System" />
                </SettingField>
                <SettingField label="Mã hóa">
                  <SelectInput defaultValue="TLS">
                    <option value="TLS">TLS (khuyến nghị)</option>
                    <option value="SSL">SSL</option>
                    <option value="NONE">Không mã hóa</option>
                  </SelectInput>
                </SettingField>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-4">
                <input type="checkbox" id="testEmail" className="h-4 w-4 rounded text-[#0058be]" />
                <label htmlFor="testEmail" className="text-sm font-medium text-[#191c1d]">
                  Gửi email kiểm thử sau khi lưu
                </label>
              </div>

              <div className="flex justify-end border-t border-[#E5E7EB] pt-6 gap-3">
                <button
                  type="button"
                  onClick={() => toast.info('Đang gửi email kiểm thử...', 'Vui lòng kiểm tra hòm thư.')}
                  className="rounded-xl border border-[#c2c6d6] px-5 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
                >
                  Gửi email test
                </button>
                <button type="submit" className="rounded-xl bg-[#0058be] px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 transition-all">
                  Lưu cấu hình SMTP
                </button>
              </div>
            </form>
          )}

          {/* ── Permissions ── */}
          {activeTab === 'permissions' && (
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave('phân quyền'); }}>
              <InfoBanner>
                Cấu hình quyền mặc định được áp dụng khi tài khoản mới đăng ký. Admin có thể thay đổi quyền từng người dùng tại trang Quản lý Người dùng.
              </InfoBanner>

              <SettingField label="Quyền mặc định khi đăng ký" hint="Quyền được gán tự động cho người dùng mới.">
                <SelectInput defaultValue="READER">
                  <option value="READER">READER — Chỉ đọc và bình luận</option>
                  <option value="USER">USER — Có thể viết bài</option>
                </SelectInput>
              </SettingField>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#191c1d]">Quyền của từng Role</p>
                {[
                  {
                    role: 'READER',
                    color: 'bg-[#edeeef] text-[#424754]',
                    perms: ['Đọc bài viết', 'Bình luận', 'React bình luận', 'Bookmark bài viết', 'Theo dõi tác giả'],
                  },
                  {
                    role: 'USER',
                    color: 'bg-[#c3e7ff] text-[#004a77]',
                    perms: ['Tất cả quyền READER', 'Viết bài mới', 'Sửa/xóa bài của mình', 'Upload ảnh'],
                  },
                  {
                    role: 'EDITOR',
                    color: 'bg-[#fff0c2] text-[#7a5900]',
                    perms: ['Tất cả quyền USER', 'Duyệt bài viết', 'Sửa/xóa bất kỳ bài viết', 'Quản lý danh mục'],
                  },
                  {
                    role: 'ADMIN',
                    color: 'bg-[#ffdad6] text-[#ba1a1a]',
                    perms: ['Tất cả quyền EDITOR', 'Quản lý người dùng', 'Phân quyền', 'Xóa bất kỳ tài nguyên', 'Cài đặt hệ thống'],
                  },
                ].map(({ role, color, perms }) => (
                  <div key={role} className="rounded-xl border border-[#E5E7EB] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>{role}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((p) => (
                        <span key={p} className="inline-flex items-center gap-1.5 rounded-lg bg-[#f3f4f5] px-3 py-1 text-xs text-[#424754]">
                          <span className="material-symbols-outlined text-[14px] text-green-600">check_circle</span>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-[#E5E7EB] pt-6">
                <button type="submit" className="rounded-xl bg-[#0058be] px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 transition-all">
                  Lưu cài đặt phân quyền
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminSettingsPage;
