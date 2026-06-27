/**
 * useFeed.
 *
 * Drives any cursor-paginated post list (home feed, user timeline,
 * trending). Renders instantly from the local cache while the on-chain
 * fetch resolves, supports infinite-scroll pagination, and exposes
 * optimistic mutators so likes/reposts update the UI immediately while
 * the underlying transaction is still in flight.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { readCache, writeCache } from '@/lib/localCache';
import type { Page, Post } from '@/types/domain';

type FeedFetcher = (cursor: string | null) => Promise<Page<Post>>;

interface UseFeedResult {
  posts: Post[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  /** Optimistically toggles a post's "liked" state and like count. */
  applyLikeToggle: (postId: string, liked: boolean) => void;
  /** Optimistically increments a post's repost count and marks it reposted. */
  applyRepost: (postId: string) => void;
  /** Optimistically prepends a freshly published post. */
  prependPost: (post: Post) => void;
  /** Optimistically increments a post's comment count. */
  applyCommentAdded: (postId: string) => void;
  refresh: () => void;
}

export function useFeed(cacheKey: string, fetcher: FeedFetcher): UseFeedResult {
  const [posts, setPosts] = useState<Post[]>(() => readCache<Post[]>(cacheKey) ?? []);
  const [isLoading, setIsLoading] = useState(posts.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(
    async (mode: 'initial' | 'more' | 'refresh') => {
      mode === 'more' ? setIsLoadingMore(true) : setIsLoading(true);
      setError(null);
      try {
        const cursor = mode === 'more' ? cursorRef.current : null;
        const page = await fetcher(cursor);
        cursorRef.current = page.nextCursor;
        setHasMore(page.nextCursor !== null);
        setPosts((current) => {
          const next = mode === 'more' ? [...current, ...page.items] : page.items;
          writeCache(cacheKey, next);
          return next;
        });
      } catch {
        setError('Could not reach the Canopy network. Check your connection and try again.');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [cacheKey, fetcher],
  );

  useEffect(() => {
    load('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) void load('more');
  }, [isLoadingMore, hasMore, load]);

  const refresh = useCallback(() => void load('refresh'), [load]);

  const applyLikeToggle = useCallback((postId: string, liked: boolean) => {
    setPosts((current) =>
      current.map((p) =>
        p.id === postId
          ? { ...p, likedByViewer: liked, likeCount: p.likeCount + (liked ? 1 : -1) }
          : p,
      ),
    );
  }, []);

  const applyRepost = useCallback((postId: string) => {
    setPosts((current) =>
      current.map((p) =>
        p.id === postId
          ? { ...p, repostedByViewer: true, repostCount: p.repostCount + 1 }
          : p,
      ),
    );
  }, []);

  const applyCommentAdded = useCallback((postId: string) => {
    setPosts((current) =>
      current.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
    );
  }, []);

  const prependPost = useCallback(
    (post: Post) => {
      setPosts((current) => {
        const next = [post, ...current];
        writeCache(cacheKey, next);
        return next;
      });
    },
    [cacheKey],
  );

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    applyLikeToggle,
    applyRepost,
    prependPost,
    applyCommentAdded,
    refresh,
  };
}
