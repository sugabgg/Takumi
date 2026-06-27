/**
 * Notification service.
 *
 * Notifications are derived on-chain events (likes, comments, follows,
 * reposts targeting the viewer) indexed by the Canopy node. Read state is
 * tracked locally per-device since "read/unread" is a viewer-side concern,
 * not chain state.
 */

import { rpcGet } from '@/lib/canopyClient';
import { readCache, writeCache } from '@/lib/localCache';
import type { Address, AppNotification, Page } from '@/types/domain';

function readReceiptsKey(address: Address): string {
  return `read-receipts:${address}`;
}

/** Fetches notifications addressed to the given account, newest first. */
export async function getNotifications(
  address: Address,
  cursor?: string | null,
): Promise<Page<AppNotification>> {
  const params = new URLSearchParams({ limit: '30' });
  if (cursor) params.set('cursor', cursor);

  const page = await rpcGet<Page<AppNotification>>(
    `/v1/query/notifications/${address}?${params.toString()}`,
  );

  const readIds = new Set(readCache<string[]>(readReceiptsKey(address)) ?? []);
  return {
    ...page,
    items: page.items.map((n) => ({ ...n, read: n.read || readIds.has(n.id) })),
  };
}

/** Marks a notification as read on this device. */
export function markAsRead(address: Address, notificationId: string): void {
  const key = readReceiptsKey(address);
  const readIds = new Set(readCache<string[]>(key) ?? []);
  readIds.add(notificationId);
  writeCache(key, Array.from(readIds));
}

/** Marks every currently-loaded notification as read on this device. */
export function markAllAsRead(address: Address, notificationIds: string[]): void {
  const key = readReceiptsKey(address);
  const readIds = new Set(readCache<string[]>(key) ?? []);
  notificationIds.forEach((id) => readIds.add(id));
  writeCache(key, Array.from(readIds));
}
