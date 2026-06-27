/**
 * Navbar — sticky top bar present on every page: branding, a quick link
 * into search, theme toggle, and the wallet connect/disconnect control.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useTheme } from '@/context/ThemeContext';
import { truncateAddress } from '@/utils/format';

export function Navbar() {
  const { account, isConnecting, connect, disconnect } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-border bg-ink-deep/95 px-4 backdrop-blur">
      <Link to="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-seal font-display text-sm font-bold text-parchment">
          匠
        </span>
        <span className="font-display text-lg tracking-wide text-parchment">TAKUMI</span>
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/search')}
          aria-label="Search"
          className="rounded-full p-2 text-parchment-muted transition hover:bg-ink-raised hover:text-parchment"
        >
          🔍
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-full p-2 text-parchment-muted transition hover:bg-ink-raised hover:text-parchment"
        >
          {theme === 'dark' ? '☼' : '☾'}
        </button>

        {account ? (
          <button
            type="button"
            onClick={() => void disconnect()}
            className="rounded-full border border-ink-border px-3 py-1.5 font-mono text-xs text-parchment transition hover:border-seal hover:text-seal-bright"
            title="Disconnect wallet"
          >
            {truncateAddress(account.address)}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void connect()}
            disabled={isConnecting}
            className="rounded-full bg-jade px-4 py-1.5 text-sm font-medium text-ink-deep transition hover:bg-jade-bright disabled:opacity-60"
          >
            {isConnecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
