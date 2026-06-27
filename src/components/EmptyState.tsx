/**
 * EmptyState — shown wherever a list has nothing to render. Copy is
 * written as an invitation to act, not an apology, per TAKUMI's voice.
 */

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, icon = '匠' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="font-display text-3xl text-jade/60" aria-hidden="true">
        {icon}
      </span>
      <h3 className="font-display text-lg text-parchment">{title}</h3>
      {description && <p className="max-w-sm text-sm text-parchment-muted">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-full bg-jade px-5 py-2 text-sm font-medium text-ink-deep transition hover:bg-jade-bright"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
