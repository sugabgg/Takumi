/**
 * Search service.
 *
 * Backs "Search Users" and "Search Posts". Both queries hit the Canopy
 * node's indexed search endpoints directly — there is no client-side
 * filtering of a local dataset, since the full social graph lives
 * on-chain and can be far larger than anything reasonable to fetch
 * wholesale.
 */

import { rpcGet } from '@/lib/canopyClient';
import { USE_MOCK } from '@/config/mock';
import { mockSearchPosts, mockSearchUsers } from '@/services/mockService';
import type { Profile, Post } from '@/types/domain';

/** Searches on-chain profiles by username/display name prefix or substring. */
export async function searchUsers(query: string): Promise<Profile[]> {
  if (USE_MOCK) return mockSearchUsers(query);
  if (!query.trim()) return [];
  try {
    return await rpcGet<Profile[]>(`/v1/query/search/users?q=${encodeURIComponent(query)}`);
  } catch {
    return [];
  }
}

/** Searches on-chain post content. */
export async function searchPosts(query: string): Promise<Post[]> {
  if (USE_MOCK) return mockSearchPosts(query);
  if (!query.trim()) return [];
  try {
    return await rpcGet<Post[]>(`/v1/query/search/posts?q=${encodeURIComponent(query)}`);
  } catch {
    return [];
  }
}
