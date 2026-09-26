import { Cog, Radio, Reply, Users } from 'lucide-react';

export interface Message {
  subject: string;
  data: string;
  timestamp: string;
  headers?: Record<string, string>;
  type?: 'connected' | 'completed' | 'error';
  reply?: string; // For request messages that need replies
}

export type SubscriptionType =
  | 'regular'
  | 'queue'
  | 'reply'
  | 'request-handler';

export interface Subscription {
  subject: string;
  queueGroup?: string;
  maxMessages?: number;
  subscriptionType: SubscriptionType;
  isActive: boolean;
  messages: Message[];
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
  lastStatusUpdate?: string;
  autoReply?: boolean; // For request handlers
  replyTemplate?: string; // Template for auto-replies
}

/** Icon per subscription type, used in tabs and the empty-state legend. */
export const subscriptionTypeIcon = {
  regular: Radio,
  queue: Users,
  reply: Reply,
  'request-handler': Cog,
} as const;
