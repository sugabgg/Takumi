/**
 * Wallet service.
 *
 * Owns the "Wallet Login" flow: create or unlock the local keystore,
 * resolve the resulting address against the chain, and expose a clean
 * connect/disconnect API to the rest of the app.
 */

import { createWallet, loadWallet, destroyWallet, hasWallet } from '@/lib/walletKeystore';
import { rpcGet } from '@/lib/canopyClient';
import type { WalletAccount } from '@/types/domain';

interface ChainAccountResponse {
  address: string;
  exists: boolean;
}

/** True if a wallet keystore already exists on this device. */
export async function isWalletInitialized(): Promise<boolean> {
  return hasWallet();
}

/**
 * Logs in: unlocks the existing local keystore if present, otherwise
 * generates a brand-new one. Returns the resulting wallet account.
 */
export async function login(): Promise<WalletAccount> {
  const existing = await loadWallet();
  if (existing) {
    return { address: existing.address, publicKey: '', createdAt: existing.createdAt };
  }

  const created = await createWallet();
  return {
    address: created.address,
    publicKey: created.publicKey,
    createdAt: new Date().toISOString(),
  };
}

/** Logs out and permanently destroys the local keystore on this device. */
export async function logout(): Promise<void> {
  await destroyWallet();
}

/** Confirms whether an address has any on-chain footprint yet. */
export async function checkAccountExists(address: string): Promise<boolean> {
  try {
    const result = await rpcGet<ChainAccountResponse>(`/v1/query/account/${address}`);
    return result.exists;
  } catch {
    return false;
  }
}
