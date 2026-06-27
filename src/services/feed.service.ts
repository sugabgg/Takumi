/**
 * Feed service.
 *
 * Three distinct on-chain reads: the personalized home feed (posts from
 * accounts the viewer follows), a single user's timeline, and the
 * network-wide trending feed ranked by recent engagement.
 */

import { rpcGet } from '@/lib/canopyClient';
import type { Address, Page, Post } from '@/types/domain';

interface FeedQuery {
  cursor?: string | null;
  limit?: number;
}

function buildQuery({ cursor, limit = 20 }: FeedQuery): string {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return params.toString();
}

/** Home feed: posts from accounts the given viewer follows, newest first. */
export async function getHomeFeed(viewer: Address, query: FeedQuery = {}): Promise<Page<Post>> {
  return rpcGet<Page<Post>>(`/v1/query/feed/home/${viewer}?${buildQuery(query)}`);
}

/** A single user's timeline: every post and repost they have published. */
export async function getUserTimeline(
  address: Address,
  query: FeedQuery = {},
): Promise<Page<Post>> {
  return rpcGet<Page<Post>>(`/v1/query/feed/timeline/${address}?${buildQuery(query)}`);
}

/** Network-wide trending posts, ranked by recent likes/comments/reposts. */
export async function getTrendingPosts(query: FeedQuery = {}): Promise<Page<Post>> {
  return rpcGet<Page<Post>>(`/v1/query/feed/trending?${buildQuery(query)}`);
}
