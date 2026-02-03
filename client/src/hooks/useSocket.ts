import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface WaveStartedEvent {
  sessionId: string;
  startedBy: string;
  starterName: string;
  endsAt: number;
  joinDeadline: number;
}

interface UseSocketOptions {
  roomId: string | undefined;
  currentUserId: string | null;
  enabled: boolean;
  onWaveStarted?: (event: WaveStartedEvent) => void;
}

/**
 * Hook to manage Socket.io connection for real-time room updates.
 * This allows the app to receive notifications even when the tab is backgrounded,
 * since the socket connection persists (unlike polling which gets throttled).
 */
export function useSocket({
  roomId,
  currentUserId,
  enabled,
  onWaveStarted,
}: UseSocketOptions): void {
  const socketRef = useRef<Socket | null>(null);
  const onWaveStartedRef = useRef(onWaveStarted);

  // Keep the callback ref up to date
  useEffect(() => {
    onWaveStartedRef.current = onWaveStarted;
  }, [onWaveStarted]);

  // Handle wave started event
  const handleWaveStarted = useCallback((event: WaveStartedEvent) => {
    // Don't notify if the current user started the wave
    if (event.startedBy === currentUserId) {
      return;
    }
    onWaveStartedRef.current?.(event);
  }, [currentUserId]);

  useEffect(() => {
    if (!enabled || !roomId) {
      return;
    }

    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected, joining room:', roomId);
      socket.emit('join-room', roomId);
    });

    socket.on('wave-started', handleWaveStarted);

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });

    return () => {
      if (roomId) {
        socket.emit('leave-room', roomId);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, roomId, handleWaveStarted]);
}

export default useSocket;
