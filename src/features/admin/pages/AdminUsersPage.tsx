import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi, { type UserResponse } from '../../../api/blogApi';
import Pagination from '../../../components/Pagination';
import { getImageUrl } from '../../../utils/imageUrl';
import { useAuth } from '../../../contexts/AuthContext';

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState('READER');

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () =>
      blogApi.getAllUsers({ pageNo: page, pageSize: 15 }).then((r) => r.data),
  });

  const users = data?.content ?? [];

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: (req: { id: string; role: string }) => blogApi.updateUserRole(req.id, req.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Cập nhật quyền thất bại.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Không thể xóa người dùng này.');
    },
  });

  // Handlers
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

  const handleDelete = (id: string, username: string) => {
    if (window.confirm(`Cảnh báo: Bạn sắp xóa vĩnh viễn người dùng "${username}". Tiếp tục?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Người dùng</h1>
          <p className="mt-1 text-sm text-[#727785]">Xem danh sách, phân quyền và khóa tài khoản</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[#727785]">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm người dùng..." 
              className="w-full sm:w-64 rounded-lg border border-[#c2c6d6] pl-10 pr-4 py-2 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
            />
          </div>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#0058be] px-4 py-2 text-sm font-medium text-white hover:brightness-110 whitespace-nowrap">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Thêm người dùng mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
        {['Tất cả', 'ADMIN', 'EDITOR', 'USER', 'READER'].map((role, idx) => (
          <button 
            key={role} 
            className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${idx === 0 ? 'bg-[#191c1d] text-white' : 'bg-[#f3f4f5] text-[#424754] hover:bg-[#e1e3e4]'}`}
          >
            {role}
          </button>
        ))}
        <div className="ml-auto text-sm font-semibold text-[#727785]">
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
                <th className="px-6 py-4 font-semibold">Họ Tên</th>
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
                  <td colSpan={5} className="px-6 py-10 text-center text-[#727785]">
                    Chưa có dữ liệu.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.username === currentUser?.username;
                  return (
                    <tr key={u.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded-full bg-[#d8e2ff] text-sm font-bold uppercase text-[#0058be]">
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
                      <td className="px-6 py-4 text-[#727785]">{u.email}</td>
                      <td className="px-6 py-4 text-[#727785]">{u.fullName || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          u.role === 'ADMIN' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 
                          u.role === 'EDITOR' ? 'bg-[#fff0c2] text-[#7a5900]' : 
                          u.role === 'USER' ? 'bg-[#c3e7ff] text-[#004a77]' : 
                          'bg-[#edeeef] text-[#424754]'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(u)}
                            disabled={isSelf}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c2c6d6] text-[#424754] hover:border-[#0058be] hover:text-[#0058be] transition-colors disabled:opacity-50 disabled:hover:border-[#c2c6d6] disabled:hover:text-[#424754]"
                            title="Sửa quyền"
                          >
                            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            disabled={isSelf}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
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
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
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
              <div className="mb-4">
                <p className="text-sm text-[#424754]">
                  Thay đổi quyền hạn cho người dùng <strong className="text-[#191c1d]">{selectedUser.username}</strong>:
                </p>
              </div>

              <div className="mb-6 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] p-4 hover:bg-[#f8f9fa] transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="READER"
                    checked={selectedRole === 'READER'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-[#0058be]"
                  />
                  <div>
                    <div className="font-semibold text-[#191c1d]">READER</div>
                    <div className="text-xs text-[#727785]">Chỉ có thể đọc và bình luận bài viết. Không có quyền đăng bài.</div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] p-4 hover:bg-[#f8f9fa] transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="USER"
                    checked={selectedRole === 'USER'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-[#0058be]"
                  />
                  <div>
                    <div className="font-semibold text-[#191c1d]">USER (Tác giả)</div>
                    <div className="text-xs text-[#727785]">Có quyền viết bài mới, sửa/xóa bài của chính mình.</div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] p-4 hover:bg-[#f8f9fa] transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="EDITOR"
                    checked={selectedRole === 'EDITOR'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-[#0058be]"
                  />
                  <div>
                    <div className="font-semibold text-[#191c1d]">EDITOR</div>
                    <div className="text-xs text-[#727785]">Biên tập viên có quyền duyệt, sửa hoặc xóa bất kỳ bài viết/danh mục nào.</div>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E5E7EB] p-4 hover:bg-[#f8f9fa] transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={selectedRole === 'ADMIN'}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-[#ba1a1a]"
                  />
                  <div>
                    <div className="font-semibold text-[#191c1d]">ADMIN</div>
                    <div className="text-xs text-[#727785]">Kiểm soát toàn hệ thống, quản lý người dùng, danh mục, tags và tất cả bài viết.</div>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-[#c2c6d6] bg-white px-5 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateRoleMutation.isPending || selectedRole === selectedUser.role}
                  className="rounded-lg bg-[#0058be] px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {updateRoleMutation.isPending ? 'Đang lưu...' : 'Lưu quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;
