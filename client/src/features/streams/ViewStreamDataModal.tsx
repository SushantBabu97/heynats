import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { StreamMessage } from '@/lib/api';
import { formatTimestamp } from '@/lib/utils';
import { StreamMessageDialog } from './StreamMessageDialog';
import { useStreamMessages } from './useStreams';

interface ViewStreamDataModalProps {
  streamName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewStreamDataModal({
  streamName,
  isOpen,
  onClose,
}: ViewStreamDataModalProps) {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<StreamMessage | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    data: messagesData,
    isLoading,
    error,
    refetch,
  } = useStreamMessages(streamName, offset, limit, searchTerm, isOpen);

  useEffect(() => {
    // Reset offset when modal opens
    if (isOpen) {
      setOffset(0);
    }
  }, [isOpen]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setOffset(0); // Reset pagination on search
  };

  const messages = messagesData?.messages || [];
  const total = messagesData?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = offset + 1;

  const handlePreviousPage = () => {
    if (offset > 0) {
      setOffset(offset - 1);
      setSelectedMessage(null);
    }
  };

  const handleNextPage = () => {
    if (offset + 1 < totalPages) {
      setOffset(offset + 1);
      setSelectedMessage(null);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setOffset(0);
    setSelectedMessage(null);
  };

  const handleMessageClick = (msg: StreamMessage) => {
    setSelectedMessage(msg);
    setIsDetailModalOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Stream Data: {streamName}
            </DialogTitle>
            <DialogDescription>
              Total Messages: {total.toLocaleString()}
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground/80 transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Close</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="stream-search"
                  className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-card placeholder-muted-foreground focus:outline-none focus:placeholder-muted-foreground focus:ring-1 focus:ring-ring focus:border-primary"
                  placeholder="Search by subject or data..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  aria-label="Search messages"
                />
              </div>
            </div>

            {/* Limit selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="limit-select"
                className="text-sm font-medium text-foreground/80"
              >
                Messages per page:
              </label>
              <select
                id="limit-select"
                value={limit}
                onChange={(e) =>
                  handleLimitChange(Number.parseInt(e.target.value))
                }
                className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Select number of messages per page"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            {/* Refresh button */}
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              aria-label="Refresh messages"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </Button>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {currentPage} of {totalPages || 1} | Showing{' '}
              {messages.length} of {total} messages
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-muted-foreground">
                  Loading messages...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <svg
                      className="h-5 w-5 text-destructive"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">
                      Error loading messages
                    </h3>
                    <p className="mt-2 text-sm text-destructive">
                      {error instanceof Error
                        ? error.message
                        : 'Failed to load messages'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-4">
              <div className="bg-primary/5 border border-primary/30 rounded-lg p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-primary mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-foreground/80 font-medium">
                  No messages found
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'This stream has no messages yet'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {messages.map((msg) => (
                <button
                  type="button"
                  key={msg.sequence}
                  onClick={() => handleMessageClick(msg)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleMessageClick(msg);
                    }
                  }}
                  className="w-full p-4 hover:bg-primary/5 cursor-pointer transition-colors text-left"
                  aria-label={`Message ${msg.sequence} from ${msg.subject}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          #{msg.sequence}
                        </span>
                        <span className="font-mono text-sm font-medium text-foreground truncate">
                          {msg.subject}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Size: {msg.size} bytes</span>
                        <span>{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <div className="mt-2 p-2 bg-muted rounded text-sm text-foreground/80 truncate font-mono">
                        {msg.data.substring(0, 100)}
                        {msg.data.length > 100 ? '...' : ''}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {total > 0 && !isLoading && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted">
            <div className="text-sm text-muted-foreground">
              Showing {offset * limit + 1} to{' '}
              {Math.min((offset + 1) * limit, total)} of {total} messages
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={offset === 0 || isLoading}
                aria-label="Previous page"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </Button>
              <span className="text-sm font-medium text-foreground/80 min-w-fit">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={offset + 1 >= totalPages || isLoading}
                aria-label="Next page"
              >
                Next
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </div>
        )}

        {/* Message Detail Modal (nested so Esc closes only the top dialog) */}
        <StreamMessageDialog
          message={selectedMessage}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
