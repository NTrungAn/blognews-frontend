import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi from '../../../api/blogApi';
import Pagination from '../../../components/Pagination';


function MyPostsPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-posts', page],
    queryFn: () =>
      blogApi.getMyPosts({ pageNo: page, pageSize: 10 }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      deleteMutation.mutate(id);
    }
  };

  const posts = data?.content ?? [];

  return (
    <div className="min-h-screen bg-[#f8f9fa] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#191c1d]">Bài viết của tôi</h1>
            <p className="mt-1 text-sm text-[#727785]">Quản lý các bài viết bạn đã tạo</p>
          </div>
          <Link
            to="/posts/new"
            className="flex items-center gap-2 rounded-lg bg-[#0058be] px-5 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Viết bài mới
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#424754]">
              <thead className="bg-[#f8f9fa] text-xs uppercase text-[#727785]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Bài viết</th>
                  <th className="px-6 py-4 font-semibold">Danh mục</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                  <th className="px-6 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                        <p>Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#727785]">
                        <span className="material-symbols-outlined text-4xl text-[#c2c6d6]">article</span>
                        <p>Bạn chưa có bài viết nào.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#f8f9fa] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#191c1d] line-clamp-1">{post.title}</div>
                        <div className="mt-1 text-xs text-[#727785] line-clamp-1">{post.summary || 'Không có tóm tắt'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-md bg-[#edeeef] px-2 py-1 text-xs font-medium text-[#424754]">
                          {post.category?.name || 'Không có'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {post.status === 'PUBLISHED' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffdad6] px-2.5 py-0.5 text-xs font-medium text-[#ba1a1a]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ba1a1a]"></span>
                            Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/posts/${post.id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c2c6d6] text-[#424754] hover:border-[#0058be] hover:text-[#0058be] transition-colors"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
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

          {data && data.totalPages > 1 && (
            <div className="border-t border-[#E5E7EB] bg-white px-6 py-4">
              <Pagination
                currentPage={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyPostsPage;
