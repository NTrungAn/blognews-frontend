import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import blogApi from '../../../api/blogApi';

export default function NotificationPage() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', 'list-page'],
    queryFn: () => blogApi.getNotifications({ pageNo: 0, pageSize: 50 }).then((res) => res.data),
  });

  const notifications = notificationsData?.content || [];

  // Mutation to mark a single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => blogApi.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation to mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => blogApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return <span className="material-symbols-outlined text-[#0058be] text-2xl">chat_bubble</span>;
      case 'REACTION':
        return <span className="material-symbols-outlined text-rose-500 text-2xl">favorite</span>;
      default:
        return <span className="material-symbols-outlined text-gray-500 text-2xl">notifications</span>;
    }
  };

  const handleNotificationClick = (id: string, read: boolean) => {
    if (!read) {
      markAsReadMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-10">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[#191c1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058be] text-3xl">notifications</span>
            Thông báo của bạn
          </h1>
          {notifications.some((n: any) => !n.read) && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-sm font-semibold text-[#0058be] hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-sm">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-[#edeeef]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-[#edeeef]" />
                    <div className="h-3 w-1/4 rounded bg-[#edeeef]" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">notifications_off</span>
              <h2 className="text-lg font-bold text-[#191c1d]">Không có thông báo nào</h2>
              <p className="text-sm text-[#727785] mt-1">Các thông báo mới về bình luận hoặc bài viết của bạn sẽ xuất hiện tại đây.</p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0058be] px-5 py-2 text-sm font-medium text-white hover:brightness-110"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif: any) => (
                <Link
                  key={notif.id}
                  to={notif.targetUrl || '#'}
                  onClick={() => handleNotificationClick(notif.id, notif.read)}
                  className={`flex items-start gap-4 p-4 transition-all hover:bg-gray-50/80 rounded-xl ${
                    !notif.read ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full bg-white p-2.5 shadow-sm ring-1 ring-gray-100 ${
                    !notif.read ? 'ring-[#0058be]/20 bg-blue-50/10' : ''
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!notif.read ? 'font-semibold text-[#191c1d]' : 'text-[#424754]'}`}>
                      {notif.content}
                    </p>
                    <time className="mt-1 block text-xs text-[#727785]">
                      {new Date(notif.createdAt).toLocaleString('vi-VN')}
                    </time>
                  </div>
                  {!notif.read && (
                    <div className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0058be] ring-4 ring-blue-50"></div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
