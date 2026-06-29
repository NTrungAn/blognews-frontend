import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi from '../../../api/blogApi';
import Pagination from '../../../components/Pagination';

function AdminDashboardPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts', page],
    queryFn: () =>
      blogApi.getPosts({ pageNo: page, pageSize: 15 }).then((r) => r.data),
  });

  // Fetch stats for dashboard cards
  const { data: usersData } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => blogApi.getAllUsers({ pageNo: 0, pageSize: 1 }).then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-categories-stats'],
    queryFn: () => blogApi.getCategories().then((r) => r.data),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['admin-tags-stats'],
    queryFn: () => blogApi.getTags({ pageNo: 0, pageSize: 1 }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Cảnh báo: Bạn đang xóa bài viết hệ thống. Khổng thể khôi phục. Tiếp tục?')) {
      deleteMutation.mutate(id);
    }
  };

  const posts = postsData?.content ?? [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Bài viết Toàn hệ thống</h1>
            <p className="mt-1 text-sm text-[#727785]">Xem và kiểm duyệt tất cả bài viết</p>
          </div>
        </div>

        {/* ─── Dashboard Stats Cards ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d8e2ff] text-[#0058be]">
              <span className="material-symbols-outlined text-2xl">article</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#727785]">Tổng bài viết</p>
              <h3 className="text-2xl font-bold text-[#191c1d]">{postsData?.totalElements ?? 0}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#c3e7ff] text-[#004a77]">
              <span className="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#727785]">Người dùng</p>
              <h3 className="text-2xl font-bold text-[#191c1d]">{usersData?.totalElements ?? 0}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eaddff] text-[#4f378b]">
              <span className="material-symbols-outlined text-2xl">category</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#727785]">Danh mục</p>
              <h3 className="text-2xl font-bold text-[#191c1d]">{categoriesData?.length ?? 0}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ffdad6] text-[#ba1a1a]">
              <span className="material-symbols-outlined text-2xl">tag</span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#727785]">Thẻ (Tags)</p>
              <h3 className="text-2xl font-bold text-[#191c1d]">{tagsData?.totalElements ?? 0}</h3>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#191c1d]">Danh sách bài viết</h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#424754]">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Bài viết</th>
                  <th className="px-6 py-4 font-semibold">Tác giả</th>
                  <th className="px-6 py-4 font-semibold">Danh mục</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {postsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                        <p>Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">article</span>
                        <p>Hệ thống chưa có bài viết nào.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          to={`/blog/${post.slug}`} 
                          className="font-semibold text-[#0058be] hover:underline line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#191c1d]">
                        {post.authorName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-[#edeeef] px-2 py-1 text-xs font-medium text-[#424754]">
                          {post.category?.name || 'Không có'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {post.status === 'PUBLISHED' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdad6] px-2.5 py-0.5 text-xs font-medium text-[#ba1a1a]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ba1a1a]"></span>
                            Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors"
                            title="Xóa bài viết"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {postsData && postsData.totalPages > 1 && (
            <div className="border-t border-[#E5E7EB] bg-white px-6 py-4">
              <Pagination
                currentPage={page}
                totalPages={postsData.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
    </div>
  );
}

export default AdminDashboardPage;
