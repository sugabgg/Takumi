import { EmptyState } from '@/components/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      title="This page doesn't exist on-chain or off it"
      description="The route you followed doesn't match anything in TAKUMI."
      actionLabel="Back to feed"
      onAction={() => {
        window.location.href = '/';
      }}
    />
  );
}
