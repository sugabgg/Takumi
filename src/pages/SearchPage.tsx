/**
 * SearchPage — /search. Covers both "Search Users" and "Search Posts"
 * against Canopy's indexed search endpoints, debounced as the viewer
 * types.
 */

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchUsers, searchPosts } from '@/services/search.service';
import { ProfileCard } from '@/components/ProfileCard';
import { PostCard } from '@/components/PostCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import type { Post, Profile } from '@/types/domain';

type Tab = 'users' | 'posts';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('users');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setProfiles([]);
      setPosts([]);
      return;
    }
    let mounted = true;
    setIsLoading(true);
    (async () => {
      if (tab === 'users') {
        const results = await searchUsers(debouncedQuery);
        if (mounted) setProfiles(results);
      } else {
        const results = await searchPosts(debouncedQuery);
        if (mounted) setPosts(results);
      }
      if (mounted) setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [debouncedQuery, tab]);

  function handleLikeToggle(postId: string, liked: boolean) {
    setPosts((current) =>
      current.map((p) =>
        p.id === postId ? { ...p, likedByViewer: liked, likeCount: p.likeCount + (liked ? 1 : -1) } : p,
      ),
    );
  }

  function handleRepost(postId: string) {
    setPosts((current) =>
      current.map((p) =>
        p.id === postId ? { ...p, repostedByViewer: true, repostCount: p.repostCount + 1 } : p,
      ),
    );
  }

  function handleCommentAdded(postId: string) {
    setPosts((current) =>
      current.map((p) => (p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p)),
    );
  }

  return (
    <div>
      <div className="border-b border-ink-border p-4">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people or posts on Canopy…"
          className="w-full rounded-full border border-ink-border bg-ink-panel px-4 py-2 text-parchment outline-none focus:border-jade"
        />
        <div className="mt-3 flex gap-2">
          {(['users', 'posts'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                tab === t ? 'bg-jade text-ink-deep' : 'text-parchment-muted hover:bg-ink-raised'
              }`}
            >
              {t === 'users' ? 'People' : 'Posts'}
            </button>
          ))}
        </div>
      </div>

      {!debouncedQuery.trim() && (
        <EmptyState title="Search TAKUMI" description="Find craftspeople and posts recorded on Canopy Network." />
      )}

      {isLoading && <LoadingSkeleton variant="line" count={5} />}

      {!isLoading && debouncedQuery.trim() && tab === 'users' && profiles.length === 0 && (
        <EmptyState title="No matching profiles" description={`Nobody on-chain matches "${debouncedQuery}".`} />
      )}
      {!isLoading && tab === 'users' && profiles.map((p) => <ProfileCard key={p.address} profile={p} />)}

      {!isLoading && debouncedQuery.trim() && tab === 'posts' && posts.length === 0 && (
        <EmptyState title="No matching posts" description={`Nothing on-chain matches "${debouncedQuery}".`} />
      )}
      {!isLoading &&
        tab === 'posts' &&
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onRepost={handleRepost}
            onCommentAdded={handleCommentAdded}
          />
        ))}
    </div>
  );
}
