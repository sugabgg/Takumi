/**
 * ProfilePage — /profile/:id. Shows the profile header, reputation, and
 * that account's on-chain timeline. If the viewer is looking at their own
 * address and has no profile yet, this is also where they create one.
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';
import { useProfile } from '@/hooks/useProfile';
import { useFeed } from '@/hooks/useFeed';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getUserTimeline } from '@/services/feed.service';
import { createProfile, updateProfile } from '@/services/profile.service';
import { followUser, unfollowUser, isFollowing as checkIsFollowing } from '@/services/follow.service';
import { ProfileHeader } from '@/components/ProfileHeader';
import { PostCard } from '@/components/PostCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ReputationBadge } from '@/components/ReputationBadge';

interface ProfileFormValues {
  username: string;
  displayName: string;
  bio: string;
  avatarSeed: string;
}

function ProfileForm({
  initial,
  isCreating,
  onSubmit,
  onCancel,
}: {
  initial: ProfileFormValues;
  isCreating: boolean;
  onSubmit: (draft: ProfileFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="space-y-3 p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
          await onSubmit(draft);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <h2 className="font-display text-lg text-parchment">
        {isCreating ? 'Create your on-chain profile' : 'Edit profile'}
      </h2>

      {isCreating && (
        <div>
          <label className="text-xs uppercase tracking-wide text-parchment-muted">Username</label>
          <input
            required
            value={draft.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value.replace(/\s/g, '').toLowerCase() })}
            placeholder="takumi_maker"
            className="mt-1 w-full rounded-lg border border-ink-border bg-ink-panel px-3 py-2 text-parchment outline-none focus:border-jade"
          />
        </div>
      )}

      <div>
        <label className="text-xs uppercase tracking-wide text-parchment-muted">Display name</label>
        <input
          required
          value={draft.displayName}
          onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink-border bg-ink-panel px-3 py-2 text-parchment outline-none focus:border-jade"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-parchment-muted">Bio</label>
        <textarea
          value={draft.bio}
          onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
          rows={3}
          className="mt-1 w-full resize-none rounded-lg border border-ink-border bg-ink-panel px-3 py-2 text-parchment outline-none focus:border-jade"
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-parchment-muted">Avatar seed</label>
        <input
          value={draft.avatarSeed}
          onChange={(e) => setDraft({ ...draft, avatarSeed: e.target.value })}
          placeholder="Any phrase — determines your avatar color"
          className="mt-1 w-full rounded-lg border border-ink-border bg-ink-panel px-3 py-2 text-parchment outline-none focus:border-jade"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm text-parchment-muted hover:text-parchment"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-jade px-5 py-2 text-sm font-medium text-ink-deep transition hover:bg-jade-bright disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : isCreating ? 'Create profile on-chain' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { account, refreshProfile } = useWallet();
  const { showToast } = useToast();
  const { profile, reputation, isLoading, notFound, refresh } = useProfile(id);
  const [isEditing, setIsEditing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [isFollowBusy, setIsFollowBusy] = useState(false);

  const isOwnProfile = account?.address === id;

  useEffect(() => {
    if (account && id && !isOwnProfile) {
      void checkIsFollowing(account.address, id).then(setFollowing);
    }
  }, [account, id, isOwnProfile]);

  const fetcher = useCallback(
    (cursor: string | null) =>
      id ? getUserTimeline(id, { cursor }) : Promise.resolve({ items: [], nextCursor: null }),
    [id],
  );
  const feed = useFeed(`timeline:${id}`, fetcher);
  const sentinelRef = useInfiniteScroll(feed.loadMore, feed.hasMore && !feed.isLoading);

  async function handleFollowToggle() {
    if (!account || !id || isFollowBusy) return;
    const next = !following;
    setIsFollowBusy(true);
    setFollowing(next);
    try {
      const result = next ? await followUser(account.address, id) : await unfollowUser(account.address, id);
      if (!result.accepted) throw new Error('rejected');
    } catch {
      setFollowing(!next);
      showToast('The network rejected that follow action. Try again.', 'error');
    } finally {
      setIsFollowBusy(false);
    }
  }

  if (!id) return null;

  if (isLoading) {
    return <LoadingSkeleton variant="profile" />;
  }

  if (notFound) {
    if (isOwnProfile && account) {
      return (
        <ProfileForm
          initial={{ username: '', displayName: '', bio: '', avatarSeed: account.address }}
          isCreating
          onSubmit={async (draft) => {
            const result = await createProfile(account.address, draft);
            if (result.accepted) {
              showToast('Profile created on-chain.', 'success');
              await refreshProfile();
              refresh();
            } else {
              showToast('The network rejected that profile. Try again.', 'error');
            }
          }}
        />
      );
    }
    return <EmptyState title="No profile here yet" description="This address hasn't created a TAKUMI profile on-chain." />;
  }

  if (!profile) return null;

  if (isEditing) {
    return (
      <ProfileForm
        initial={{
          username: profile.username,
          displayName: profile.displayName,
          bio: profile.bio,
          avatarSeed: profile.avatarSeed,
        }}
        isCreating={false}
        onCancel={() => setIsEditing(false)}
        onSubmit={async (draft) => {
          if (!account) return;
          const result = await updateProfile(account.address, draft);
          if (result.accepted) {
            showToast('Profile updated on-chain.', 'success');
            await refreshProfile();
            refresh();
            setIsEditing(false);
          } else {
            showToast('The network rejected that update. Try again.', 'error');
          }
        }}
      />
    );
  }

  return (
    <div>
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={following}
        isFollowBusy={isFollowBusy}
        onFollowToggle={handleFollowToggle}
        onEdit={() => setIsEditing(true)}
      />

      {reputation && (
        <section className="flex items-center justify-between border-b border-ink-border p-4">
          <div>
            <h2 className="font-display text-sm uppercase tracking-wide text-parchment-muted">
              Reputation breakdown
            </h2>
            <p className="mt-1 text-xs text-parchment-faint">
              {reputation.postCount} posts · {reputation.likesReceived} likes received ·{' '}
              {reputation.commentsReceived} comments received · {reputation.followersGained} followers ·{' '}
              {reputation.repostsReceived} reposts received
            </p>
          </div>
          <ReputationBadge score={profile.reputationScore} />
        </section>
      )}

      {feed.isLoading && feed.posts.length === 0 && <LoadingSkeleton count={4} />}

      {!feed.isLoading && feed.posts.length === 0 && (
        <EmptyState title="No posts yet" description="Nothing published on-chain by this account so far." />
      )}

      {feed.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLikeToggle={feed.applyLikeToggle}
          onRepost={feed.applyRepost}
          onCommentAdded={feed.applyCommentAdded}
        />
      ))}

      {feed.isLoadingMore && <LoadingSkeleton count={2} />}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
