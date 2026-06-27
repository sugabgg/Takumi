/**
 * ProfileHeader — the full-width header at the top of a profile page:
 * identity, bio, stats, and the follow/edit action appropriate to the
 * viewer.
 */

import { Avatar } from './Avatar';
import { ReputationBadge } from './ReputationBadge';
import { formatCompactNumber, formatJoinDate, truncateAddress } from '@/utils/format';
import type { Profile } from '@/types/domain';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isFollowBusy: boolean;
  onFollowToggle: () => void;
  onEdit: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  isFollowing,
  isFollowBusy,
  onFollowToggle,
  onEdit,
}: ProfileHeaderProps) {
  return (
    <header className="border-b border-ink-border bg-ink-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <Avatar seed={profile.avatarSeed} displayName={profile.displayName} size={72} />
        <ReputationBadge score={profile.reputationScore} size="lg" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl text-parchment">{profile.displayName}</h1>
          <p className="truncate text-sm text-parchment-muted">
            @{profile.username} · {truncateAddress(profile.address)}
          </p>
        </div>

        {isOwnProfile ? (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-full border border-ink-border px-4 py-1.5 text-sm font-medium text-parchment transition hover:border-jade hover:text-jade"
          >
            Edit profile
          </button>
        ) : (
          <button
            type="button"
            onClick={onFollowToggle}
            disabled={isFollowBusy}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
              isFollowing
                ? 'border border-ink-border text-parchment hover:border-seal hover:text-seal-bright'
                : 'bg-jade text-ink-deep hover:bg-jade-bright'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {profile.bio && <p className="mt-3 whitespace-pre-wrap text-sm text-parchment">{profile.bio}</p>}

      <p className="mt-3 text-xs text-parchment-faint">Joined {formatJoinDate(profile.joinedAt)}</p>

      <dl className="mt-4 flex gap-5 text-sm">
        <div>
          <dt className="sr-only">Posts</dt>
          <dd>
            <span className="font-semibold text-parchment">{formatCompactNumber(profile.postCount)}</span>{' '}
            <span className="text-parchment-muted">Posts</span>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Followers</dt>
          <dd>
            <span className="font-semibold text-parchment">{formatCompactNumber(profile.followerCount)}</span>{' '}
            <span className="text-parchment-muted">Followers</span>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Following</dt>
          <dd>
            <span className="font-semibold text-parchment">{formatCompactNumber(profile.followingCount)}</span>{' '}
            <span className="text-parchment-muted">Following</span>
          </dd>
        </div>
      </dl>
    </header>
  );
}
