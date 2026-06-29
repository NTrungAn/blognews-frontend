import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import blogApi from '../../../api/blogApi';
import Pagination from '../../../components/Pagination';
import ArticleCard from '../../../components/ArticleCard';

function MyBookmarksPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-bookmarks', page],
    queryFn: () =>
      blogApi.getMyBookmarks({ pageNo: page, pageSize: 6 }).then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#191c1d]">Bài viết đã lưu</h1>
            <p className="mt-2 text-[#727785]">Xem lại những bài viết bạn đã đánh dấu bookmark</p>
          </div>
          {data && (
            <span className="rounded-full bg-[#d8e2ff] px-3 py-1 text-sm font-semibold text-[#0058be]">
              Đã lưu: {data.totalElements}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-72 flex-col rounded-2xl bg-white p-4 shadow-sm">
                <div className="h-40 animate-pulse rounded-xl bg-[#edeeef]" />
                <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-[#edeeef]" />
                <div className="mt-2 h-6 animate-pulse rounded bg-[#edeeef]" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-[#ffdad6] bg-[#fff4f3] p-6 text-center text-[#ba1a1a]">
            Không thể tải danh sách bài viết đã lưu. Vui lòng thử lại sau.
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#c2c6d6] bg-white py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f5ff]">
              <span className="material-symbols-outlined text-3xl text-[#0058be]">bookmark_border</span>
            </div>
            <h3 className="text-lg font-bold text-[#191c1d]">Chưa có bài viết nào</h3>
            <p className="mt-1 text-[#727785]">Bạn chưa lưu bài viết nào. Hãy khám phá và lưu lại những bài hay nhé!</p>
            <Link
              to="/"
              className="mt-6 rounded-lg bg-[#0058be] px-6 py-2.5 font-medium text-white transition-all hover:brightness-110"
            >
              Khám phá bài viết
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.content.map((post) => (
                <ArticleCard key={post.id} article={post} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookmarksPage;
