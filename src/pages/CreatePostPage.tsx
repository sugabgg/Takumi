/**
 * CreatePostPage — dedicated route for composing a new on-chain post,
 * for direct navigation (e.g. from a bookmark or the mobile nav).
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/context/WalletContext';
import { useToast } from '@/context/ToastContext';
import { createPost } from '@/services/post.service';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';

const MAX_LENGTH = 280;

export function CreatePostPage() {
  const { account, profile } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  if (!account || !profile) {
    return (
      <EmptyState
        title="Set up your profile first"
        description="You need an on-chain profile before you can publish posts."
        actionLabel="Go to settings"
        onAction={() => navigate('/settings')}
      />
    );
  }

  const remaining = MAX_LENGTH - content.length;
  const canPublish = content.trim().length > 0 && remaining >= 0 && !isPublishing;

  async function handlePublish() {
    if (!canPublish) return;
    setIsPublishing(true);
    try {
      const result = await createPost(account.address, content.trim());
      if (!result.accepted) throw new Error('rejected');
      showToast('Post published on-chain.', 'success');
      navigate('/');
    } catch {
      showToast('The network rejected that post. Try again.', 'error');
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="p-4">
      <h1 className="font-display text-lg text-parchment">Create post</h1>

      <div className="mt-4 flex gap-3">
        <Avatar seed={profile.avatarSeed} displayName={profile.displayName} size={40} />
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you make today?"
          rows={6}
          className="flex-1 resize-none rounded-lg border border-ink-border bg-ink-panel p-3 text-parchment outline-none placeholder:text-parchment-faint focus:border-jade"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs ${remaining < 0 ? 'text-seal-bright' : 'text-parchment-faint'}`}>
          {remaining} characters left
        </span>
        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          className="rounded-full bg-jade px-6 py-2 text-sm font-medium text-ink-deep transition hover:bg-jade-bright disabled:opacity-50"
        >
          {isPublishing ? 'Publishing…' : 'Publish on-chain'}
        </button>
      </div>
    </div>
  );
}
