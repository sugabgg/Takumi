/**
 * ToastViewport — fixed-position renderer for the active toast queue.
 * Mounted once near the app root.
 */

import { useToast } from '@/context/ToastContext';
import type { ToastVariant } from '@/context/ToastContext';

const VARIANT_CLASS: Record<ToastVariant, string> = {
  info: 'border-ink-border text-parchment',
  success: 'border-jade text-jade-bright',
  error: 'border-seal text-seal-bright',
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={`animate-fade-up rounded-lg border bg-ink-panel px-4 py-2.5 text-left text-sm shadow-panel ${VARIANT_CLASS[toast.variant]}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
