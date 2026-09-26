import { type ReactNode, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useConnectionStatus } from '@/features/connection/useNATS';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: status, isLoading } = useConnectionStatus();
  const wasConnected = useRef(false);
  const connected = !!status?.connected;
  // Set by useDisconnectFromNATS so a deliberate disconnect isn't reported as a loss.
  const userInitiated = !!(status as { userInitiated?: boolean } | undefined)
    ?.userInitiated;

  useEffect(() => {
    if (connected) {
      wasConnected.current = true;
    } else if (wasConnected.current && !userInitiated) {
      toast.error('Connection to NATS lost', {
        description:
          'The server closed the session. Connect again to continue.',
      });
    }
  }, [connected, userInitiated]);

  // Show loading state while checking connection
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Redirect to login if not connected
  if (!connected) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
