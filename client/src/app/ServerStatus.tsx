import { useQuery } from '@tanstack/react-query';
import { useConnectionStatus } from '@/features/connection/useNATS';
import { healthApi } from '@/lib/api';
import { cn } from '@/lib/utils';

function Row({
  label,
  ok,
  text,
  compact,
}: {
  label: string;
  ok: boolean;
  text: string;
  compact: boolean;
}) {
  return (
    <div className="flex items-center gap-2" title={`${label}: ${text}`}>
      <span
        className={cn(
          'size-2 shrink-0 rounded-full',
          ok ? 'bg-success' : 'bg-destructive'
        )}
        aria-hidden="true"
      />
      {compact ? (
        <span className="sr-only">{`${label}: ${text}`}</span>
      ) : (
        <span className="truncate">
          {label} <span className="text-muted-foreground">{text}</span>
        </span>
      )}
    </div>
  );
}

/** API and NATS health, shown in the sidebar footer. */
export function ServerStatus({ compact }: { compact: boolean }) {
  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.getHealth,
    refetchInterval: 10000,
  });
  const { data: nats } = useConnectionStatus();

  return (
    <div
      className={cn(
        'space-y-1.5 rounded-lg border bg-background px-3 py-2 text-xs',
        compact && 'flex flex-col items-center px-0'
      )}
    >
      <Row
        label="API"
        ok={health?.status === 'healthy'}
        text={health?.status ?? 'unknown'}
        compact={compact}
      />
      <Row
        label="NATS"
        ok={!!nats?.connected}
        text={nats?.connected ? 'connected' : 'disconnected'}
        compact={compact}
      />
    </div>
  );
}
