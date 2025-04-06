import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRoom, joinRoom } from '../api';

function Room() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [nickname, setNickname] = useState("");
  const [userJoined, setUserJoined] = useState(false);
  const queryClient = useQueryClient();

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
          <h2>Welcome to the room!</h2>
          {/* Room content will go here in future tasks */}
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
