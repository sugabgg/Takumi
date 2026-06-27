/**
 * Transaction builder/submitter.
 *
 * Wraps the wallet keystore + Canopy RPC client into a single helper so
 * every service module submits on-chain writes the same way: build a
 * canonical unsigned tx -> sign it -> POST it to `/v1/tx` -> return the
 * resulting hash. Nonces are tracked per-sender in memory and reconciled
 * against the chain's reported nonce before each submission to avoid
 * collisions across browser tabs.
 */

import { rpcPost, rpcGet } from './canopyClient';
import { signPayload, getActivePublicKey } from './walletKeystore';
import type {
  TakumiTxType,
  TakumiTxPayloadMap,
  UnsignedTakumiTx,
  SignedTakumiTx,
  TxSubmissionResult,
} from '@/types/transaction';
import type { Address } from '@/types/domain';

const nonceCache = new Map<Address, number>();

interface ChainNonceResponse {
  nonce: number;
}

async function fetchChainNonce(sender: Address): Promise<number> {
  try {
    const result = await rpcGet<ChainNonceResponse>(`/v1/query/account/${sender}/nonce`);
    return result.nonce;
  } catch {
    // Node may not have an account record yet (first transaction ever).
    return 0;
  }
}

async function nextNonce(sender: Address): Promise<number> {
  const cached = nonceCache.get(sender);
  if (cached !== undefined) return cached + 1;
  const chainNonce = await fetchChainNonce(sender);
  return chainNonce + 1;
}

function canonicalize<T extends TakumiTxType>(tx: UnsignedTakumiTx<T>): string {
  // Deterministic key ordering so the signature is reproducible/verifiable.
  return JSON.stringify(tx, Object.keys(tx).sort());
}

/**
 * Builds, signs, and submits an on-chain TAKUMI transaction. Returns the
 * resulting transaction hash once the node accepts it into its mempool.
 */
export async function submitTakumiTx<T extends TakumiTxType>(
  type: T,
  sender: Address,
  payload: TakumiTxPayloadMap[T],
): Promise<TxSubmissionResult> {
  const nonce = await nextNonce(sender);

  const unsigned: UnsignedTakumiTx<T> = {
    type,
    payload,
    sender,
    nonce,
    createdAt: new Date().toISOString(),
  };

  const signature = await signPayload(canonicalize(unsigned));
  const publicKey = await getActivePublicKey();

  const signedTx: SignedTakumiTx<T> = { unsigned, signature, publicKey };

  const result = await rpcPost<TxSubmissionResult>('/v1/tx', signedTx);

  if (result.accepted) {
    nonceCache.set(sender, nonce);
  }

  return result;
}
