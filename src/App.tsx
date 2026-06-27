/**
 * App — top-level router. Wraps every route in the shared AppLayout and
 * the wallet/toast/theme providers (mounted once in main.tsx).
 */

import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { FeedPage } from '@/pages/FeedPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CreatePostPage } from '@/pages/CreatePostPage';
import { SearchPage } from '@/pages/SearchPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/create" element={<CreatePostPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
