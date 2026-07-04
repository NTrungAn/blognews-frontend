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

  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const suggestMutation = useMutation({
    mutationFn: () => blogApi.suggestPostContent(form.title, form.summary),
    onMutate: () => {
      setIsGeneratingAi(true);
      setIsAiPanelOpen(true);
      setAiSuggestion('');
    },
    onSuccess: (res) => {
      setIsGeneratingAi(false);
      setAiSuggestion(res.data as unknown as string);
    },
    onError: (err: any) => {
      setIsGeneratingAi(false);
      setAiSuggestion(`Gợi ý thất bại: ${err.response?.data?.message || 'Không thể kết nối tới server.'}`);
    }
  });

  const handleGetAiSuggestion = () => {
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết để AI có thể gợi ý nội dung.');
      return;
    }
    suggestMutation.mutate();
  };

  const handleTogglePanel = () => {
    setIsAiPanelOpen((prev) => !prev);
  };

  const handleCopyOutline = async () => {
    if (!aiSuggestion) return;
    try {
      await navigator.clipboard.writeText(aiSuggestion);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // fallback for older browsers
    }
  };

  const handleApplyOutline = () => {
    if (!aiSuggestion) return;
    if (!form.contentMarkdown.trim() || window.confirm('Nội dung hiện tại sẽ được thay thế bằng dàn ý gợi ý. Bạn có đồng ý không?')) {
      setForm((prev) => ({
        ...prev,
        contentMarkdown: aiSuggestion
      }));
      setIsAiPanelOpen(false);
    }
  };

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
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Nhập tiêu đề bài viết..."
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: '' });
                }}
                className="flex-1 bg-transparent text-3xl font-bold tracking-tight text-[#191c1d] placeholder:text-[#c2c6d6] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGetAiSuggestion}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 transition-all focus:outline-none shrink-0 cursor-pointer"
                title="Gợi ý dàn ý bài viết bằng AI"
              >
                <span className="material-symbols-outlined text-[16px] animate-pulse">neurology</span>
                Gợi ý dàn ý (AI)
              </button>
            </div>
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
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.categoryId
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
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${isSelected
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
      {/* ── Floating Pull-tab: hiện khi panel đóng và đã có nội dung ── */}
      {!isAiPanelOpen && (aiSuggestion || isGeneratingAi) && (
        <button
          type="button"
          onClick={handleTogglePanel}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 rounded-l-2xl bg-gradient-to-b from-blue-600 to-indigo-700 px-2 py-4 text-white shadow-xl hover:from-blue-500 hover:to-indigo-600 transition-all cursor-pointer"
          title="Mở lại gợi ý AI"
        >
          <span className="material-symbols-outlined text-[18px]">neurology</span>
          <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }} className="text-[10px] font-bold tracking-widest uppercase mt-1">AI Gợi ý</span>
          <span className="material-symbols-outlined text-[14px] mt-1">chevron_left</span>
        </button>
      )}

      {/* ── AI Side-panel: luôn tồn tại trong DOM, ẩn/hiện bằng CSS translate ── */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-gray-100 transition-transform duration-300 ease-in-out ${
          isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4 shrink-0 bg-gradient-to-r from-blue-600 to-indigo-700">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">neurology</span>
            Trợ lý Gợi ý Nội dung (AI)
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleGetAiSuggestion}
              disabled={isGeneratingAi || !form.title.trim()}
              className="flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Tạo lại gợi ý mới"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Tạo lại
            </button>
            <button
              onClick={handleTogglePanel}
              className="rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer ml-1"
              title="Thu gọn panel (nội dung vẫn được giữ lại)"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 flex gap-2">
            <span className="material-symbols-outlined text-[15px] mt-0.5 text-blue-500 shrink-0">info</span>
            <p>Nhấn <strong>Thu gọn</strong> để ẩn panel — nội dung gợi ý vẫn được giữ nguyên. Nhấn tab <strong>AI Gợi ý</strong> ở cạnh phải để mở lại.</p>
          </div>

          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tiêu đề</div>
          <div className="text-sm font-semibold text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">{form.title || <span className="text-gray-300 italic">Chưa có tiêu đề</span>}</div>

          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Dàn ý gợi ý</div>
            {aiSuggestion && !isGeneratingAi && (
              <button
                type="button"
                onClick={handleCopyOutline}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">{isCopied ? 'check_circle' : 'content_copy'}</span>
                {isCopied ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex-1 min-h-[320px] max-h-[calc(100vh-340px)] overflow-y-auto font-mono text-xs whitespace-pre-wrap leading-relaxed text-gray-700">
            {isGeneratingAi ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 min-h-[280px]">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="animate-pulse text-sm">Đang phân tích và lập dàn ý...</p>
                <p className="text-[10px] text-gray-300">Quá trình có thể mất 5–15 giây</p>
              </div>
            ) : aiSuggestion ? (
              aiSuggestion
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-300 min-h-[280px]">
                <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                <p className="text-xs">Nhấn "Tạo lại" để nhận gợi ý mới</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex gap-2 shrink-0 bg-gray-50/50">
          <button
            type="button"
            onClick={handleTogglePanel}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Thu gọn
          </button>
          {!isGeneratingAi && aiSuggestion && (
            <button
              type="button"
              onClick={handleApplyOutline}
              className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">edit_document</span>
              Áp dụng vào bài viết
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostEditorPage;
