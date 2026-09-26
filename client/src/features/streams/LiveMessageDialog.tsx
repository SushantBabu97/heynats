import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { MessageEvent } from './types';

interface LiveMessageDialogProps {
  message: MessageEvent | null;
  open: boolean;
  onClose: () => void;
}

export function LiveMessageDialog({
  message,
  open,
  onClose,
}: LiveMessageDialogProps) {
  return (
    <Dialog
      open={open && message !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      {message && (
        <DialogContent
          aria-describedby={undefined}
          className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        >
          <div className="px-4 py-3 border-b bg-gray-50">
            <DialogTitle>Message Details</DialogTitle>
          </div>

          {/* Modal Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-7rem)]">
            {/* Message Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  Subject
                </h3>
                <p className="text-xs font-mono bg-card p-2 rounded border">
                  {message.subject}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  Timestamp
                </h3>
                <p className="text-xs font-mono bg-card p-2 rounded border">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Message Data */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Data</h3>
              <div className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {typeof message.data === 'string'
                    ? message.data
                    : JSON.stringify(message.data, null, 2)}
                </pre>
              </div>
            </div>

            {/* Headers */}
            {message.headers && Object.keys(message.headers).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Headers</h3>
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {JSON.stringify(message.headers, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Raw JSON</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(message, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(message, null, 2));
              }}
            >
              Copy JSON
            </Button>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
