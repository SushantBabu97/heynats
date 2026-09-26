export interface SubjectSubscription {
  subject: string;
  isActive: boolean;
  messages: any[]; // Only data messages
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
  lastStatusUpdate?: string;
}

export interface MessageEvent {
  subject: string;
  data?: any;
  timestamp: string;
  headers?: Record<string, string>;
  type?: string; // For connection/status messages
  stream?: string; // For connection/status messages
}
