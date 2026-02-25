// Types for the room system
export type User = {
  id: string;
  nickname: string;
  emoji: string; // Animal emoji for avatar
  isHost: boolean;
};

export type Timer = {
  endsAt: number; // Unix timestamp (ms) when the timer ends
  durationMinutes: number;
  startedBy: string; // User ID who started the timer
};

export type PomoSession = {
  id: string;
  startedAt: number; // Unix timestamp (ms)
  startedBy: string; // User ID
  participants: string[]; // User IDs who joined the wave during the join window
  partialParticipants?: string[]; // User IDs who joined after the join deadline (in-progress join)
  durationMinutes: number;
  joinDeadline: number; // Unix timestamp (ms) - deadline for joining the wave (60s after start)
  workDeclarations?: Record<string, string>; // userId -> what they're working on (optional)
};

export type Room = {
  id: string;
  users: User[];
  timer?: Timer; // Active timer, if any
  sessions: PomoSession[]; // Completed pomo sessions
};