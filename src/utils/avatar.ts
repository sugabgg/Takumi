/**
 * Deterministic avatar utility.
 *
 * TAKUMI does not host avatar image uploads — every profile's avatar is a
 * deterministic ink-wash color derived from its on-chain `avatarSeed`
 * (set at profile creation), paired with the profile's first initial.
 * Same seed always produces the same look, with no image hosting needed.
 */

const PALETTE = ['#5FA777', '#B5402C', '#7FD19C', '#D85B3F', '#3E7355', '#9CA293'];

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarColor(seed: string): string {
  const index = hashSeed(seed) % PALETTE.length;
  return PALETTE[index] ?? PALETTE[0]!;
}

export function avatarInitial(displayName: string): string {
  return displayName.trim().charAt(0).toUpperCase() || '?';
}
