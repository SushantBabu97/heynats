import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { LoginPage } from '@/features/connection/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { StreamsPage } from '@/features/streams/StreamsPage';
import { StreamDetailPage } from '@/features/streams/StreamDetailPage';
import { KeyValuePage } from '@/features/kv/KeyValuePage';
import { KVBucketDetailPage } from '@/features/kv/KVBucketDetailPage';
import { PublishPage } from '@/features/messaging/PublishPage';
import { SubscribePage } from '@/features/messaging/SubscribePage';
import { AccountPage } from '@/features/dashboard/AccountPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'streams',
            element: <StreamsPage />,
          },
          {
            path: 'streams/:streamName',
            element: <StreamDetailPage />,
          },
          {
            path: 'kv',
            element: <KeyValuePage />,
          },
          {
            path: 'kv/:bucketName',
            element: <KVBucketDetailPage />,
          },
          {
            path: 'publish',
            element: <PublishPage />,
          },
          {
            path: 'subscribe',
            element: <SubscribePage />,
          },
          {
            path: 'account',
            element: <AccountPage />,
          },
        ],
      },
    ],
  },
]);

export default router;