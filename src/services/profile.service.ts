/**
 * Profile service.
 *
 * Handles "Create Profile" and "Edit Profile": both are submitted as
 * signed `takumi.profile.*` transactions, and profile reads come straight
 * from Canopy's `/v1/query/profile/*` endpoints.
 */

import { rpcGet } from '@/lib/canopyClient';
import { submitTakumiTx } from '@/lib/txBuilder';
import { USE_MOCK } from '@/config/mock';
import { mockCreateProfile, mockGetProfileByAddress, mockGetProfileByUsername, mockUpdateProfile } from '@/services/mockService';
import type { Profile, ProfileDraft, Address } from '@/types/domain';
import type { TxSubmissionResult } from '@/types/transaction';

/** Fetches a profile by wallet address. Returns null if none exists yet. */
export async function getProfileByAddress(address: Address): Promise<Profile | null> {
  if (USE_MOCK) return mockGetProfileByAddress(address);
  try {
    return await rpcGet<Profile>(`/v1/query/profile/${address}`);
  } catch {
    return null;
  }
}

/** Fetches a profile by its chosen username. Returns null if not found. */
export async function getProfileByUsername(username: string): Promise<Profile | null> {
  if (USE_MOCK) return mockGetProfileByUsername(username);
  try {
    return await rpcGet<Profile>(`/v1/query/profile/by-username/${encodeURIComponent(username)}`);
  } catch {
    return null;
  }
}

/** Creates the on-chain profile record for the connected wallet. */
export async function createProfile(
  sender: Address,
  draft: ProfileDraft,
): Promise<TxSubmissionResult> {
  if (USE_MOCK) return mockCreateProfile(sender, draft);
  return submitTakumiTx('takumi.profile.create', sender, draft);
}

/** Updates the connected wallet's existing on-chain profile record. */
export async function updateProfile(
  sender: Address,
  draft: Omit<ProfileDraft, 'username'>,
): Promise<TxSubmissionResult> {
  if (USE_MOCK) return mockUpdateProfile(sender, draft);
  return submitTakumiTx('takumi.profile.update', sender, draft);
}
