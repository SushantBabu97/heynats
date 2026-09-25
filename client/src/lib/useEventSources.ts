import { useCallback, useEffect, useRef } from 'react';

// ponytail: keeps the newest N messages per subscription; raise if users need deeper scrollback.
export const MAX_MESSAGES = 1000;

export const appendCapped = <T>(list: T[], item: T) =>
  list.length >= MAX_MESSAGES
    ? [...list.slice(list.length - MAX_MESSAGES + 1), item]
    : [...list, item];

interface Handlers {
  onOpen?: () => void;
  onMessage: (data: any) => void;
  onError?: () => void;
}

/**
 * Keyed SSE connections held in a ref, so close() and unmount cleanup always see
 * the live EventSource (state captured in callbacks goes stale).
 * On error the source is closed instead of letting the browser auto-reconnect.
 */
export function useEventSources() {
  const sources = useRef(new Map<string, EventSource>());

  const close = useCallback((key: string) => {
    sources.current.get(key)?.close();
    sources.current.delete(key);
  }, []);

  const open = useCallback(
    (key: string, url: string, { onOpen, onMessage, onError }: Handlers) => {
      close(key);
      const es = new EventSource(url);
      sources.current.set(key, es);
      es.onopen = () => onOpen?.();
      es.onmessage = (event) => {
        try {
          onMessage(JSON.parse(event.data));
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };
      es.onerror = () => {
        close(key);
        onError?.();
      };
    },
    [close]
  );

  useEffect(() => {
    const map = sources.current;
    return () => {
      for (const es of map.values()) es.close();
      map.clear();
    };
  }, []);

  return { open, close };
}
