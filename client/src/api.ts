// API base URL configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://pomowave.onrender.com/api' 
  : '/api';

// API function to create a room
export const createRoom = async (nickname: string) => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
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

// API function to get room data
export const fetchRoom = async (roomCode: string) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomCode}`);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};

// API function to join a room
export const joinRoom = async (roomCode: string, nickname: string) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomCode}/join`, {
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