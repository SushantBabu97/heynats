import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { ConnectionCredentials } from '@/lib/api';
import { ConnectionForm } from './ConnectionForm';
import { useConnectionStatus, useConnectToNATS } from './useNATS';

export function LoginPage() {
  const navigate = useNavigate();
  const { data: status } = useConnectionStatus();
  const connectMutation = useConnectToNATS();

  // Redirect to dashboard if already connected
  useEffect(() => {
    if (status?.connected) {
      navigate('/dashboard', { replace: true });
    }
  }, [status?.connected, navigate]);

  const handleConnect = async (credentials: ConnectionCredentials) => {
    try {
      await connectMutation.mutateAsync(credentials);
      // Navigation will happen automatically via useEffect when status updates
    } catch (error) {
      // Error is already handled by the mutation and can be accessed via mutation state
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      <ThemeToggle className="fixed top-4 right-4 z-10" />
      <ConnectionForm
        onConnect={handleConnect}
        isLoading={connectMutation.isPending}
        error={connectMutation.error?.message}
      />
    </div>
  );
}
