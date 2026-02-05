import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRoom, joinRoom, startTimer, joinWave } from '../api';
import BeachScene from '../components/BeachScene';
import WaveScene from '../components/WaveScene';
import SessionHistory from '../components/SessionHistory';
import HotkeysModal from '../components/HotkeysModal';
import { notifyTimerStart, notifyTimerComplete, notifyWaveStarted, requestNotificationPermission } from '../services/notifications';
import { useBackgroundTimer } from '../hooks/useBackgroundTimer';
import { useSocket } from '../hooks/useSocket';

type User = {
  id: string;
  nickname: string;
  emoji: string;
  isHost: boolean;
};

type PomoSession = {
  id: string;
  startedAt: number;
  startedBy: string;
  participants: string[];
  durationMinutes: number;
  joinDeadline?: number;
};

/** Helper to read the roomUserMap from localStorage */
function getRoomUserMap(): Record<string, string> {
  return JSON.parse(localStorage.getItem("roomUserMap") || "{}");
}

/** Pure function hoisted outside component to avoid re-creation on every render */
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** Static styles hoisted outside component (rendering-hoist-jsx) */
const pageStyles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  roomCode: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 500,
  },
  shareButton: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.75rem',
    color: '#64748b',
    cursor: 'pointer',
  },
  headerButtons: {
    display: 'flex',
    gap: '8px',
  },
  hotkeysButton: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '0.75rem',
    color: '#64748b',
    cursor: 'pointer',
  },
  joinContainer: {
    background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center' as const,
  },
  joinTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#0369a1',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #bae6fd',
    fontSize: '1rem',
    outline: 'none',
    textAlign: 'center' as const,
  },
  joinButton: {
    background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    marginTop: '8px',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#64748b',
  },
};

