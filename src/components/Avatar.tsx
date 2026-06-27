/**
 * Avatar — renders a profile's deterministic seed-based identity circle.
 */

import { avatarColor, avatarInitial } from '@/utils/avatar';

interface AvatarProps {
  seed: string;
  displayName: string;
  size?: number;
}

export function Avatar({ seed, displayName, size = 40 }: AvatarProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-ink-deep"
      style={{ width: size, height: size, backgroundColor: avatarColor(seed), fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {avatarInitial(displayName)}
    </div>
  );
}
