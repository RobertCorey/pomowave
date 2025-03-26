import express, { Request, Response } from "express";

// Initialize Express
const app = express();
app.use(express.json());

// Set port
const PORT = process.env.PORT || 3000;

// Types for the room system
type User = {
  id: string;
  nickname: string;
  isHost: boolean;
};

type Room = {
  id: string;
  users: User[];
};

// Helper function to generate a room code
const generateRoomCode = (): string => {
  const animals = [
    "cat",
    "dog",
    "rabbit",
    "fox",
    "wolf",
    "bear",
    "panda",
    "tiger",
    "lion",
    "elephant",
  ];
  const colors = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "pink",
    "black",
    "white",
    "brown",
  ];
  const locations = [
    "forest",
    "mountain",
    "river",
    "lake",
    "beach",
    "desert",
    "cave",
    "field",
    "ocean",
    "valley",
  ];

  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomLocation =
    locations[Math.floor(Math.random() * locations.length)];

  return `${randomAnimal}-${randomColor}-${randomLocation}`;
};

// Using dynamic import for ESM module
async function main() {
  const { JSONFilePreset } = await import("lowdb/node");

  // Create a db structure with rooms and coin face
  const db = await JSONFilePreset<{
    face: "heads" | "tails" | null;
    rooms: Record<string, Room>;
  }>("game.json", { face: null, rooms: {} });

  // Route to get the current face of the coin
  app.get("/api/coin-face", (req: Request, res: Response) => {
    const face = db.data.face;
    res.json({ face });
  });

  // Route to update the face of the coin
  app.post("/api/flip", async (req, res) => {
    const face = Math.random() >= 0.5 ? "heads" : "tails";
    db.data.face = face;
    await db.write();
    res.json({ face: db.data.face });
  });

  // Route to create a new room
  app.post("/api/rooms", async (req, res) => {
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== "string") {
      res.status(400).json({ error: "Nickname is required" });
      return; // Add this return to prevent further execution
    }

    const userId = Math.random().toString(36).substring(2, 15);
    const roomId = generateRoomCode();

    // Create a new room with the user as the host
    const newRoom: Room = {
      id: roomId,
      users: [{ id: userId, nickname, isHost: true }],
    };

    // Add the room to the database
    if (!db.data.rooms) {
      db.data.rooms = {};
    }
    db.data.rooms[roomId] = newRoom;
    await db.write();

    // Return the created room and the user ID
    res.status(201).json({ room: newRoom, userId });
  });

  // Route to get a room by ID
  app.get("/api/rooms/:roomId", (req, res) => {
    const { roomId } = req.params;
    const room = db.data.rooms[roomId];

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json({ room });
  });

  // Route to join a room
  app.post("/api/rooms/:roomId/join", async (req, res) => {
    const { roomId } = req.params;
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== "string") {
      res.status(400).json({ error: "Nickname is required" });
      return;
    }

    const room = db.data.rooms[roomId];

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const userId = Math.random().toString(36).substring(2, 15);

    // Add the user to the room
    room.users.push({ id: userId, nickname, isHost: false });
    await db.write();

    // Return the updated room and the user ID
    res.json({ room, userId });
  });

  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Handle graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force close after 5 seconds if it hangs
    setTimeout(() => {
      console.log('Server shutdown timed out, forcing exit');
      process.exit(1);
    }, 5000);
  };

  // Handle various signals
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    gracefulShutdown();
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise rejection:', reason);
    gracefulShutdown();
  });
}

main().catch((error) => {
  console.error("Server failed to start:", error);
});
