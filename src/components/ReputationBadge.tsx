/**
 * ReputationBadge — TAKUMI's signature visual element. Modeled on a hanko
 * (Japanese name-seal): a stamped circle that "certifies" a profile's
 * standing. Tier color escalates with score, echoing how a craftsman's
 * seal carries more weight as their body of work grows.
 */

interface ReputationBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

type Tier = 'apprentice' | 'journeyman' | 'artisan' | 'master';

function getTier(score: number): Tier {
  if (score >= 500) return 'master';
  if (score >= 150) return 'artisan';
  if (score >= 30) return 'journeyman';
  return 'apprentice';
}

const TIER_LABEL: Record<Tier, string> = {
  apprentice: 'Apprentice',
  journeyman: 'Journeyman',
  artisan: 'Artisan',
  master: 'Master',
};

const TIER_RING: Record<Tier, string> = {
  apprentice: 'border-parchment-faint text-parchment-muted',
  journeyman: 'border-jade-dim text-jade',
  artisan: 'border-jade text-jade-bright',
  master: 'border-seal text-seal-bright',
};

const SIZE_CLASS: Record<NonNullable<ReputationBadgeProps['size']>, string> = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-12 w-12 text-xs',
  lg: 'h-20 w-20 text-base',
};

export function ReputationBadge({ score, size = 'md' }: ReputationBadgeProps) {
  const tier = getTier(score);

  return (
    <div className="inline-flex flex-col items-center gap-1" title={`${TIER_LABEL[tier]} · ${score} reputation`}>
      <div
        className={`flex items-center justify-center rounded-seal border-2 font-display font-bold shadow-stamp animate-stamp-in ${TIER_RING[tier]} ${SIZE_CLASS[size]}`}
      >
        {score}
      </div>
      <span className="text-[10px] uppercase tracking-wide text-parchment-faint">
        {TIER_LABEL[tier]}
      </span>
    </div>
  );
}
