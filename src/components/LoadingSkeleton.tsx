/**
 * LoadingSkeleton — shimmering placeholder blocks shown while on-chain
 * data is loading. `variant` picks the shape that matches the content it
 * stands in for.
 */

interface LoadingSkeletonProps {
  variant?: 'post' | 'profile' | 'line' | 'avatar';
  count?: number;
}

function Shimmer({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-ink-raised ${className}`}
      aria-hidden="true"
    />
  );
}

function PostSkeleton() {
  return (
    <div className="flex gap-3 border-b border-ink-border p-4">
      <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3 w-32" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-2/3" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Shimmer className="h-24 w-24 rounded-full" />
      <Shimmer className="h-4 w-40" />
      <Shimmer className="h-3 w-60" />
    </div>
  );
}

export function LoadingSkeleton({ variant = 'post', count = 3 }: LoadingSkeletonProps) {
  if (variant === 'line') {
    return (
      <div className="space-y-2 p-4" role="status" aria-label="Loading">
        {Array.from({ length: count }).map((_, i) => (
          <Shimmer key={i} className="h-3 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return <Shimmer className="h-10 w-10 rounded-full" />;
  }

  if (variant === 'profile') {
    return <ProfileSkeleton />;
  }

  return (
    <div role="status" aria-label="Loading posts">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
