import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi, { type UserResponse } from '../../../api/blogApi';
import Pagination from '../../../components/Pagination';
import { getImageUrl } from '../../../utils/imageUrl';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast, useConfirm, ToastContainer } from '../../../components/Toast';

// ─── Role badge helper ────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  ADMIN:  'bg-[#ffdad6] text-[#ba1a1a]',
  EDITOR: 'bg-[#fff0c2] text-[#7a5900]',
  USER:   'bg-[#c3e7ff] text-[#004a77]',
  READER: 'bg-[#edeeef] text-[#424754]',
};

const ROLE_FILTERS = ['Tất cả', 'ADMIN', 'EDITOR', 'USER', 'READER'];

// ─── Component ────────────────────────────────────────────────────────────────

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { toasts, toast, removeToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // ── State ──
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [activeRole, setActiveRole] = useState('Tất cả');

  // ── Modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState('READER');

  // ── Debounced keyword (500ms) ──
  const handleKeywordChange = useCallback((val: string) => {
    setKeyword(val);
    const timer = setTimeout(() => {
      setDebouncedKeyword(val);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ── Fetch ──
  const roleParam = activeRole === 'Tất cả' ? '' : activeRole;
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, debouncedKeyword, roleParam],
    queryFn: () =>
      blogApi.getAllUsers({
        pageNo: page,
        pageSize: 15,
        keyword: debouncedKeyword || undefined,
        role: roleParam || undefined,
      }).then((r) => r.data),
  });

  const users = data?.content ?? [];

  // ── Mutations ──
  const updateRoleMutation = useMutation({
    mutationFn: (req: { id: string; role: string }) => blogApi.updateUserRole(req.id, req.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      handleCloseModal();
      toast.success('Cập nhật quyền thành công!', 'Tài khoản đã được phân quyền mới.');
    },
    onError: (err: any) => {
      toast.error('Cập nhật quyền thất bại', err.response?.data?.message || 'Vui lòng thử lại.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Xóa tài khoản thành công!', 'Người dùng đã bị xóa khỏi hệ thống.');
    },
    onError: (err: any) => {
      toast.error('Không thể xóa tài khoản', err.response?.data?.message || 'Vui lòng thử lại.');
    },
  });

  // ── Handlers ──
  const handleOpenModal = (user: UserResponse) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      updateRoleMutation.mutate({ id: selectedUser.id, role: selectedRole });
    }
  };

  const handleDelete = async (id: string, username: string) => {
    const ok = await confirm({
      title: 'Xóa tài khoản người dùng',
      message: `Bạn sắp xóa vĩnh viễn tài khoản "${username}". Hành động này không thể khôi phục.`,
      confirmText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy bỏ',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(id);
  };

  const handleRoleFilter = (role: string) => {
    setActiveRole(role);
    setPage(0);
  };

  return (
    <>
      {ConfirmDialogComponent}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="p-6 md:p-8">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Người dùng</h1>
            <p className="mt-1 text-sm text-[#727785]">Xem danh sách, phân quyền và quản lý tài khoản</p>
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
              placeholder="Tìm theo tên, email, username..."
              className="w-full rounded-xl border border-[#c2c6d6] bg-white pl-10 pr-10 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-2 focus:ring-[#0058be]/10 transition-all"
            />
            {keyword && (
              <button
                onClick={() => { setKeyword(''); setDebouncedKeyword(''); setPage(0); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-[#727785] hover:bg-[#f3f4f5] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Role filters */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleFilter(role)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-all ${
                activeRole === role
                  ? 'bg-[#191c1d] text-white shadow-sm'
                  : 'bg-[#f3f4f5] text-[#424754] hover:bg-[#e1e3e4]'
              }`}
            >
              {role}
            </button>
          ))}
          <div className="ml-auto shrink-0 text-sm font-semibold text-[#727785]">
            Tổng số: <span className="text-[#191c1d]">{data?.totalElements ?? 0}</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#424754]">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tài khoản</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">Họ Tên</th>
                  <th className="px-6 py-4 font-semibold">Quyền hạn</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#727785]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                        <p>Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">manage_search</span>
                        <p className="font-medium">Không tìm thấy người dùng</p>
                        {(keyword || activeRole !== 'Tất cả') && (
                          <button
                            onClick={() => { setKeyword(''); setDebouncedKeyword(''); setActiveRole('Tất cả'); setPage(0); }}
                            className="text-sm text-[#0058be] hover:underline"
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isSelf = u.username === currentUser?.username;
                    return (
                      <tr key={u.id} className="hover:bg-[#f8f9fa] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-full bg-[#d8e2ff] text-sm font-bold uppercase text-[#0058be]">
                              {u.avatar ? (
                                <img src={getImageUrl(u.avatar)} alt="Avatar" className="h-full w-full object-cover" />
                              ) : (
                                u.username.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-[#191c1d]">{u.username}</div>
                              {isSelf && <span className="text-[10px] uppercase text-[#0058be] font-bold">Bạn</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#727785] text-xs">{u.email}</td>
                        <td className="px-6 py-4 text-[#727785] hidden md:table-cell">{u.fullName || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE[u.role] ?? 'bg-[#edeeef] text-[#424754]'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(u)}
                              disabled={isSelf}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c2c6d6] text-[#424754] hover:border-[#0058be] hover:text-[#0058be] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                              title="Sửa quyền"
                            >
                              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                            </button>
                            <button
                              onClick={() => handleDelete(u.id, u.username)}
                              disabled={isSelf}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                              title="Xóa tài khoản"
                            >
                              <span className="material-symbols-outlined text-[18px]">person_remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="border-t border-[#E5E7EB] bg-white px-6 py-4">
              <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={(p) => { setPage(p); }} />
            </div>
          )}
        </div>

        {/* Role Update Modal */}
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1d]/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
                <h2 className="text-lg font-bold text-[#191c1d]">Phân quyền tài khoản</h2>
                <button
                  onClick={handleCloseModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#727785] hover:bg-[#f3f4f5] transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveRole} className="p-6">
                <p className="mb-5 text-sm text-[#424754]">
                  Thay đổi quyền hạn cho người dùng <strong className="text-[#191c1d]">{selectedUser.username}</strong>:
                </p>

                <div className="mb-6 space-y-3">
                  {[
                    { value: 'READER', label: 'READER', desc: 'Chỉ có thể đọc và bình luận bài viết.', color: 'text-[#0058be]' },
                    { value: 'USER',   label: 'USER (Tác giả)', desc: 'Có quyền viết bài, sửa/xóa bài của chính mình.', color: 'text-[#0058be]' },
                    { value: 'EDITOR', label: 'EDITOR', desc: 'Biên tập viên — duyệt, sửa hoặc xóa bất kỳ bài viết nào.', color: 'text-amber-600' },
                    { value: 'ADMIN',  label: 'ADMIN', desc: 'Kiểm soát toàn hệ thống — người dùng, danh mục, tags và bài viết.', color: 'text-[#ba1a1a]' },
                  ].map(({ value, label, desc, color }) => (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                        selectedRole === value ? 'border-[#0058be] bg-[#EFF6FF]' : 'border-[#E5E7EB] hover:bg-[#f8f9fa]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={selectedRole === value}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <div>
                        <div className={`font-semibold text-[#191c1d]`}>{label}</div>
                        <div className="text-xs text-[#727785] mt-0.5">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-xl border border-[#c2c6d6] bg-white px-5 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updateRoleMutation.isPending || selectedRole === selectedUser.role}
                    className="rounded-xl bg-[#0058be] px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {updateRoleMutation.isPending ? 'Đang lưu...' : 'Lưu quyền'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminUsersPage;
