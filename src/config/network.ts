/**
 * Network configuration for TAKUMI.
 *
 * Defines the Canopy Network RPC endpoints the app talks to and the
 * failover policy used when the primary node is unreachable. All values
 * are read from environment variables (see .env.example) with sane
 * defaults matching a local Canopy devnet.
 */

export interface RetryPolicy {
  /** Max attempts against a single endpoint before failing over. */
  maxRetries: number;
  /** Base delay (ms) between retries, doubled on each subsequent attempt. */
  baseDelayMs: number;
  /** Per-request timeout (ms) before an attempt is considered failed. */
  timeoutMs: number;
}

export interface NetworkConfig {
  primaryRpcUrl: string;
  secondaryRpcUrl: string;
  chainId: number | null;
  retry: RetryPolicy;
}

const env = import.meta.env;

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Primary Canopy RPC endpoint — attempted first on every request. */
export const RPC_PRIMARY: string = env.RPC_PRIMARY ?? 'http://127.0.0.1:50002';

/** Secondary Canopy RPC endpoint — used automatically if the primary fails. */
export const RPC_SECONDARY: string = env.RPC_SECONDARY ?? 'http://127.0.0.1:50003';

/** Retry/backoff/timeout policy applied to every RPC call. */
export const RETRY_POLICY: RetryPolicy = {
  maxRetries: readNumber(env.VITE_RPC_MAX_RETRIES, 2),
  baseDelayMs: 300,
  timeoutMs: readNumber(env.VITE_RPC_TIMEOUT_MS, 8000),
};

/** Full network configuration, composed from the values above. */
export const NETWORK_CONFIG: NetworkConfig = {
  primaryRpcUrl: RPC_PRIMARY,
  secondaryRpcUrl: RPC_SECONDARY,
  chainId: env.VITE_CHAIN_ID ? Number(env.VITE_CHAIN_ID) : null,
  retry: RETRY_POLICY,
};

/** Ordered list of endpoints to try, primary first. */
export function getEndpointPriority(): string[] {
  return [NETWORK_CONFIG.primaryRpcUrl, NETWORK_CONFIG.secondaryRpcUrl];
}
