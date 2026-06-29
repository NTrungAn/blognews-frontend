import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const trafficData = [
  { name: 'Mon', visits: 4000 },
  { name: 'Tue', visits: 3000 },
  { name: 'Wed', visits: 2000 },
  { name: 'Thu', visits: 2780 },
  { name: 'Fri', visits: 1890 },
  { name: 'Sat', visits: 2390 },
  { name: 'Sun', visits: 3490 },
];

const categoryData = [
  { name: 'Công nghệ', value: 400 },
  { name: 'Đời sống', value: 300 },
  { name: 'Kinh doanh', value: 300 },
  { name: 'Văn hóa', value: 200 },
];

const COLORS = ['#0058be', '#2170e4', '#adc6ff', '#555f6f'];

function AdminAnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState('7days');

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1d]">Báo cáo & Phân tích</h1>
          <p className="mt-1 text-sm text-[#727785]">Theo dõi hiệu suất và tương tác của hệ thống</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="rounded-lg border border-[#c2c6d6] px-3 py-2 text-sm text-[#424754] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="year">Năm nay</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg bg-[#0058be] px-4 py-2 text-sm font-medium text-white hover:brightness-110">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#727785]">Tổng lượt xem</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#191c1d]">124,592</h3>
            <span className="text-sm font-medium text-green-600">+12.5%</span>
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#727785]">Thời gian đọc TB</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#191c1d]">4m 12s</h3>
            <span className="text-sm font-medium text-green-600">+2.1%</span>
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#727785]">Tỷ lệ thoát</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#191c1d]">42.3%</h3>
            <span className="text-sm font-medium text-[#ba1a1a]">-1.4%</span>
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[#727785]">Lượt chia sẻ</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#191c1d]">8,234</h3>
            <span className="text-sm font-medium text-green-600">+5.2%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-[#191c1d]">Lượt truy cập theo thời gian</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#727785', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#727785', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="visits" stroke="#0058be" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-1 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col">
          <h2 className="mb-6 text-lg font-bold text-[#191c1d]">Tỷ lệ bài viết theo danh mục</h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-[#424754]">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Posts Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-bold text-[#191c1d]">Bài viết xem nhiều nhất</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#424754]">
            <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
              <tr>
                <th className="px-6 py-4 font-semibold">Tiêu đề</th>
                <th className="px-6 py-4 font-semibold">Tác giả</th>
                <th className="px-6 py-4 text-right font-semibold">Lượt xem</th>
                <th className="px-6 py-4 text-right font-semibold">Tăng trưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-[#f8f9fa] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#0058be]">Hướng dẫn thiết kế UI/UX {item}</td>
                  <td className="px-6 py-4 text-[#191c1d]">Nguyễn Văn A</td>
                  <td className="px-6 py-4 text-right font-medium text-[#191c1d]">{Math.floor(Math.random() * 5000) + 1000}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <span className="material-symbols-outlined text-[16px]">trending_up</span>
                      +{Math.floor(Math.random() * 20) + 5}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
