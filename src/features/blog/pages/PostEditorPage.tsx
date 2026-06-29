import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MDEditor from '@uiw/react-md-editor';
import blogApi, { type PostRequest } from '../../../api/blogApi';
import { getImageUrl } from '../../../utils/imageUrl';

function PostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [form, setForm] = useState<PostRequest>({
    title: '',
    summary: '',
    contentMarkdown: '',
    categoryId: '',
    tagIds: [],
    status: 'DRAFT',
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories & tags
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => blogApi.getCategories().then((r) => r.data),
  });

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => blogApi.getTags().then((r) => r.data),
  });
  const tags = tagsData?.content ?? [];

  // Fetch existing post if edit mode
  const { data: existingPost, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => blogApi.getPostById(id!).then((r) => r.data),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingPost) {
      setForm({
        title: existingPost.title,
        summary: existingPost.summary || '',
        contentMarkdown: existingPost.contentMarkdown,
        categoryId: existingPost.category.id,
        tagIds: existingPost.tags.map((t) => t.id),
        status: existingPost.status as 'DRAFT' | 'PUBLISHED',
      });
      if (existingPost.coverImage) {
        setCoverImagePreview(getImageUrl(existingPost.coverImage));
      }
    }
  }, [existingPost]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { post: PostRequest; file?: File }) =>
      blogApi.createPost(data.post, data.file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate(`/blog/${res.data.slug}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; post: PostRequest; file?: File }) =>
      blogApi.updatePost(data.id, data.post, data.file),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      navigate(`/blog/${res.data.slug}`);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Tiêu đề không được để trống';
    if (!form.categoryId) newErrors.categoryId = 'Vui lòng chọn danh mục';
    if (!form.contentMarkdown.trim()) newErrors.contentMarkdown = 'Nội dung không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent, status?: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload = { ...form };
    if (status) payload.status = status;

    if (isEditMode) {
      updateMutation.mutate({ id, post: payload, file: coverImageFile ?? undefined });
    } else {
      createMutation.mutate({ post: payload, file: coverImageFile ?? undefined });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const url = URL.createObjectURL(file);
      setCoverImagePreview(url);
    }
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEditMode && isLoadingPost) {
    return <div className="p-8 text-center text-[#727785]">Đang tải dữ liệu bài viết...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#191c1d]">
          {isEditMode ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
        </h1>
        <div className="flex gap-3">
          <Link
            to="/my-posts"
            className="rounded-lg border border-[#c2c6d6] bg-white px-4 py-2 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
          >
            Hủy
          </Link>
          <button
            onClick={(e) => handleSubmit(e, 'DRAFT')}
            disabled={isPending}
            className="rounded-lg bg-[#edeeef] px-4 py-2 text-sm font-medium text-[#191c1d] hover:bg-[#e1e3e4] transition-colors disabled:opacity-50"
          >
            Lưu nháp
          </button>
          <button
            onClick={(e) => handleSubmit(e, 'PUBLISHED')}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-[#0058be] px-5 py-2 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? 'Đang lưu...' : 'Xuất bản'}
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>

      {(createMutation.isError || updateMutation.isError) && (
        <div className="mb-6 rounded-lg border border-[#ffdad6] bg-[#fff4f3] p-4 text-sm text-[#ba1a1a]">
          Lưu bài viết thất bại. Vui lòng thử lại.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* ── Main Editor ────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Nhập tiêu đề bài viết..."
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              className="w-full bg-transparent text-3xl font-bold tracking-tight text-[#191c1d] placeholder:text-[#c2c6d6] focus:outline-none"
            />
            {errors.title && <p className="mt-1 text-sm text-[#ba1a1a]">{errors.title}</p>}
          </div>

          {/* Summary */}
          <div>
            <textarea
              rows={2}
              placeholder="Nhập tóm tắt ngắn (hiển thị trên thẻ bài viết)..."
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full resize-none rounded-xl border border-[#c2c6d6] bg-white p-4 text-sm text-[#191c1d] placeholder:text-[#727785] focus:border-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#0058be]/10"
            />
          </div>

          {/* Markdown Editor */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-bold text-[#424754]">Nội dung bài viết</label>
              <label className="cursor-pointer inline-flex items-center gap-1 rounded bg-[#f0f5ff] px-3 py-1.5 text-xs font-medium text-[#0058be] hover:bg-[#d8e2ff] transition-colors">
                <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                Tải ảnh lên & chèn vào nội dung
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const res = await blogApi.uploadImage(file);
                        const imageUrl = getImageUrl(res.data.url);
                        const imageMarkdown = `\n![Hình ảnh](${imageUrl})\n`;
                        setForm((prev) => ({
                          ...prev,
                          contentMarkdown: prev.contentMarkdown + imageMarkdown,
                        }));
                      } catch (err) {
                        alert('Tải ảnh lên thất bại. Vui lòng thử lại.');
                      }
                    }
                    e.target.value = ''; // Reset file input
                  }}
                />
              </label>
            </div>
            <div data-color-mode="light" className="overflow-hidden rounded-xl border border-[#c2c6d6]">
              <MDEditor
                value={form.contentMarkdown}
                onChange={(val) => {
                  setForm({ ...form, contentMarkdown: val || '' });
                  if (errors.contentMarkdown) setErrors({ ...errors, contentMarkdown: '' });
                }}
                height={600}
                preview="live"
                className="!border-none !shadow-none"
              />
            </div>
            {errors.contentMarkdown && <p className="mt-1 text-sm text-[#ba1a1a]">{errors.contentMarkdown}</p>}
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#424754]">Ảnh bìa</h3>
            {coverImagePreview ? (
              <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg border border-[#E5E7EB]">
                <img src={coverImagePreview} alt="Cover preview" className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    setCoverImageFile(null);
                    setCoverImagePreview(null);
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#ba1a1a] shadow hover:bg-white"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ) : (
              <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c2c6d6] bg-[#f8f9fa] transition-colors hover:border-[#0058be] hover:bg-[#d8e2ff]/30">
                <span className="material-symbols-outlined mb-2 text-3xl text-[#727785]">add_photo_alternate</span>
                <span className="text-sm font-medium text-[#424754]">Tải ảnh lên</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Category */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#424754]">Danh mục <span className="text-[#ba1a1a]">*</span></h3>
            <select
              value={form.categoryId}
              onChange={(e) => {
                setForm({ ...form, categoryId: e.target.value });
                if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
              }}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.categoryId
                  ? 'border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]/10'
                  : 'border-[#c2c6d6] focus:border-[#0058be] focus:ring-[#0058be]/10'
              }`}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-[#ba1a1a]">{errors.categoryId}</p>}
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#424754]">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = form.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                      isSelected
                        ? 'border-[#0058be] bg-[#0058be] text-white'
                        : 'border-[#c2c6d6] bg-[#f8f9fa] text-[#424754] hover:bg-[#edeeef]'
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostEditorPage;
