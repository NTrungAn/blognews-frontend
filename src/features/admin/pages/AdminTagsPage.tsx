import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi, { type Tag, type TagRequest } from '../../../api/blogApi';

function AdminTagsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  
  const [form, setForm] = useState<TagRequest>({ name: '', slug: '' });
  const [formError, setFormError] = useState('');

  // Fetch tags
  const { data: tagsData, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => blogApi.getTags().then((r) => r.data),
  });

  const tags = tagsData?.content ?? [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: TagRequest) => blogApi.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      handleCloseModal();
    },
    onError: () => setFormError('Tạo tag thất bại. Vui lòng thử lại.'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; req: TagRequest }) => blogApi.updateTag(data.id, data.req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      handleCloseModal();
    },
    onError: () => setFormError('Cập nhật tag thất bại. Vui lòng thử lại.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
    onError: () => alert('Không thể xóa tag này.'),
  });

  // Handlers
  const handleOpenModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setForm({ name: tag.name, slug: tag.slug });
    } else {
      setEditingTag(null);
      setForm({ name: '', slug: '' });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setForm({ name: '', slug: '' });
    setEditingTag(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Tên tag không được để trống.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      slug: form.slug?.trim() || undefined,
    };

    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, req: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tag này không?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1d]">Quản lý Tags</h1>
            <p className="mt-1 text-sm text-[#727785]">Thêm, sửa, xóa các tag (nhãn) bài viết</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-lg bg-[#0058be] px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Thêm Tag
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#424754]">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tên Tag</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-[#727785]">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : tags.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-[#727785]">
                      Chưa có tag nào.
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4 font-medium text-[#191c1d]">{tag.name}</td>
                      <td className="px-6 py-4 text-[#727785]">{tag.slug}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(tag)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c2c6d6] text-[#424754] hover:border-[#0058be] hover:text-[#0058be] transition-colors"
                            title="Sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#fff4f3] transition-colors"
                            title="Xóa"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191c1d]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-lg font-bold text-[#191c1d]">
                {editingTag ? 'Chỉnh sửa Tag' : 'Thêm Tag mới'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#727785] hover:bg-[#f3f4f5] transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-[#191c1d]">
                  Tên tag <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Công nghệ mới"
                  className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] focus:border-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#0058be]/10"
                />
              </div>
              <div className="mb-6">
                <label className="mb-1.5 block text-sm font-semibold text-[#191c1d]">
                  Slug (Tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="VD: cong-nghe-moi (để trống sẽ tự tạo)"
                  className="w-full rounded-lg border border-[#c2c6d6] px-4 py-2.5 text-sm text-[#191c1d] focus:border-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#0058be]/10"
                />
              </div>
              
              {formError && (
                <div className="mb-4 text-sm text-[#ba1a1a]">{formError}</div>
              )}

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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-lg bg-[#0058be] px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTagsPage;
