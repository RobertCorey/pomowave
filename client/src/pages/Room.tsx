import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRoom, joinRoom, startTimer } from '../api';
import BeachScene from '../components/BeachScene';
import WaveScene from '../components/WaveScene';
import SessionHistory from '../components/SessionHistory';

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
};

function Room() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [nickname, setNickname] = useState("");
  const [userJoined, setUserJoined] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Get the current user's ID for this room
  const currentUserId = useMemo(() => {
    const roomUserMap = JSON.parse(localStorage.getItem("roomUserMap") || "{}");
    return roomCode ? roomUserMap[roomCode] : null;
  }, [roomCode, userJoined]);

  // Check if the user has already joined this room
  useEffect(() => {
    const roomUserMap = JSON.parse(localStorage.getItem("roomUserMap") || "{}");
    if (roomCode && roomUserMap[roomCode]) {
      setUserJoined(true);
    }
  }, [roomCode]);

  // Query to fetch and poll room data
  const {
    data: roomData,
    isLoading: isRoomLoading,
    error: roomError,
  } = useQuery({
    queryKey: ["room", roomCode],
    queryFn: () => fetchRoom(roomCode!),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!roomCode,
  });

  // Update time remaining when room data changes or every second
  useEffect(() => {
    const timer = roomData?.room?.timer;
    if (!timer) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const remaining = Math.max(0, timer.endsAt - Date.now());
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [roomData?.room?.timer?.endsAt]);

  // Mutation to start a timer
  const startTimerMutation = useMutation({
    mutationFn: () => startTimer(roomCode!, currentUserId!, 25),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
    },
  });

  // Mutation to join a room
  const joinRoomMutation = useMutation({
    mutationFn: () => joinRoom(roomCode!, nickname),
    onSuccess: (data) => {
      // Save the user ID to localStorage for this room
      const roomUserMap = JSON.parse(
        localStorage.getItem("roomUserMap") || "{}"
      );
      roomUserMap[roomCode!] = data.userId;
      localStorage.setItem("roomUserMap", JSON.stringify(roomUserMap));

      // Mark that the user has joined
      setUserJoined(true);

      // Invalidate and refetch room data
      queryClient.invalidateQueries({ queryKey: ["room", roomCode] });
    },
  });

  // Copy room URL to clipboard
  const copyRoomLink = () => {
    const roomUrl = window.location.href;
    navigator.clipboard
      .writeText(roomUrl)
      .then(() => alert("Room link copied to clipboard!"))
      .catch((err) => console.error("Could not copy room link:", err));
  };

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
  const sessions: PomoSession[] = roomData?.room?.sessions || [];

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
        <button style={pageStyles.shareButton} onClick={copyRoomLink}>
          Share Link
        </button>
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
          {joinRoomMutation.isError && (
            <div style={pageStyles.error}>
              Error: {(joinRoomMutation.error as Error).message}
            </div>
          )}
        </div>
      ) : (
        <>
          {isTimerActive ? (
            <WaveScene
              users={users}
              timeRemaining={timeRemaining!}
              startedByName={timerStarterName || 'Someone'}
            />
          ) : (
            <BeachScene
              users={users}
              onStartTimer={() => startTimerMutation.mutate()}
              isStarting={startTimerMutation.isPending}
              timerComplete={timeRemaining === 0}
            />
          )}

          {startTimerMutation.isError && (
            <div style={pageStyles.error}>
              Error starting timer: {(startTimerMutation.error as Error).message}
            </div>
          )}

          <SessionHistory sessions={sessions} users={users} />
        </>
      )}
    </div>
  );
}

export default Room;
