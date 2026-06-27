/**
 * AppLayout — the persistent app shell: top navbar, left navigation,
 * routed page content in the center column, and the trending rail on
 * wide viewports.
 */

import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { TrendingPanel } from '@/components/TrendingPanel';
import { ToastViewport } from '@/components/ToastViewport';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-ink-deep text-parchment">
      <Navbar />
      <div className="mx-auto flex max-w-5xl">
        <Sidebar />
        <main className="min-h-[calc(100vh-3.5rem)] w-full flex-1 border-x border-ink-border pb-16 md:pb-0">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <TrendingPanel />
      </div>
      <ToastViewport />
    </div>
  );
}
