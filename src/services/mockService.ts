/**
 * MockService layer.
 *
 * This file contains purely local demo-mode implementations for the TAKUMI
 * social actions and reads. It is intentionally kept separate from the
 * existing Canopy RPC services so the original architecture remains intact.
 * Switching USE_MOCK to false restores the on-chain implementation path.
 */

import type { Address, AppNotification, Comment, Page, Post, Profile, ReputationEvent, TxHash } from '@/types/domain';
import type { TxSubmissionResult } from '@/types/transaction';
import { USE_MOCK } from '@/config/mock';

const STORAGE_KEY = 'takumi:mock:data';
const DEMO_PROFILE_ADDRESS = '0xDemoProfile111111111111111111111111111111111111';
const DEMO_FOLLOWER_ADDRESS = '0xDemoFollower222222222222222222222222222222222222';

interface MockState {
  profile: Profile;
  posts: Post[];
  comments: Comment[];
  notifications: AppNotification[];
  reputationEvents: ReputationEvent[];
  following: Address[];
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSeededProfile(address: Address): Profile {
  return {
    address,
    username: 'demo_craftsman',
    displayName: 'Demo Craftsman',
    bio: 'A realistic TAKUMI demo profile powered by local mock data.',
    avatarSeed: 'demo-avatar',
    joinedAt: new Date().toISOString(),
    followerCount: 2,
    followingCount: 1,
    postCount: 10,
    reputationScore: 42,
  };
}

function makeDemoPost(index: number): Post {
  const content = [
    'Just shipped a new prototype and the feedback has been amazing.',
    'Exploring a fresh composition workflow with a tiny but sharp toolset.',
    'The best part of building today was iterating fast without friction.',
    'A calm morning, a clear idea, and a polished result.',
    'Simple tools, thoughtful design, and a satisfying finish.',
    'I love how tiny details can change the whole experience.',
    'Shipped a small improvement that made the whole flow feel lighter.',
    'Today felt like a good day to make something useful and honest.',
    'The feedback loop was quick and the result feels much better now.',
    'A tiny idea turned into something worth sharing today.',
  ][index % 10] ?? 'A fresh demo post from TAKUMI.';

  return {
    id: `mock-post-${index}`,
    author: DEMO_PROFILE_ADDRESS,
    authorUsername: 'demo_craftsman',
    authorDisplayName: 'Demo Craftsman',
    authorAvatarSeed: 'demo-avatar',
    content,
    createdAt: new Date(Date.now() - index * 60000).toISOString(),
    likeCount: index + 1,
    commentCount: index % 3,
    repostCount: index % 2,
  };
}

function createInitialState(): MockState {
  const profile = createSeededProfile(DEMO_PROFILE_ADDRESS);
  const posts = Array.from({ length: 10 }, (_, index) => makeDemoPost(index));
  const comments: Comment[] = [];
  const notifications: AppNotification[] = [];
  const firstPost = posts[0] ?? makeDemoPost(0);
  const secondPost = posts[1] ?? makeDemoPost(1);
  const thirdPost = posts[2] ?? makeDemoPost(2);
  const fourthPost = posts[3] ?? makeDemoPost(3);
  const reputationEvents: ReputationEvent[] = [
    { type: 'POST_CREATED', address: DEMO_PROFILE_ADDRESS, points: 2, refId: firstPost.id, createdAt: firstPost.createdAt },
    { type: 'LIKE_RECEIVED', address: DEMO_PROFILE_ADDRESS, points: 1, refId: secondPost.id, createdAt: secondPost.createdAt },
    { type: 'COMMENT_RECEIVED', address: DEMO_PROFILE_ADDRESS, points: 3, refId: thirdPost.id, createdAt: thirdPost.createdAt },
    { type: 'FOLLOW_RECEIVED', address: DEMO_PROFILE_ADDRESS, points: 5, refId: createId('follow'), createdAt: new Date().toISOString() },
    { type: 'REPOST_RECEIVED', address: DEMO_PROFILE_ADDRESS, points: 4, refId: fourthPost.id, createdAt: fourthPost.createdAt },
  ];

  return {
    profile,
    posts,
    comments,
    notifications,
    reputationEvents,
    following: [DEMO_FOLLOWER_ADDRESS],
  };
}

function readState(): MockState {
  if (typeof window === 'undefined') return createInitialState();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const state = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }

  try {
    const parsed = JSON.parse(raw) as MockState;
    return {
      ...createInitialState(),
      ...parsed,
      posts: parsed.posts ?? createInitialState().posts,
      profile: parsed.profile ?? createInitialState().profile,
      following: parsed.following ?? [DEMO_FOLLOWER_ADDRESS],
    };
  } catch {
    const state = createInitialState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  }
}

function writeState(state: MockState): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function buildPage<T>(items: T[]): Page<T> {
  return { items, nextCursor: null };
}

