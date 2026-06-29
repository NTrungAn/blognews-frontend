import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import blogApi from '../../../api/blogApi';
import ArticleCard from '../../../components/ArticleCard';
import CategoryBlock from '../../../components/CategoryBlock';
import HeroSection from '../../../components/HeroSection';
import Pagination from '../../../components/Pagination';
import { getImageUrl } from '../../../utils/imageUrl';

const PAGE_SIZE = 9;

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') ?? 0);
  const activeCategorySlug = searchParams.get('category') ?? undefined;
  const activeSearchKeyword = searchParams.get('search') ?? undefined;
  const sortParam = searchParams.get('sort');

  const isTrending = sortParam === 'trending';

  // Fetch posts
  const { data: postsData, isLoading: postsLoading, isError: postsError } = useQuery({
    queryKey: ['posts', currentPage, activeCategorySlug, activeSearchKeyword, isTrending],
    queryFn: () =>
      blogApi.getPosts({
        pageNo: currentPage,
        pageSize: PAGE_SIZE,
        categorySlug: activeCategorySlug,
        keyword: activeSearchKeyword,
        status: 'PUBLISHED',
        sortBy: isTrending ? 'viewCount' : 'createdAt',
        sortDir: 'desc',
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => blogApi.getCategories().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => blogApi.getTags().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });
  const tags = tagsData?.content ?? [];

  // Tag Cloud Calculations
  const maxPostCount = Math.max(...tags.map(t => t.postCount || 0), 1);
  const minPostCount = Math.min(...tags.map(t => t.postCount || 0));

  const getTagStyleClass = (count: number = 0) => {
    if (maxPostCount === minPostCount) return 'text-xs px-3 py-1 text-[#424754]';
    
    const ratio = (count - minPostCount) / (maxPostCount - minPostCount);
    if (ratio < 0.25) return 'text-[11px] px-2.5 py-1 text-[#727785]';
    if (ratio < 0.5) return 'text-xs px-3 py-1 font-medium text-[#424754]';
    if (ratio < 0.75) return 'text-sm px-3.5 py-1.5 font-semibold text-[#191c1d]';
    return 'text-base font-bold px-4 py-1.5 border-[#0058be] text-[#0058be] shadow-sm bg-[#f0f5ff]';
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (slug?: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('page');
      if (slug) next.set('category', slug);
      else next.delete('category');
      return next;
    });
  };

  const posts = postsData?.content ?? [];
  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  // Map data cho CategoryBlock (bài viết từ thứ 4 đến 6)
  const categoryBlockArticles = gridPosts.slice(3, 6).map((post) => ({
    id: post.id,
    title: post.title,
    excerpt: post.summary || 'Chưa có tóm tắt cho bài viết này.',
    imageUrl: post.coverImage
      ? getImageUrl(post.coverImage)
      : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
    date: new Date(post.createdAt).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    slug: post.slug,
  }));

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* ── Hero Section ──────────────────────────────────────────── */}
      {!activeCategorySlug && currentPage === 0 && featuredPost && (
        <HeroSection
          featuredArticle={featuredPost}
          trendingArticles={gridPosts.slice(0, 3)}
        />
      )}

      {/* ── Category Block Example ──────────────────────────────── */}
      {!activeCategorySlug && currentPage === 0 && categoryBlockArticles.length > 0 && (
        <section className="border-b border-[#E5E7EB] bg-white">
          <div className="mx-auto max-w-7xl px-6">
            <CategoryBlock
              categoryName="Có thể bạn quan tâm"
              categorySlug="co-the-ban-quan-tam"
              articles={categoryBlockArticles}
            />
          </div>
        </section>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Posts Grid */}
          <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-[#191c1d]">
                {isTrending
                  ? '🔥 Bài viết thịnh hành'
                  : activeSearchKeyword
                  ? `Kết quả tìm kiếm cho: "${activeSearchKeyword}"`
                  : activeCategorySlug
                  ? `Danh mục: ${categories.find((c) => c.slug === activeCategorySlug)?.name ?? activeCategorySlug}`
                  : 'Bài viết mới nhất'}
              </h2>
              {postsData && (
                <span className="text-sm text-[#727785]">
                  {postsData.totalElements} bài viết
                </span>
              )}
            </div>

            {/* Loading skeleton */}
            {postsLoading && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ArticleSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {postsError && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#ffdad6] bg-[#fff4f3] py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-[#ba1a1a]">error_outline</span>
                <p className="mt-3 font-semibold text-[#ba1a1a]">Không thể tải bài viết</p>
                <p className="mt-1 text-sm text-[#424754]">Vui lòng thử lại sau.</p>
              </div>
            )}

            {/* Grid */}
            {!postsLoading && !postsError && (
              <>
                {posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-[#c2c6d6]">article</span>
                    <p className="mt-3 font-semibold text-[#191c1d]">Chưa có bài viết nào</p>
                    <p className="mt-1 text-sm text-[#424754]">
                      {activeCategorySlug
                        ? 'Danh mục này chưa có bài viết nào.'
                        : 'Hãy là người đầu tiên đăng bài!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {(activeCategorySlug || currentPage > 0 ? posts : gridPosts).map((post) => (
                      <ArticleCard key={post.id} article={post} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {postsData && postsData.totalPages > 1 && (
                  <Pagination
                    currentPage={postsData.pageNo}
                    totalPages={postsData.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Category Filter */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#424754]">
                <span className="material-symbols-outlined text-base text-[#0058be]">folder</span>
                Danh mục
              </h3>
              <ul className="mt-4 space-y-1">
                <li>
                  <button
                    onClick={() => handleCategoryClick(undefined)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      !activeCategorySlug
                        ? 'bg-[#d8e2ff] font-semibold text-[#0058be]'
                        : 'text-[#424754] hover:bg-[#f3f4f5]'
                    }`}
                  >
                    <span>Tất cả</span>
                    <span className="rounded-full bg-[#edeeef] px-2 py-0.5 text-xs text-[#727785]">
                      {postsData?.totalElements ?? '—'}
                    </span>
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeCategorySlug === cat.slug
                          ? 'bg-[#d8e2ff] font-semibold text-[#0058be]'
                          : 'text-[#424754] hover:bg-[#f3f4f5]'
                      }`}
                    >
                      <span>{cat.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tag Cloud */}
            {tags.length > 0 && (
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#424754]">
                  <span className="material-symbols-outlined text-base text-[#0058be]">tag</span>
                  Đám mây từ khóa
                </h3>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {tags.slice(0, 20).map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/?tag=${tag.slug}`}
                      className={`rounded-full border border-[#c2c6d6] transition-all hover:border-[#0058be] hover:bg-[#d8e2ff] hover:text-[#0058be] hover:shadow-md ${getTagStyleClass(tag.postCount)}`}
                      title={`${tag.postCount || 0} bài viết`}
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Write CTA */}
            <div className="overflow-hidden rounded-xl border border-[#d8e2ff] bg-gradient-to-br from-[#0058be] to-[#2170e4] p-5 text-white">
              <div className="mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">edit_note</span>
                <h3 className="font-bold">Bắt đầu viết</h3>
              </div>
              <p className="mt-1 text-sm text-blue-100">
                Chia sẻ kiến thức của bạn với cộng đồng.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0058be] transition-all hover:bg-blue-50"
              >
                Đăng ký ngay
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────
function ArticleSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
      <div className="h-48 animate-pulse bg-[#edeeef]" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#edeeef]" />
        <div className="h-4 w-full animate-pulse rounded bg-[#edeeef]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#edeeef]" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#edeeef]" />
      </div>
    </div>
  );
}

export default HomePage;
