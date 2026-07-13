import { useEffect, useRef, useCallback, useState } from 'react';

interface SSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export function useSSE(url: string | null, options: SSEOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastEvent, setLastEvent] = useState<any>(null);

  // Store callbacks in refs to avoid re-creating the connection on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!url) return;

    // Clean up any existing connection before creating a new one
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      optionsRef.current.onOpen?.();
    };

    es.onerror = (err) => {
      setIsConnected(false);
      optionsRef.current.onError?.(err);
    };

    // Listen to custom events
    ['status_change', 'progress', 'error', 'completed'].forEach(type => {
      es.addEventListener(type, (event: MessageEvent) => {
        try {
          if (!event.data || event.data === 'undefined') return;
          const data = JSON.parse(event.data);
          setLastEvent({ type, data });
          optionsRef.current.onMessage?.(event);
        } catch (err) {
          console.error('SSE parse error:', err, 'Data:', event.data);
        }
      });
    });

    es.addEventListener('close', () => {
      es.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [url]); // Only reconnect when URL changes, not on every render

  return { isConnected, lastEvent, disconnect };
}
