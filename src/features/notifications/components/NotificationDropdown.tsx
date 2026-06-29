import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import blogApi from '../../../api/blogApi';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch số lượng thông báo chưa đọc (Polling mỗi 1 phút)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => blogApi.getUnreadNotificationCount().then((res) => res.data),
    refetchInterval: 60000,
  });

  // Fetch danh sách thông báo
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => blogApi.getNotifications({ pageNo: 0, pageSize: 20 }).then((res) => res.data),
    enabled: isOpen, // Chỉ fetch khi mở dropdown
  });

  const notifications = notificationsData?.content || [];

  // Mutation đánh dấu đã đọc 1 thông báo
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => blogApi.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation đánh dấu đã đọc tất cả
  const markAllAsReadMutation = useMutation({
    mutationFn: () => blogApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
        return <span className="material-symbols-outlined text-[#0058be]">chat_bubble</span>;
      case 'REACTION':
        return <span className="material-symbols-outlined text-rose-500">favorite</span>;
      default:
        return <span className="material-symbols-outlined text-gray-500">notifications</span>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[#0058be]/25 bg-[#f0f5ff] text-[#0058be] transition-colors hover:border-[#0058be] hover:bg-[#d8e2ff]"
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-2 w-2 items-center justify-center rounded-full bg-[#0058be] ring-2 ring-white"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#E5E7EB] bg-white shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-gray-50/50 px-4 py-3">
            <h3 className="font-bold text-[#191c1d]">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-xs font-medium text-[#0058be] hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-[#727785]">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined mb-2 text-4xl text-gray-300">notifications_off</span>
                <p className="text-sm text-[#727785]">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif: any) => (
                  <Link
                    key={notif.id}
                    to={notif.targetUrl || '#'}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 ${
                      !notif.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-white p-2 shadow-sm ring-1 ring-gray-100">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!notif.read ? 'font-medium text-[#191c1d]' : 'text-[#424754]'}`}>
                        {notif.content}
                      </p>
                      <p className="mt-1 text-xs text-[#727785]">
                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0058be]"></div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-[#E5E7EB] p-2 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg py-2 text-sm font-medium text-[#424754] hover:bg-gray-50 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
