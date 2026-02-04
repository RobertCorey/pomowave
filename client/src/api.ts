import { config } from './config';

// API function to create a room
export const createRoom = async (nickname: string) => {
  const response = await fetch(`${config.apiBaseUrl}/rooms`, {
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
  const response = await fetch(`${config.apiBaseUrl}/rooms/${roomCode}`);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};

// API function to join a room
export const joinRoom = async (roomCode: string, nickname: string) => {
  const response = await fetch(`${config.apiBaseUrl}/rooms/${roomCode}/join`, {
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

// API function to start a timer in a room
export const startTimer = async (roomCode: string, userId: string, durationMinutes: number = 25) => {
  const response = await fetch(`${config.apiBaseUrl}/rooms/${roomCode}/timer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, durationMinutes }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};

// API function to join an active wave
export const joinWave = async (roomCode: string, userId: string) => {
  const response = await fetch(`${config.apiBaseUrl}/rooms/${roomCode}/wave/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};

// Type for room details returned by validation
export type RoomDetails = {
  users: { nickname: string; emoji: string }[];
  wavesCompleted: number;
} | null;

// API function to validate multiple rooms and get their details
export const validateRooms = async (roomIds: string[]): Promise<{ roomDetails: Record<string, RoomDetails> }> => {
  const response = await fetch(`${config.apiBaseUrl}/rooms/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roomIds }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
};