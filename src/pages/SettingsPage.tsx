/**
 * SettingsPage — /settings. Wallet management, theme preference, and the
 * currently configured Canopy RPC endpoints (read from network config).
 */

import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useTheme } from '@/context/ThemeContext';
import { NETWORK_CONFIG } from '@/config/network';
import { EmptyState } from '@/components/EmptyState';
import { truncateAddress } from '@/utils/format';

export function SettingsPage() {
  const { account, profile, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!account) {
    return <EmptyState title="Connect your wallet" description="Settings are tied to your on-chain identity." />;
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="font-display text-lg text-parchment">Settings</h1>

      <section className="rounded-lg border border-ink-border p-4">
        <h2 className="text-sm font-medium text-parchment-muted">Wallet</h2>
        <p className="mt-1 font-mono text-sm text-parchment">{account.address}</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => profile && navigate(`/profile/${account.address}`)}
            className="rounded-full border border-ink-border px-4 py-1.5 text-sm text-parchment transition hover:border-jade hover:text-jade"
          >
            {profile ? 'View profile' : 'Create profile'}
          </button>
          <button
            type="button"
            onClick={() => void disconnect()}
            className="rounded-full border border-ink-border px-4 py-1.5 text-sm text-parchment transition hover:border-seal hover:text-seal-bright"
          >
            Disconnect wallet
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-ink-border p-4">
        <h2 className="text-sm font-medium text-parchment-muted">Appearance</h2>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-parchment">Dark mode</span>
          <button
            type="button"
            onClick={toggleTheme}
            className={`h-6 w-11 rounded-full transition ${theme === 'dark' ? 'bg-jade' : 'bg-ink-border'}`}
            aria-pressed={theme === 'dark'}
            aria-label="Toggle dark mode"
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-parchment transition ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-ink-border p-4">
        <h2 className="text-sm font-medium text-parchment-muted">Canopy network</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-parchment-faint">Primary RPC</dt>
            <dd className="font-mono text-parchment">{NETWORK_CONFIG.primaryRpcUrl}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-parchment-faint">Secondary RPC</dt>
            <dd className="font-mono text-parchment">{NETWORK_CONFIG.secondaryRpcUrl}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-parchment-faint">Max retries</dt>
            <dd className="text-parchment">{NETWORK_CONFIG.retry.maxRetries}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-parchment-faint">Timeout</dt>
            <dd className="text-parchment">{NETWORK_CONFIG.retry.timeoutMs}ms</dd>
          </div>
        </dl>
      </section>

      <p className="text-xs text-parchment-faint">
        Connected as {truncateAddress(account.address)}. Every action you take is signed locally and
        submitted on-chain — TAKUMI never stores your data on a server it controls.
      </p>
    </div>
  );
}