function Room() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [nickname, setNickname] = useState("");
  // Lazy state initialization from localStorage (rerender-lazy-state-init)
  const [userJoined, setUserJoined] = useState(() => {
    const roomUserMap = getRoomUserMap();
    return !!(roomCode && roomUserMap[roomCode]);
  });
  const [isHotkeysModalOpen, setIsHotkeysModalOpen] = useState(false);
  const queryClient = useQueryClient();
  // Track which session we've already notified completion for (to prevent double notifications)
  const completedSessionIdRef = useRef<string | null>(null);

  // Derive currentUserId during render instead of caching in stale useMemo (rerender-derived-state-no-effect)
  const currentUserId = useMemo(() => {
    const roomUserMap = getRoomUserMap();
    return roomCode ? roomUserMap[roomCode] ?? null : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, userJoined]);

  // Query to fetch room data (real-time updates via WebSocket)
  const {
    data: roomData,
    isLoading: isRoomLoading,
    error: roomError,
  } = useQuery({
    queryKey: ["room", roomCode],
    queryFn: () => fetchRoom(roomCode!),
    enabled: !!roomCode,
  });

  // Get the current session ID for deduplication
  const currentSessionId = useMemo(() => {
    const sessions = roomData?.room?.sessions || [];
    return sessions[sessions.length - 1]?.id || null;
  }, [roomData?.room?.sessions]);

  // Handle timer completion with deduplication
  // This prevents double notifications when both client-side and server-side detect completion
  const handleTimerComplete = useCallback((sessionId?: string) => {
    const effectiveSessionId = sessionId || currentSessionId;
    if (!effectiveSessionId) return;

    // Check if we've already notified for this session
    if (completedSessionIdRef.current === effectiveSessionId) {
      console.log('Already notified completion for session:', effectiveSessionId);
      return;
    }

    console.log('Timer complete, notifying for session:', effectiveSessionId);
    completedSessionIdRef.current = effectiveSessionId;
    notifyTimerComplete();
    queryClient.invalidateQueries({ queryKey: ['room', roomCode] });
  }, [currentSessionId, queryClient, roomCode]);

  // Define callbacks before passing to hooks (avoid inline useCallback at call sites)
  const handleBackgroundTimerComplete = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

  const handleSocketWaveStarted = useCallback((event: { starterName: string }) => {
    notifyWaveStarted(event.starterName);
    queryClient.invalidateQueries({ queryKey: ['room', roomCode] });
  }, [queryClient, roomCode]);

  const handleSocketTimerComplete = useCallback((event: { sessionId: string }) => {
    handleTimerComplete(event.sessionId);
  }, [handleTimerComplete]);

  const handleSocketUserJoined = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['room', roomCode] });
  }, [queryClient, roomCode]);

  const handleSocketUserJoinedWave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['room', roomCode] });
  }, [queryClient, roomCode]);

  // Use background-aware timer hook for reliable timing even when tab is suspended
  // This is a fallback in case the socket connection drops
  const { timeRemaining } = useBackgroundTimer({
    endsAt: roomData?.room?.timer?.endsAt ?? null,
    onComplete: handleBackgroundTimerComplete,
  });

  // Use Socket.io for real-time notifications (works even when tab is backgrounded)
  // Server sends timer-complete at exact completion time - this is the primary notification method
  useSocket({
    roomId: roomCode,
    currentUserId,
    enabled: userJoined,
    onWaveStarted: handleSocketWaveStarted,
    onTimerComplete: handleSocketTimerComplete,
    onUserJoined: handleSocketUserJoined,
    onUserJoinedWave: handleSocketUserJoinedWave,
  });

  // Request notification permission when user joins
  useEffect(() => {
    if (userJoined) {
      requestNotificationPermission();
    }
  }, [userJoined]);

  // Sync timer status to browser tab title
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      document.title = `${formatTime(timeRemaining)} - Pomowave`;
    } else {
      document.title = 'Pomowave';
    }

    return () => {
      document.title = 'Pomowave';
    };
  }, [timeRemaining]);

  // Get the join deadline from the current session
  const joinDeadlineEndsAt = useMemo(() => {
    const sessions = roomData?.room?.sessions || [];
    const currentSession = sessions[sessions.length - 1];
    if (!currentSession?.joinDeadline || !roomData?.room?.timer) {
      return null;
    }
    return currentSession.joinDeadline;
  }, [roomData?.room?.sessions, roomData?.room?.timer]);

  // Use background-aware timer for join deadline as well
  // Use the timer value directly instead of syncing via effect (rerender-derived-state-no-effect)
  const { timeRemaining: joinDeadlineRemaining } = useBackgroundTimer({
    endsAt: joinDeadlineEndsAt,
  });

  // Mutation to start a timer
  const startTimerMutation = useMutation({
    mutationFn: () => startTimer(roomCode!, currentUserId!, 25),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
      notifyTimerStart();
    },
  });

  // Mutation to join an active wave
  const joinWaveMutation = useMutation({
    mutationFn: () => joinWave(roomCode!, currentUserId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
    },
  });

  // Mutation to join a room
  const joinRoomMutation = useMutation({
    mutationFn: () => joinRoom(roomCode!, nickname),
    onSuccess: (data) => {
      // Save the user ID to localStorage for this room
      const roomUserMap = getRoomUserMap();
      roomUserMap[roomCode!] = data.userId;
      localStorage.setItem("roomUserMap", JSON.stringify(roomUserMap));

      // Mark that the user has joined
      setUserJoined(true);

      // Invalidate and refetch room data
      queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
    },
  });

  // Copy room URL to clipboard
  const copyRoomLink = useCallback(() => {
    const roomUrl = window.location.href;
    navigator.clipboard
      .writeText(roomUrl)
      .then(() => alert("Room link copied to clipboard!"))
      .catch((err) => console.error("Could not copy room link:", err));
  }, []);

  // Check if timer is active (has time remaining)
  const isTimerActive = timeRemaining !== null && timeRemaining > 0;

  // Get the name of the user who started the timer
  const timerStarterName = useMemo(() => {
    const timer = roomData?.room?.timer;
    if (!timer) return null;
    const starter = roomData?.room?.users?.find(
      (u: { id: string }) => u.id === timer.startedBy
    );
    return starter?.nickname || "Someone";
  }, [roomData?.room?.timer, roomData?.room?.users]);

  const users: User[] = roomData?.room?.users || [];
  const sessions: PomoSession[] = useMemo(
    () => roomData?.room?.sessions || [],
    [roomData?.room?.sessions]
  );

  // Get the current active session's participants (most recent session when timer is active)
  const activeSessionParticipants = useMemo(() => {
    if (!isTimerActive || sessions.length === 0) return [];
    const currentSession = sessions[sessions.length - 1];
    return currentSession?.participants || [];
  }, [isTimerActive, sessions]);

  // Check if current user can join the wave (not already a participant and deadline hasn't passed)
  const canJoinWave = useMemo(() => {
    if (!isTimerActive || !currentUserId) return false;
    const isParticipant = activeSessionParticipants.includes(currentUserId);
    const deadlineNotPassed = joinDeadlineRemaining !== null && joinDeadlineRemaining > 0;
    return !isParticipant && deadlineNotPassed;
  }, [isTimerActive, currentUserId, activeSessionParticipants, joinDeadlineRemaining]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (!userJoined) return;

      if (!isTimerActive) {
        // Start a new pomo
        if (currentUserId && !startTimerMutation.isPending) {
          startTimerMutation.mutate();
        }
      } else if (canJoinWave && !joinWaveMutation.isPending) {
        // Join the active wave
        joinWaveMutation.mutate();
      }
    }

    if (e.code === 'Escape' && isHotkeysModalOpen) {
      setIsHotkeysModalOpen(false);
    }
  }, [userJoined, isTimerActive, currentUserId, canJoinWave, isHotkeysModalOpen, startTimerMutation, joinWaveMutation]);

  // Register keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Stable callback for onClose (avoid creating new function on every render)
  const closeHotkeysModal = useCallback(() => setIsHotkeysModalOpen(false), []);
  const openHotkeysModal = useCallback(() => setIsHotkeysModalOpen(true), []);
  const handleStartTimer = useCallback(() => startTimerMutation.mutate(), [startTimerMutation]);
  const handleJoinWave = useCallback(() => joinWaveMutation.mutate(), [joinWaveMutation]);

  if (isRoomLoading) {
    return <div style={pageStyles.loading}>Loading... 🌊</div>;
  }

  if (roomError) {
    return (
      <div style={{ ...pageStyles.container, ...pageStyles.error }}>
        Error loading room: {(roomError as Error).message}
      </div>
    );
  }

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <span style={pageStyles.roomCode}>🏝️ {roomCode}</span>
        <div style={pageStyles.headerButtons}>
          <button style={pageStyles.hotkeysButton} onClick={openHotkeysModal}>
            Hotkeys
          </button>
          <button style={pageStyles.shareButton} onClick={copyRoomLink}>
            Share Link
          </button>
        </div>
      </div>

      {!userJoined ? (
        <div style={pageStyles.joinContainer}>
          <div style={pageStyles.joinTitle}>Join the Beach! 🏖️</div>
          <form
            style={pageStyles.form}
            onSubmit={(e) => {
              e.preventDefault();
              if (nickname.trim()) {
                joinRoomMutation.mutate();
              }
            }}
          >
            <input
              type="text"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={pageStyles.input}
              required
            />
            <button
              type="submit"
              disabled={joinRoomMutation.isPending || !nickname.trim()}
              style={{
                ...pageStyles.joinButton,
                opacity: joinRoomMutation.isPending || !nickname.trim() ? 0.6 : 1,
              }}
            >
              {joinRoomMutation.isPending ? "Joining..." : "🐚 Join Room"}
            </button>
          </form>
          {joinRoomMutation.isError ? (
            <div style={pageStyles.error}>
              Error: {(joinRoomMutation.error as Error).message}
            </div>
          ) : null}
        </div>
      ) : (
        <>
          {isTimerActive ? (
            <WaveScene
              users={users}
              participantIds={activeSessionParticipants}
              timeRemaining={timeRemaining!}
              startedByName={timerStarterName || 'Someone'}
              currentUserId={currentUserId}
              canJoinWave={canJoinWave}
              joinDeadlineRemaining={joinDeadlineRemaining}
              onJoinWave={handleJoinWave}
              isJoiningWave={joinWaveMutation.isPending}
            />
          ) : (
            <BeachScene
              users={users}
              onStartTimer={handleStartTimer}
              isStarting={startTimerMutation.isPending}
              timerComplete={timeRemaining === 0}
            />
          )}

          {startTimerMutation.isError ? (
            <div style={pageStyles.error}>
              Error starting timer: {(startTimerMutation.error as Error).message}
            </div>
          ) : null}

          <SessionHistory sessions={sessions} users={users} />
        </>
      )}

      <HotkeysModal
        isOpen={isHotkeysModalOpen}
        onClose={closeHotkeysModal}
      />
    </div>
  );
}

export default Room;
