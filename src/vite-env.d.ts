/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RPC_PRIMARY?: string;
  readonly RPC_SECONDARY?: string;
  readonly VITE_CHAIN_ID?: string;
  readonly VITE_RPC_MAX_RETRIES?: string;
  readonly VITE_RPC_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
