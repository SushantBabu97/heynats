import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { subscribeApi } from '@/lib/api';
import type { Subscription } from './types';

interface SubscriptionsPanelProps {
  subscriptions: Record<string, Subscription>;
  activeSubscriptions: [string, Subscription][];
  activeTab: string | null;
  setActiveTab: (key: string) => void;
  handleDisconnectClick: (key: string) => void;
  handleDisconnectAll: () => void;
}

export function SubscriptionsPanel({
  subscriptions,
  activeSubscriptions,
  activeTab,
  setActiveTab,
  handleDisconnectClick,
  handleDisconnectAll,
}: SubscriptionsPanelProps) {
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // Reply state
  const [replyData, setReplyData] = useState('');
  const [selectedReplySubject, setSelectedReplySubject] = useState('');

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({
      replySubject,
      data,
    }: {
      replySubject: string;
      data: string;
    }) => subscribeApi.sendReply(replySubject, data),
    onSuccess: () => {
      setReplyData('');
      setSelectedReplySubject('');
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeTab && subscriptions[activeTab]?.messages.length > 0) {
      const container = messagesContainerRef.current;
      if (container && !showJumpToLatest) {
        setTimeout(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [subscriptions, activeTab, showJumpToLatest]);

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
    const shouldShowButton = distanceFromBottom > 100;

    setShowJumpToLatest(shouldShowButton);
  };

  return (
    <div className="bg-card rounded-lg border border-gray-200 flex-1 flex flex-col min-h-0">
      {/* Subscription Tabs */}
      <div className="border-b border-gray-200 px-4">
        <div className="flex space-x-1 overflow-x-auto py-2">
          {activeSubscriptions.map(([key, subscription]) => {
            const isSelected = activeTab === key;
            const typePrefix =
              subscription.subscriptionType === 'reply'
                ? '📩'
                : subscription.subscriptionType === 'request-handler'
                  ? '⚙️'
                  : subscription.subscriptionType === 'queue'
                    ? '👥'
                    : '📡';
            const displayName = subscription.queueGroup
              ? `${typePrefix} ${subscription.subject} (${subscription.queueGroup})`
              : `${typePrefix} ${subscription.subject}`;

            return (
              <div
                key={key}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap shrink-0 flex items-center gap-2
                  ${
                    isSelected
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className="flex items-center gap-2"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${subscription.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                  <span className="truncate max-w-[200px]">{displayName}</span>
                  <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                    {subscription.messages.length}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Disconnect subscription"
                  onClick={() => handleDisconnectClick(key)}
                  className="ml-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  title="Disconnect subscription"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
            );
          })}
        </div>
      </div>

      {/* Messages Area */}
      {activeTab && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Subscription Controls Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${subscriptions[activeTab].isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {subscriptions[activeTab].subscriptionType === 'reply'
                      ? 'Reply Subscription'
                      : subscriptions[activeTab].subscriptionType ===
                          'request-handler'
                        ? 'Request Handler'
                        : subscriptions[activeTab].subscriptionType === 'queue'
                          ? 'Queue Subscription'
                          : 'Regular Subscription'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Subject:{' '}
                  <code className="bg-gray-200 px-1 py-0.5 rounded">
                    {subscriptions[activeTab].subject}
                  </code>
                  {subscriptions[activeTab].queueGroup && (
                    <span className="ml-2">
                      Queue:{' '}
                      <code className="bg-gray-200 px-1 py-0.5 rounded">
                        {subscriptions[activeTab].queueGroup}
                      </code>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500">
                  {subscriptions[activeTab].messages.length} messages
                </div>
                {activeSubscriptions.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDisconnectAll}
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    Disconnect All
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDisconnectClick(activeTab)}
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-2"
            style={{ minHeight: 0 }}
          >
            {activeMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-sm">
                  Waiting for{' '}
                  {subscriptions[activeTab].subscriptionType === 'reply'
                    ? 'reply messages'
                    : subscriptions[activeTab].subscriptionType ===
                        'request-handler'
                      ? 'requests'
                      : 'messages'}{' '}
                  on subject:
                  <code className="bg-gray-100 px-1 py-0.5 rounded ml-1">
                    {subscriptions[activeTab].subject}
                  </code>
                </div>
                {subscriptions[activeTab].queueGroup && (
                  <div className="text-xs mt-1">
                    Queue group:{' '}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">
                      {subscriptions[activeTab].queueGroup}
                    </code>
                  </div>
                )}
                <div className="text-xs mt-1 capitalize">
                  Type:{' '}
                  {subscriptions[activeTab].subscriptionType.replace('-', ' ')}
                </div>
              </div>
            ) : (
              activeMessages.map((message, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {message.subject}
                      </div>
                      {message.reply && (
                        <div className="text-xs text-blue-600 font-mono">
                          Reply to: {message.reply}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  {message.data && (
                    <div className="mb-2">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words font-mono bg-card p-2 rounded border">
                        {message.data}
                      </pre>
                    </div>
                  )}

                  {message.headers &&
                    Object.keys(message.headers).length > 0 && (
                      <div className="text-xs text-gray-600">
                        <div className="font-medium mb-1">Headers:</div>
                        <div className="space-y-1">
                          {Object.entries(message.headers).map(
                            ([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-mono bg-gray-100 px-1 rounded mr-2">
                                  {key}:
                                </span>
                                <span className="font-mono">{value}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Reply Button for Request Handler */}
                  {subscriptions[activeTab]?.subscriptionType ===
                    'request-handler' &&
                    message.reply && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label
                              htmlFor="sub-quick-reply"
                              className="block text-xs font-medium text-gray-700 mb-1"
                            >
                              Quick Reply
                            </label>
                            <Textarea
                              id="sub-quick-reply"
                              value={
                                selectedReplySubject === message.reply
                                  ? replyData
                                  : ''
                              }
                              onChange={(e) => {
                                setReplyData(e.target.value);
                                if (message.reply)
                                  setSelectedReplySubject(message.reply);
                              }}
                              placeholder='{"status": "success", "result": "..."}'
                              className="min-h-[60px] text-sm"
                              onFocus={() => {
                                if (message.reply)
                                  setSelectedReplySubject(message.reply);
                              }}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (message.reply) {
                                replyMutation.mutate({
                                  replySubject: message.reply,
                                  data: replyData,
                                });
                              }
                            }}
                            disabled={
                              !replyData.trim() || replyMutation.isPending
                            }
                          >
                            {replyMutation.isPending
                              ? 'Sending...'
                              : 'Send Reply'}
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              ))
            )}
          </div>

          {/* Jump to Latest Button */}
          {showJumpToLatest && (
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={scrollToBottom}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                ↓ Jump to Latest
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
