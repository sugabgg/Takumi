/**
 * Post service.
 *
 * Covers every post-level on-chain action: create, like/unlike, repost,
 * and comment, plus the reads needed to render a single post thread.
 */

import { rpcGet } from '@/lib/canopyClient';
import { submitTakumiTx } from '@/lib/txBuilder';
import { USE_MOCK } from '@/config/mock';
import {
  mockCommentOnPost,
  mockCreatePost,
  mockGetComments,
  mockGetPost,
  mockLikePost,
  mockRepostPost,
  mockUnlikePost,
} from '@/services/mockService';
import type { Post, Comment, Address, TxHash } from '@/types/domain';
import type { TxSubmissionResult } from '@/types/transaction';

/** Submits a brand-new on-chain post. */
export async function createPost(sender: Address, content: string): Promise<TxSubmissionResult> {
  if (USE_MOCK) return mockCreatePost(sender, content);
  return submitTakumiTx('takumi.post.create', sender, { content });
}

/** Submits an on-chain repost of an existing post. */
export async function repostPost(sender: Address, postId: TxHash): Promise<TxSubmissionResult> {
  if (USE_MOCK) return mockRepostPost(sender, postId);
  return submitTakumiTx('takumi.post.repost', sender, { postId });
}

/** Likes a post on-chain. */
export async function likePost(sender: Address, postId: TxHash): Promise<TxSubmissionResult> {
  if (USE_MOCK) return mockLikePost(sender, postId);
  return submitTakumiTx('takumi.post.like', sender, { postId });
}

/** Removes a previously submitted on-chain like. */
export async function unlikePost(sender: Address, postId: TxHash): Promise<TxSubmissionResult> {
  if (USE_MOCK) return mockUnlikePost(sender, postId);
  return submitTakumiTx('takumi.post.unlike', sender, { postId });
}

/** Submits an on-chain comment on a post. */
export async function commentOnPost(
  sender: Address,
  postId: TxHash,
  content: string,
): Promise<TxSubmissionResult> {
  if (USE_MOCK) return mockCommentOnPost(sender, postId, content);
  return submitTakumiTx('takumi.post.comment', sender, { postId, content });
}

/** Fetches a single post by id. */
export async function getPost(postId: TxHash): Promise<Post | null> {
  if (USE_MOCK) return mockGetPost(postId);
  try {
    return await rpcGet<Post>(`/v1/query/post/${postId}`);
  } catch {
    return null;
  }
}

/** Fetches the comment thread for a post, oldest first. */
export async function getComments(postId: TxHash): Promise<Comment[]> {
  if (USE_MOCK) return mockGetComments(postId);
  try {
    return await rpcGet<Comment[]>(`/v1/query/post/${postId}/comments`);
  } catch {
    return [];
  }
}
