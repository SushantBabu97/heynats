import { useVirtualizer } from '@tanstack/react-virtual';
import { Download, Play, Square } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { SubjectSubscription } from './types';

const SUBJECT_ITEM_HEIGHT = 50; // approximate row height for the virtualizer

interface SubjectListProps {
  subjects: string[];
  subscriptions: Record<string, SubjectSubscription>;
  selectedSubjects: Set<string>;
  handleSubjectToggle: (subject: string) => void;
  startSubscription: (subject: string) => void;
  stopSubscription: (subject: string) => void;
  exportMessages: (subject: string) => void;
}

export function SubjectList({
  subjects,
  subscriptions,
  selectedSubjects,
  handleSubjectToggle,
  startSubscription,
  stopSubscription,
  exportMessages,
}: SubjectListProps) {
  const subjectsContainerRef = useRef<HTMLDivElement>(null);
  const subjectsVirtualizer = useVirtualizer({
    count: subjects.length,
    getScrollElement: () => subjectsContainerRef.current,
    estimateSize: () => SUBJECT_ITEM_HEIGHT,
  });
  const hasActiveSubscriptions = Object.values(subscriptions).some(
    (sub) => sub.isActive
  );

  return (
    <div className="bg-card rounded-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-4 w-full">
          <h2 className="text-base font-semibold">
            Subjects ({subjects.length})
          </h2>
          {subjects.length > 0 && (
            <span className="text-sm text-gray-500 ml-auto">
              Showing {subjectsVirtualizer.getVirtualItems().length} of{' '}
              {subjects.length}
            </span>
          )}
        </div>
        {hasActiveSubscriptions && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-700 rounded-full animate-pulse" />
            <span className="text-green-600">
              {
                Object.values(subscriptions).filter((sub) => sub.isActive)
                  .length
              }{' '}
              active subscriptions
            </span>
          </div>
        )}
      </div>

      {subjects.length === 0 ? (
        <p className="text-gray-500 shrink-0">
          No subjects configured for this stream
        </p>
      ) : (
        <div
          ref={subjectsContainerRef}
          className="relative overflow-auto border border-gray-200 rounded-lg flex-1 min-h-0"
        >
          <div style={{ height: subjectsVirtualizer.getTotalSize() }}>
            {subjectsVirtualizer.getVirtualItems().map((virtualItem) => {
              const subject = subjects[virtualItem.index];
              const subscription = subscriptions[subject];
              const isSelected = selectedSubjects.has(subject);
              const isActive = subscription?.isActive || false;
              const messageCount = subscription?.messages?.length || 0;

              return (
                <div
                  key={virtualItem.key}
                  className={`absolute top-0 left-0 w-full flex items-center justify-between p-4 border-b transition-colors ${
                    isActive
                      ? 'bg-green-50 border-green-200'
                      : isSelected
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  style={{
                    height: virtualItem.size,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSubjectToggle(subject)}
                      disabled={isActive}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="font-medium text-gray-900 truncate max-w-xs block">
                        {subject}
                      </span>
                      {isActive && (
                        <div className="flex items-center gap-3 mt-1">
                          {/* Connection Status */}
                          <div className="flex items-center">
                            {subscription?.connectionStatus === 'connected' ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                <span className="text-sm text-green-600">
                                  Connected
                                </span>
                              </>
                            ) : subscription?.connectionStatus ===
                              'connecting' ? (
                              <>
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse" />
                                <span className="text-sm text-yellow-600">
                                  Connecting
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" />
                                <span className="text-sm text-blue-600">
                                  Subscribing
                                </span>
                              </>
                            )}
                          </div>

                          {/* Message Count */}
                          {messageCount > 0 && (
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600">
                                {messageCount} message
                                {messageCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {messageCount > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportMessages(subject)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                    )}
                    {isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => stopSubscription(subject)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => startSubscription(subject)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Subscribe
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
