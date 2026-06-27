/**
 * Transaction envelope types.
 *
 * Every social action in TAKUMI (profile edit, post, like, follow, repost,
 * comment) is encoded as one of these typed payloads, signed locally by
 * the wallet keystore, and submitted to Canopy's `/v1/tx` endpoint. This
 * keeps a single, auditable shape for "everything that touches the chain".
 */

import type { Address } from './domain';

export type TakumiTxType =
  | 'takumi.profile.create'
  | 'takumi.profile.update'
  | 'takumi.post.create'
  | 'takumi.post.like'
  | 'takumi.post.unlike'
  | 'takumi.post.repost'
  | 'takumi.post.comment'
  | 'takumi.follow.create'
  | 'takumi.follow.remove';

export interface TakumiTxPayloadMap {
  'takumi.profile.create': { username: string; displayName: string; bio: string; avatarSeed: string };
  'takumi.profile.update': { displayName: string; bio: string; avatarSeed: string };
  'takumi.post.create': { content: string; repostOf?: string };
  'takumi.post.like': { postId: string };
  'takumi.post.unlike': { postId: string };
  'takumi.post.repost': { postId: string };
  'takumi.post.comment': { postId: string; content: string };
  'takumi.follow.create': { target: Address };
  'takumi.follow.remove': { target: Address };
}

export interface UnsignedTakumiTx<T extends TakumiTxType = TakumiTxType> {
  type: T;
  payload: TakumiTxPayloadMap[T];
  sender: Address;
  nonce: number;
  createdAt: string;
}

export interface SignedTakumiTx<T extends TakumiTxType = TakumiTxType> {
  unsigned: UnsignedTakumiTx<T>;
  signature: string;
  publicKey: string;
}

export interface TxSubmissionResult {
  hash: string;
  accepted: boolean;
}
