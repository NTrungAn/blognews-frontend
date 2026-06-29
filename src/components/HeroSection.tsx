import { Link } from 'react-router-dom';
import type { ArticleDto } from '../api/blogApi';
import { getImageUrl } from '../utils/imageUrl';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  authorName: string;
  imageUrl: string;
  date: string;
  slug: string;
}

interface HeroSectionProps {
  /** Bài viết nổi bật chính (cột trái). Nếu không truyền, dùng mock data. */
  featuredArticle?: ArticleDto;
  /** Danh sách tin nóng (cột phải, tối đa 3). Nếu không truyền, dùng mock data. */
  trendingArticles?: ArticleDto[];
}

// ─── Helper: Chuyển đổi ArticleDto → HeroArticle ──────────────────────────────

function toHeroArticle(dto: ArticleDto): HeroArticle {
  return {
    id: dto.id,
    title: dto.title,
    excerpt: dto.summary || 'Chưa có tóm tắt cho bài viết này.',
    category: dto.category?.name || 'Chung',
    authorName: dto.authorName || 'Ẩn danh',
    imageUrl: dto.coverImage
      ? getImageUrl(dto.coverImage)
      : 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
    date: new Date(dto.createdAt).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    slug: dto.slug,
  };
}

// ─── Mock Data (Fallback) ─────────────────────────────────────────────────────

const mockFeaturedArticle: HeroArticle = {
  id: 'featured-001',
  title: 'Hành trình xây dựng hệ thống Blog CMS từ con số 0 với Spring Boot & React',
  excerpt:
    'Khám phá kiến trúc Backend RESTful API với Spring Boot 4, tích hợp PostgreSQL và Flyway Migration, cùng giao diện Frontend hiện đại sử dụng React 18, TailwindCSS và React Query.',
  category: 'Hướng dẫn',
  authorName: 'Trung An',
  imageUrl:
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop&q=80',
  date: '20 Th06, 2026',
  slug: '#',
};

const mockTrendingArticles: HeroArticle[] = [
  {
    id: 'trending-001',
    title: 'Tối ưu hiệu năng React với useMemo, useCallback và React.memo',
    excerpt: 'Phân tích sâu 3 kỹ thuật quan trọng giúp ứng dụng React nhanh hơn.',
    category: 'Frontend',
    authorName: 'Minh Khôi',
    imageUrl:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60',
    date: '19 Th06, 2026',
    slug: '#',
  },
  {
    id: 'trending-002',
    title: 'Bảo mật API với JWT và Spring Security 6: Hướng dẫn toàn diện',
    excerpt: 'Triển khai xác thực và phân quyền JWT đúng chuẩn production.',
    category: 'Backend',
    authorName: 'Hoàng Nam',
    imageUrl:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60',
    date: '18 Th06, 2026',
    slug: '#',
  },
  {
    id: 'trending-003',
    title: 'Docker & CI/CD Pipeline: Triển khai ứng dụng Java lên AWS ECS',
    excerpt: 'Tự động hóa quy trình build, test và deploy với GitHub Actions.',
    category: 'DevOps',
    authorName: 'Thanh Hà',
    imageUrl:
      'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=60',
    date: '17 Th06, 2026',
    slug: '#',
  },
];

// ─── Category Badge ───────────────────────────────────────────────────────────

function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#0058be] px-3 py-1 text-xs font-semibold text-white shadow-sm">
      {name}
    </span>
  );
}

// ─── HeroSection Component ────────────────────────────────────────────────────

