// Types for the room system
export type User = {
  id: string;
  nickname: string;
  isHost: boolean;
};

export type Room = {
  id: string;
  users: User[];
};