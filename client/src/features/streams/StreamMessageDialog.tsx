import { useState } from 'react';
import {
  CodeDisplay,
  formatJSON,
  isValidJSON,
  JsonViewer,
} from '@/components/JsonViewer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { StreamMessage } from '@/lib/api';
import { formatTimestamp } from '@/lib/utils';

// Message Detail Modal
interface StreamMessageDialogProps {
  message: StreamMessage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StreamMessageDialog({
  message,
  isOpen,
  onClose,
}: StreamMessageDialogProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  if (!message) return null;

  const isMessageJSON = isValidJSON(message.data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-card z-10">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Message Details - Sequence #{message.sequence}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {message.subject}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Subject */}
          <div>
            <label
              htmlFor="detail-subject"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Subject
            </label>
            <div
              id="detail-subject"
              className="p-3 bg-gray-50 rounded border border-gray-300 font-mono text-sm break-all"
            >
              {message.subject}
            </div>
          </div>

          {/* Data Payload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="detail-data"
                className="block text-sm font-medium text-gray-700"
              >
                Data Payload
                {isMessageJSON && (
                  <span className="ml-2 text-xs font-normal text-green-600">
                    (JSON)
                  </span>
                )}
              </label>
              {isMessageJSON && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('formatted')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'formatted'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    type="button"
                  >
                    Formatted
                  </button>
                  <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'raw'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    type="button"
                  >
                    Raw
                  </button>
                </div>
              )}
            </div>

            <div id="detail-data">
              {viewMode === 'formatted' && isMessageJSON ? (
                <div className="p-4 bg-gray-50 rounded border border-gray-300 overflow-auto max-h-96">
                  <JsonViewer data={JSON.parse(message.data)} />
                </div>
              ) : (
                <CodeDisplay
                  code={isMessageJSON ? formatJSON(message.data) : message.data}
                  maxHeight="max-h-96"
                />
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="detail-sequence"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sequence
              </label>
              <div
                id="detail-sequence"
                className="p-3 bg-gray-50 rounded border border-gray-300 text-sm font-mono"
              >
                {message.sequence}
              </div>
            </div>
            <div>
              <label
                htmlFor="detail-size"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Size
              </label>
              <div
                id="detail-size"
                className="p-3 bg-gray-50 rounded border border-gray-300 text-sm font-mono"
              >
                {message.size} bytes
              </div>
            </div>
            <div>
              <label
                htmlFor="detail-timestamp"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Timestamp
              </label>
              <div
                id="detail-timestamp"
                className="p-3 bg-gray-50 rounded border border-gray-300 text-sm font-mono"
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>

          {/* Headers */}
          {message.headers && Object.keys(message.headers).length > 0 && (
            <div>
              <label
                htmlFor="detail-headers"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Headers ({Object.keys(message.headers).length})
              </label>
              <div
                id="detail-headers"
                className="p-3 bg-gray-50 rounded border border-gray-300 space-y-2 max-h-48 overflow-auto"
              >
                {Object.entries(message.headers).map(([key, value]) => (
                  <div
                    key={key}
                    className="text-sm border-b border-gray-200 pb-2 last:border-b-0"
                  >
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-500 mx-2">:</span>
                    <span className="text-gray-600 break-all">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
