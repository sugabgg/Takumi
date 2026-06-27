/**
 * useInfiniteScroll.
 *
 * Observes a sentinel element and invokes `onIntersect` when it enters the
 * viewport — the standard pattern for infinite-scroll feeds without
 * pulling in a routing/scroll library.
 */

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

export function useInfiniteScroll(onIntersect: () => void, enabled: boolean): RefObject<HTMLDivElement> {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
}
