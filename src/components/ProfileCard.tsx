/**
 * ProfileCard — compact profile summary used in search results, the
 * trending panel, and "who to follow"-style lists.
 */

import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Avatar } from './Avatar';
import { ReputationBadge } from './ReputationBadge';
import { formatCompactNumber, truncateAddress } from '@/utils/format';
import type { Profile } from '@/types/domain';

interface ProfileCardProps {
  profile: Profile;
  trailing?: ReactNode;
}

export function ProfileCard({ profile, trailing }: ProfileCardProps) {
  return (
    <Link
      to={`/profile/${profile.address}`}
      className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-ink-raised"
    >
      <Avatar seed={profile.avatarSeed} displayName={profile.displayName} size={44} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-parchment">{profile.displayName}</p>
        <p className="truncate text-sm text-parchment-muted">
          @{profile.username} · {truncateAddress(profile.address)}
        </p>
        <p className="text-xs text-parchment-faint">
          {formatCompactNumber(profile.followerCount)} followers
        </p>
      </div>
      {trailing ?? <ReputationBadge score={profile.reputationScore} size="sm" />}
    </Link>
  );
}
