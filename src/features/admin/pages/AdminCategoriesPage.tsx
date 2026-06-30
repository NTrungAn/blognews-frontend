import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi, { type Category, type CategoryRequest } from '../../../api/blogApi';
import { useToast, useConfirm, ToastContainer } from '../../../components/Toast';

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toasts, toast, removeToast } = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [form, setForm] = useState<CategoryRequest>({ name: '', slug: '' });
  const [formError, setFormError] = useState('');

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => blogApi.getCategories().then((r) => r.data),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CategoryRequest) => blogApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseModal();
      toast.success('Tạo danh mục thành công!', 'Danh mục mới đã được thêm vào hệ thống.');
    },
    onError: () => {
      setFormError('Tạo danh mục thất bại. Vui lòng thử lại.');
      toast.error('Tạo danh mục thất bại', 'Tên danh mục có thể đã tồn tại.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; req: CategoryRequest }) => blogApi.updateCategory(data.id, data.req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCloseModal();
      toast.success('Cập nhật thành công!', 'Danh mục đã được cập nhật.');
    },
    onError: () => {
      setFormError('Cập nhật danh mục thất bại. Vui lòng thử lại.');
      toast.error('Cập nhật thất bại', 'Vui lòng kiểm tra lại thông tin.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Xóa danh mục thành công!', 'Danh mục đã bị xóa khỏi hệ thống.');
    },
    onError: () => toast.error('Không thể xóa danh mục', 'Danh mục có thể đang chứa bài viết.'),
  });

  // Handlers
  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({ name: category.name, slug: category.slug });
    } else {
      setEditingCategory(null);
      setForm({ name: '', slug: '' });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({ name: '', slug: '' });
    setEditingCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Tên danh mục không được để trống.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug?.trim() || undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, req: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Xóa danh mục',
      message: 'Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể khôi phục.',
      confirmText: 'Xóa danh mục',
      variant: 'danger',
    });
    if (ok) deleteMutation.mutate(id);
  };

  return (
    <>
      {ConfirmDialogComponent}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Danh mục</h1>
            <p className="mt-1 text-sm text-[#727785]">Sắp xếp và phân loại nội dung bài viết</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-[#0058be] px-4 py-2 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Thêm danh mục
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#424754]">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tên danh mục</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-[#727785]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                        <p>Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-[#727785]">
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#191c1d]">{cat.name}</td>
                      <td className="px-6 py-4 text-[#727785]">{cat.slug}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c2c6d6] text-[#424754] hover:border-[#0058be] hover:text-[#0058be] transition-colors"
                            title="Sửa danh mục"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors"
                            title="Xóa danh mục"
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
        </div>

      {/* Modal Cập nhật/Thêm mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1d]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-lg font-bold text-[#191c1d]">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#727785] hover:bg-[#f3f4f5] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#191c1d]">
                    Tên danh mục <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
                    placeholder="VD: Công nghệ"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-[#191c1d]">
                    Slug (đường dẫn) <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] outline-none focus:border-[#0058be] focus:ring-1 focus:ring-[#0058be]"
                    placeholder="VD: cong-nghe"
                  />
                  <p className="mt-1 text-xs text-[#727785]">Viết liền không dấu, ngăn cách bằng dấu gạch ngang.</p>
                </div>
              </div>

              {formError && (
                <div className="mt-4 text-sm text-[#ba1a1a]">{formError}</div>
              )}

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-[#c2c6d6] bg-white px-5 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-[#0058be] px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 'Đang lưu...' : 'Lưu danh mục'}
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

export default AdminCategoriesPage;
