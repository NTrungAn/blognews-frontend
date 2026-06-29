import { Link } from 'react-router-dom';
import type { ArticleDto } from '../api/blogApi';
import { getImageUrl } from '../utils/imageUrl';

interface ArticleCardProps {
  article: ArticleDto;
}

function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Ước tính thời gian đọc (200 từ/phút)
  const wordCount = article.contentMarkdown?.split(/\s+/).length ?? 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-[#edeeef]">
        <img
          src={article.coverImage ? getImageUrl(article.coverImage) : 'https://placehold.co/600x400?text=No+Image'}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category Badge */}
        {article.category && (
          <span className="absolute left-3 top-3 rounded-full bg-[#0058be] px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {article.category.name}
          </span>
        )}
        {/* Status: Draft */}
        {article.status === 'DRAFT' && (
          <span className="absolute right-3 top-3 rounded-full bg-[#ffdad6] px-2.5 py-0.5 text-xs font-semibold text-[#ba1a1a]">
            Nháp
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#191c1d] transition-colors group-hover:text-[#0058be]">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#424754]">
            {article.summary || 'Chưa có tóm tắt cho bài viết này.'}
          </p>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-[#edeeef] px-2 py-0.5 text-xs text-[#424754]"
              >
                #{tag.name}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="rounded-md bg-[#edeeef] px-2 py-0.5 text-xs text-[#727785]">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-[#f3f4f5] pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8e2ff] text-xs font-bold uppercase text-[#0058be]">
              {article.authorName ? article.authorName.charAt(0) : 'U'}
            </div>
            <span className="text-xs font-medium text-[#424754]">
              {article.authorName || 'Ẩn danh'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#727785]">
            {(article.likesCount ?? 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm text-rose-500">favorite</span>
                {article.likesCount!.toLocaleString('vi-VN')}
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {readTime} phút
            </span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ArticleCard;
