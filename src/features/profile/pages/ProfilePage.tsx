import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import blogApi, { type UserUpdateRequest, type FollowerDto } from '../../../api/blogApi';
import { useAuth } from '../../../contexts/AuthContext';
import { getImageUrl } from '../../../utils/imageUrl';
import ArticleCard from '../../../components/ArticleCard';
import Pagination from '../../../components/Pagination';

function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'articles' | 'followers' | 'following' | 'settings'>('settings');
  const [form, setForm] = useState<UserUpdateRequest>({
    fullName: '',
    avatar: '',
    coverImage: '',
    biography: '',
    currentPassword: '',
    newPassword: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch User Profile Stats
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => blogApi.getMyProfileStats().then((r) => r.data),
    enabled: !!user,
  });

  const [pageNo, setPageNo] = useState(0);
  const pageSize = 6;

  // Fetch My Posts
  const { data: myPostsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['my-posts', pageNo],
    queryFn: () => blogApi.getMyPosts({ pageNo, pageSize }).then((r) => r.data),
    enabled: activeTab === 'articles',
  });

  // Fetch Followers
  const { data: followersData, isLoading: isFollowersLoading, isError: isFollowersError } = useQuery({
    queryKey: ['my-followers'],
    queryFn: () => blogApi.getMyFollowers(),
    enabled: activeTab === 'followers',
    staleTime: 30_000,
  });

  // Fetch Following
  const { data: followingData, isLoading: isFollowingLoading, isError: isFollowingError } = useQuery({
    queryKey: ['my-following'],
    queryFn: () => blogApi.getMyFollowing(),
    enabled: activeTab === 'following',
    staleTime: 30_000,
  });

  useEffect(() => {
    if (userProfile) {
      setForm((prev) => ({
        ...prev,
        fullName: userProfile.fullName || '',
        avatar: userProfile.avatar || '',
        coverImage: userProfile.coverImage || '',
        biography: userProfile.biography || '',
      }));
    }
  }, [userProfile]);

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: (data: UserUpdateRequest) => blogApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
      setSuccessMsg('Cập nhật thông tin thành công!');
      setErrorMsg('');
      // Reset password fields
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setSuccessMsg('');
      setErrorMsg(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại thông tin.');
    },
  });

  // Mutation for uploading avatar
  const uploadMutation = useMutation({
    mutationFn: (file: File) => blogApi.uploadImage(file),
    onSuccess: (response) => {
      setForm((prev) => ({ ...prev, avatar: response.data.url }));
      setErrorMsg('');
    },
    onError: () => {
      setErrorMsg('Tải ảnh lên thất bại. Vui lòng thử lại.');
    }
  });

  // Mutation for uploading cover image
  const uploadCoverMutation = useMutation({
    mutationFn: (file: File) => blogApi.uploadImage(file),
    onSuccess: (response) => {
      const newCoverUrl = response.data.url;
      // Cập nhật local form state
      setForm((prev) => ({ ...prev, coverImage: newCoverUrl }));
      // Auto-save ngay lập tức vào DB – không cần bấm "Lưu Thay Đổi"
      blogApi.updateProfile({ coverImage: newCoverUrl }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['profile-stats'] });
        setSuccessMsg('Đã cập nhật ảnh nền thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
      });
      setErrorMsg('');
    },
    onError: () => {
      setErrorMsg('Tải ảnh nền thất bại. Vui lòng thử lại.');
    }
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Vui lòng chọn định dạng ảnh hợp lệ (jpg, png, webp)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ảnh không được vượt quá 5MB');
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Vui lòng chọn định dạng ảnh hợp lệ (jpg, png, webp)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ảnh nền không được vượt quá 10MB');
        return;
      }
      uploadCoverMutation.mutate(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UserUpdateRequest = { ...form };
    
    // Chỉ gửi mật khẩu nếu người dùng nhập
    if (!payload.currentPassword || !payload.newPassword) {
      delete payload.currentPassword;
      delete payload.newPassword;
    } else if (payload.newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    updateMutation.mutate(payload);
  };

  if (!user) return null;

  if (isProfileLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f8f9fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
      </div>
    );
  }

  const displayInitial = userProfile?.fullName ? userProfile.fullName.charAt(0) : user.username.charAt(0);
  const avatarUrl = userProfile?.avatar || null;
  const userRole = userProfile?.role || user.role;

  // Map roles to nicer display names
  const displayRole = userRole === 'ADMIN' ? 'Administrator' : 
                      userRole === 'EDITOR' ? 'Senior Editor' : 
                      userRole === 'USER' ? 'Author' : 'Reader';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <div className="p-6 md:p-10 mx-auto max-w-7xl">
        
        {/* Hero Profile Section */}
        <section className="mb-10">
          {/* Cover Image */}
          <div className="relative rounded-xl overflow-hidden h-52 group">
            {userProfile?.coverImage ? (
              <img
                src={getImageUrl(userProfile.coverImage)}
                alt="Cover"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-[#0058be] to-[#2170e4] opacity-90"></div>
            )}
            {/* Overlay nút thay ảnh nền */}
            <label className="absolute bottom-3 right-3 hidden group-hover:flex items-center gap-1.5 cursor-pointer rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-black/70">
              <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
              {uploadCoverMutation.isPending ? 'Đang tải...' : 'Đổi ảnh nền'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverSelect}
                disabled={uploadCoverMutation.isPending}
              />
            </label>
          </div>
          <div className="relative px-6 flex flex-col md:flex-row md:items-start gap-6">
            <div className="relative inline-block w-max -mt-16">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-4 border-[#f8f9fa] bg-[#d8e2ff] text-5xl font-bold uppercase text-[#0058be] shadow-md">
                {avatarUrl ? (
                  <img src={getImageUrl(avatarUrl)} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  displayInitial
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border-4 border-[#f8f9fa] bg-green-500" title="Online"></div>
            </div>
            <div className="flex-1 pt-3 md:pt-4 pb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight text-[#191c1d]">{userProfile?.fullName || user.username}</h2>
                <span className="rounded-full bg-[#d6e0f3] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#3d4756]">
                  {displayRole}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-base text-[#555f6f]">
                {userProfile?.biography && userProfile.biography.trim() !== ''
                  ? userProfile.biography
                  : 'Thành viên của hệ thống Blog CMS. Đam mê với việc tạo ra những bài viết chất lượng và lan tỏa tri thức đến cộng đồng.'}
              </p>
            </div>
            <div className="flex gap-2 md:pt-4 pb-2">
              <button 
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 rounded-lg bg-[#0058be] px-6 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Chỉnh sửa
              </button>
              <button className="rounded-lg border border-[#c2c6d6] p-2 text-[#555f6f] transition-colors hover:bg-[#edeeef]">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Bài viết */}
          <div className="flex items-center gap-4 rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d8e2ff] text-[#0058be]">
              <span className="material-symbols-outlined">article</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#555f6f]">Bài Viết</p>
              <p className="text-2xl font-bold">{userProfile?.totalPosts ?? 0}</p>
            </div>
          </div>
          {/* Bình luận */}
          <div className="flex items-center gap-4 rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#d6e0f3] text-[#555f6f]">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#555f6f]">Bình Luận</p>
              <p className="text-2xl font-bold">{userProfile?.totalComments ?? 0}</p>
            </div>
          </div>
          {/* Người theo dõi */}
          <button
            className="flex items-center gap-4 rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm text-left hover:border-[#0058be] hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveTab('followers')}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8f5e9] text-[#2e7d32]">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#555f6f]">Người Theo Dõi</p>
              <p className="text-2xl font-bold">{userProfile?.followersCount ?? 0}</p>
            </div>
          </button>
          {/* Đang theo dõi */}
          <button
            className="flex items-center gap-4 rounded-xl border border-[#c2c6d6] bg-white p-5 shadow-sm text-left hover:border-[#0058be] hover:shadow-md transition-all cursor-pointer"
            onClick={() => setActiveTab('following')}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#fff3e0] text-[#e65100]">
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-[#555f6f]">Đang Theo Dõi</p>
              <p className="text-2xl font-bold">{userProfile?.followingCount ?? 0}</p>
            </div>
          </button>
        </section>

        {/* Tabbed Interface */}
        <section className="overflow-hidden rounded-xl border border-[#c2c6d6] bg-white shadow-sm">
          <div className="border-b border-[#c2c6d6] px-6">
            <div className="flex gap-6 overflow-x-auto">
              {([
                { key: 'articles', label: 'Bài Viết Của Tôi', icon: 'article' },
                { key: 'followers', label: `Người Theo Dõi${userProfile?.followersCount ? ` (${userProfile.followersCount})` : ''}`, icon: 'group' },
                { key: 'following', label: `Đang Theo Dõi${userProfile?.followingCount ? ` (${userProfile.followingCount})` : ''}`, icon: 'person_add' },
                { key: 'settings', label: 'Cài Đặt Tài Khoản', icon: 'settings' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap py-4 text-sm font-medium transition-all ${
                    activeTab === tab.key ? 'text-[#0058be]' : 'text-[#555f6f] hover:text-[#0058be]'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                  {activeTab === tab.key && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#0058be]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tab: My Articles */}
          {activeTab === 'articles' && (
            <div className="p-6 md:p-10">
              {isPostsLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                </div>
              ) : myPostsData?.content && myPostsData.content.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {myPostsData.content.map((post) => (
                      <ArticleCard key={post.id} article={post} />
                    ))}
                  </div>
                  {myPostsData.totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={myPostsData.pageNo}
                        totalPages={myPostsData.totalPages}
                        onPageChange={setPageNo}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c2c6d6] bg-[#f8f9fa] text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-[#727785]">article</span>
                  <h3 className="text-lg font-semibold text-[#191c1d]">Chưa có bài viết nào</h3>
                  <p className="text-sm text-[#555f6f]">Bạn chưa xuất bản bài viết nào. Hãy tạo bài viết mới nhé!</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Followers */}
          {activeTab === 'followers' && (
            <div className="p-6 md:p-8">
              {isFollowersLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                </div>
              ) : isFollowersError ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 bg-red-50 text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-red-400">error</span>
                  <h3 className="text-lg font-semibold text-red-700">Không thể tải danh sách</h3>
                  <p className="text-sm text-red-500">Vui lòng đăng nhập lại hoặc thử lại sau.</p>
                </div>
              ) : followersData?.content && followersData.content.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {followersData.content.map((person: FollowerDto) => (
                    <Link
                      key={person.id}
                      to={`/author/${person.username}`}
                      className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm transition-all hover:border-[#0058be] hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d8e2ff] text-lg font-bold uppercase text-[#0058be]">
                        {person.avatar ? (
                          <img src={getImageUrl(person.avatar)} alt={person.fullName} className="h-full w-full object-cover" />
                        ) : (
                          (person.fullName || person.username).charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#191c1d]">{person.fullName || person.username}</p>
                        <p className="truncate text-sm text-[#727785]">@{person.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c2c6d6] bg-[#f8f9fa] text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-[#727785]">group</span>
                  <h3 className="text-lg font-semibold text-[#191c1d]">Chưa có người theo dõi</h3>
                  <p className="text-sm text-[#555f6f]">Hãy viết những bài viết thú vị để thu hút người theo dõi!</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Following */}
          {activeTab === 'following' && (
            <div className="p-6 md:p-8">
              {isFollowingLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0058be] border-t-transparent" />
                </div>
              ) : isFollowingError ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 bg-red-50 text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-red-400">error</span>
                  <h3 className="text-lg font-semibold text-red-700">Không thể tải danh sách</h3>
                  <p className="text-sm text-red-500">Vui lòng đăng nhập lại hoặc thử lại sau.</p>
                </div>
              ) : followingData?.content && followingData.content.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {followingData.content.map((person: FollowerDto) => (
                    <Link
                      key={person.id}
                      to={`/author/${person.username}`}
                      className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-sm transition-all hover:border-[#0058be] hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d8e2ff] text-lg font-bold uppercase text-[#0058be]">
                        {person.avatar ? (
                          <img src={getImageUrl(person.avatar)} alt={person.fullName} className="h-full w-full object-cover" />
                        ) : (
                          (person.fullName || person.username).charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#191c1d]">{person.fullName || person.username}</p>
                        <p className="truncate text-sm text-[#727785]">@{person.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c2c6d6] bg-[#f8f9fa] text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-[#727785]">person_search</span>
                  <h3 className="text-lg font-semibold text-[#191c1d]">Chưa theo dõi ai</h3>
                  <p className="text-sm text-[#555f6f]">Hãy khám phá và theo dõi các tác giả bạn yêu thích!</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Account Settings */}
          {activeTab === 'settings' && (
            <div className="p-6 md:p-10 max-w-3xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {successMsg && (
                  <div className="rounded-lg bg-[#d8e2ff] p-4 text-sm font-medium text-[#001a42]">
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="rounded-lg bg-[#ffdad6] p-4 text-sm font-medium text-[#93000a]">
                    {errorMsg}
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#424754]">Họ và Tên</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Nhập họ và tên"
                      className="w-full rounded-lg border border-[#c2c6d6] px-3 py-2 text-base text-[#191c1d] focus:border-[#0058be] focus:outline-none focus:ring-1 focus:ring-[#0058be]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#424754]">Địa chỉ Email</label>
                    <input
                      type="email"
                      value={userProfile?.email || user.email}
                      disabled
                      className="w-full rounded-lg border border-[#e1e3e4] bg-[#f3f4f5] px-3 py-2 text-base text-[#727785] cursor-not-allowed"
                    />
                    <p className="text-xs text-[#727785]">Email không thể thay đổi</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#424754]">Ảnh Đại Diện</label>
                  <div className="flex items-center gap-4">
                    {form.avatar ? (
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-[#c2c6d6]">
                        <img src={getImageUrl(form.avatar)} alt="Avatar Preview" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#edeeef] text-[#727785]">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#c2c6d6] px-4 py-2 text-sm font-medium text-[#424754] transition-colors hover:bg-[#f0f5ff] hover:text-[#0058be]">
                        <span className="material-symbols-outlined text-sm">upload</span>
                        {uploadMutation.isPending ? 'Đang tải lên...' : 'Chọn ảnh từ máy'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarSelect}
                          disabled={uploadMutation.isPending}
                        />
                      </label>
                      <p className="mt-1 text-xs text-[#727785]">Chấp nhận định dạng JPG, PNG, GIF, WEBP (Max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#424754]">Tiểu sử (Biography)</label>
                  <textarea
                    rows={4}
                    value={form.biography ?? ''}
                    onChange={(e) => setForm({ ...form, biography: e.target.value })}
                    maxLength={500}
                    placeholder="Viết vài dòng giới thiệu về bản thân bạn..."
                    className="w-full rounded-lg border border-[#c2c6d6] px-3 py-2 text-base text-[#191c1d] focus:border-[#0058be] focus:outline-none focus:ring-1 focus:ring-[#0058be] resize-none"
                  />
                  <p className="text-right text-xs text-[#727785]">{(form.biography ?? '').length}/500</p>
                </div>

                <div className="mt-8 border-t border-[#e1e3e4] pt-8">
                  <h4 className="mb-4 text-lg font-bold text-[#191c1d]">Đổi Mật Khẩu</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-[#424754]">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={form.currentPassword}
                        onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                        placeholder="Để trống nếu không đổi"
                        className="w-full rounded-lg border border-[#c2c6d6] px-3 py-2 text-base text-[#191c1d] focus:border-[#0058be] focus:outline-none focus:ring-1 focus:ring-[#0058be]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-bold text-[#424754]">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                        placeholder="Ít nhất 6 ký tự"
                        className="w-full rounded-lg border border-[#c2c6d6] px-3 py-2 text-base text-[#191c1d] focus:border-[#0058be] focus:outline-none focus:ring-1 focus:ring-[#0058be]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#e1e3e4] pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="rounded-lg border border-[#c2c6d6] px-6 py-2 text-sm font-medium text-[#555f6f] transition-all hover:bg-[#edeeef]"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-lg bg-[#0058be] px-6 py-2 text-sm font-medium text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default ProfilePage;
