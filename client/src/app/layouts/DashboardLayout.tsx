import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Outlet, useMatches, useNavigate } from 'react-router-dom';
import type { RouteHandle } from '@/app/router';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  useAccountInfo,
  useConnectionStatus,
  useDisconnectFromNATS,
} from '@/features/connection/useNATS';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  const navigate = useNavigate();
  const { data: status } = useConnectionStatus();
  const { data: accountInfo } = useAccountInfo(status?.connected);
  const disconnectMutation = useDisconnectFromNATS();

  const match = [...useMatches()].reverse().find((m) => m.handle) as
    | { handle: RouteHandle; params: Record<string, string | undefined> }
    | undefined;
  const title =
    typeof match?.handle.title === 'function'
      ? match.handle.title(match.params)
      : (match?.handle.title ?? 'Dashboard');
  const parent = match?.handle.parent;

  useEffect(() => {
    document.title = `${title} · HeyNATS`;
  }, [title]);

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Disconnect failed:', error);
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="bg-card border-b shrink-0 p-4 py-3 mb-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex min-w-0 items-center gap-1 text-xl font-bold text-gray-900">
                {parent && (
                  <>
                    <Link
                      to={parent.to}
                      className="font-medium text-gray-500 hover:text-gray-900"
                    >
                      {parent.label}
                    </Link>
                    <ChevronRight className="size-4 shrink-0 text-gray-400" />
                  </>
                )}
                <span className="truncate">{title}</span>
              </h1>
              <p className="truncate text-xs text-gray-500 mt-0.5">
                {accountInfo?.account_information ? (
                  <>
                    Connected as{' '}
                    <span className="font-medium">
                      {accountInfo.account_information.user}
                    </span>{' '}
                    • Account: {accountInfo.account_information.account}
                  </>
                ) : (
                  'Managing NATS server connections and monitoring'
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                disabled={disconnectMutation.isPending}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {disconnectMutation.isPending
                  ? 'Disconnecting...'
                  : 'Disconnect'}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 pt-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
