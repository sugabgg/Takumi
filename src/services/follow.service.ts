/**
 * Follow service.
 *
 * Follow/unfollow are on-chain transactions (and, on the recipient's side,
 * they also feed the reputation system — see reputation.service.ts).
 */

import { rpcGet } from '@/lib/canopyClient';
import { submitTakumiTx } from '@/lib/txBuilder';
import type { Address, Profile } from '@/types/domain';
import type { TxSubmissionResult } from '@/types/transaction';

/** Follows another account on-chain. */
export async function followUser(sender: Address, target: Address): Promise<TxSubmissionResult> {
  return submitTakumiTx('takumi.follow.create', sender, { target });
}

/** Unfollows another account on-chain. */
export async function unfollowUser(
  sender: Address,
  target: Address,
): Promise<TxSubmissionResult> {
  return submitTakumiTx('takumi.follow.remove', sender, { target });
}

/** True if `viewer` currently follows `target`, per chain state. */
export async function isFollowing(viewer: Address, target: Address): Promise<boolean> {
  try {
    const result = await rpcGet<{ following: boolean }>(
      `/v1/query/follow/${viewer}/${target}`,
    );
    return result.following;
  } catch {
    return false;
  }
}

/** Lists the profiles that follow the given address. */
export async function getFollowers(address: Address): Promise<Profile[]> {
  try {
    return await rpcGet<Profile[]>(`/v1/query/follow/${address}/followers`);
  } catch {
    return [];
  }
}

/** Lists the profiles the given address follows. */
export async function getFollowing(address: Address): Promise<Profile[]> {
  try {
    return await rpcGet<Profile[]>(`/v1/query/follow/${address}/following`);
  } catch {
    return [];
  }
}
