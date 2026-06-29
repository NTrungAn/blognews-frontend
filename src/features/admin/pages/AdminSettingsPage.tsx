import { useState } from 'react';

function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Cài đặt chung' },
    { id: 'seo', name: 'Cấu hình SEO' },
    { id: 'email', name: 'Cài đặt Email (SMTP)' },
    { id: 'permissions', name: 'Phân quyền' },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#191c1d]">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-[#727785]">Cấu hình các thông số hoạt động của Blog CMS</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-[#E5E7EB]">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0058be] text-[#0058be]'
                  : 'border-transparent text-[#727785] hover:border-[#c2c6d6] hover:text-[#424754]'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-sm">
        {activeTab === 'general' && (
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#191c1d]">Tên website</label>
              <p className="mb-2 text-xs text-[#727785]">Tên hiển thị trên thanh tiêu đề trình duyệt.</p>
              <input
                type="text"
                defaultValue="NewsFlow Blog CMS"
                className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#191c1d]">Logo website</label>
              <p className="mb-2 text-xs text-[#727785]">Khuyên dùng kích thước 256x256 px, định dạng PNG/SVG.</p>
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#f3f4f5] border border-dashed border-[#c2c6d6]">
                  <span className="material-symbols-outlined text-2xl text-[#c2c6d6]">image</span>
                </div>
                <button type="button" className="rounded-lg border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754] hover:bg-[#f8f9fa] transition-colors">
                  Thay đổi Logo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191c1d]">Mô tả website (Description)</label>
              <textarea
                rows={3}
                defaultValue="Một hệ thống quản trị nội dung mạnh mẽ."
                className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-2">Ngôn ngữ mặc định</label>
                <select className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c1d] mb-2">Múi giờ</label>
                <select className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]">
                  <option value="Asia/Ho_Chi_Minh">(UTC+07:00) Hồ Chí Minh</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E7EB] flex justify-end">
              <button type="button" className="rounded-lg bg-[#0058be] px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110">
                Lưu cấu hình
              </button>
            </div>
          </form>
        )}

        {activeTab !== 'general' && (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-4xl text-[#c2c6d6] mb-3">construction</span>
            <h3 className="text-lg font-bold text-[#191c1d]">Tính năng đang phát triển</h3>
            <p className="text-sm text-[#727785] mt-1">Cấu hình {tabs.find(t => t.id === activeTab)?.name} sẽ sớm ra mắt.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSettingsPage;