function HeroSection({ featuredArticle, trendingArticles }: HeroSectionProps) {
  // Chuyển đổi dữ liệu thực sang HeroArticle, hoặc dùng mock data làm dự phòng
  const featured: HeroArticle = featuredArticle
    ? toHeroArticle(featuredArticle)
    : mockFeaturedArticle;

  const trending: HeroArticle[] = trendingArticles && trendingArticles.length > 0
    ? trendingArticles.slice(0, 3).map(toHeroArticle)
    : mockTrendingArticles;

  const featuredLink = featured.slug === '#' ? '#' : `/blog/${featured.slug}`;

  return (
    <section
      id="hero-section"
      className="border-b border-[#E5E7EB] bg-white"
      aria-label="Bài viết nổi bật và tin nóng"
    >
      <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        {/* ── Section Header ─────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-[#0058be]">
            local_fire_department
          </span>
          <h2 className="text-xl font-bold tracking-tight text-[#191c1d]">
            Bài viết nổi bật
          </h2>
          <div className="ml-auto hidden items-center gap-1.5 text-sm font-semibold text-[#0058be] sm:flex">
            <Link
              to="/blog"
              className="group flex items-center gap-1 transition-all hover:gap-2"
            >
              Xem tất cả
              <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* ── Grid Layout: 12 cột ─────────────────────────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ── Cột trái: Bài viết chính (8/12 cột) ────────── */}
          <article
            className="group lg:col-span-8"
            aria-label={`Bài viết nổi bật: ${featured.title}`}
          >
            <Link to={featuredLink} className="block">
              {/* Ảnh bìa lớn */}
              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] shadow-sm">
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  loading="eager"
                  className="aspect-[16/9] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>

              {/* Nội dung bài viết chính */}
              <div className="mt-5">
                {/* Badge danh mục + thẻ nổi bật */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#d8e2ff] px-3 py-1 text-xs font-semibold text-[#0058be]">
                    <span className="material-symbols-outlined text-sm">star</span>
                    Nổi bật
                  </span>
                  <CategoryBadge name={featured.category} />
                </div>

                {/* Tiêu đề */}
                <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-[#191c1d] transition-colors group-hover:text-[#0058be] md:text-3xl lg:text-3xl">
                  {featured.title}
                </h1>

                {/* Tóm tắt */}
                <p className="mt-3 line-clamp-3 text-base leading-relaxed text-[#424754] md:text-[15px]">
                  {featured.excerpt}
                </p>

                {/* Tác giả + Ngày */}
                <div className="mt-5 flex items-center gap-3">
                  {/* Avatar tác giả */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8e2ff] text-sm font-bold uppercase text-[#0058be]">
                    {featured.authorName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#191c1d]">
                      {featured.authorName}
                    </span>
                    <span className="text-xs text-[#727785]">
                      {featured.date}
                    </span>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-[#0058be] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                    Đọc ngay
                    <span className="material-symbols-outlined text-base">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          </article>

          {/* ── Cột phải: Tin nóng (4/12 cột) ──────────────── */}
          <aside className="lg:col-span-4" aria-label="Bài viết thịnh hành">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-lg text-[#ba1a1a]">
                trending_up
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#424754]">
                Tin nóng
              </h3>
              <div className="ml-auto h-px flex-1 bg-[#E5E7EB]" />
            </div>

            <div className="space-y-5">
              {trending.map((article, index) => {
                const articleLink = article.slug === '#' ? '#' : `/blog/${article.slug}`;
                return (
                  <article
                    key={article.id}
                    className="group"
                    aria-label={`Bài viết thịnh hành ${index + 1}: ${article.title}`}
                  >
                    <Link
                      to={articleLink}
                      className="flex flex-row items-start gap-4 rounded-lg p-2 transition-colors hover:bg-[#f8f9fa]"
                    >
                      {/* Số thứ tự */}
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edeeef] text-xs font-bold text-[#727785]">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* Nội dung */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                          <CategoryBadge name={article.category} />
                          <span className="text-xs text-[#727785]">{article.date}</span>
                        </div>
                        <h4 className="line-clamp-2 text-md font-semibold leading-snug text-[#191c1d] transition-colors group-hover:text-[#0058be]">
                          {article.title}
                        </h4>
                        <p className="mt-1 line-clamp-1 text-xs text-[#727785]">
                          {article.excerpt}
                        </p>
                        {/* Tác giả */}
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d8e2ff] text-[10px] font-bold uppercase text-[#0058be]">
                            {article.authorName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-[#424754]">
                            {article.authorName}
                          </span>
                        </div>
                      </div>

                      {/* Ảnh thumbnail */}
                      <div className="shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB]">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          loading="lazy"
                          className="h-24 w-24 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </Link>

                    {/* Đường phân cách giữa các bài tin nóng */}
                    {index < trending.length - 1 && (
                      <div className="mt-4 h-px bg-[#E5E7EB]" />
                    )}
                  </article>
                );
              })}
            </div>
          </aside>
        </div>

        {/* ── Mobile CTA ───────────────────────────────────── */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0058be] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
          >
            Xem tất cả bài viết
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
