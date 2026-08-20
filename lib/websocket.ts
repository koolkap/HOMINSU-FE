import { useEffect, useRef, useCallback } from 'react';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export interface WSMessage {
  type: string;
  [key: string]: unknown;
}

export function useFleetWebSocket(onMessage: (data: WSMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  const reconnectRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_BASE}/ws/operator`);

    ws.onopen = () => console.log('[WS] Connected to Operator Fleet');
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data);
      } catch {
        console.error('[WS] Failed to parse message');
      }
    };
    ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 3s...');
      setTimeout(() => reconnectRef.current(), 3000);
    };
    ws.onerror = (err) => console.error('[WS] Error', err);

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    reconnectRef.current = connect;
    connect();
    return () => {
      reconnectRef.current = () => undefined;
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { send };
}
