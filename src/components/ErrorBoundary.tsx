/**
 * ErrorBoundary — catches render-time errors in its subtree so a single
 * broken panel (e.g. a malformed on-chain response) can't take down the
 * entire app shell.
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('TAKUMI render error:', error, info.componentStack);
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="font-display text-3xl text-seal" aria-hidden="true">
          ✕
        </span>
        <h3 className="font-display text-lg text-parchment">
          {this.props.fallbackTitle ?? 'Something broke while rendering this view'}
        </h3>
        <p className="max-w-sm text-sm text-parchment-muted">{error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="mt-2 rounded-full border border-ink-border px-5 py-2 text-sm font-medium text-parchment transition hover:border-jade hover:text-jade"
        >
          Try again
        </button>
      </div>
    );
  }
}
