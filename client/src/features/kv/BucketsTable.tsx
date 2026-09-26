import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { KVBucket } from '@/lib/api';
import { formatBytes, formatTTL } from '@/lib/utils';

interface BucketsTableProps {
  buckets: KVBucket[];
  onDelete: (bucket: string) => void;
}

export function BucketsTable({ buckets, onDelete }: BucketsTableProps) {
  const sorted = [...buckets].sort((a, b) => a.bucket.localeCompare(b.bucket));
  return (
    <div className="relative overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              Bucket
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Entries
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Size
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              History
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              TTL
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-medium">
              Storage
            </th>
            <th scope="col" className="px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((b) => (
            <tr key={b.bucket} className="transition-colors hover:bg-muted/50">
              <td className="max-w-72 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/dashboard/kv/${encodeURIComponent(b.bucket)}`}
                    className="truncate font-medium text-foreground hover:text-primary hover:underline"
                    title={b.bucket}
                  >
                    {b.bucket}
                  </Link>
                  {b.is_compressed && (
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      compressed
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right">
                {b.values.toLocaleString()}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right">
                {formatBytes(b.bytes)}
              </td>
              <td className="whitespace-nowrap px-4 py-2.5 text-right">
                {b.history}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {formatTTL(b.ttl)}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {b.backing_store}
              </td>
              <td className="px-2 py-1.5 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete bucket ${b.bucket}`}
                  title="Delete bucket"
                  onClick={() => onDelete(b.bucket)}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
