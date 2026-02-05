import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Socket URL configuration - must match the API server
const SOCKET_URL = import.meta.env.PROD
  ? 'https://pomowave.onrender.com'
  : 'http://localhost:3000';

interface WaveStartedEvent {
  sessionId: string;
  startedBy: string;
  starterName: string;
  endsAt: number;
  joinDeadline: number;
}

interface TimerCompleteEvent {
  sessionId: string;
}

interface UserJoinedEvent {
  userId: string;
  nickname: string;
  emoji: string;
}

interface UserJoinedWaveEvent {
  sessionId: string;
  userId: string;
  nickname: string;
  emoji: string;
}

interface UseSocketOptions {
  roomId: string | undefined;
  currentUserId: string | null;
  enabled: boolean;
  onWaveStarted?: (event: WaveStartedEvent) => void;
  onTimerComplete?: (event: TimerCompleteEvent) => void;
  onUserJoined?: (event: UserJoinedEvent) => void;
  onUserJoinedWave?: (event: UserJoinedWaveEvent) => void;
}

/**
 * Hook to manage Socket.io connection for real-time room updates.
 * This allows the app to receive notifications even when the tab is backgrounded,
 * since the socket connection persists (unlike polling which gets throttled).
 *
 * Uses refs to keep callback references current without causing socket reconnection.
 */
export function useSocket({
  roomId,
  currentUserId,
  enabled,
  onWaveStarted,
  onTimerComplete,
  onUserJoined,
  onUserJoinedWave,
}: UseSocketOptions): void {
  const socketRef = useRef<Socket | null>(null);
  const currentUserIdRef = useRef(currentUserId);
  const onWaveStartedRef = useRef(onWaveStarted);
  const onTimerCompleteRef = useRef(onTimerComplete);
  const onUserJoinedRef = useRef(onUserJoined);
  const onUserJoinedWaveRef = useRef(onUserJoinedWave);

  // Keep refs up to date via direct assignment instead of separate effects.
  // Refs are updated synchronously during render, which is safe and avoids
  // extra effect overhead (rerender-move-effect-to-event).
  currentUserIdRef.current = currentUserId;
  onWaveStartedRef.current = onWaveStarted;
  onTimerCompleteRef.current = onTimerComplete;
  onUserJoinedRef.current = onUserJoined;
  onUserJoinedWaveRef.current = onUserJoinedWave;

  // Handle wave started event
  const handleWaveStarted = useCallback((event: WaveStartedEvent) => {
    // Don't notify if the current user started the wave
    if (event.startedBy === currentUserIdRef.current) {
      return;
    }
    onWaveStartedRef.current?.(event);
  }, []);

  // Handle timer complete event (sent by server at exact completion time)
  const handleTimerComplete = useCallback((event: TimerCompleteEvent) => {
    console.log('Timer complete event received from server:', event);
    onTimerCompleteRef.current?.(event);
  }, []);

  // Handle user joined event
  const handleUserJoined = useCallback((event: UserJoinedEvent) => {
    console.log('User joined room:', event);
    onUserJoinedRef.current?.(event);
  }, []);

  // Handle user joined wave event
  const handleUserJoinedWave = useCallback((event: UserJoinedWaveEvent) => {
    console.log('User joined wave:', event);
    onUserJoinedWaveRef.current?.(event);
  }, []);

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
    socket.on('timer-complete', handleTimerComplete);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-joined-wave', handleUserJoinedWave);

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
  }, [enabled, roomId, handleWaveStarted, handleTimerComplete, handleUserJoined, handleUserJoinedWave]);
}

export default useSocket;
