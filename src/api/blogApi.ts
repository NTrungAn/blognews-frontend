import axiosInstance from './axiosConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
}

export interface TagRequest {
  name: string;
  slug?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  role: string;
  biography?: string;
}

export interface UserProfileResponse extends UserResponse {
  totalPosts: number;
  totalComments: number;
  followersCount: number;
  followingCount: number;
  coverImage?: string;
}

export interface FollowerDto {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
}

export interface PublicProfileResponse {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  biography?: string;
  followersCount: number;
  followingCount: number;
  totalPosts: number;
  isFollowing: boolean;
  coverImage?: string;
}

export interface UserUpdateRequest {
  fullName?: string;
  avatar?: string;
  coverImage?: string;
  currentPassword?: string;
  newPassword?: string;
  biography?: string;
}

export interface PostRequest {
  title: string;
  slug?: string;
  summary?: string;
  contentMarkdown: string;
  coverImage?: string;
  categoryId: string;
  tagIds: string[];
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface ArticleDto {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentMarkdown: string;
  coverImage: string | null;
  status: string;
  viewCount?: number;
  likesCount?: number;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorId?: string;
  authorUsername?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  tags: Tag[];
}

export interface CommentDto {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
  };
  parentId?: string | null;
  replies?: CommentDto[];
  reactionsCount?: Record<string, number>;
}

export interface CommentRequest {
  content: string;
  parentId?: string | null;
}

export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PostLikeResponse {
  liked: boolean;
  likesCount: number;
}

// ─── Blog API ─────────────────────────────────────────────────────────────────

