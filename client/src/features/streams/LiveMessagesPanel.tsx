import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { MessageEvent, SubjectSubscription } from './types';

interface LiveMessagesPanelProps {
  subscriptions: Record<string, SubjectSubscription>;
  activeTab: string;
  setActiveTab: (subject: string) => void;
  openMessageModal: (message: MessageEvent) => void;
}

export function LiveMessagesPanel({
  subscriptions,
  activeTab,
  setActiveTab,
  openMessageModal,
}: LiveMessagesPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  // Get visible messages for active tab
  const activeMessages = useMemo(() => {
    if (!activeTab || !subscriptions[activeTab]) return [];
    return subscriptions[activeTab].messages.slice(-200); // Show last 200 messages
  }, [subscriptions, activeTab]);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
    setShowJumpToLatest(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const shouldShowButton = distanceFromBottom > 100; // Show button if more than 100px from bottom

    setShowJumpToLatest(shouldShowButton);
  };

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (activeTab && subscriptions[activeTab]?.messages.length > 0) {
      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

          if (distanceFromBottom <= 100) {
            // User is near bottom, auto-scroll and hide button
            container.scrollTo({
              top: scrollHeight,
              behavior: 'smooth',
            });
            setShowJumpToLatest(false);
          } else {
            // User is not at bottom, show the jump button
            setShowJumpToLatest(true);
          }
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [subscriptions, activeTab]);

  return (
    <div className="w-full lg:w-1/2 flex flex-col min-h-[300px] lg:min-h-0">
      {/* Active Subscriptions Status - Show when subscriptions are active but no data messages yet */}
      {(() => {
        const activeSubscriptions = Object.entries(subscriptions).filter(
          ([_, sub]) => sub.isActive
        );
        const hasDataMessages = Object.values(subscriptions).some(
          (sub) => sub.messages.length > 0
        );

        if (activeSubscriptions.length === 0 || hasDataMessages) return null;

        return (
          <div className="bg-primary/5 border border-primary/30 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse mt-2" />
              <div className="flex-1">
                <h3 className="font-medium text-primary mb-1 text-sm">
                  Waiting for Data Messages
                </h3>
                <p className="text-primary text-xs mb-2">
                  You have {activeSubscriptions.length} active subscription
                  {activeSubscriptions.length > 1 ? 's' : ''}, but no data
                  messages have been received yet. Only messages with data
                  content will appear here.
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-primary font-medium">
                    Active subscriptions:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {activeSubscriptions.map(([subject]) => (
                      <span
                        key={subject}
                        className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Live Messages Panel - Tabbed Interface */}
      <div className="bg-card rounded-lg border border-border flex-1 flex flex-col overflow-y-auto">
        <div className="px-3 py-2 bg-muted shrink-0">
          <div className="flex items-center justify-between mb-2">
            {(() => {
              const hasMessages = Object.values(subscriptions).some(
                (sub) => sub.messages.length > 0
              );
              const totalMessages = Object.values(subscriptions).reduce(
                (sum, sub) => sum + sub.messages.length,
                0
              );

              return (
                <>
                  <h2 className="text-base font-semibold text-foreground">
                    Live Messages {hasMessages ? `(${totalMessages})` : ''}
                  </h2>
                </>
              );
            })()}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {Object.values(subscriptions).some(
            (sub) => sub.messages.length > 0
          ) ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              defaultValue=""
              className="h-full flex flex-col"
            >
              <div className="px-3 py-1 border-b bg-muted">
                <TabsList className="h-auto p-0.5 bg-muted">
                  {Object.entries(subscriptions)
                    .filter(
                      ([_, sub]) => sub.isActive && sub.messages.length > 0
                    )
                    .map(([subject, subscription]) => (
                      <TabsTrigger
                        key={subject}
                        value={subject}
                        className="flex items-center gap-2 px-3 py-2"
                      >
                        <span className="truncate max-w-32">{subject}</span>
                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full min-w-[20px]">
                          {subscription.messages.length}
                        </span>
                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                      </TabsTrigger>
                    ))}
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden">
                {Object.entries(subscriptions)
                  .filter(([_, sub]) => sub.isActive && sub.messages.length > 0)
                  .map(([subject]) => (
                    <TabsContent
                      key={subject}
                      value={subject}
                      className="h-full mt-0 p-0 relative"
                    >
                      <div
                        ref={
                          subject === activeTab ? messagesContainerRef : null
                        }
                        className="h-full overflow-y-auto"
                        onScroll={handleScroll}
                      >
                        <div className="space-y-1 p-2">
                          {subject === activeTab &&
                            activeMessages.map((message, index) => {
                              const dataStr =
                                typeof message.data === 'string'
                                  ? message.data
                                  : JSON.stringify(message.data);
                              const isLongData = dataStr?.length > 100;
                              const previewData = isLongData
                                ? `${dataStr.substring(0, 100)}...`
                                : dataStr;

                              return (
                                <button
                                  type="button"
                                  key={`message-${activeTab}-${index}-${message.timestamp}`}
                                  onClick={() => openMessageModal(message)}
                                  className="block w-full text-left px-4 py-2 hover:bg-primary/5 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-primary/30 hover:shadow-sm group border-b border-border last:border-b-0"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded shrink-0">
                                      {new Date(
                                        message.timestamp
                                      ).toLocaleTimeString()}
                                    </span>

                                    <div className="flex-1 bg-muted text-foreground p-2 rounded text-xs font-mono overflow-hidden">
                                      <div className="break-words whitespace-pre-wrap">
                                        {previewData}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      {message.headers &&
                                        Object.keys(message.headers).length >
                                          0 && (
                                          <span className="text-xs text-warning bg-warning/10 px-1 py-0.5 rounded">
                                            {
                                              Object.keys(message.headers)
                                                .length
                                            }{' '}
                                            headers
                                          </span>
                                        )}
                                      {isLongData && (
                                        <span className="text-xs text-primary bg-primary/10 px-1 py-0.5 rounded group-hover:bg-primary/10 transition-colors">
                                          Click to expand
                                        </span>
                                      )}
                                      <svg
                                        className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>

                        {/* Scroll indicator for messages */}
                        {activeMessages.length > 50 && (
                          <div className="sticky bottom-2 right-2 ml-auto w-fit bg-foreground text-background text-xs px-2 py-1 rounded mb-2 mr-2">
                            Showing {activeMessages.length} messages
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>
                      {/* Jump to Latest Button - Show for active tab */}
                      {activeTab === subject && (
                        <div>
                          {showJumpToLatest && (
                            <button
                              type="button"
                              onClick={scrollToBottom}
                              className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-full shadow-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium z-50 border-2 border-white"
                            >
                              <ChevronDown className="w-4 h-4" />
                              Jump to Latest
                            </button>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  ))}
              </div>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
              <div className="text-center">
                {Object.entries(subscriptions).filter(
                  ([_, sub]) => sub.isActive
                ).length === 0 ? (
                  <>
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No Active Subscriptions
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Start subscribing to subjects to see live messages appear
                      here. Each subject will appear as a separate tab when
                      messages arrive.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-lg font-medium text-primary mb-2">
                      Waiting for Messages
                    </h3>
                    <p className="text-sm text-primary max-w-md mb-4">
                      You have active subscriptions. Messages will appear as
                      tabs when they arrive.
                    </p>
                    <div className="flex flex-wrap gap-1 justify-center max-w-md">
                      {Object.entries(subscriptions)
                        .filter(([_, sub]) => sub.isActive)
                        .map(([subject]) => (
                          <span
                            key={subject}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                          >
                            {subject}
                          </span>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
