/**
 * Canopy RPC client.
 *
 * Every service module in TAKUMI goes through this single client so that
 * retry/failover behaviour lives in exactly one place. Canopy nodes expose
 * a JSON-RPC-over-HTTP interface: state reads go through `/v1/query/*`
 * and state-changing actions are submitted as signed transactions through
 * `/v1/tx`. See each service module for the concrete endpoints used.
 *
 * Failover policy: a call is attempted against the primary endpoint first.
 * If it fails (network error, timeout, or 5xx) it is retried against the
 * same endpoint up to `retry.maxRetries` times with exponential backoff,
 * then automatically retried against the secondary endpoint before the
 * call is reported as failed.
 */

import { getEndpointPriority, RETRY_POLICY } from '@/config/network';

export class RpcError extends Error {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly status?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'RpcError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  signal?: AbortSignal;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function attemptEndpoint<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_POLICY.maxRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        `${baseUrl}${path}`,
        {
          method: options.method ?? 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        },
        RETRY_POLICY.timeoutMs,
      );

      if (!response.ok) {
        throw new RpcError(
          `Canopy node responded with status ${response.status}`,
          baseUrl,
          response.status,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_POLICY.maxRetries) {
        await delay(RETRY_POLICY.baseDelayMs * 2 ** attempt);
      }
    }
  }

  throw new RpcError(
    `All attempts against ${baseUrl} failed`,
    baseUrl,
    undefined,
    lastError,
  );
}

/**
 * Calls the Canopy RPC, trying every configured endpoint in priority order
 * (primary, then secondary). Resolves with the parsed JSON response from
 * the first endpoint that succeeds; rejects with an AggregateRpcError if
 * every endpoint fails.
 */
export async function callRpc<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const endpoints = getEndpointPriority();
  const errors: RpcError[] = [];

  for (const endpoint of endpoints) {
    try {
      return await attemptEndpoint<T>(endpoint, path, options);
    } catch (error) {
      if (error instanceof RpcError) errors.push(error);
    }
  }

  throw new AggregateRpcError(
    'All Canopy RPC endpoints (primary and secondary) are unreachable.',
    errors,
  );
}

export class AggregateRpcError extends Error {
  constructor(
    message: string,
    public readonly endpointErrors: RpcError[],
  ) {
    super(message);
    this.name = 'AggregateRpcError';
  }
}

/** Convenience GET wrapper, used for simple Canopy `/v1/query/*` reads. */
export function rpcGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return callRpc<T>(path, { method: 'GET', signal });
}

/** Convenience POST wrapper, used for Canopy `/v1/query/*` and `/v1/tx` calls. */
export function rpcPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return callRpc<T>(path, { method: 'POST', body, signal });
}
