/**
 * Wallet context.
 *
 * Holds the connected account (if any) and exposes connect/disconnect
 * actions. Every page that needs "who am I" reads from this context
 * instead of re-querying the keystore directly.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { isWalletInitialized, login, logout } from '@/services/wallet.service';
import { getProfileByAddress } from '@/services/profile.service';
import type { Profile, WalletAccount } from '@/types/domain';

interface WalletContextValue {
  account: WalletAccount | null;
  profile: Profile | null;
  isConnecting: boolean;
  isInitializing: boolean;
  isProfileLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const loadProfileFor = useCallback(async (address: string) => {
    setIsProfileLoading(true);
    try {
      setProfile(await getProfileByAddress(address));
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  // Auto-reconnect on load if a keystore already exists on this device.
  useEffect(() => {
    let mounted = true;
    (async () => {
      const initialized = await isWalletInitialized();
      if (initialized) {
        const wallet = await login();
        if (mounted) {
          setAccount(wallet);
          await loadProfileFor(wallet.address);
        }
      }
      if (mounted) setIsInitializing(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadProfileFor]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const wallet = await login();
      setAccount(wallet);
      await loadProfileFor(wallet.address);
    } finally {
      setIsConnecting(false);
    }
  }, [loadProfileFor]);

  const disconnect = useCallback(async () => {
    await logout();
    setAccount(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (account) await loadProfileFor(account.address);
  }, [account, loadProfileFor]);

  const value = useMemo(
    () => ({
      account,
      profile,
      isConnecting,
      isInitializing,
      isProfileLoading,
      connect,
      disconnect,
      refreshProfile,
    }),
    [account, profile, isConnecting, isInitializing, isProfileLoading, connect, disconnect, refreshProfile],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