function getProfileByAddress(address: Address): Profile | null {
  const state = readState();
  return state.profile.address === address || state.profile.address === DEMO_PROFILE_ADDRESS ? state.profile : null;
}

function getProfileByUsername(username: string): Profile | null {
  const state = readState();
  return state.profile.username === username ? state.profile : null;
}

function getPostFeed(): Post[] {
  return readState().posts.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getTimeline(address: Address): Post[] {
  const state = readState();
  return state.posts.filter((post) => post.author === address).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getNotificationsFor(address: Address): AppNotification[] {
  const state = readState();
  return state.notifications.filter((n) => n.recipient === address);
}

function getReputationSummaryFor(): { score: number; postCount: number; likesReceived: number; commentsReceived: number; followersGained: number; repostsReceived: number } {
  const state = readState();
  const base = state.profile;
  return {
    score: base.reputationScore,
    postCount: base.postCount,
    likesReceived: state.posts.reduce((sum, post) => sum + post.likeCount, 0),
    commentsReceived: state.posts.reduce((sum, post) => sum + post.commentCount, 0),
    followersGained: base.followerCount,
    repostsReceived: state.posts.reduce((sum, post) => sum + post.repostCount, 0),
  };
}

function getReputationHistoryFor(address: Address): ReputationEvent[] {
  const state = readState();
  return state.reputationEvents.filter((event) => event.address === address);
}

function findPost(postId: TxHash): Post | null {
  return readState().posts.find((post) => post.id === postId) ?? null;
}

function buildNotification(type: AppNotification['type'], recipient: Address, actor: Address, postId?: TxHash): AppNotification {
  return {
    id: createId(type.toLowerCase()),
    type,
    actor,
    recipient,
    postId,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

/**
 * Demo-mode service selector.
 *
 * This remains separate from the existing RPC-based services and is only used
 * when USE_MOCK is true. When it is false, the original service modules remain
 * the single path for all network traffic.
 */
export function useMockService(): boolean {
  return USE_MOCK;
}

/** Demo-mode profile operations. */
export async function mockCreateProfile(sender: Address, draft: { username: string; displayName: string; bio: string; avatarSeed: string }): Promise<TxSubmissionResult> {
  const state = readState();
  state.profile = {
    ...state.profile,
    address: sender,
    username: draft.username,
    displayName: draft.displayName,
    bio: draft.bio,
    avatarSeed: draft.avatarSeed,
    joinedAt: new Date().toISOString(),
  };
  writeState(state);
  return { hash: createId('profile'), accepted: true };
}

/** Demo-mode profile update. */
export async function mockUpdateProfile(sender: Address, draft: { displayName: string; bio: string; avatarSeed: string }): Promise<TxSubmissionResult> {
  const state = readState();
  state.profile = {
    ...state.profile,
    address: sender,
    displayName: draft.displayName,
    bio: draft.bio,
    avatarSeed: draft.avatarSeed,
  };
  writeState(state);
  return { hash: createId('profile-update'), accepted: true };
}

/** Demo-mode post creation. */
export async function mockCreatePost(sender: Address, content: string): Promise<TxSubmissionResult> {
  const state = readState();
  const post: Post = {
    id: createId('post'),
    author: sender,
    authorUsername: state.profile.username,
    authorDisplayName: state.profile.displayName,
    authorAvatarSeed: state.profile.avatarSeed,
    content,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
  };
  state.posts.unshift(post);
  state.profile.postCount = state.posts.length;
  state.reputationEvents.unshift({ type: 'POST_CREATED', address: sender, points: 2, refId: post.id, createdAt: post.createdAt });
  state.notifications.unshift(buildNotification('MENTION', sender, sender, post.id));
  writeState(state);
  return { hash: post.id, accepted: true };
}

/** Demo-mode like. */
export async function mockLikePost(sender: Address, postId: TxHash): Promise<TxSubmissionResult> {
  const state = readState();
  const post = state.posts.find((item) => item.id === postId);
  if (post) {
    post.likeCount += 1;
    post.likedByViewer = true;
    state.reputationEvents.unshift({ type: 'LIKE_RECEIVED', address: post.author, points: 1, refId: post.id, createdAt: new Date().toISOString() });
    state.notifications.unshift(buildNotification('LIKE', post.author, sender, post.id));
  }
  writeState(state);
  return { hash: createId('like'), accepted: true };
}

/** Demo-mode unlike. */
export async function mockUnlikePost(_sender: Address, postId: TxHash): Promise<TxSubmissionResult> {
  const state = readState();
  const post = state.posts.find((item) => item.id === postId);
  if (post) {
    post.likeCount = Math.max(0, post.likeCount - 1);
    post.likedByViewer = false;
  }
  writeState(state);
  return { hash: createId('unlike'), accepted: true };
}

/** Demo-mode repost. */
export async function mockRepostPost(sender: Address, postId: TxHash): Promise<TxSubmissionResult> {
  const state = readState();
  const post = state.posts.find((item) => item.id === postId);
  if (post) {
    post.repostCount += 1;
    state.reputationEvents.unshift({ type: 'REPOST_RECEIVED', address: post.author, points: 4, refId: post.id, createdAt: new Date().toISOString() });
    state.notifications.unshift(buildNotification('REPOST', post.author, sender, post.id));
  }
  writeState(state);
  return { hash: createId('repost'), accepted: true };
}

/** Demo-mode follow. */
export async function mockFollowUser(sender: Address, target: Address): Promise<TxSubmissionResult> {
  const state = readState();
  if (!state.following.includes(target)) {
    state.following.push(target);
    state.reputationEvents.unshift({ type: 'FOLLOW_RECEIVED', address: target, points: 5, refId: createId('follow'), createdAt: new Date().toISOString() });
    state.notifications.unshift(buildNotification('FOLLOW', target, sender));
  }
  writeState(state);
  return { hash: createId('follow'), accepted: true };
}

/** Demo-mode unfollow. */
export async function mockUnfollowUser(_sender: Address, target: Address): Promise<TxSubmissionResult> {
  const state = readState();
  state.following = state.following.filter((item) => item !== target);
  writeState(state);
  return { hash: createId('unfollow'), accepted: true };
}

/** Demo-mode comment. */
export async function mockCommentOnPost(sender: Address, postId: TxHash, content: string): Promise<TxSubmissionResult> {
  const state = readState();
  const post = state.posts.find((item) => item.id === postId);
  if (post) {
    post.commentCount += 1;
    state.comments.push({
      id: createId('comment'),
      postId,
      author: sender,
      authorUsername: state.profile.username,
      authorDisplayName: state.profile.displayName,
      authorAvatarSeed: state.profile.avatarSeed,
      content,
      createdAt: new Date().toISOString(),
    });
    state.reputationEvents.unshift({ type: 'COMMENT_RECEIVED', address: post.author, points: 3, refId: post.id, createdAt: new Date().toISOString() });
    state.notifications.unshift(buildNotification('COMMENT', post.author, sender, post.id));
  }
  writeState(state);
  return { hash: createId('comment'), accepted: true };
}

/** Demo-mode query helpers. */
export async function mockGetProfileByAddress(address: Address): Promise<Profile | null> {
  return getProfileByAddress(address);
}

export async function mockGetProfileByUsername(username: string): Promise<Profile | null> {
  return getProfileByUsername(username);
}

export async function mockGetHomeFeed(_viewer: Address): Promise<Page<Post>> {
  const state = readState();
  const visible = state.posts.filter((post) => post.author === state.profile.address || state.following.includes(post.author));
  return buildPage(visible.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function mockGetUserTimeline(address: Address): Promise<Page<Post>> {
  return buildPage(getTimeline(address));
}

export async function mockGetTrendingPosts(): Promise<Page<Post>> {
  return buildPage(getPostFeed().slice(0, 6));
}

export async function mockIsFollowing(_viewer: Address, target: Address): Promise<boolean> {
  return readState().following.includes(target);
}

export async function mockGetFollowers(address: Address): Promise<Profile[]> {
  const state = readState();
  return state.profile.address === address ? [state.profile] : [];
}

export async function mockGetFollowing(address: Address): Promise<Profile[]> {
  const state = readState();
  return state.profile.address === address ? [state.profile] : [];
}

export async function mockGetNotifications(address: Address): Promise<Page<AppNotification>> {
  return buildPage(getNotificationsFor(address));
}

export async function mockGetReputationSummary(_address: Address): Promise<{ score: number; postCount: number; likesReceived: number; commentsReceived: number; followersGained: number; repostsReceived: number }> {
  return getReputationSummaryFor();
}

export async function mockGetReputationHistory(address: Address): Promise<ReputationEvent[]> {
  return getReputationHistoryFor(address);
}

export async function mockSearchUsers(query: string): Promise<Profile[]> {
  const state = readState();
  const normalized = query.toLowerCase();
  if (!normalized) return [];
  return [state.profile].filter((profile) => profile.username.includes(normalized) || profile.displayName.toLowerCase().includes(normalized));
}

export async function mockSearchPosts(query: string): Promise<Post[]> {
  const state = readState();
  const normalized = query.toLowerCase();
  if (!normalized) return [];
  return state.posts.filter((post) => post.content.toLowerCase().includes(normalized));
}

export async function mockGetPost(postId: TxHash): Promise<Post | null> {
  return findPost(postId);
}

export async function mockGetComments(postId: TxHash): Promise<Comment[]> {
  return readState().comments.filter((comment) => comment.postId === postId);
}
