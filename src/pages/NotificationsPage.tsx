/**
 * NotificationsPage — /notifications. Lists on-chain-derived notifications
 * for the connected wallet with infinite scroll and mark-read controls.
 */

import { useWallet } from '@/context/WalletContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { NotificationPanel } from '@/components/NotificationPanel';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';

export function NotificationsPage() {
  const { account } = useWallet();
  const { notifications, isLoading, hasMore, unreadCount, loadMore, markRead, markAllRead } =
    useNotifications(account?.address ?? null);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isLoading);

  if (!account) {
    return (
      <EmptyState
        title="Connect your wallet to see notifications"
        description="Likes, comments, follows, and reposts addressed to your account live here."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink-border p-4">
        <h1 className="font-display text-lg text-parchment">
          Notifications {unreadCount > 0 && <span className="text-jade">({unreadCount})</span>}
        </h1>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-parchment-muted transition hover:text-jade"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading && notifications.length === 0 && <LoadingSkeleton variant="line" count={6} />}

      <NotificationPanel notifications={notifications} onMarkRead={markRead} />

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
