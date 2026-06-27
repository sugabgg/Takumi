/**
 * PostCard — renders a single post (or repost) with like/repost/comment
 * actions. All three actions are optimistic: the UI updates immediately
 * and is reconciled with the real on-chain result once the transaction
 * is confirmed or rejected.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { CommentCard } from './CommentCard';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';
import { likePost, unlikePost, repostPost, commentOnPost, getComments } from '@/services/post.service';
import { formatCompactNumber, formatRelativeTime } from '@/utils/format';
import type { Comment, Post } from '@/types/domain';

interface PostCardProps {
  post: Post;
  onLikeToggle: (postId: string, liked: boolean) => void;
  onRepost: (postId: string) => void;
  onCommentAdded: (postId: string) => void;
}

export function PostCard({ post, onLikeToggle, onRepost, onCommentAdded }: PostCardProps) {
  const { account, profile } = useWallet();
  const { showToast } = useToast();
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const [isRepostBusy, setIsRepostBusy] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [areCommentsLoading, setAreCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [isCommentBusy, setIsCommentBusy] = useState(false);

  async function handleLike() {
    if (!account || isLikeBusy) return;
    const nextLiked = !post.likedByViewer;
    setIsLikeBusy(true);
    onLikeToggle(post.id, nextLiked);
    try {
      const result = nextLiked
        ? await likePost(account.address, post.id)
        : await unlikePost(account.address, post.id);
      if (!result.accepted) throw new Error('rejected');
    } catch {
      onLikeToggle(post.id, !nextLiked);
      showToast('The network rejected that like. Try again.', 'error');
    } finally {
      setIsLikeBusy(false);
    }
  }

  async function handleRepost() {
    if (!account || isRepostBusy || post.repostedByViewer) return;
    setIsRepostBusy(true);
    onRepost(post.id);
    try {
      const result = await repostPost(account.address, post.id);
      if (!result.accepted) throw new Error('rejected');
      showToast('Reposted on-chain.', 'success');
    } catch {
      showToast('The network rejected that repost. Try again.', 'error');
    } finally {
      setIsRepostBusy(false);
    }
  }

  async function toggleComments() {
    setShowComments((open) => !open);
    if (!showComments && comments.length === 0) {
      setAreCommentsLoading(true);
      try {
        setComments(await getComments(post.id));
      } finally {
        setAreCommentsLoading(false);
      }
    }
  }

  async function handleCommentSubmit() {
    if (!account || !commentDraft.trim() || isCommentBusy) return;
    setIsCommentBusy(true);
    try {
      const result = await commentOnPost(account.address, post.id, commentDraft.trim());
      if (!result.accepted) throw new Error('rejected');
      setComments((current) => [
        ...current,
        {
          id: result.hash,
          postId: post.id,
          author: account.address,
          authorUsername: profile?.username ?? 'you',
          authorDisplayName: profile?.displayName ?? 'You',
          authorAvatarSeed: profile?.avatarSeed ?? account.address,
          content: commentDraft.trim(),
          createdAt: new Date().toISOString(),
        },
      ]);
      onCommentAdded(post.id);
      setCommentDraft('');
      showToast('Comment posted on-chain.', 'success');
    } catch {
      showToast('The network rejected that comment. Try again.', 'error');
    } finally {
      setIsCommentBusy(false);
    }
  }

  return (
    <article className="border-b border-ink-border p-4 animate-fade-up">
      {post.repostOf && (
        <p className="mb-2 ml-12 text-xs text-parchment-faint">↻ Reposted</p>
      )}
      <div className="flex gap-3">
        <Link to={`/profile/${post.author}`}>
          <Avatar seed={post.authorAvatarSeed} displayName={post.authorDisplayName} size={40} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm">
            <Link to={`/profile/${post.author}`} className="font-medium text-parchment hover:underline">
              {post.authorDisplayName}
            </Link>
            <span className="text-parchment-faint">@{post.authorUsername}</span>
            <span className="text-parchment-faint">·</span>
            <span className="text-parchment-faint">{formatRelativeTime(post.createdAt)}</span>
          </div>

          <p className="mt-1 whitespace-pre-wrap text-parchment">{post.content}</p>

          <div className="mt-3 flex max-w-sm items-center justify-between text-parchment-muted">
            <button
              type="button"
              onClick={toggleComments}
              className="flex items-center gap-1.5 text-xs transition hover:text-jade"
              aria-expanded={showComments}
            >
              <span aria-hidden="true">💬</span> {formatCompactNumber(post.commentCount)}
            </button>
            <button
              type="button"
              onClick={handleRepost}
              disabled={isRepostBusy || post.repostedByViewer}
              className={`flex items-center gap-1.5 text-xs transition hover:text-jade disabled:opacity-100 ${
                post.repostedByViewer ? 'text-jade' : ''
              }`}
            >
              <span aria-hidden="true">↻</span> {formatCompactNumber(post.repostCount)}
            </button>
            <button
              type="button"
              onClick={handleLike}
              disabled={isLikeBusy}
              className={`flex items-center gap-1.5 text-xs transition hover:text-seal-bright ${
                post.likedByViewer ? 'text-seal-bright' : ''
              }`}
            >
              <span aria-hidden="true">{post.likedByViewer ? '♥' : '♡'}</span>{' '}
              {formatCompactNumber(post.likeCount)}
            </button>
          </div>

          {showComments && (
            <div className="mt-3 space-y-3 border-t border-ink-border pt-3">
              {areCommentsLoading && <p className="text-xs text-parchment-faint">Loading comments…</p>}
              {!areCommentsLoading && comments.length === 0 && (
                <p className="text-xs text-parchment-faint">No comments yet. Start the thread.</p>
              )}
              {comments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}

              {account && (
                <div className="flex gap-2">
                  <input
                    value={commentDraft}
                    onChange={(e) => setCommentDraft(e.target.value)}
                    placeholder="Write a comment…"
                    className="flex-1 rounded-full border border-ink-border bg-ink-deep px-3 py-1.5 text-sm text-parchment outline-none focus:border-jade"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleCommentSubmit();
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCommentSubmit}
                    disabled={isCommentBusy || !commentDraft.trim()}
                    className="rounded-full bg-jade px-3 py-1.5 text-xs font-medium text-ink-deep transition hover:bg-jade-bright disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
