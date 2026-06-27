/**
 * FeedPage — the home route ("/"). Shows the connected wallet's
 * personalized on-chain feed (posts from accounts they follow), with a
 * composer trigger, infinite scroll, and a local-cache instant render.
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useFeed } from '@/hooks/useFeed';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getHomeFeed } from '@/services/feed.service';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Avatar } from '@/components/Avatar';

export function FeedPage() {
  const { account, profile } = useWallet();
  const navigate = useNavigate();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const fetcher = useCallback(
    (cursor: string | null) =>
      account ? getHomeFeed(account.address, { cursor }) : Promise.resolve({ items: [], nextCursor: null }),
    [account],
  );

  const feed = useFeed(account ? `home:${account.address}` : 'home:anonymous', fetcher);
  const sentinelRef = useInfiniteScroll(feed.loadMore, feed.hasMore && !feed.isLoading);

  if (!account) {
    return (
      <EmptyState
        title="Connect your wallet to see your feed"
        description="TAKUMI's feed, profile, and reputation are all tied to your on-chain identity."
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-ink-border p-4">
        <h1 className="font-display text-lg text-parchment">Feed</h1>
      </div>

      {profile && (
        <div className="border-b border-ink-border bg-ink-panel/70 p-4">
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-ink-border bg-ink-raised/80 p-3 text-left text-parchment-muted shadow-sm transition hover:border-jade hover:bg-ink-raised"
          >
            <Avatar seed={profile.avatarSeed} displayName={profile.displayName} size={36} />
            <span className="flex-1">What did you make today?</span>
            <span className="rounded-full bg-jade/15 px-3 py-1 text-xs font-medium text-jade">Post</span>
          </button>
        </div>
      )}

      {feed.isLoading && feed.posts.length === 0 && <LoadingSkeleton count={5} />}

      {!feed.isLoading && feed.posts.length === 0 && !feed.error && (
        <EmptyState
          title="Your feed is quiet"
          description="Follow a few craftspeople to see their posts here, or publish your own."
          actionLabel="Find people to follow"
          onAction={() => navigate('/search')}
        />
      )}

      {feed.error && (
        <EmptyState title="Couldn't load your feed" description={feed.error} />
      )}

      {feed.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLikeToggle={feed.applyLikeToggle}
          onRepost={feed.applyRepost}
          onCommentAdded={feed.applyCommentAdded}
        />
      ))}

      {feed.isLoadingMore && <LoadingSkeleton count={2} />}
      <div ref={sentinelRef} className="h-1" />

      {isComposerOpen && (
        <CreatePostModal
          onClose={() => setIsComposerOpen(false)}
          onPublished={feed.prependPost}
        />
      )}
    </div>
  );
}
