/**
 * Sidebar — primary navigation. Renders as a left rail on tablet/desktop
 * and collapses into a fixed bottom tab bar on mobile, per the
 * mobile-first requirement.
 */

import { NavLink } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

function buildNavItems(profileAddress: string | null): NavItem[] {
  return [
    { to: '/', label: 'Feed', icon: '🏠' },
    { to: '/create', label: 'Create', icon: '✍️' },
    { to: '/search', label: 'Search', icon: '🔍' },
    { to: '/notifications', label: 'Alerts', icon: '🔔' },
    { to: profileAddress ? `/profile/${profileAddress}` : '/settings', label: 'Profile', icon: '匠' },
    { to: '/settings', label: 'Settings', icon: '⚙' },
  ];
}

export function Sidebar() {
  const { account } = useWallet();
  const items = buildNavItems(account?.address ?? null);

  return (
    <nav
      className="fixed bottom-0 left-0 z-20 flex w-full justify-around border-t border-ink-border bg-ink-deep/95 py-2 backdrop-blur md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:w-56 md:flex-col md:justify-start md:gap-1 md:border-t-0 md:border-r md:px-3 md:py-4"
      aria-label="Primary"
    >
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
              isActive ? 'text-jade-bright md:bg-ink-raised' : 'text-parchment-muted hover:text-parchment'
            }`
          }
        >
          <span aria-hidden="true" className="text-lg md:text-base">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
