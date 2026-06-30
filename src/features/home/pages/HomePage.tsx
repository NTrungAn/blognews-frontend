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

  // Fetch popular authors
  const { data: popularAuthors = [] } = useQuery({
    queryKey: ['popular-authors'],
    queryFn: () => blogApi.getPopularAuthors(),
    staleTime: 10 * 60 * 1000,
  });

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
      {/* ── Trending Tags Carousel ──────────────────────────────── */}
      {!activeCategorySlug && currentPage === 0 && tags.length > 0 && (
        <section className="bg-white border-b border-[#E5E7EB] py-3.5">
          <div className="mx-auto max-w-7xl px-6 flex items-center gap-3 overflow-hidden">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#424754] shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#0058be]">trending_up</span>
              Xu hướng:
            </span>
            <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              {tags.slice(0, 10).map((tag) => (
                <Link
                  key={tag.id}
                  to={`/?tag=${tag.slug}`}
                  className="shrink-0 rounded-full bg-[#f3f4f5] px-3.5 py-1.5 text-xs font-medium text-[#424754] border border-[#E5E7EB] hover:bg-[#d8e2ff] hover:text-[#0058be] hover:border-[#0058be]/30 transition-all shadow-sm"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* ── Top Creators Section ────────────────────────────────── */}
      {!activeCategorySlug && currentPage === 0 && popularAuthors.length > 0 && (
        <section className="bg-[#f0f4f9] border-b border-[#E5E7EB] py-10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#191c1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">groups</span>
                Tác giả tiêu biểu
              </h2>
              <span className="text-xs text-[#727785] uppercase tracking-wider font-semibold">Cộng đồng NewsFlow</span>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {popularAuthors.map((author) => (
                <div key={author.id} className="group relative flex flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center shadow-sm hover:shadow-md transition-all">
                  {/* Avatar */}
                  <Link to={`/author/${author.username}`} className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-transparent group-hover:ring-[#0058be] transition-all">
                    {author.avatar ? (
                      <img src={getImageUrl(author.avatar)} alt={author.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#d8e2ff] font-serif text-xl font-bold uppercase text-[#0058be]">
                        {author.fullName.charAt(0)}
                      </div>
                    )}
                  </Link>

                  <Link to={`/author/${author.username}`} className="mt-3 block font-bold text-[#191c1d] hover:text-[#0058be] transition-colors line-clamp-1">
                    {author.fullName}
                  </Link>
                  <span className="text-xs text-[#727785]">@{author.username}</span>

                  <p className="mt-2 line-clamp-2 min-h-[32px] text-xs text-[#424754] leading-relaxed">
                    {author.biography || 'Đóng góp nội dung cho NewsFlow.'}
                  </p>

                  <div className="mt-4 flex items-center justify-around w-full border-t border-gray-100 pt-3 text-[11px] text-[#727785]">
                    <div className="text-center">
                      <span className="block font-bold text-[#191c1d]">{author.totalPosts}</span>
                      Bài viết
                    </div>
                    <div className="h-4 w-px bg-gray-100" />
                    <div className="text-center">
                      <span className="block font-bold text-[#191c1d]">{author.followersCount}</span>
                      Followers
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

            {/* Newsletter Subscription Widget */}
            <div className="relative overflow-hidden rounded-xl border border-[#d8e2ff] bg-white/70 p-5 shadow-sm backdrop-blur-md">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-50/50 -z-10" />
              <div className="mb-2 flex items-center gap-2 text-[#0058be]">
                <span className="material-symbols-outlined text-xl">mail</span>
                <h3 className="font-bold text-[#191c1d]">Nhận bản tin mới nhất</h3>
              </div>
              <p className="text-xs text-[#727785] leading-relaxed">
                Đăng ký email để nhận những phân tích, tin tức nóng hổi trực tiếp vào hộp thư của bạn mỗi tuần.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký nhận bản tin!'); }} className="mt-4 space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Địa chỉ email của bạn"
                  className="w-full rounded-lg border border-[#c2c6d6] px-3.5 py-2 text-xs text-[#191c1d] placeholder:text-[#727785] focus:border-[#0058be] focus:outline-none focus:ring-2 focus:ring-[#0058be]/10"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#0058be] py-2 text-xs font-bold text-white transition-all hover:brightness-110 shadow-sm"
                >
                  Đăng ký ngay
                </button>
              </form>
            </div>

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
