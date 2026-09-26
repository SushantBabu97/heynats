import { History, Loader2, PlugZap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { type ConnectionCredentials, natsApi } from '@/lib/api';
import {
  AuthFields,
  type AuthMethod,
  authMethodOf,
  withOnlyAuth,
} from './AuthFields';

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
  const [authMethod, setAuthMethod] = useState<AuthMethod>('user');
  const [testing, setTesting] = useState(false);
  const [saveConnection, setSaveConnection] = useState(false);
  const [showContextManager, setShowContextManager] = useState(false);
  const { getDefaultContext } = useNATSContexts();

  // Load default context on component mount
  useEffect(() => {
    const loadDefaultContext = async () => {
      const defaultContextResult = await getDefaultContext();
      if (defaultContextResult.success && defaultContextResult.data) {
        const context = defaultContextResult.data;
        setCredentials(withOnlyAuth(context, authMethodOf(context)));
        setAuthMethod(authMethodOf(context));
        setSaveConnection(true);
      } else {
        // Fallback to localStorage if no context is set
        const savedCredentials = localStorage.getItem('nats-connection');
        if (savedCredentials) {
          try {
            const parsed = JSON.parse(savedCredentials);
            setCredentials(parsed);
            setAuthMethod(authMethodOf(parsed));
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
    const payload = withOnlyAuth(credentials, authMethod);

    // Save credentials to localStorage if checkbox is checked
    if (saveConnection) {
      localStorage.setItem('nats-connection', JSON.stringify(payload));
    } else {
      localStorage.removeItem('nats-connection');
    }

    await onConnect(payload);
  };

  const handleTest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form;
    if (form && !form.reportValidity()) return;
    setTesting(true);
    try {
      const res = await natsApi.test(withOnlyAuth(credentials, authMethod));
      toast.success(`Connected to ${res.server_name} (v${res.version}).`);
    } catch (err) {
      const details = (err as { details?: string }).details;
      const msg = err instanceof Error ? err.message : 'Connection failed';
      toast.error(details ? `${msg}: ${details}` : msg);
    } finally {
      setTesting(false);
    }
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
    setCredentials(withOnlyAuth(context, authMethodOf(context)));
    setAuthMethod(authMethodOf(context));
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
            <div className="-mt-2 -mb-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowContextManager(true)}
                disabled={isLoading}
              >
                <History />
                Saved connections
              </Button>
            </div>
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
            <AuthFields
              value={credentials}
              method={authMethod}
              onMethodChange={setAuthMethod}
              onChange={handleInputChange}
              disabled={isLoading}
            />

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
                  Stored unencrypted in local storage, including secrets.
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

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={isLoading || testing}
              >
                {testing ? <Loader2 className="animate-spin" /> : <PlugZap />}
                {testing ? 'Testing…' : 'Test'}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                {isLoading ? 'Connecting…' : 'Connect'}
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
