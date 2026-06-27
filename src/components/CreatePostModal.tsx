/**
 * CreatePostModal — the composer for publishing a new on-chain post.
 * Used both as a floating action ("compose" button) and as the dedicated
 * /create page content.
 */

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';
import { createPost } from '@/services/post.service';
import { Avatar } from './Avatar';
import type { Post } from '@/types/domain';

const MAX_LENGTH = 280;

interface CreatePostModalProps {
  onClose: () => void;
  onPublished: (post: Post) => void;
}

export function CreatePostModal({ onClose, onPublished }: CreatePostModalProps) {
  const { account, profile } = useWallet();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const remaining = MAX_LENGTH - content.length;
  const canPublish = content.trim().length > 0 && remaining >= 0 && !isPublishing;
  const fallbackDisplayName = account ? `Wallet ${account.address.slice(0, 6)}` : 'Anonymous';
  const fallbackUsername = account ? `wallet-${account.address.slice(0, 8)}` : 'anonymous';
  const fallbackAvatarSeed = account?.address ?? 'anonymous';

  async function handlePublish() {
    if (!account || !canPublish) return;
    setIsPublishing(true);
    try {
      const result = await createPost(account.address, content.trim());
      if (!result.accepted) throw new Error('rejected');

      onPublished({
        id: result.hash,
        author: account.address,
        authorUsername: profile?.username ?? fallbackUsername,
        authorDisplayName: profile?.displayName ?? fallbackDisplayName,
        authorAvatarSeed: profile?.avatarSeed ?? fallbackAvatarSeed,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        repostCount: 0,
      });
      showToast('Post published on-chain.', 'success');
      setContent('');
      onClose();
    } catch {
      showToast('The network rejected that post. Try again.', 'error');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-ink-deep/80 px-4 pt-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Create post"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-ink-border bg-ink-panel p-4 shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          <Avatar
            seed={profile?.avatarSeed ?? fallbackAvatarSeed}
            displayName={profile?.displayName ?? fallbackDisplayName}
            size={40}
          />
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you make today?"
            rows={4}
            className="flex-1 resize-none bg-transparent text-parchment outline-none placeholder:text-parchment-faint"
          />
        </div>

        {!profile && (
          <p className="mt-3 text-xs text-parchment-faint">
            Posting works right away with your wallet; a profile will be attached later if you create one.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-ink-border pt-3">
          <span className={`text-xs ${remaining < 0 ? 'text-seal-bright' : 'text-parchment-faint'}`}>
            {remaining}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-1.5 text-sm text-parchment-muted transition hover:text-parchment"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish}
              className="rounded-full bg-jade px-5 py-1.5 text-sm font-medium text-ink-deep transition hover:bg-jade-bright disabled:opacity-50"
            >
              {isPublishing ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
