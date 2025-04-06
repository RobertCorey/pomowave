import express, { Request, Response } from "express";
import cors from 'cors';
import { db } from './db';
import { Room, User } from './types';

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors({
  origin: ['https://pomowave-919t.onrender.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Set port
const PORT = process.env.PORT || 3000;

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

async function main() {
  // Initialize the database connection
  await db.init();

  // Route to get the current face of the coin
  app.get("/api/coin-face", async (req: Request, res: Response) => {
    try {
      const face = await db.coinFace.get();
      res.json({ face });
    } catch (error) {
      console.error('Error getting coin face:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to update the face of the coin
  app.post("/api/flip", async (req, res) => {
    try {
      const face = Math.random() >= 0.5 ? "heads" : "tails";
      await db.coinFace.set(face);
      res.json({ face });
    } catch (error) {
      console.error('Error flipping coin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to create a new room
  app.post("/api/rooms", async (req, res) => {
    try {
      const { nickname } = req.body;

      if (!nickname || typeof nickname !== "string") {
        res.status(400).json({ error: "Nickname is required" });
        return;
      }

      const userId = Math.random().toString(36).substring(2, 15);
      const roomId = generateRoomCode();

      // Create a new room with the user as the host
      const newRoom: Room = {
        id: roomId,
        users: [{ id: userId, nickname, isHost: true }],
      };

      // Add the room to the database
      await db.rooms.create(newRoom);

      // Return the created room and the user ID
      res.status(201).json({ room: newRoom, userId });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to get a room by ID
  app.get("/api/rooms/:roomId", async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await db.rooms.get(roomId);

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      res.json({ room });
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to join a room
  app.post("/api/rooms/:roomId/join", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { nickname } = req.body;

      if (!nickname || typeof nickname !== "string") {
        res.status(400).json({ error: "Nickname is required" });
        return;
      }

      const room = await db.rooms.get(roomId);

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      const userId = Math.random().toString(36).substring(2, 15);
      const newUser: User = { id: userId, nickname, isHost: false };

      // Add the user to the room
      const updatedRoom = await db.rooms.addUser(roomId, newUser);

      // Return the updated room and the user ID
      res.json({ room: updatedRoom, userId });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check endpoint for Render
  app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
  });

  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Handle graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Shutting down server gracefully...');
    
    // Close the database connection
    try {
      await db.close();
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
    
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
