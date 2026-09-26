import { AlertCircle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Page description with page-level actions; the title lives in the layout header. */
export function PageIntro({
  description,
  actions,
}: {
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{description}</p>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'default',
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: 'default' | 'error';
  className?: string;
}) {
  const error = tone === 'error';
  return (
    <div
      role={error ? 'alert' : undefined}
      className={cn(
        'flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-12 text-center',
        error && 'border-solid border-destructive/30 bg-destructive/5',
        className
      )}
    >
      <div
        className={cn(
          'mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5',
          error && 'bg-destructive/10 text-destructive'
        )}
        aria-hidden="true"
      >
        {icon ?? (error ? <AlertCircle /> : null)}
      </div>
      <h3 className="font-medium">{title}</h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}
