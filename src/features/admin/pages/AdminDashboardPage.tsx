import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi, { type PostResponse } from '../../../api/blogApi';
import Pagination from '../../../components/Pagination';
import { useToast, useConfirm, ToastContainer } from '../../../components/Toast';

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        Đã xuất bản
      </span>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Chờ duyệt
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
      Bản nháp
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function AdminDashboardPage() {
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toasts, toast, removeToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // ── Filter state ──
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');      // '' | 'PUBLISHED' | 'PENDING' | 'DRAFT'
  const [categoryFilter, setCategoryFilter] = useState('');  // category slug

  // ── Debounced keyword ──
  const handleKeywordChange = useCallback((val: string) => {
    setKeyword(val);
    const timer = setTimeout(() => { setDebouncedKeyword(val); setPage(0); }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ── Queries ──
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts', page, debouncedKeyword, statusFilter, categoryFilter],
    queryFn: () =>
      blogApi.getPosts({
        pageNo: page,
        pageSize: 15,
        keyword: debouncedKeyword || undefined,
        status: statusFilter || undefined,
        categorySlug: categoryFilter || undefined,
        sortBy: 'createdAt',
        sortDir: 'desc',
      }).then((r) => r.data),
  });

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

  // ── Mutations ──
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Xóa bài viết thành công!', 'Bài viết đã được xóa khỏi hệ thống.');
    },
    onError: () => toast.error('Không thể xóa bài viết', 'Bạn có thể không có quyền xóa bài này.'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'DRAFT' | 'PENDING' | 'PUBLISHED' }) =>
      blogApi.updatePostStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      const statusMap: Record<string, string> = {
        PUBLISHED: 'phê duyệt xuất bản thành công!',
        DRAFT: 'thu hồi về bản nháp thành công!',
        PENDING: 'đưa vào hàng chờ phê duyệt thành công!',
      };
      toast.success('Cập nhật trạng thái thành công', `Bài viết đã được ${statusMap[variables.status]}`);
    },
    onError: (err: any) => {
      toast.error('Cập nhật trạng thái thất bại', err.response?.data?.message || 'Không thể cập nhật trạng thái bài viết.');
    },
  });

  // ── Handlers ──
  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: 'Xóa bài viết hệ thống',
      message: `Cảnh báo: Bạn đang xóa bài "${title}". Hành động này không thể khôi phục.`,
      confirmText: 'Xóa bài viết',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(id);
  };

  const handleUpdateStatus = async (id: string, title: string, status: 'DRAFT' | 'PUBLISHED') => {
    const isApprove = status === 'PUBLISHED';
    const ok = await confirm({
      title: isApprove ? 'Phê duyệt xuất bản bài viết' : 'Gỡ bài viết xuống bản nháp',
      message: isApprove
        ? `Xác nhận phê duyệt bài viết "${title}" xuất bản công khai lên trang chủ?`
        : `Xác nhận gỡ bài viết "${title}" khỏi trang chủ và chuyển về dạng bản nháp?`,
      confirmText: isApprove ? 'Phê duyệt đăng' : 'Thu hồi về nháp',
      variant: isApprove ? 'success' : 'warning',
    });
    if (ok) updateStatusMutation.mutate({ id, status });
  };

  const posts = postsData?.content ?? [];
  const categories = categoriesData ?? [];

  const hasFilter = debouncedKeyword || statusFilter || categoryFilter;

  // Render ảnh bìa helper
  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/uploads/images/${path}`;
  };

  return (
    <>
      {ConfirmDialogComponent}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="p-6 md:p-8">

        {/* ─── Header ─── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Bài viết</h1>
          <p className="mt-1 text-sm text-[#727785]">Xem, lọc và kiểm duyệt tất cả bài viết trong hệ thống</p>
        </div>

        {/* ─── Stats Cards ─── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Tổng bài viết', value: postsData?.totalElements ?? 0, icon: 'article',  color: 'bg-[#d8e2ff] text-[#0058be]', link: '' },
            { label: 'Người dùng',   value: usersData?.totalElements ?? 0,  icon: 'group',    color: 'bg-[#c3e7ff] text-[#004a77]', link: '/admin/users' },
            { label: 'Danh mục',     value: categories.length,               icon: 'category', color: 'bg-[#eaddff] text-[#4f378b]', link: '/admin/categories' },
            { label: 'Tags',         value: tagsData?.totalElements ?? 0,    icon: 'tag',      color: 'bg-[#ffdad6] text-[#ba1a1a]', link: '/admin/tags' },
          ].map(({ label, value, icon, color, link }) => (
            <div
              key={label}
              onClick={() => link && navigate(link)}
              className={`flex items-center gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all ${link ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-[#727785]">{label}</p>
                <h3 className="text-2xl font-bold text-[#191c1d]">{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Filters ─── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#727785]">search</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="Tìm kiếm tiêu đề bài viết..."
              className="w-full rounded-xl border border-[#c2c6d6] bg-white pl-10 pr-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="rounded-xl border border-[#c2c6d6] bg-white px-3 py-2.5 text-sm text-[#424754] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="DRAFT">Bản nháp</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            className="rounded-xl border border-[#c2c6d6] bg-white px-3 py-2.5 text-sm text-[#424754] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          {/* Clear filter */}
          {hasFilter && (
            <button
              onClick={() => { setKeyword(''); setDebouncedKeyword(''); setStatusFilter(''); setCategoryFilter(''); setPage(0); }}
              className="flex items-center gap-1.5 rounded-xl border border-[#c2c6d6] px-3 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* ─── Table ─── */}
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#424754]">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Bài viết</th>
                  <th className="px-6 py-4 font-semibold hidden sm:table-cell">Tác giả</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Danh mục</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold hidden lg:table-cell">Ngày tạo</th>
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
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">article</span>
                        <p className="font-medium">Không tìm thấy bài viết nào</p>
                        {hasFilter && (
                          <button
                            onClick={() => { setKeyword(''); setDebouncedKeyword(''); setStatusFilter(''); setCategoryFilter(''); setPage(0); }}
                            className="text-sm text-[#0058be] hover:underline"
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4 max-w-xs">
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          className="font-semibold text-[#0058be] hover:underline line-clamp-2 block"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#191c1d] hidden sm:table-cell whitespace-nowrap">
                        {post.authorName}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="rounded-md bg-[#edeeef] px-2 py-1 text-xs font-medium text-[#424754]">
                          {post.category?.name || 'Không có'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap hidden lg:table-cell">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve / Reject status update */}
                          {post.status !== 'PUBLISHED' ? (
                            <button
                              onClick={() => handleUpdateStatus(post.id, post.title, 'PUBLISHED')}
                              disabled={updateStatusMutation.isPending}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Duyệt xuất bản bài viết"
                            >
                              <span className="material-symbols-outlined text-[18px]">publish</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(post.id, post.title, 'DRAFT')}
                              disabled={updateStatusMutation.isPending}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c2c6d6] text-[#727785] hover:bg-gray-55 hover:text-[#191c1d] transition-colors disabled:opacity-50"
                              title="Gỡ bài viết (Chuyển về nháp)"
                            >
                              <span className="material-symbols-outlined text-[18px]">unpublished</span>
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/posts/${post.id}/edit`)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c2c6d6] text-[#424754] hover:border-[#0058be] hover:text-[#0058be] transition-colors"
                            title="Sửa bài viết"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            disabled={deleteMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors disabled:opacity-50"
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
    </>
  );
}

export default AdminDashboardPage;
