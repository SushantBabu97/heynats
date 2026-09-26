import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { appendCapped, useEventSources } from '@/lib/useEventSources';
import { type SubscribeFn, SubscribeForm } from './SubscribeForm';
import { SubscriptionsPanel } from './SubscriptionsPanel';
import type { Subscription, SubscriptionType } from './types';

export function SubscribePage() {
  // Common state
  const { open: openSource, close: closeSource } = useEventSources();
  const [subscriptions, setSubscriptions] = useState<
    Record<string, Subscription>
  >({});
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Confirmation state
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<
    string | null
  >(null);

  const startSubscription = (
    subscriptionSubject: string,
    subscriptionType: SubscriptionType = 'regular',
    subscriptionQueueGroup?: string,
    subscriptionMaxMessages?: number,
    subscriptionAutoReply?: boolean,
    subscriptionReplyTemplate?: string
  ) => {
    let key = subscriptionSubject;
    if (subscriptionType === 'queue' && subscriptionQueueGroup) {
      key = `${subscriptionSubject}:${subscriptionQueueGroup}`;
    } else if (subscriptionType === 'reply') {
      key = `reply:${subscriptionSubject}`;
    } else if (subscriptionType === 'request-handler') {
      key = subscriptionQueueGroup
        ? `handler:${subscriptionSubject}:${subscriptionQueueGroup}`
        : `handler:${subscriptionSubject}`;
    }

    // Build URL with query parameters
    let url = `/api/nats/subscribe/messages/${encodeURIComponent(subscriptionSubject)}`;
    const params = new URLSearchParams();
    if (subscriptionQueueGroup) {
      params.append('queue_group', subscriptionQueueGroup);
    }
    if (subscriptionMaxMessages && subscriptionMaxMessages > 0) {
      params.append('max_messages', subscriptionMaxMessages.toString());
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    openSource(key, url, {
      onOpen: () =>
        setSubscriptions((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            subject: subscriptionSubject,
            queueGroup: subscriptionQueueGroup,
            maxMessages: subscriptionMaxMessages,
            subscriptionType,
            isActive: true,
            messages: prev[key]?.messages || [],
            autoReply: subscriptionAutoReply,
            replyTemplate: subscriptionReplyTemplate,
          },
        })),
      onMessage: (messageData) =>
        setSubscriptions((prev) => {
          const currentSub = prev[key] || {
            subject: subscriptionSubject,
            queueGroup: subscriptionQueueGroup,
            maxMessages: subscriptionMaxMessages,
            subscriptionType,
            isActive: true,
            messages: [],
            autoReply: subscriptionAutoReply,
            replyTemplate: subscriptionReplyTemplate,
          };

          // Handle connection/status messages
          if (messageData.type) {
            return {
              ...prev,
              [key]: {
                ...currentSub,
                connectionStatus: messageData.type as
                  | 'connected'
                  | 'disconnected'
                  | 'connecting',
                lastStatusUpdate: messageData.timestamp,
              },
            };
          }

          // Handle data messages
          if (messageData.data !== undefined) {
            return {
              ...prev,
              [key]: {
                ...currentSub,
                messages: appendCapped(currentSub.messages, messageData),
              },
            };
          }

          return prev;
        }),
      onError: () => {
        console.error('SSE error for subject:', subscriptionSubject);
        markStopped(key);
      },
    });
    return key;
  };

  // Start a subscription and show it if nothing is selected yet.
  const subscribe: SubscribeFn = (...args) => {
    const key = startSubscription(...args);
    setActiveTab((current) => current ?? key);
  };

  const markStopped = (key: string) =>
    setSubscriptions((prev) => ({
      ...prev,
      [key]: { ...prev[key], isActive: false },
    }));

  const stopSubscription = (key: string) => {
    closeSource(key);
    markStopped(key);
  };

  const handleDisconnectClick = (key: string) => {
    setShowDisconnectConfirm(key);
  };

  const confirmDisconnect = (key: string) => {
    stopSubscription(key);
    setShowDisconnectConfirm(null);
  };

  const handleDisconnectAll = () => {
    activeSubscriptions.forEach(([key]) => stopSubscription(key));
  };

  const activeSubscriptions = Object.entries(subscriptions).filter(
    ([, sub]) => sub.isActive
  );

  // When the shown subscription stops (manually or on SSE error), fall back to the first active one.
  const firstActiveKey = activeSubscriptions[0]?.[0] ?? null;
  useEffect(() => {
    if (activeTab && !subscriptions[activeTab]?.isActive) {
      setActiveTab(firstActiveKey);
    }
  }, [activeTab, subscriptions, firstActiveKey]);

  return (
    <div className="p-3 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Subscribe to Messages
        </h2>
        <p className="text-sm text-gray-600">
          Listen to NATS subjects and view incoming messages in real-time
        </p>
      </div>

      <SubscribeForm subscribe={subscribe} />

      {/* Active Subscriptions */}
      {activeSubscriptions.length > 0 && (
        <SubscriptionsPanel
          subscriptions={subscriptions}
          activeSubscriptions={activeSubscriptions}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleDisconnectClick={handleDisconnectClick}
          handleDisconnectAll={handleDisconnectAll}
        />
      )}

      {/* Empty State */}
      {activeSubscriptions.length === 0 && (
        <div className="bg-card rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Active Subscriptions
          </h3>
          <p className="text-gray-500 mb-4">
            Start subscribing to NATS subjects to monitor real-time message
            flow.
          </p>
          <div className="text-sm text-gray-400">
            <div className="mb-2">Subscription types available:</div>
            <ul className="space-y-1">
              <li>
                📡 <strong>Regular</strong> - Standard NATS subscriptions
              </li>
              <li>
                👥 <strong>Queue Group</strong> - Load balanced subscriptions
              </li>
              <li>
                📩 <strong>Reply Subject</strong> - Monitor reply messages
              </li>
              <li>
                ⚙️ <strong>Request Handler</strong> - Handle requests with
                auto-reply
              </li>
            </ul>
            <div className="mt-3 mb-2">Features:</div>
            <ul className="space-y-1">
              <li>• Real-time message monitoring</li>
              <li>• Subject wildcards and pattern matching</li>
              <li>• Header inspection</li>
              <li>• Request-reply handling</li>
            </ul>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDisconnectConfirm !== null}
        onOpenChange={(open) => !open && setShowDisconnectConfirm(null)}
        title="Disconnect subscription?"
        description={
          showDisconnectConfirm && (
            <>
              <div className="mb-3 rounded bg-muted p-3">
                <div className="font-medium text-foreground">
                  {subscriptions[showDisconnectConfirm]?.subject}
                </div>
                {subscriptions[showDisconnectConfirm]?.queueGroup && (
                  <div className="text-xs">
                    Queue: {subscriptions[showDisconnectConfirm].queueGroup}
                  </div>
                )}
                <div className="text-xs capitalize">
                  Type:{' '}
                  {subscriptions[
                    showDisconnectConfirm
                  ]?.subscriptionType.replace('-', ' ')}
                </div>
              </div>
              This stops receiving messages. You can subscribe again later.
            </>
          )
        }
        confirmLabel="Disconnect"
        destructive
        onConfirm={() =>
          showDisconnectConfirm && confirmDisconnect(showDisconnectConfirm)
        }
      />
    </div>
  );
}
