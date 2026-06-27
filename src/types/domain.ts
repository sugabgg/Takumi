/**
 * Core domain types for TAKUMI, shared between services, hooks, and
 * components. These mirror the on-chain state shapes returned by Canopy's
 * `/v1/query/*` endpoints for the TAKUMI custom transaction types
 * (profile, post, follow, like, repost, comment).
 */

export type Address = string;
export type TxHash = string;

/** A locally-held signing identity, used to sign every on-chain transaction. */
export interface WalletAccount {
  address: Address;
  publicKey: string;
  /** ISO timestamp the keystore was created on this device. */
  createdAt: string;
}

export interface Profile {
  address: Address;
  username: string;
  displayName: string;
  bio: string;
  avatarSeed: string;
  joinedAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  reputationScore: number;
}

export interface ProfileDraft {
  username: string;
  displayName: string;
  bio: string;
  avatarSeed: string;
}

export interface Post {
  id: TxHash;
  author: Address;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarSeed: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  /** Present when this post is a repost, pointing at the original post id. */
  repostOf?: TxHash;
  /** True if the viewer's address has liked this post (derived client-side). */
  likedByViewer?: boolean;
  /** True if the viewer's address has reposted this post (derived client-side). */
  repostedByViewer?: boolean;
}

export interface Comment {
  id: TxHash;
  postId: TxHash;
  author: Address;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarSeed: string;
  content: string;
  createdAt: string;
}

export type ReputationEventType =
  | 'POST_CREATED'
  | 'LIKE_RECEIVED'
  | 'COMMENT_RECEIVED'
  | 'FOLLOW_RECEIVED'
  | 'REPOST_RECEIVED';

export interface ReputationEvent {
  type: ReputationEventType;
  address: Address;
  points: number;
  refId: TxHash;
  createdAt: string;
}

export const REPUTATION_WEIGHTS: Record<ReputationEventType, number> = {
  POST_CREATED: 2,
  LIKE_RECEIVED: 1,
  COMMENT_RECEIVED: 3,
  FOLLOW_RECEIVED: 5,
  REPOST_RECEIVED: 4,
};

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'REPOST' | 'MENTION';

export interface AppNotification {
  id: TxHash;
  type: NotificationType;
  actor: Address;
  recipient: Address;
  postId?: TxHash;
  createdAt: string;
  read: boolean;
}

export interface SearchResults {
  profiles: Profile[];
  posts: Post[];
}

/** Generic paginated response shape returned by feed/timeline queries. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
