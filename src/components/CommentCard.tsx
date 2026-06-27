/**
 * CommentCard — a single on-chain comment rendered inside a post thread.
 */

import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { formatRelativeTime } from '@/utils/format';
import type { Comment } from '@/types/domain';

export function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-2.5">
      <Link to={`/profile/${comment.author}`}>
        <Avatar seed={comment.authorAvatarSeed} displayName={comment.authorDisplayName} size={28} />
      </Link>
      <div className="min-w-0 flex-1 rounded-lg bg-ink-raised px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs">
          <Link to={`/profile/${comment.author}`} className="font-medium text-parchment hover:underline">
            {comment.authorDisplayName}
          </Link>
          <span className="text-parchment-faint">@{comment.authorUsername}</span>
          <span className="text-parchment-faint">· {formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm text-parchment">{comment.content}</p>
      </div>
    </div>
  );
}
