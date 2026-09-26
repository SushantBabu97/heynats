import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Connection } from '@/lib/api';
import {
  cn,
  formatBytes,
  formatDuration,
  formatRTT,
  formatTimestamp,
} from '@/lib/utils';

function InOut({ inbound, outbound }: { inbound: string; outbound: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="inline-flex items-center gap-0.5">
        <ArrowDown className="size-3 text-success" aria-hidden="true" />
        <span className="sr-only">in </span>
        {inbound}
      </span>
      <span className="inline-flex items-center gap-0.5">
        <ArrowUp className="size-3 text-primary" aria-hidden="true" />
        <span className="sr-only">out </span>
        {outbound}
      </span>
    </span>
  );
}

export function ConnectionsTable({
  connections,
}: {
  connections: Connection[];
}) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-y bg-muted/50 text-xs text-muted-foreground">
          <tr>
            {[
              'CID',
              'Client',
              'Address',
              'Messages',
              'Data',
              'RTT',
              'Uptime',
              'Last activity',
            ].map((h, i) => (
              <th
                key={h}
                scope="col"
                className={cn(
                  'px-4 py-2.5 font-medium',
                  i >= 3 && i <= 5 ? 'text-right' : 'text-left',
                  i >= 6 && 'hidden xl:table-cell'
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {connections.map((c) => (
            <tr key={c.cid} className="transition-colors hover:bg-muted/50">
              <td className="px-4 py-2 font-mono text-muted-foreground">
                {c.cid}
              </td>
              <td className="max-w-56 px-4 py-2">
                <div
                  className="truncate font-medium"
                  title={c.name || undefined}
                >
                  {c.name || (
                    <span className="text-muted-foreground">unnamed</span>
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {c.lang} {c.version}
                </div>
              </td>
              <td className="px-4 py-2 font-mono text-xs">
                {c.ip}:{c.port}
              </td>
              <td className="px-4 py-2 text-right">
                <InOut
                  inbound={c.in_msgs.toLocaleString()}
                  outbound={c.out_msgs.toLocaleString()}
                />
              </td>
              <td className="px-4 py-2 text-right">
                <InOut
                  inbound={formatBytes(c.in_bytes)}
                  outbound={formatBytes(c.out_bytes)}
                />
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-right font-mono text-xs">
                {formatRTT(c.rtt)}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-2 xl:table-cell">
                {formatDuration(c.uptime)}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-2 text-muted-foreground xl:table-cell">
                {formatTimestamp(c.last_activity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
