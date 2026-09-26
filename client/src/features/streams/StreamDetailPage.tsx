import {
  ArrowLeft,
  BarChart3,
  HardDrive,
  Hash,
  Play,
  Square,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { appendCapped, useEventSources } from '@/lib/useEventSources';
import { LiveMessageDialog } from './LiveMessageDialog';
import { LiveMessagesPanel } from './LiveMessagesPanel';
import { SubjectList } from './SubjectList';
import type { MessageEvent, SubjectSubscription } from './types';
import { useStream } from './useStreams';

export function StreamDetailPage() {
  const { streamName } = useParams<{ streamName: string }>();
  const navigate = useNavigate();
  const { open: openSource, close: closeSource } = useEventSources();
  const [subscriptions, setSubscriptions] = useState<
    Record<string, SubjectSubscription>
  >({});
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(
    new Set()
  );
  const [selectedMessage, setSelectedMessage] = useState<MessageEvent | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New state for improved UX
  const [activeTab, setActiveTab] = useState<string>('');

  // Fetch stream details
  const { data: stream, isLoading, error } = useStream(streamName);

  // Get subjects and active messages for virtualization (must be called before any early returns)
  const subjects = stream?.config?.subjects || [];

  // Note: Removed message virtualization to fix scrolling issues
  // For better UX, we'll render the last 200 messages directly

  // Initial scroll to bottom is handled by the auto-scroll effect

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subject)) {
        newSet.delete(subject);
      } else {
        newSet.add(subject);
      }
      return newSet;
    });
  };

  const startSubscription = (subject: string) => {
    if (subscriptions[subject]?.isActive) return;

    const url = `/api/nats/streams/${encodeURIComponent(streamName ?? '')}/subjects/${encodeURIComponent(subject)}/subscribe`;
    openSource(subject, url, {
      onOpen: () =>
        setSubscriptions((prev) => ({
          ...prev,
          [subject]: {
            subject,
            isActive: true,
            messages: prev[subject]?.messages || [],
          },
        })),
      onMessage: (messageData: MessageEvent) =>
        setSubscriptions((prev) => {
          const currentSub = prev[subject] || {
            subject,
            isActive: true,
            messages: [],
          };

          // Handle connection/status messages (messages with 'type' field)
          if (messageData.type) {
            return {
              ...prev,
              [subject]: {
                ...currentSub,
                connectionStatus: messageData.type as
                  | 'connected'
                  | 'disconnected'
                  | 'connecting',
                lastStatusUpdate: messageData.timestamp,
              },
            };
          }

          // Handle data messages (messages with 'data' field)
          if (messageData.data !== undefined) {
            return {
              ...prev,
              [subject]: {
                ...currentSub,
                messages: appendCapped(currentSub.messages, messageData),
              },
            };
          }

          // If neither type nor data, just update the subscription without adding to messages
          return prev;
        }),
      onError: () => {
        console.error('SSE error for subject:', subject);
        markStopped(subject);
      },
    });
  };

  const markStopped = (subject: string) =>
    setSubscriptions((prev) => ({
      ...prev,
      [subject]: { ...prev[subject], isActive: false },
    }));

  const stopSubscription = (subject: string) => {
    closeSource(subject);
    markStopped(subject);
  };

  const startSelectedSubscriptions = () => {
    selectedSubjects.forEach((subject) => {
      startSubscription(subject);
    });
  };

  const stopAllSubscriptions = () => {
    Object.keys(subscriptions).forEach((subject) => {
      stopSubscription(subject);
    });
  };

  const exportMessages = (subject: string) => {
    const messages = subscriptions[subject]?.messages || [];
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subject}-messages.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openMessageModal = (message: MessageEvent) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Initialize active tab when subscriptions change
  useEffect(() => {
    const activeSubjects = Object.entries(subscriptions)
      .filter(([_, sub]) => sub.isActive && sub.messages.length > 0)
      .map(([subject]) => subject);

    if (activeSubjects.length > 0 && !activeTab) {
      setActiveTab(activeSubjects[0]); // Set first subject as active tab
    }
  }, [subscriptions, activeTab]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 mb-4">Failed to load stream details</p>
        <Button onClick={() => navigate('/dashboard/streams')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Streams
        </Button>
      </div>
    );
  }

  const hasActiveSubscriptions = Object.values(subscriptions).some(
    (sub) => sub.isActive
  );

  return (
    <div className="p-3 h-screen overflow-hidden">
      <div className="max-w-full h-full">
        <div className="flex flex-col lg:flex-row gap-3 h-[calc(100vh-1.5rem)]">
          {/* Left Side - Main Content */}
          <div className="flex-1 lg:w-1/2 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/dashboard/streams')}
                  className="mr-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <h1 className="text-xl font-bold text-gray-900">
                  Stream: {stream.config?.name || 'Unknown'}
                </h1>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={startSelectedSubscriptions}
                  disabled={selectedSubjects.size === 0}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start ({selectedSubjects.size})
                </Button>
                <Button
                  onClick={stopAllSubscriptions}
                  disabled={!hasActiveSubscriptions}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Square className="w-3 h-3 mr-1" />
                  Stop All
                </Button>
              </div>
            </div>

            {/* Stream Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 shrink-0">
              <StatsCard
                title="Messages"
                value={(stream.state?.messages || 0).toLocaleString()}
                icon={<BarChart3 className="w-4 h-4 text-blue-600" />}
              />
              <StatsCard
                title="Bytes"
                value={`${((stream.state?.bytes || 0) / 1024 / 1024).toFixed(2)} MB`}
                icon={<HardDrive className="w-4 h-4 text-green-600" />}
              />
              <StatsCard
                title="Consumers"
                value={(stream.state?.consumer_count || 0).toString()}
                icon={<Users className="w-4 h-4 text-purple-600" />}
              />
              <StatsCard
                title="Subjects"
                value={subjects.length.toString()}
                icon={<Hash className="w-4 h-4 text-orange-600" />}
              />
            </div>

            {/* Stream Configuration */}
            <div className="bg-card rounded-lg border border-gray-200 p-4 mb-4 shrink-0">
              <h2 className="text-base font-semibold mb-3">
                Stream Configuration
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div>
                  <span className="font-medium">Retention:</span>{' '}
                  {stream.config?.retention || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Storage:</span>{' '}
                  {stream.config?.storage || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Replicas:</span>{' '}
                  {stream.config?.num_replicas || 0}
                </div>
                <div>
                  <span className="font-medium">Max Messages:</span>{' '}
                  {(stream.config?.max_msgs || 0).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Max Bytes:</span>{' '}
                  {((stream.config?.max_bytes || 0) / 1024 / 1024).toFixed(2)}{' '}
                  MB
                </div>
                <div>
                  <span className="font-medium">Max Age:</span>{' '}
                  {stream.config?.max_age
                    ? `${stream.config.max_age}s`
                    : 'No limit'}
                </div>
              </div>
            </div>

            <SubjectList
              subjects={subjects}
              subscriptions={subscriptions}
              selectedSubjects={selectedSubjects}
              handleSubjectToggle={handleSubjectToggle}
              startSubscription={startSubscription}
              stopSubscription={stopSubscription}
              exportMessages={exportMessages}
            />
          </div>

          <LiveMessagesPanel
            subscriptions={subscriptions}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openMessageModal={openMessageModal}
          />

          <LiveMessageDialog
            message={selectedMessage}
            open={isModalOpen}
            onClose={closeMessageModal}
          />
        </div>
      </div>
    </div>
  );
}
