import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

// API function to create a room
const createRoom = async (nickname: string) => {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  
  return response.json();
};

function NewRoom() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  
  const createRoomMutation = useMutation({
    mutationFn: () => createRoom(nickname),
    onSuccess: (data) => {
      // Save the user ID to localStorage, namespaced by the room ID
      const roomUserMap = JSON.parse(localStorage.getItem('roomUserMap') || '{}');
      roomUserMap[data.room.id] = data.userId;
      localStorage.setItem('roomUserMap', JSON.stringify(roomUserMap));
      
      // Navigate to the room page
      navigate(`/room/${data.room.id}`);
    },
  });

  return (
    <div className="new-room-container">
      <h1>Create a New Room</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (nickname.trim()) {
          createRoomMutation.mutate();
        }
      }}>
        <div className="form-group">
          <label htmlFor="nickname">Nickname:</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={createRoomMutation.isPending || !nickname.trim()}
        >
          {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
        </button>
      </form>
      {createRoomMutation.isError && (
        <div className="error">
          Error creating room: {(createRoomMutation.error as Error).message}
        </div>
      )}
    </div>
  );
}

export default NewRoom;