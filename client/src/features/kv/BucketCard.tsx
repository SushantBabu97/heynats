import { Archive, Clock, Eye, HardDrive, Hash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/components/ui/button';

import type { KVBucket } from '@/lib/api';
import { formatBytes, formatTTL } from '@/lib/utils';

interface BucketCardProps {
  bucket: KVBucket;
  onView: (bucketName: string) => void;
  onDelete: (bucketName: string) => void;
}

export function BucketCard({ bucket, onView, onDelete }: BucketCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="min-w-48 flex-1">
            <h3
              className="truncate text-lg font-semibold text-gray-900 mb-1"
              title={bucket.bucket}
            >
              {bucket.bucket}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500 whitespace-nowrap">
              <div className="flex items-center space-x-1">
                <Hash className="w-3 h-3" />
                <span>{bucket.values.toLocaleString()} entries</span>
              </div>
              <div className="flex items-center space-x-1">
                <HardDrive className="w-3 h-3" />
                <span>{formatBytes(bucket.bytes)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center space-x-2">
            <Button
              onClick={() => onView(bucket.bucket)}
              size="sm"
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              onClick={() => setConfirmingDelete(true)}
              size="sm"
              variant="outline"
              className="text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <Archive className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-gray-500">History</div>
              <div className="font-medium">{bucket.history} revisions</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-gray-500">TTL</div>
              <div className="font-medium">{formatTTL(bucket.ttl)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Storage</div>
              <div className="font-medium capitalize">
                {bucket.backing_store}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Archive className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-gray-500">Compression</div>
              <div className="font-medium">
                {bucket.is_compressed ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete bucket?"
        description={
          <>
            Bucket <strong>{bucket.bucket}</strong> and all its keys will be
            permanently deleted.
          </>
        }
        confirmLabel="Delete bucket"
        destructive
        onConfirm={() => onDelete(bucket.bucket)}
      />
    </div>
  );
}
