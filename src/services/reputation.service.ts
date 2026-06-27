/**
 * Reputation service.
 *
 * Reputation itself is computed and stored on-chain by the Canopy node
 * (every post/like/comment/follow/repost transaction updates the
 * recipient's running score in the FSM) — this module only reads that
 * state and exposes the documented weighting scheme so the UI can explain
 * "why" a score is what it is.
 */

import { rpcGet } from '@/lib/canopyClient';
import { REPUTATION_WEIGHTS } from '@/types/domain';
import type { Address, ReputationEvent } from '@/types/domain';

export interface ReputationSummary {
  score: number;
  postCount: number;
  likesReceived: number;
  commentsReceived: number;
  followersGained: number;
  repostsReceived: number;
}

/** Fetches the current on-chain reputation summary for an address. */
export async function getReputationSummary(address: Address): Promise<ReputationSummary> {
  try {
    return await rpcGet<ReputationSummary>(`/v1/query/reputation/${address}`);
  } catch {
    return {
      score: 0,
      postCount: 0,
      likesReceived: 0,
      commentsReceived: 0,
      followersGained: 0,
      repostsReceived: 0,
    };
  }
}

/** Fetches the raw reputation event history for an address, newest first. */
export async function getReputationHistory(address: Address): Promise<ReputationEvent[]> {
  try {
    return await rpcGet<ReputationEvent[]>(`/v1/query/reputation/${address}/history`);
  } catch {
    return [];
  }
}

/** The point value each on-chain action contributes to reputation. */
export function getReputationWeights(): Record<string, number> {
  return REPUTATION_WEIGHTS;
}
