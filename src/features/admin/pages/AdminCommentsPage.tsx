import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi, { type CommentDto } from '../../../api/blogApi';
import Pagination from '../../../components/Pagination';
import { useToast, useConfirm, ToastContainer } from '../../../components/Toast';

type CommentTab = 'all' | 'reported';

const REPORT_REASONS_MAP: Record<string, string> = {
  SPAM: 'Spam / Quảng cáo',
  OFFENSIVE: 'Ngôn từ thô tục / Kích động',
  HARASSMENT: 'Quấy rối / Đe dọa',
  MISLEADING: 'Thông tin sai lệch',
  OTHER: 'Lý do khác',
};

function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const { toasts, toast, removeToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // ── State ──
  const [activeTab, setActiveTab] = useState<CommentTab>('all');
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedCommentReports, setSelectedCommentReports] = useState<CommentDto | null>(null);

  // ── Debounced keyword (500ms) ──
  const handleKeywordChange = useCallback((val: string) => {
    setKeyword(val);
    const timer = setTimeout(() => {
      setDebouncedKeyword(val);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ── Query ──
  const { data, isLoading } = useQuery({
    queryKey: ['admin-comments', activeTab, page, debouncedKeyword],
    queryFn: () => {
      const apiCall =
        activeTab === 'all'
          ? blogApi.getAllComments
          : blogApi.getReportedComments;

      return apiCall({
        pageNo: page,
        pageSize: 15,
        keyword: debouncedKeyword || undefined,
      }).then((r) => r.data);
    },
  });

  // Query phụ để lấy số lượng tab còn lại phục vụ Badge thông báo
  const { data: reportedStats } = useQuery({
    queryKey: ['admin-reported-comments-badge'],
    queryFn: () =>
      blogApi.getReportedComments({ pageNo: 0, pageSize: 1 }).then((r) => r.data),
    refetchInterval: 30000,
  });

  const comments = data?.content ?? [];
  const reportedCountBadge = reportedStats?.totalElements ?? 0;

  // ── Mutations ──
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteCommentByAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reported-comments-badge'] });
      setSelectedCommentReports(null);
      toast.success('Xóa bình luận thành công!', 'Bình luận đã được xóa hoàn toàn khỏi hệ thống.');
    },
    onError: (err: any) => {
      toast.error('Không thể xóa bình luận', err.response?.data?.message || 'Vui lòng thử lại sau.');
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => blogApi.dismissCommentReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reported-comments-badge'] });
      setSelectedCommentReports(null);
      toast.success('Bỏ qua báo cáo thành công!', 'Bình luận được xác minh an toàn.');
    },
    onError: (err: any) => {
      toast.error('Không thể bỏ qua báo cáo', err.response?.data?.message || 'Vui lòng thử lại.');
    },
  });

  // ── Handlers ──
  const handleDelete = async (id: string, authorName: string) => {
    const ok = await confirm({
      title: 'Xóa bình luận vĩnh viễn',
      message: `Bạn sắp thực hiện xóa vĩnh viễn bình luận của "${authorName}". Mọi bình luận con (nếu có) cũng sẽ bị xóa.`,
      confirmText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy bỏ',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(id);
  };

  const handleDismissReport = async (id: string, authorName: string) => {
    const ok = await confirm({
      title: 'Bỏ qua báo cáo vi phạm',
      message: `Xác nhận bình luận của "${authorName}" không vi phạm và giữ lại trên hệ thống?`,
      confirmText: 'Bỏ qua báo cáo',
      cancelText: 'Hủy',
      variant: 'warning',
    });
    if (ok) dismissMutation.mutate(id);
  };

  const handleTabChange = (tab: CommentTab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const hasFilter = !!debouncedKeyword;

  return (
    <>
      {ConfirmDialogComponent}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Bình luận</h1>
            <p className="mt-1 text-sm text-[#727785]">Theo dõi, kiểm duyệt và xử lý các bình luận báo cáo vi phạm</p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#727785]">
              search
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="Tìm theo nội dung, người viết..."
              className="w-full rounded-xl border border-[#c2c6d6] bg-white pl-10 pr-10 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
            />
            {keyword && (
              <button
                onClick={() => {
                  setKeyword('');
                  setDebouncedKeyword('');
                  setPage(0);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-[#727785] hover:bg-[#f3f4f5] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-[#E5E7EB]">
          <nav className="-mb-px flex gap-2">
            <button
              onClick={() => handleTabChange('all')}
              className={`border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'border-[#0058be] text-[#0058be]'
                  : 'border-transparent text-[#727785] hover:text-[#424754]'
              }`}
            >
              Tất cả bình luận
            </button>
            <button
              onClick={() => handleTabChange('reported')}
              className={`relative border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'reported'
                  ? 'border-[#ba1a1a] text-[#ba1a1a]'
                  : 'border-transparent text-[#727785] hover:text-[#ba1a1a]'
              }`}
            >
              Bị báo cáo vi phạm
              {reportedCountBadge > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ba1a1a] px-1.5 text-[10px] font-bold text-white shadow-sm shadow-red-200">
                  {reportedCountBadge}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Info bar */}
        <div className="mb-4 flex items-center justify-between text-sm">
          <div className="font-medium text-[#727785]">
            Hiển thị: <span className="font-semibold text-[#191c1d]">{data?.totalElements ?? 0}</span> bình luận
          </div>
          {hasFilter && (
            <button
              onClick={() => {
                setKeyword('');
                setDebouncedKeyword('');
                setPage(0);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0058be] hover:underline"
            >
              <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>

        {/* Comments Table */}
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#424754]">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
                <tr>
                  <th className="px-6 py-4 font-semibold w-1/5">Người viết</th>
                  <th className="px-6 py-4 font-semibold w-1/3">Nội dung</th>
                  <th className="px-6 py-4 font-semibold w-1/5">Bài viết</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Đính kèm</th>
                  {activeTab === 'reported' && (
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Lượt báo cáo</th>
                  )}
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">Thời gian</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={activeTab === 'reported' ? 7 : 6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                        <p>Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : comments.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'reported' ? 7 : 6} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">
                          {activeTab === 'reported' ? 'check_circle_outline' : 'chat_bubble_outline'}
                        </span>
                        <p className="font-semibold text-base text-[#424754]">
                          {activeTab === 'reported' ? 'Không có bình luận nào bị báo cáo' : 'Chưa có bình luận nào'}
                        </p>
                        <p className="text-xs text-[#727785]">
                          {activeTab === 'reported'
                            ? 'Mọi bình luận trong hệ thống đều đang hoạt động an toàn.'
                            : 'Nội dung phản hồi của độc giả sẽ xuất hiện tại đây.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  comments.map((c) => (
                    <tr key={c.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-[#191c1d]">{c.author.fullName}</div>
                          <div className="text-xs text-[#727785]">@{c.author.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#191c1d] whitespace-pre-wrap leading-relaxed line-clamp-3" title={c.content}>
                          {c.content || <span className="italic text-[#727785] text-xs">Chỉ gửi ảnh</span>}
                        </p>
                        {c.parentId && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#727785]">
                            <span className="material-symbols-outlined text-[12px]">reply</span>
                            Trả lời bình luận khác
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {c.post ? (
                          <a
                            href={`/blog/${c.post.slug}#comment-${c.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-[#0058be] hover:underline line-clamp-2"
                            title="Bấm để mở bài viết và nhảy đến đúng vị trí bình luận này"
                          >
                            {c.post.title} ↗
                          </a>
                        ) : (
                          <span className="text-xs text-[#727785] italic">Không xác định</span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {c.imageUrl ? (
                          <a
                            href={c.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-10 h-10 overflow-hidden rounded-lg border border-[#E5E7EB] hover:opacity-85"
                          >
                            <img src={c.imageUrl} alt="Đính kèm" className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <span className="text-xs text-[#c2c6d6]">—</span>
                        )}
                      </td>
                      {activeTab === 'reported' && (
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedCommentReports(c)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold hover:scale-105 transition-transform ${
                              (c.reportCount ?? 0) >= 5
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : (c.reportCount ?? 0) >= 3
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                            title="Click để xem chi tiết lý do báo cáo vi phạm"
                          >
                            <span className="material-symbols-outlined text-[14px]">report</span>
                            {c.reportCount} lần
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 text-xs text-[#727785] whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString('vi-VN', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === 'reported' && (
                            <button
                              onClick={() => handleDismissReport(c.id, c.author.fullName || c.author.username)}
                              disabled={dismissMutation.isPending}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                              title="Bỏ qua báo cáo (Duyệt an toàn)"
                            >
                              <span className="material-symbols-outlined text-[18px]">done</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c.id, c.author.fullName || c.author.username)}
                            disabled={deleteMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors disabled:opacity-50"
                            title="Xóa bình luận"
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

          {data && data.totalPages > 1 && (
            <div className="border-t border-[#E5E7EB] bg-white px-6 py-4">
              <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </div>
      </div>

      {/* Chi tiết báo cáo vi phạm Modal */}
      {selectedCommentReports && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#191c1d]/40 backdrop-blur-sm"
            onClick={() => setSelectedCommentReports(null)}
          />
          {/* Modal Container */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h3 className="text-base font-bold text-[#191c1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">campaign</span>
                Chi tiết báo cáo vi phạm
              </h3>
              <button
                onClick={() => setSelectedCommentReports(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#727785] hover:bg-[#f3f4f5] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Nội dung bình luận bị báo cáo */}
              <div className="rounded-xl bg-[#f8f9fa] border border-[#E5E7EB] p-4 text-xs">
                <div className="mb-2 flex items-center justify-between font-bold text-[#191c1d]">
                  <span>Bình luận của @{selectedCommentReports.author.username} ({selectedCommentReports.author.fullName})</span>
                  <span className="text-[10px] text-[#727785] font-normal">
                    {new Date(selectedCommentReports.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                {/* Link bài viết */}
                {selectedCommentReports.post && (
                  <div className="mb-3 flex items-center gap-2 bg-[#f0f5ff] border border-[#d8e2ff] px-3 py-2 rounded-xl text-xs text-[#0058be]">
                    <span className="material-symbols-outlined text-[16px]">article</span>
                    <span className="font-medium">Thuộc bài viết:</span>
                    <a
                      href={`/blog/${selectedCommentReports.post.slug}#comment-${selectedCommentReports.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold hover:underline truncate"
                      title="Bấm để mở bài viết và nhảy đến đúng vị trí bình luận này"
                    >
                      {selectedCommentReports.post.title} ↗
                    </a>
                  </div>
                )}

                <p className="text-[#424754] whitespace-pre-wrap leading-relaxed">
                  {selectedCommentReports.content || <span className="italic text-[#727785]">Không có nội dung văn bản</span>}
                </p>
                {selectedCommentReports.imageUrl && (
                  <div className="mt-2.5 max-w-xs rounded-lg overflow-hidden border border-[#E5E7EB] bg-white">
                    <img src={selectedCommentReports.imageUrl} alt="Đính kèm" className="max-h-40 w-auto object-contain" />
                  </div>
                )}
              </div>

              {/* Danh sách các báo cáo chi tiết */}
              <div>
                <h4 className="text-xs font-bold text-[#191c1d] uppercase tracking-wider mb-3">
                  Danh sách phản hồi từ độc giả ({selectedCommentReports.reports?.length ?? 0})
                </h4>

                <div className="space-y-3">
                  {selectedCommentReports.reports && selectedCommentReports.reports.length > 0 ? (
                    selectedCommentReports.reports.map((report) => (
                      <div key={report.id} className="rounded-xl border border-[#E5E7EB] p-4 bg-white hover:shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 text-red-700 px-2.5 py-1 text-xs font-semibold border border-red-150">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            {REPORT_REASONS_MAP[report.reason] || report.reason}
                          </span>
                          <span className="text-[10px] text-[#727785]">
                            Gửi bởi <strong className="text-[#191c1d]">@{report.reporterUsername}</strong> • {new Date(report.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {report.detail ? (
                          <p className="text-xs text-[#424754] leading-relaxed whitespace-pre-wrap bg-gray-55 p-3 rounded-lg border border-gray-100">
                            {report.detail}
                          </p>
                        ) : (
                          <p className="text-xs italic text-[#727785]">Không có nội dung mô tả chi tiết.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#727785] italic text-center py-6">
                      Chưa tải dữ liệu báo cáo chi tiết hoặc không tìm thấy bản ghi.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-[#E5E7EB] px-6 py-4 flex gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setSelectedCommentReports(null)}
                className="flex-1 rounded-xl border border-[#c2c6d6] bg-white py-2.5 text-xs font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
              >
                Đóng lại
              </button>
              <button
                type="button"
                onClick={() => handleDismissReport(selectedCommentReports.id, selectedCommentReports.author.fullName || selectedCommentReports.author.username)}
                disabled={dismissMutation.isPending}
                className="flex-1 rounded-xl border border-green-200 bg-white py-2.5 text-xs font-semibold text-green-700 hover:bg-green-50 transition-colors"
              >
                Bỏ qua báo cáo
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedCommentReports.id, selectedCommentReports.author.fullName || selectedCommentReports.author.username)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-[#ba1a1a] py-2.5 text-xs font-semibold text-white hover:bg-[#a01616] transition-all"
              >
                Xóa bình luận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminCommentsPage;
