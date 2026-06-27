/**
 * NotificationPanel — renders a list of on-chain-derived notifications
 * (likes, comments, follows, reposts) addressed to the viewer.
 */

import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { EmptyState } from './EmptyState';
import { formatRelativeTime, truncateAddress } from '@/utils/format';
import type { AppNotification, NotificationType } from '@/types/domain';

const TYPE_COPY: Record<NotificationType, string> = {
  LIKE: 'liked your post',
  COMMENT: 'commented on your post',
  FOLLOW: 'followed you',
  REPOST: 'reposted your post',
  MENTION: 'mentioned you',
};

const TYPE_ICON: Record<NotificationType, string> = {
  LIKE: '♥',
  COMMENT: '💬',
  FOLLOW: '匠',
  REPOST: '↻',
  MENTION: '@',
};

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
}

export function NotificationPanel({ notifications, onMarkRead }: NotificationPanelProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        description="Likes, comments, follows, and reposts on your activity will show up here."
      />
    );
  }

  return (
    <ul>
      {notifications.map((notification) => (
        <li key={notification.id}>
          <Link
            to={`/profile/${notification.actor}`}
            onClick={() => onMarkRead(notification.id)}
            className={`flex items-center gap-3 border-b border-ink-border px-4 py-3 transition hover:bg-ink-raised ${
              notification.read ? '' : 'bg-jade/5'
            }`}
          >
            <span className="text-lg text-jade" aria-hidden="true">
              {TYPE_ICON[notification.type]}
            </span>
            <Avatar seed={notification.actor} displayName={truncateAddress(notification.actor)} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-parchment">
                <span className="font-medium">{truncateAddress(notification.actor)}</span>{' '}
                {TYPE_COPY[notification.type]}
              </p>
              <p className="text-xs text-parchment-faint">{formatRelativeTime(notification.createdAt)}</p>
            </div>
            {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-seal" aria-hidden="true" />}
          </Link>
        </li>
      ))}
    </ul>
  );
}