const blogApi = {
  /** Lấy danh sách bài viết có phân trang, lọc theo category/tag/keyword */
  getPosts: (params?: {
    pageNo?: number;
    pageSize?: number;
    categorySlug?: string;
    tagSlug?: string;
    keyword?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }) =>
    axiosInstance.get<PageResponse<ArticleDto>>('/posts', { params }),

  /** Lấy danh sách bài viết của tác giả hiện tại */
  getMyPosts: (params?: { pageNo?: number; pageSize?: number }) =>
    axiosInstance.get<PageResponse<ArticleDto>>('/posts/my-posts', { params }),

  /** Lấy chi tiết bài viết theo slug */
  getPostBySlug: (slug: string) =>
    axiosInstance.get<ArticleDto>(`/posts/slug/${slug}`),

  /** Lấy chi tiết bài viết theo ID */
  getPostById: (id: string) =>
    axiosInstance.get<ArticleDto>(`/posts/${id}`),

  /** Lấy tất cả danh mục */
  getCategories: () =>
    axiosInstance.get<Category[]>('/categories'),

  /** Lấy danh mục theo slug (kèm posts) */
  getCategoryBySlug: (slug: string) =>
    axiosInstance.get<Category>(`/categories/slug/${slug}`),

  /** Lấy tất cả tag */
  getTags: (params?: { pageNo?: number; pageSize?: number }) =>
    axiosInstance.get<PageResponse<Tag>>('/tags', { params: { pageSize: 100, ...params } }),

  // ─── Quản lý Danh mục (Admin) ───
  createCategory: (data: CategoryRequest) =>
    axiosInstance.post<Category>('/categories', data),

  updateCategory: (id: string, data: CategoryRequest) =>
    axiosInstance.put<Category>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    axiosInstance.delete(`/categories/${id}`),

  // ─── Quản lý Tag (Admin) ───
  createTag: (data: TagRequest) =>
    axiosInstance.post<Tag>('/tags', data),

  updateTag: (id: string, data: TagRequest) =>
    axiosInstance.put<Tag>(`/tags/${id}`, data),

  deleteTag: (id: string) =>
    axiosInstance.delete(`/tags/${id}`),

  /** Lấy bình luận của bài viết */
  getCommentsByPostId: (postId: string, params?: { pageNo?: number; pageSize?: number }) =>
    axiosInstance.get<PageResponse<CommentDto>>(`/posts/${postId}/comments`, { params }),

  /** Gửi bình luận */
  createComment: (postId: string, data: CommentRequest) =>
    axiosInstance.post<CommentDto>(`/posts/${postId}/comments`, data),

  /** Thêm/Cập nhật Reaction cho bình luận */
  addReaction: (postId: string, commentId: string, emoji: string) =>
    axiosInstance.post(`/posts/${postId}/comments/${commentId}/reactions`, { emoji }),

  /** Xoá Reaction khỏi bình luận */
  removeReaction: (postId: string, commentId: string) =>
    axiosInstance.delete(`/posts/${postId}/comments/${commentId}/reactions`),

  /** Kiểm tra trạng thái thích bài viết của user hiện tại */
  checkPostLikeStatus: (postId: string) =>
    axiosInstance.get<boolean>(`/posts/${postId}/like/status`),

  /** Bật/tắt thích bài viết — trả về data đã unwrap */
  togglePostLike: async (postId: string): Promise<PostLikeResponse> => {
    const response = await axiosInstance.post<PostLikeResponse>(`/posts/${postId}/like`);
    const data = response.data;
    if (typeof data === 'object' && data !== null && 'likesCount' in data) {
      return data as PostLikeResponse;
    }
    throw new Error('Phản hồi like không hợp lệ');
  },

  /** Tạo bài viết mới (multipart/form-data) */
  createPost: (data: PostRequest, coverImage?: File) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    return axiosInstance.post<ArticleDto>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Cập nhật bài viết */
  updatePost: (id: string, data: PostRequest, coverImage?: File) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }
    return axiosInstance.put<ArticleDto>(`/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Xoá bài viết */
  deletePost: (id: string) =>
    axiosInstance.delete(`/posts/${id}`),

  // ─── Quản lý User (Profile) ───
  getCurrentUser: () =>
    axiosInstance.get<UserResponse>('/users/me'),

  getMyProfileStats: () =>
    axiosInstance.get<UserProfileResponse>('/users/me/profile'),

  updateProfile: async (data: UserUpdateRequest): Promise<UserResponse> => {
    const response = await axiosInstance.put<UserResponse>('/users/me', data);
    return response.data;
  },

  // Public Profile & Author Posts
  getPublicProfile: async (username: string): Promise<PublicProfileResponse> => {
    const response = await axiosInstance.get<PublicProfileResponse>(`/users/${username}`);
    return response.data;
  },

  getAuthorPosts: async (username: string, pageNo = 0, pageSize = 10): Promise<PageResponse<ArticleDto>> => {
    const response = await axiosInstance.get<PageResponse<ArticleDto>>(`/users/${username}/posts`, {
      params: { pageNo, pageSize },
    });
    return response.data;
  },

  // Follow
  followUser: async (username: string): Promise<string> => {
    const response = await axiosInstance.post<any>(`/users/${username}/follow`);
    return response.data.message || 'Theo dõi thành công!';
  },

  unfollowUser: async (username: string): Promise<string> => {
    const response = await axiosInstance.delete<any>(`/users/${username}/follow`);
    return response.data.message || 'Đã hủy theo dõi!';
  },

  getMyFollowers: async (pageNo = 0, pageSize = 20): Promise<PageResponse<FollowerDto>> => {
    const response = await axiosInstance.get<PageResponse<FollowerDto>>('/users/me/followers', {
      params: { pageNo, pageSize },
    });
    return response.data;
  },

  getMyFollowing: async (pageNo = 0, pageSize = 20): Promise<PageResponse<FollowerDto>> => {
    const response = await axiosInstance.get<PageResponse<FollowerDto>>('/users/me/following', {
      params: { pageNo, pageSize },
    });
    return response.data;
  },

  /** Upload ảnh (avatar, cover, etc) */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ─── Quản lý Bookmarks ───
  checkBookmarkStatus: (postId: string) =>
    axiosInstance.get<boolean>(`/bookmarks/${postId}/status`),

  toggleBookmark: (postId: string) =>
    axiosInstance.post<string>(`/bookmarks/${postId}`),

  getMyBookmarks: (params?: { pageNo?: number; pageSize?: number }) =>
    axiosInstance.get<PageResponse<ArticleDto>>('/bookmarks/me', { params }),

  // ─── Quản lý User (Admin) ───
  getAllUsers: (params?: { pageNo?: number; pageSize?: number; sortBy?: string; sortDir?: string }) =>
    axiosInstance.get<PageResponse<UserResponse>>('/users', { params }),

  updateUserRole: (id: string, role: string) =>
    axiosInstance.put<UserResponse>(`/users/${id}/role`, { role }),

  deleteUser: (id: string) =>
    axiosInstance.delete(`/users/${id}`),
};


export default blogApi;
