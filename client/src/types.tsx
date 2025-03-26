type Room = {
  id: string;
  users: User[];
};

type User = {
  nickname: string;
  id: string;
  isHost: boolean;
};
