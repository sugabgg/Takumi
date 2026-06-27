/**
 * TrendingPanel — right-rail panel surfacing the network's trending
 * posts (ranked on-chain by recent likes/comments/reposts).
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingPosts } from '@/services/feed.service';
import { formatCompactNumber } from '@/utils/format';
import { LoadingSkeleton } from './LoadingSkeleton';
import type { Post } from '@/types/domain';

export function TrendingPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const page = await getTrendingPosts({ limit: 5 });
        if (mounted) setPosts(page.items);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="hidden w-72 shrink-0 border-l border-ink-border p-4 lg:block">
      <h2 className="font-display text-sm uppercase tracking-wide text-parchment-muted">
        Trending on Canopy
      </h2>

      {isLoading && <LoadingSkeleton variant="line" count={4} />}

      {!isLoading && posts.length === 0 && (
        <p className="mt-3 text-sm text-parchment-faint">
          Nothing trending yet. Be the first to set the pace.
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link
              to={`/profile/${post.author}`}
              className="block rounded-lg p-2 transition hover:bg-ink-raised"
            >
              <p className="text-xs text-parchment-faint">#{index + 1} · @{post.authorUsername}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-parchment">{post.content}</p>
              <p className="mt-1 text-xs text-jade">
                {formatCompactNumber(post.likeCount + post.commentCount + post.repostCount)} engagements
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
