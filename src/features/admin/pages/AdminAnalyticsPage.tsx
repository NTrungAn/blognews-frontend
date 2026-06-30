import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import blogApi from '../../../api/blogApi';

// ─── Colors ───────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#0058be', '#2170e4', '#adc6ff', '#555f6f', '#6ea8fe', '#9ec8ff'];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-[#727785] mb-1">{label}</p>
        <p className="text-sm font-bold text-[#0058be]">{payload[0].value.toLocaleString()} lượt xem</p>
      </div>
    );
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

function AdminAnalyticsPage() {
  // ── Top posts (dữ liệu thật từ API) ──
  const { data: topPostsData, isLoading: topLoading } = useQuery({
    queryKey: ['admin-top-posts'],
    queryFn: () =>
      blogApi.getPosts({ pageNo: 0, pageSize: 5, sortBy: 'viewCount', sortDir: 'desc', status: 'PUBLISHED' })
        .then((r) => r.data),
  });

  // ── Category distribution ──
  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['admin-categories-analytics'],
    queryFn: () => blogApi.getCategories().then((r) => r.data),
  });

  // ── Posts per category (lấy tổng elements cho từng category) ──
  const { data: allPostsData } = useQuery({
    queryKey: ['admin-all-posts-stats'],
    queryFn: () =>
      blogApi.getPosts({ pageNo: 0, pageSize: 1, status: 'PUBLISHED' }).then((r) => r.data),
  });

  const topPosts = topPostsData?.content ?? [];

  // Build category pie data from categories with postCount if available
  const categoryPieData = (categories ?? [])
    .map((cat) => ({ name: cat.name, value: cat.postCount ?? 0 }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // ── Summary stats ──
  const totalPublished = allPostsData?.totalElements ?? 0;

  const summaryStats = [
    {
      label: 'Bài viết đã xuất bản',
      value: totalPublished.toLocaleString(),
      icon: 'article',
      color: 'text-[#0058be]',
      bg: 'bg-[#d8e2ff]',
    },
    {
      label: 'Top bài viết (lượt xem)',
      value: topPosts[0]?.viewCount?.toLocaleString() ?? '—',
      icon: 'visibility',
      color: 'text-green-700',
      bg: 'bg-green-100',
    },
    {
      label: 'Danh mục hoạt động',
      value: (categories?.length ?? 0).toString(),
      icon: 'category',
      color: 'text-purple-700',
      bg: 'bg-purple-100',
    },
    {
      label: 'Bài viết TB / danh mục',
      value: categories?.length
        ? Math.round(totalPublished / (categories.length || 1)).toString()
        : '—',
      icon: 'analytics',
      color: 'text-amber-700',
      bg: 'bg-amber-100',
    },
  ];

  // ── Chart data: viewCount của top 5 posts ──
  const viewChartData = topPosts.map((p) => ({
    name: p.title.length > 20 ? p.title.substring(0, 20) + '…' : p.title,
    visits: p.viewCount ?? 0,
  }));

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1d]">Báo cáo &amp; Phân tích</h1>
          <p className="mt-1 text-sm text-[#727785]">Thống kê hiệu suất hệ thống theo dữ liệu thực tế</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryStats.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
              </div>
              <p className="text-sm font-medium text-[#727785]">{label}</p>
            </div>
            <h3 className="text-2xl font-bold text-[#191c1d]">{value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar Chart — Top 5 bài viết theo lượt xem */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-[#191c1d]">
            Top 5 bài viết — lượt xem nhiều nhất
          </h2>
          {topLoading ? (
            <div className="flex h-[280px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
            </div>
          ) : viewChartData.length === 0 ? (
            <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-[#727785]">
              <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">bar_chart</span>
              <p className="text-sm">Chưa có dữ liệu</p>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewChartData} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#727785', fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#727785', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#0058be"
                    strokeWidth={3}
                    dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#0058be' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart — Bài viết theo danh mục */}
        <div className="col-span-1 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm flex flex-col">
          <h2 className="mb-4 text-lg font-bold text-[#191c1d]">Bài viết theo danh mục</h2>
          {catLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
            </div>
          ) : categoryPieData.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[#727785]">
              <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">pie_chart</span>
              <p className="text-sm text-center">Chưa có bài viết theo danh mục</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} bài`, 'Số bài viết']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-3">
                {categoryPieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-[#424754] min-w-0">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto font-semibold text-[#191c1d] shrink-0">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Top Posts Table ─── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-bold text-[#191c1d]">Bài viết xem nhiều nhất</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#424754]">
            <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
              <tr>
                <th className="px-6 py-4 font-semibold">#</th>
                <th className="px-6 py-4 font-semibold">Tiêu đề</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Tác giả</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Danh mục</th>
                <th className="px-6 py-4 text-right font-semibold">Lượt xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {topLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#727785]">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0058be] border-t-transparent" />
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : topPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#727785]">
                    Chưa có dữ liệu bài viết.
                  </td>
                </tr>
              ) : (
                topPosts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-[#d8e2ff] text-[#0058be]' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-[#f3f4f5] text-[#727785]'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#0058be] hover:underline line-clamp-1"
                      >
                        {post.title}
                      </a>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-[#424754]">{post.authorName}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="rounded-md bg-[#edeeef] px-2 py-1 text-xs">{post.category?.name || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#191c1d]">
                        <span className="material-symbols-outlined text-[16px] text-[#727785]">visibility</span>
                        {(post.viewCount ?? 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsPage;
