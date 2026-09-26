import { History, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ContextManager } from '@/features/connection/contexts/ContextManager';
import type { NATSContext } from '@/features/connection/contexts/types';
import { useNATSContexts } from '@/features/connection/contexts/useNATSContexts';
import type { ConnectionCredentials } from '@/lib/api';

interface ConnectionFormProps {
  onConnect: (credentials: ConnectionCredentials) => Promise<void>;
  isLoading: boolean;
  error?: string;
}

export function ConnectionForm({
  onConnect,
  isLoading,
  error,
}: ConnectionFormProps) {
  const [credentials, setCredentials] = useState<ConnectionCredentials>({
    host: 'localhost',
    port: '4222',
    username: '',
    password: '',
  });
  const [saveConnection, setSaveConnection] = useState(false);
  const [showContextManager, setShowContextManager] = useState(false);
  const { getDefaultContext } = useNATSContexts();

  // Load default context on component mount
  useEffect(() => {
    const loadDefaultContext = async () => {
      const defaultContextResult = await getDefaultContext();
      if (defaultContextResult.success && defaultContextResult.data) {
        const context = defaultContextResult.data;
        setCredentials({
          host: context.host,
          port: context.port,
          username: context.username,
          password: context.password,
        });
        setSaveConnection(true);
      } else {
        // Fallback to localStorage if no context is set
        const savedCredentials = localStorage.getItem('nats-connection');
        if (savedCredentials) {
          try {
            const parsed = JSON.parse(savedCredentials);
            setCredentials(parsed);
            setSaveConnection(true);
          } catch (error) {
            console.error('Failed to parse saved credentials:', error);
          }
        }
      }
    };

    loadDefaultContext();
  }, [getDefaultContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save credentials to localStorage if checkbox is checked
    if (saveConnection) {
      localStorage.setItem('nats-connection', JSON.stringify(credentials));
    } else {
      localStorage.removeItem('nats-connection');
    }

    await onConnect(credentials);
  };

  const handleInputChange = (
    field: keyof ConnectionCredentials,
    value: string
  ) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectContext = (context: NATSContext) => {
    setCredentials({
      host: context.host,
      port: context.port,
      username: context.username,
      password: context.password,
    });
    setSaveConnection(true);
    setShowContextManager(false);
  };

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src="/heynats.jpg"
              alt=""
              className="mb-4 size-12 rounded-xl shadow-sm"
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Connect to NATS
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage streams, key-value buckets and live messages.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <div className="space-y-1.5">
                <label htmlFor="host" className="text-sm font-medium">
                  Host
                </label>
                <Input
                  id="host"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="localhost"
                  value={credentials.host}
                  onChange={(e) => handleInputChange('host', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="port" className="text-sm font-medium">
                  Port
                </label>
                <Input
                  id="port"
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="4222"
                  value={credentials.port}
                  onChange={(e) => handleInputChange('port', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="optional"
                  value={credentials.username}
                  onChange={(e) =>
                    handleInputChange('username', e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="optional"
                  value={credentials.password}
                  onChange={(e) =>
                    handleInputChange('password', e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>

            <label
              htmlFor="save-connection"
              className="flex items-start gap-2 text-sm"
            >
              <input
                id="save-connection"
                type="checkbox"
                checked={saveConnection}
                onChange={(e) => setSaveConnection(e.target.checked)}
                disabled={isLoading}
                className="mt-0.5 size-4 rounded border-input accent-primary"
              />
              <span>
                Remember in this browser
                <span className="block text-xs text-muted-foreground">
                  Stored unencrypted in local storage, including the password.
                </span>
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <div className="space-y-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="animate-spin" />}
                {isLoading ? 'Connecting…' : 'Connect'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowContextManager(true)}
                disabled={isLoading}
                className="w-full"
              >
                <History />
                Saved connections
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Dialog open={showContextManager} onOpenChange={setShowContextManager}>
        <DialogContent
          aria-describedby={undefined}
          className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>Saved connections</DialogTitle>
          </DialogHeader>
          <ContextManager
            onSelectContext={handleSelectContext}
            onClose={() => setShowContextManager(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
