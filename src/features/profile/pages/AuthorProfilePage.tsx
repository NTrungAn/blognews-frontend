import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import blogApi from '../../../api/blogApi';
import ArticleCard from '../../../components/ArticleCard';
import { getImageUrl } from '../../../utils/imageUrl';
import { useAuth } from '../../../contexts/AuthContext';

const AuthorProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const {
    data: authorProfile,
    isLoading: isLoadingProfile,
    isError: isErrorProfile,
    error: errorProfile,
  } = useQuery({
    queryKey: ['authorProfile', username],
    queryFn: () => blogApi.getPublicProfile(username!),
    enabled: !!username,
  });

  const {
    data: authorPostsPage,
    isLoading: isLoadingPosts,
    isError: isErrorPosts,
  } = useQuery({
    queryKey: ['authorPosts', username],
    queryFn: () => blogApi.getAuthorPosts(username!, 0, 10),
    enabled: !!username,
  });

  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);

  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    isError: isErrorFollowers,
  } = useQuery({
    queryKey: ['authorFollowers', username],
    queryFn: () => blogApi.getAuthorFollowers(username!, 0, 100),
    enabled: isFollowersModalOpen && !!username,
  });

  const followMutation = useMutation({
    mutationFn: () => blogApi.followUser(username!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['authorProfile', username] });
      const previousProfile = queryClient.getQueryData(['authorProfile', username]);
      
      queryClient.setQueryData(['authorProfile', username], (old: any) => ({
        ...old,
        followersCount: (old?.followersCount || 0) + 1,
        isFollowing: true,
      }));

      return { previousProfile };
    },
    onError: (_err, _newFollow, context) => {
      queryClient.setQueryData(['authorProfile', username], context?.previousProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorProfile', username] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => blogApi.unfollowUser(username!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['authorProfile', username] });
      const previousProfile = queryClient.getQueryData(['authorProfile', username]);
      
      queryClient.setQueryData(['authorProfile', username], (old: any) => ({
        ...old,
        followersCount: Math.max((old?.followersCount || 1) - 1, 0),
        isFollowing: false,
      }));

      return { previousProfile };
    },
    onError: (_err, _newFollow, context) => {
      queryClient.setQueryData(['authorProfile', username], context?.previousProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorProfile', username] });
    },
  });

  const handleToggleFollow = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thực hiện chức năng theo dõi!');
      return;
    }
    if (authorProfile?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent"></div>
      </div>
    );
  }

  if (isErrorProfile || !authorProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Không tìm thấy tác giả</h2>
        <p className="text-gray-600">{(errorProfile as any)?.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu hồ sơ.'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header Profile */}
      <div className="mb-10 overflow-hidden rounded-2xl bg-white shadow-sm">
        {/* Cover Image */}
        <div className="relative h-52 w-full">
          {authorProfile.coverImage ? (
            <img
              src={getImageUrl(authorProfile.coverImage)}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-[#0058be] to-[#2170e4]" />
          )}
        </div>
        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-4 px-8 pb-8 text-center sm:flex-row sm:items-end sm:text-left sm:-mt-16">
          <div className="relative -mt-16 sm:mt-0 flex-shrink-0">
            <img
              src={authorProfile.avatar ? getImageUrl(authorProfile.avatar) : 'https://placehold.co/150x150?text=Avatar'}
              alt={authorProfile.fullName}
              className="h-28 w-28 rounded-full object-cover shadow-lg border-4 border-white"
            />
          </div>
          <div className="flex-1 sm:pb-2">
            <h1 className="text-3xl font-bold text-gray-900">{authorProfile.fullName}</h1>
            <p className="mt-1 font-medium text-[#0058be]">@{authorProfile.username}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-6 sm:justify-start">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xl font-bold text-gray-900">{authorProfile.totalPosts}</span>
                <span className="text-sm text-gray-500">Bài viết</span>
              </div>
              <button
                onClick={() => setIsFollowersModalOpen(true)}
                className="flex flex-col items-center sm:items-start hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
              >
                <span className="text-xl font-bold text-gray-900">{authorProfile.followersCount}</span>
                <span className="text-sm text-gray-500 hover:underline">Người theo dõi</span>
              </button>
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xl font-bold text-gray-900">{authorProfile.followingCount}</span>
                <span className="text-sm text-gray-500">Đang theo dõi</span>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-gray-600">
              {authorProfile.biography || 'Tác giả này chưa cập nhật tiểu sử.'}
            </p>
          </div>

          {(!isAuthenticated || user?.username !== username) && (
            <div className="mt-4 shrink-0 sm:mt-0 sm:pb-2">
              <button
                onClick={handleToggleFollow}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                className={`min-w-[120px] rounded-full px-6 py-2.5 font-semibold shadow-sm transition-all ${
                  authorProfile.isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-[#0058be] text-white hover:bg-[#004a9e]'
                }`}
              >
                {authorProfile.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Posts */}
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Bài viết đã xuất bản</h2>
        
        {isLoadingPosts ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 animate-pulse rounded-xl bg-gray-200"></div>
            ))}
          </div>
        ) : isErrorPosts ? (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">Lỗi tải danh sách bài viết.</div>
        ) : authorPostsPage?.content && authorPostsPage.content.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {authorPostsPage.content.map((post) => (
              <ArticleCard key={post.id} article={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">Tác giả này chưa có bài viết nào được xuất bản.</p>
          </div>
        )}
      </div>

      {/* Modal Người theo dõi */}
      {isFollowersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-scale-in">
            {/* Modal Header */}
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0058be]">group</span>
                Người theo dõi ({authorProfile.followersCount})
              </h3>
              <button
                onClick={() => setIsFollowersModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[350px] overflow-y-auto pr-1">
              {isLoadingFollowers ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/4 rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isErrorFollowers ? (
                <p className="py-8 text-center text-sm text-rose-500">
                  Không thể tải danh sách người theo dõi. Vui lòng thử lại sau.
                </p>
              ) : !followersData || followersData.content.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">group_off</span>
                  <p className="text-sm">Chưa có người theo dõi nào.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {followersData.content.map((person) => (
                    <div key={person.id} className="flex items-center gap-3 py-3">
                      <img
                        src={person.avatar ? getImageUrl(person.avatar) : 'https://placehold.co/100x100?text=Avatar'}
                        alt={person.fullName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {person.fullName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{person.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-gray-100 pt-3">
              <button
                onClick={() => setIsFollowersModalOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default AuthorProfilePage;
