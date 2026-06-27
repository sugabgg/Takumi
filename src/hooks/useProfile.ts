/**
 * useProfile — loads a profile (by address) plus its on-chain reputation
 * summary, and exposes a refresh function for use after edits.
 */

import { useCallback, useEffect, useState } from 'react';
import { getProfileByAddress } from '@/services/profile.service';
import { getReputationSummary } from '@/services/reputation.service';
import type { ReputationSummary } from '@/services/reputation.service';
import type { Profile } from '@/types/domain';

interface UseProfileResult {
  profile: Profile | null;
  reputation: ReputationSummary | null;
  isLoading: boolean;
  notFound: boolean;
  refresh: () => void;
}

export function useProfile(address: string | undefined): UseProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reputation, setReputation] = useState<ReputationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!address) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    try {
      const [profileResult, reputationResult] = await Promise.all([
        getProfileByAddress(address),
        getReputationSummary(address),
      ]);
      setProfile(profileResult);
      setReputation(reputationResult);
      setNotFound(profileResult === null);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, reputation, isLoading, notFound, refresh: () => void load() };
}
