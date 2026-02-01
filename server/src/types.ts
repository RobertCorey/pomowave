// Types for the room system
export type User = {
  id: string;
  nickname: string;
  isHost: boolean;
};

export type Timer = {
  endsAt: number; // Unix timestamp (ms) when the timer ends
  durationMinutes: number;
  startedBy: string; // User ID who started the timer
};

export type Room = {
  id: string;
  users: User[];
  timer?: Timer; // Active timer, if any
};