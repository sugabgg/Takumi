/**
 * useNotifications — paginated on-chain notification feed for the
 * connected wallet, with local read/unread tracking.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getNotifications, markAllAsRead, markAsRead } from '@/services/notification.service';
import type { AppNotification } from '@/types/domain';

interface UseNotificationsResult {
  notifications: AppNotification[];
  isLoading: boolean;
  hasMore: boolean;
  unreadCount: number;
  loadMore: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export function useNotifications(address: string | null): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'more') => {
      if (!address) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const cursor = mode === 'more' ? cursorRef.current : null;
        const page = await getNotifications(address, cursor);
        cursorRef.current = page.nextCursor;
        setHasMore(page.nextCursor !== null);
        setNotifications((current) => (mode === 'more' ? [...current, ...page.items] : page.items));
      } finally {
        setIsLoading(false);
      }
    },
    [address],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const markRead = useCallback(
    (id: string) => {
      if (!address) return;
      markAsRead(address, id);
      setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
    },
    [address],
  );

  const markAllRead = useCallback(() => {
    if (!address) return;
    const ids = notifications.map((n) => n.id);
    markAllAsRead(address, ids);
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  }, [address, notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    isLoading,
    hasMore,
    unreadCount,
    loadMore: () => void load('more'),
    markRead,
    markAllRead,
  };
}
