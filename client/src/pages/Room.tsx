import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRoom, joinRoom, startTimer } from '../api';

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

  // Format milliseconds as MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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

  if (isRoomLoading) return <div>Loading room data...</div>;
  if (roomError)
    return <div>Error loading room: {(roomError as Error).message}</div>;

  return (
    <div className="room-container">
      <div className="room-info">
        <h1>Room: {roomCode}</h1>
        <button onClick={copyRoomLink}>Share Link</button>
      </div>

      {!userJoined ? (
        <div className="join-form">
          <h2>Join this Room</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (nickname.trim()) {
                joinRoomMutation.mutate();
              }
            }}
          >
            <div className="form-group">
              <label htmlFor="join-nickname">Nickname:</label>
              <input
                type="text"
                id="join-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={joinRoomMutation.isPending || !nickname.trim()}
            >
              {joinRoomMutation.isPending ? "Joining..." : "Join Room"}
            </button>
          </form>
          {joinRoomMutation.isError && (
            <div className="error">
              Error joining room: {(joinRoomMutation.error as Error).message}
            </div>
          )}
        </div>
      ) : (
        <div className="room-content">
          <div className="timer-section">
            {isTimerActive ? (
              <>
                <div className="timer-display">{formatTime(timeRemaining!)}</div>
                <p className="timer-info">Timer started by {timerStarterName}</p>
              </>
            ) : (
              <>
                <div className="timer-display">25:00</div>
                {timeRemaining === 0 && <p className="timer-info">Timer complete!</p>}
                <button
                  className="start-timer-btn"
                  onClick={() => startTimerMutation.mutate()}
                  disabled={startTimerMutation.isPending}
                >
                  {startTimerMutation.isPending ? "Starting..." : "Start Timer"}
                </button>
              </>
            )}
            {startTimerMutation.isError && (
              <div className="error">
                Error starting timer: {(startTimerMutation.error as Error).message}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="users-list">
        <h2>Users in Room</h2>
        <ul>
          {roomData?.room?.users?.map(
            (user: { id: string; nickname: string; isHost: boolean }) => (
              <li key={user.id}>
                {user.nickname} {user.isHost ? "(Host)" : ""}
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}

export default Room;
