import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryArticle {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  date: string;
  slug: string;
}

interface CategoryBlockProps {
  categoryName: string;
  categorySlug?: string;
  articles?: CategoryArticle[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockArticles: CategoryArticle[] = [
  {
    id: 'mock-1',
    title: 'Hiểu rõ về Virtual DOM trong React',
    excerpt: 'Tìm hiểu cách React tối ưu hóa quá trình render với Virtual DOM và thuật toán Diffing.',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60',
    date: '20 Th06, 2026',
    slug: 'hieu-ro-ve-virtual-dom',
  },
  {
    id: 'mock-2',
    title: 'Hướng dẫn sử dụng TailwindCSS hiệu quả',
    excerpt: 'Các best practices khi sử dụng TailwindCSS trong dự án quy mô lớn để code luôn sạch sẽ.',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60',
    date: '19 Th06, 2026',
    slug: 'huong-dan-tailwindcss',
  },
  {
    id: 'mock-3',
    title: 'Quản lý state với Zustand thay vì Redux',
    excerpt: 'Tại sao Zustand đang trở thành thư viện quản lý state được ưa chuộng nhất hiện nay.',
    imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=60',
    date: '18 Th06, 2026',
    slug: 'quan-ly-state-zustand',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CategoryBlock({
  categoryName,
  categorySlug = '#',
  articles = mockArticles,
}: CategoryBlockProps) {
  // Đảm bảo chỉ hiển thị tối đa 3 bài viết theo yêu cầu lưới
  const displayArticles = articles.slice(0, 3);

  return (
    <section className="py-8" aria-labelledby={`category-${categorySlug}`}>
      {/* ── Header: Flexbox ── */}
      <div className="mb-6 flex items-center justify-between">
        <h2
          id={`category-${categorySlug}`}
          className="text-2xl font-bold tracking-tight text-[#191c1d]"
        >
          {categoryName}
        </h2>
        <Link
          to={`/category/${categorySlug}`}
          className="text-sm font-medium text-[#0058be] transition-all hover:text-[#004799] hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      {/* ── Grid: 3 Cột ── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {displayArticles.map((article) => (
          <article
            key={article.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-[#E5E7EB] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Ảnh bìa */}
            <Link to={`/blog/${article.slug}`} className="block overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                loading="lazy"
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            {/* Nội dung thẻ */}
            <div className="flex flex-1 flex-col p-4">
              <Link to={`/blog/${article.slug}`}>
                <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-[#191c1d] transition-colors group-hover:text-[#0058be]">
                  {article.title}
                </h3>
              </Link>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-[#424754]">
                {article.excerpt}
              </p>
              <div className="mt-4 text-xs font-medium text-[#727785]">
                {article.date}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
