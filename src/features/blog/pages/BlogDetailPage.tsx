import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi, { type CommentDto } from '../../../api/blogApi';
import { useAuth } from '../../../contexts/AuthContext';
import { getImageUrl } from '../../../utils/imageUrl';

// ─── Reading Progress Bar ─────────────────────────────────────────────────────
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 h-1 w-full bg-[#edeeef]">
      <div
        className="h-full bg-[#0058be] transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────
function CommentItem({
  comment,
  postId,
  onReply,
}: {
  comment: CommentDto;
  postId?: string;
  onReply?: (parentId: string, authorName: string) => void;
}) {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const queryClient = useQueryClient();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
    setShowReactionPicker(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = window.setTimeout(() => {
      setShowReactionPicker(false);
    }, 300);
  };

  const reactionMutation = useMutation({
    mutationFn: (emoji: string) => blogApi.addReaction(postId!, comment.id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setShowReactionPicker(false);
    }
  });

  const removeReactionMutation = useMutation({
    mutationFn: () => blogApi.removeReaction(postId!, comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    }
  });

  const handleReact = (emoji: string) => {
    if (!postId || !isAuthenticated) return;
    reactionMutation.mutate(emoji);
  };

  const handleTogglePrimaryReact = () => {
    if (!postId || !isAuthenticated) return;
    if (comment.userReaction) {
      removeReactionMutation.mutate();
    } else {
      reactionMutation.mutate('👍');
    }
  };

  const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const totalReactions = comment.reactionsCount ? Object.values(comment.reactionsCount).reduce((a, b) => a + b, 0) : 0;
  const topEmojis = comment.reactionsCount
    ? Object.entries(comment.reactionsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(e => e[0])
    : [];

  const authorDisplayName = comment.author?.fullName || comment.author?.username || 'Unknown';

  return (
    <div className="group">
      <div className="flex gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#d8e2ff] text-xs font-bold uppercase text-[#0058be]">
          {authorDisplayName.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="relative rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-[#191c1d]">{authorDisplayName}</span>
              <span className="text-xs text-[#727785]">
                {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#424754]">
              {comment.content}
            </p>

            {totalReactions > 0 && (
              <div className="absolute right-2 -bottom-3 flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 shadow-sm border border-[#E5E7EB] text-[11px] font-medium text-[#727785] z-10">
                <div className="flex -space-x-1">
                  {topEmojis.map((emoji, idx) => (
                    <span key={idx} className="z-10 bg-white rounded-full text-[13px] leading-none border border-white">{emoji}</span>
                  ))}
                </div>
                <span className="ml-0.5">{totalReactions}</span>
              </div>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {isAuthenticated && postId && (
              <div
                className="relative flex items-center"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={handleTogglePrimaryReact}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${comment.userReaction
                      ? 'bg-[#f0f5ff] text-[#0058be]'
                      : 'text-[#727785] hover:bg-[#f0f5ff] hover:text-[#0058be]'
                    }`}
                >
                  {comment.userReaction ? (
                    <span className="text-sm">{comment.userReaction}</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                  )}
                  {comment.userReaction ? 'Đã thả cảm xúc' : 'Thích'}
                </button>

                {showReactionPicker && (
                  <div className="absolute bottom-full left-0 mb-1 flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-lg border border-[#E5E7EB] animate-fade-in-up z-20">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xl hover:scale-125 hover:bg-[#f0f5ff] transition-transform origin-bottom"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && onReply && (
              <button
                onClick={() => onReply(comment.id, authorDisplayName)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#727785] hover:bg-[#f0f5ff] hover:text-[#0058be] rounded-md transition-colors"
              >
                <span className="material-symbols-outlined text-sm">reply</span>
                Trả lời
              </button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#0058be] hover:bg-[#f0f5ff] rounded-md transition-colors"
              >
                <span className="material-symbols-outlined text-sm">
                  {isExpanded ? 'expand_less' : 'expand_more'}
                </span>
                {isExpanded ? 'Thu gọn' : `Xem ${comment.replies.length} câu trả lời`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {isExpanded && comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3 border-l-2 border-[#d8e2ff] pl-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ToCItem {
  id: string;
  text: string;
  level: number;
}

// Mock related articles removed in favor of conditional rendering

// ─── BlogDetailPage ───────────────────────────────────────────────────────────
function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const commentTextRef = useRef<HTMLTextAreaElement>(null);

  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ parentId: string; authorName: string } | null>(null);
  const [commentPage, setCommentPage] = useState(0);

  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [toc, setToc] = useState<ToCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Highlight and Share state
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [sharePosition, setSharePosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState('');
  const articleRef = useRef<HTMLDivElement>(null);

  // Like count hiển thị — state riêng để cập nhật UI ngay lập tức
  const [displayLikesCount, setDisplayLikesCount] = useState(0);

  // Fetch post
  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => blogApi.getPostBySlug(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  // Đồng bộ số like từ server khi load/refetch bài viết
  useEffect(() => {
    if (post != null) {
      setDisplayLikesCount(post.likesCount ?? 0);
    }
  }, [post?.id, post?.likesCount]);

  // Fetch comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', post?.id, commentPage],
    queryFn: () =>
      blogApi.getCommentsByPostId(post!.id, { pageNo: commentPage, pageSize: 10 }).then((r) => r.data),
    enabled: !!post?.id,
  });

  // Fetch related posts from same category
  const { data: relatedPostsResponse } = useQuery({
    queryKey: ['related-posts', post?.category?.slug, post?.id],
    queryFn: () =>
      blogApi.getPosts({
        categorySlug: post?.category?.slug,
        pageSize: 4,
      }).then((r) => r.data),
    enabled: !!post?.category?.slug,
  });

  const realRelated = relatedPostsResponse?.content
    ?.filter((item) => item.id !== post?.id)
    ?.slice(0, 3) || [];

  const relatedToShow = realRelated.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category?.name || 'Chung',
    imageUrl: p.coverImage ? getImageUrl(p.coverImage) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60',
    date: new Date(p.createdAt).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    slug: p.slug,
  }));

  // Extract ToC items from markdown
  useEffect(() => {
    if (!post?.contentMarkdown) return;

    const lines = post.contentMarkdown.split('\n');
    const items: ToCItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{2,4})\s+(.+)$/);
      if (match) {
        const hashes = match[1];
        const text = match[2].trim();
        const level = hashes.length;
        items.push({
          id: slugify(text),
          text,
          level,
        });
      }
    });

    setToc(items);
  }, [post?.contentMarkdown]);

  // Setup active heading observer
  useEffect(() => {
    if (toc.length === 0) return;

    const headingElements = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const closest = visibleEntries.reduce((prev, curr) => {
            return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev;
          });
          setActiveId(closest.target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [toc]);

  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  // Submit comment mutation
  const submitComment = useMutation({
    mutationFn: (data: { content: string; parentId?: string | null }) =>
      blogApi.createComment(post!.id, data),
    onSuccess: () => {
      setCommentContent('');
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ['comments', post?.id] });
    },
  });

  const handleReply = (parentId: string, authorName: string) => {
    setReplyTo({ parentId, authorName });
    setCommentContent(`@${authorName} `);
    commentTextRef.current?.focus();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    submitComment.mutate({
      content: commentContent.trim(),
      parentId: replyTo?.parentId ?? null,
    });
  };

  // Bookmark logic
  const { data: isBookmarked } = useQuery({
    queryKey: ['bookmarkStatus', post?.id],
    queryFn: () => blogApi.checkBookmarkStatus(post!.id).then((r) => r.data),
    enabled: !!post?.id && isAuthenticated,
  });

  const toggleBookmark = useMutation({
    mutationFn: () => blogApi.toggleBookmark(post!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarkStatus', post?.id] });
      queryClient.invalidateQueries({ queryKey: ['my-bookmarks'] });
    },
  });

  // Post like logic
  const { data: isLiked = false } = useQuery({
    queryKey: ['likeStatus', post?.id],
    queryFn: () => blogApi.checkPostLikeStatus(post!.id).then((r) => r.data),
    enabled: !!post?.id && isAuthenticated,
  });

  const toggleLike = useMutation({
    mutationFn: () => blogApi.togglePostLike(post!.id),
    onMutate: async () => {
      const previousLiked = queryClient.getQueryData<boolean>(['likeStatus', post?.id]) ?? isLiked;
      const previousCount = displayLikesCount;

      const nextLiked = !previousLiked;
      const nextCount = previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1;

      setDisplayLikesCount(nextCount);
      queryClient.setQueryData(['likeStatus', post?.id], nextLiked);

      return { previousLiked, previousCount };
    },
    onSuccess: (data) => {
      setDisplayLikesCount(data.likesCount);
      queryClient.setQueryData(['likeStatus', post?.id], data.liked);
      queryClient.setQueryData(['post', slug], (old: typeof post) =>
        old ? { ...old, likesCount: data.likesCount } : old,
      );
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      setDisplayLikesCount(context.previousCount);
      queryClient.setQueryData(['likeStatus', post?.id], context.previousLiked);
    },
  });

  const handleLikeClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/blog/${slug}` } } });
      return;
    }
    toggleLike.mutate();
  };

  // Format date
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  // Estimate read time
  const readTime = post
    ? Math.max(1, Math.ceil((post.contentMarkdown?.split(/\s+/).length ?? 0) / 200))
    : 0;

  // ── Highlight & Share Handlers ─────────────────────────────────────────────
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      if (sharePopupOpen) setSharePopupOpen(false);
      return;
    }

    const text = selection.toString().trim();
    // Only show if text is selected inside the articleRef
    if (text.length > 0 && articleRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSharePosition({
        top: rect.top + window.scrollY - 45,
        left: rect.left + window.scrollX + rect.width / 2,
      });
      setSelectedText(text);
      setSharePopupOpen(true);
    } else {
      if (sharePopupOpen) setSharePopupOpen(false);
    }
  }, [sharePopupOpen]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, [handleSelection]);

  const shareToTwitter = (text: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent('"' + text + '"')} - ${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(`"${text}" - ${window.location.href}`);
    alert('Đã sao chép đoạn văn bản!');
  };

  // ── Loading ────────────────────────────────────────────────────
  if (postLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <ReadingProgress />
        <div className="mx-auto max-w-3xl px-6 py-12">
          {/* @ts-ignore - skeleton is not imported in this chunk but handled elsewhere if needed, let's just show text */}
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Not Found ──────────────────────────────────────────
  if (postError || !post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f9fa] text-center">
        <span className="material-symbols-outlined text-6xl text-[#c2c6d6]">search_off</span>
        <h1 className="text-2xl font-bold text-[#191c1d]">Bài viết không tồn tại</h1>
        <p className="text-sm text-[#424754]">
          Bài viết này có thể đã bị xóa hoặc đường dẫn không đúng.
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#0058be] px-5 py-2.5 text-sm font-medium text-white hover:brightness-110"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <ReadingProgress />

      {/* Hero Image */}
      {post.coverImage && (
        <div className="mx-auto mt-8 max-w-5xl px-6">
          <div className="overflow-hidden rounded-2xl bg-[#edeeef] shadow-sm">
            <img
              src={getImageUrl(post.coverImage)}
              alt={post.title}
              className="w-full object-cover md:h-[500px]"
            />
          </div>
        </div>
      )}

      {/* ── Main ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-10 lg:flex lg:gap-10 lg:items-start">
        {/* Left Column: Article Content, Related Articles, and Comments */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-[#727785]">
            <Link to="/" className="hover:text-[#0058be] transition-colors">
              Trang chủ
            </Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            {post.category && (
              <>
                <Link
                  to={`/?category=${post.category.slug}`}
                  className="hover:text-[#0058be] transition-colors"
                >
                  {post.category.name}
                </Link>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </>
            )}
            <span className="line-clamp-1 font-medium text-[#191c1d]">{post.title}</span>
          </nav>

          {/* Category + Status */}
          <div className="mb-4 flex flex-wrap gap-2">
            {post.category && (
              <Link
                to={`/?category=${post.category.slug}`}
                className="rounded-full bg-[#0058be] px-3 py-1 text-xs font-semibold text-white hover:brightness-110 transition-all"
              >
                {post.category.name}
              </Link>
            )}
            {post.status === 'DRAFT' && (
              <span className="rounded-full bg-[#ffdad6] px-3 py-1 text-xs font-semibold text-[#ba1a1a]">
                Bản nháp
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#191c1d] md:text-4xl">
            {post.title}
          </h1>

          {/* Summary */}
          {post.summary && (
            <p className="mt-4 text-lg leading-relaxed text-[#424754]">{post.summary}</p>
          )}

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-[#E5E7EB] py-4">
            <div className="flex items-center gap-2">
              <Link to={post.authorUsername ? `/author/${post.authorUsername}` : '#'} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8e2ff] text-sm font-bold uppercase text-[#0058be] hover:brightness-95 transition-all">
                {post.authorName?.charAt(0) ?? 'U'}
              </Link>
              <div>
                <Link to={post.authorUsername ? `/author/${post.authorUsername}` : '#'} className="text-sm font-semibold text-[#191c1d] hover:text-[#0058be] transition-colors">
                  {post.authorName}
                </Link>
                <p className="text-xs text-[#727785]">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3 text-xs text-[#727785]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {readTime} phút đọc
              </span>
              {post.viewCount !== undefined && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  {post.viewCount.toLocaleString()}
                </span>
              )}
              <button
                onClick={handleLikeClick}
                disabled={toggleLike.isPending}
                title={isAuthenticated ? (isLiked ? 'Bỏ thích' : 'Thích bài viết') : 'Đăng nhập để thích bài viết'}
                className={`flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                  isLiked
                    ? 'border-rose-500 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-[#c2c6d6] bg-white text-[#424754] hover:bg-[#f3f4f5]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  favorite
                </span>
                {(displayLikesCount).toLocaleString('vi-VN')}
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => toggleBookmark.mutate()}
                  disabled={toggleBookmark.isPending}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${isBookmarked
                    ? 'border-[#0058be] bg-[#0058be] text-white hover:brightness-110'
                    : 'border-[#c2c6d6] bg-white text-[#424754] hover:bg-[#f3f4f5]'
                    }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isBookmarked ? 'font-variation-settings:\'FILL\'_1' : ''}`}>
                    bookmark
                  </span>
                  {isBookmarked ? 'Đã lưu' : 'Lưu bài viết'}
                </button>
              )}
            </div>
          </div>

          {/* Mobile ToC */}
          {toc.length > 0 && (
            <div className="mb-6 block lg:hidden rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <button
                onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
                className="flex w-full items-center justify-between font-bold text-[#191c1d] text-sm uppercase tracking-wider focus:outline-none"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0058be]">toc</span>
                  Mục lục bài viết
                </span>
                <span className="material-symbols-outlined transition-transform duration-200" style={{ transform: isMobileTocOpen ? 'rotate(180deg)' : 'none' }}>
                  expand_more
                </span>
              </button>
              {isMobileTocOpen && (
                <nav className="mt-3 space-y-1 border-t border-[#E5E7EB] pt-3 text-sm">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        handleTocClick(e, item.id);
                        setIsMobileTocOpen(false);
                      }}
                      className={`block py-1.5 transition-all text-[#727785] hover:text-[#191c1d] ${item.level === 2 ? 'pl-1' :
                        item.level === 3 ? 'pl-4 text-[13px]' : 'pl-6 text-[12px]'
                        }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              )}
            </div>
          )}

          {/* ── Content ─────────────────────────────────────────── */}
          <article
            ref={articleRef}
            className="prose-blog mt-8"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(post.contentMarkdown),
            }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/?tag=${tag.slug}`}
                  className="rounded-full border border-[#c2c6d6] px-3 py-1 text-xs font-medium text-[#424754] hover:border-[#0058be] hover:bg-[#d8e2ff] hover:text-[#0058be] transition-all"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* ── Related Articles ────────────────────────────────── */}
          {relatedToShow.length > 0 && (
            <section className="mt-16 border-t border-[#E5E7EB] pt-10">
              <h2 className="mb-8 text-2xl font-bold text-[#191c1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">dynamic_feed</span>
                Bài viết liên quan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedToShow.map((article) => {
                  const isMock = article.slug === '#';
                  const CardWrapper = isMock ? 'div' : Link;
                  const cardProps = isMock ? {} : { to: `/blog/${article.slug}` };

                  return (
                    // @ts-ignore
                    <CardWrapper
                      key={article.id}
                      {...cardProps}
                      className={`group block rounded-lg overflow-hidden border border-[#E5E7EB] bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${!isMock ? 'cursor-pointer' : ''}`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-[#edeeef]">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute left-3 top-3 rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-xs font-semibold text-[#0058be]">
                          {article.category}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="line-clamp-2 text-base font-bold text-[#191c1d] group-hover:text-[#0058be] transition-colors min-h-[48px]">
                          {article.title}
                        </h3>
                        <div className="mt-3 flex items-center justify-between text-xs text-[#727785]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                            {article.date}
                          </span>
                          {!isMock && (
                            <span className="flex items-center text-[#0058be] font-medium group-hover:translate-x-0.5 transition-transform">
                              Đọc tiếp
                              <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Comments ────────────────────────────────────────── */}
          <section className="mt-12" id="comments">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#191c1d]">
              <span className="material-symbols-outlined text-[#0058be]">chat_bubble</span>
              Bình luận
              {commentsData && (
                <span className="ml-1 rounded-full bg-[#edeeef] px-2.5 py-0.5 text-sm font-medium text-[#727785]">
                  {commentsData.totalElements}
                </span>
              )}
            </h2>

            {/* Comment Form */}
            {isAuthenticated ? (
              <form
                onSubmit={handleCommentSubmit}
                className="mb-8 rounded-xl border border-[#E5E7EB] bg-white p-5"
              >
                {replyTo && (
                  <div className="mb-3 flex items-center justify-between rounded-lg bg-[#d8e2ff] px-3 py-2 text-sm text-[#0058be]">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">reply</span>
                      Đang trả lời <strong>{replyTo.authorName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => { setReplyTo(null); setCommentContent(''); }}
                      className="hover:text-[#ba1a1a]"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                <textarea
                  ref={commentTextRef}
                  rows={3}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="w-full resize-none rounded-lg border border-[#c2c6d6] px-4 py-3 text-sm text-[#191c1d] placeholder:text-[#727785] focus:border-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#0058be]/10"
                />
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={!commentContent.trim() || submitComment.isPending}
                    className="flex items-center gap-2 rounded-lg bg-[#0058be] px-5 py-2 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {submitComment.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
                {submitComment.isError && (
                  <p className="mt-2 text-xs text-[#ba1a1a]">Gửi bình luận thất bại. Vui lòng thử lại.</p>
                )}
              </form>
            ) : (
              <div className="mb-8 rounded-xl border border-[#d8e2ff] bg-[#f0f5ff] px-6 py-5 text-center">
                <p className="text-sm text-[#424754]">
                  <Link to="/login" className="font-semibold text-[#0058be] hover:underline">
                    Đăng nhập
                  </Link>{' '}
                  để tham gia bình luận.
                </p>
              </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-[#edeeef]" />
                    <div className="flex-1 rounded-xl border border-[#E5E7EB] bg-white p-4">
                      <div className="mb-2 h-3 w-24 animate-pulse rounded bg-[#edeeef]" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-[#edeeef]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : commentsData?.content.length === 0 ? (
              <div className="rounded-xl border border-[#E5E7EB] bg-white py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">chat_bubble_outline</span>
                <p className="mt-2 text-sm text-[#727785]">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {commentsData?.content.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} postId={post?.id} onReply={handleReply} />
                ))}

                {/* Load more comments */}
                {commentsData && !commentsData.last && (
                  <button
                    onClick={() => setCommentPage((p) => p + 1)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#c2c6d6] bg-white py-3 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">expand_more</span>
                    Tải thêm bình luận
                  </button>
                )}
              </div>
            )}
          </section>

          {/* ── Back Button ─────────────────────────────────────── */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 rounded-lg border border-[#c2c6d6] bg-white px-5 py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Quay lại
            </button>
          </div>

        </div>

        {/* Right Column: Sticky Sidebar ToC */}
        {toc.length > 0 && (
          <aside className="sticky top-24 hidden w-72 shrink-0 lg:block">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#191c1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#0058be]">toc</span>
                Mục lục bài viết
              </h3>
              <nav className="space-y-1 text-sm max-h-[calc(100vh-160px)] overflow-y-auto pr-1">
                {toc.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                      className={`block py-1.5 transition-all duration-200 border-l-2 pl-3 ${isActive
                        ? 'border-[#0058be] font-semibold text-[#0058be] bg-[#f0f5ff]/60'
                        : 'border-transparent text-[#727785] hover:text-[#191c1d] hover:border-[#c2c6d6]'
                        } ${item.level === 2 ? 'pl-3' :
                          item.level === 3 ? 'pl-6 text-[13px]' : 'pl-8 text-[12px]'
                        }`}
                    >
                      {item.text}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {/* ── Article CSS ─────────────────────────────────────────── */}
      <style>{`
        .prose-blog {
          color: #191c1d;
          line-height: 1.8;
          font-size: 1.0625rem;
        }
        .prose-blog h1,.prose-blog h2,.prose-blog h3,.prose-blog h4 {
          font-weight: 700; margin: 1.75rem 0 0.75rem; color: #191c1d; line-height: 1.3;
        }
        .prose-blog h1 { font-size: 2rem; }
        .prose-blog h2 { font-size: 1.5rem; border-bottom: 1px solid #E5E7EB; padding-bottom: 0.4rem; }
        .prose-blog h3 { font-size: 1.2rem; }
        .prose-blog p { margin: 1rem 0; }
        .prose-blog a { color: #0058be; text-decoration: underline; }
        .prose-blog a:hover { color: #004395; }
        .prose-blog ul,.prose-blog ol { padding-left: 1.5rem; margin: 1rem 0; }
        .prose-blog li { margin: 0.4rem 0; }
        .prose-blog blockquote {
          border-left: 4px solid #0058be; background: #f0f5ff;
          margin: 1.5rem 0; padding: 0.75rem 1rem; color: #424754; border-radius: 0 8px 8px 0;
        }
        .prose-blog code {
          background: #edeeef; border-radius: 4px;
          font-size: 0.875rem; padding: 0.15rem 0.4rem;
        }
        .prose-blog pre {
          background: #1e293b; color: #e2e8f0; border-radius: 10px;
          padding: 1.25rem; overflow-x: auto; margin: 1.5rem 0; font-size: 0.875rem;
        }
        .prose-blog pre code { background: none; padding: 0; }
        .prose-blog img { max-width: 100%; border-radius: 10px; margin: 1.5rem 0; }
        .prose-blog table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.9rem; }
        .prose-blog th { background: #f3f4f5; font-weight: 600; padding: 0.6rem 1rem; border: 1px solid #E5E7EB; }
        .prose-blog td { padding: 0.6rem 1rem; border: 1px solid #E5E7EB; }
        .prose-blog tr:nth-child(even) { background: #f8f9fa; }
      `}</style>
      {/* ── Highlight & Share Popup ───────────────────────────────────────── */}
      {sharePopupOpen && (
        <div
          className="absolute z-50 flex items-center gap-2 rounded-lg bg-[#191c1d] px-3 py-2 text-white shadow-xl animate-fade-in-up transition-opacity duration-200"
          style={{
            top: sharePosition.top,
            left: sharePosition.left,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button
            onClick={() => shareToTwitter(selectedText)}
            className="flex items-center gap-1 hover:text-[#1da1f2] transition-colors group"
            title="Share to Twitter"
          >
            <span className="text-xs font-semibold group-hover:underline">Twitter</span>
          </button>
          <div className="h-3 w-px bg-gray-600"></div>
          <button
            onClick={() => shareToFacebook()}
            className="flex items-center gap-1 hover:text-[#1877f2] transition-colors group"
            title="Share to Facebook"
          >
            <span className="text-xs font-semibold group-hover:underline">Facebook</span>
          </button>
          <div className="h-3 w-px bg-gray-600"></div>
          <button
            onClick={() => copyText(selectedText)}
            className="flex items-center gap-1 hover:text-[#e5e7eb] transition-colors group"
            title="Copy Text"
          >
            <span className="text-xs font-semibold group-hover:underline">Copy</span>
          </button>
          {/* Arrow pointing down */}
          <div className="absolute left-1/2 bottom-[-4px] h-2 w-2 -translate-x-1/2 rotate-45 bg-[#191c1d]"></div>
        </div>
      )}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── Simple Markdown to HTML renderer ─────────────────────────────
function renderMarkdown(md: string): string {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // headings
    .replace(/^#### (.+)$/gm, (_, p1) => `<h4 id="${slugify(p1)}">${p1}</h4>`)
    .replace(/^### (.+)$/gm, (_, p1) => `<h3 id="${slugify(p1)}">${p1}</h3>`)
    .replace(/^## (.+)$/gm, (_, p1) => `<h2 id="${slugify(p1)}">${p1}</h2>`)
    .replace(/^# (.+)$/gm, (_, p1) => `<h1 id="${slugify(p1)}">${p1}</h1>`)
    // bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // unordered list
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    // ordered list
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // paragraphs
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  return `<p>${html}</p>`;
}



export default BlogDetailPage;
