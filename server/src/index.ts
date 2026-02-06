import express, { Request, Response } from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db } from './db';
import { Room, User, PomoSession } from './types';

// Animal emojis for user avatars
const ANIMAL_EMOJIS = [
  "🐬", "🐳", "🦈", "🐙", "🦑", "🦀", "🦞", "🐠", "🐟", "🐡",
  "🦭", "🐢", "🦩", "🦜", "🐚", "🌊"
];

const getRandomEmoji = (): string => {
  return ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)];
};

// Initialize Express
const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOrigins = ['https://pomowave-919t.onrender.com', 'http://localhost:5173'];

app.use(express.json());
app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a room to receive updates
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
  });

  // Leave a room
  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`Client ${socket.id} left room ${roomId}`);
  });

  // Broadcast emoji reaction to all clients in the room
  socket.on('send-reaction', (data: { roomId: string; userId: string; emoji: string; nickname: string }) => {
    io.to(data.roomId).emit('wave-reaction', {
      userId: data.userId,
      emoji: data.emoji,
      nickname: data.nickname,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Set port
const PORT = process.env.PORT || 3000;

// Store active timer timeouts by room ID (for server-side timer completion)
const activeTimers = new Map<string, NodeJS.Timeout>();

/**
 * Schedule a timer completion event for a room.
 * The server will emit 'timer-complete' to all clients in the room when the timer ends.
 * This is more reliable than client-side timers because the server isn't throttled.
 */
function scheduleTimerCompletion(roomId: string, endsAt: number, sessionId: string): void {
  // Clear any existing timer for this room
  const existingTimer = activeTimers.get(roomId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timeUntilEnd = endsAt - Date.now();

  if (timeUntilEnd <= 0) {
    // Timer already ended, emit immediately
    io.to(roomId).emit('timer-complete', { sessionId });
    return;
  }

  console.log(`Scheduling timer completion for room ${roomId} in ${Math.round(timeUntilEnd / 1000)}s`);

  const timeout = setTimeout(() => {
    console.log(`Timer completed for room ${roomId}`);
    io.to(roomId).emit('timer-complete', { sessionId });
    activeTimers.delete(roomId);

    // Clear the timer from the room in the database
    db.rooms.get(roomId).then((room) => {
      if (room && room.timer) {
        room.timer = undefined;
        db.rooms.update(room).catch((err) => {
          console.error('Error clearing timer from room:', err);
        });
      }
    }).catch((err) => {
      console.error('Error getting room to clear timer:', err);
    });
  }, timeUntilEnd);

  activeTimers.set(roomId, timeout);
}

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

  // Restore any active timers from the database (in case of server restart)
  try {
    const roomsWithTimers = await db.rooms.getAllWithActiveTimers();
    for (const room of roomsWithTimers) {
      if (room.timer && room.sessions && room.sessions.length > 0) {
        const currentSession = room.sessions[room.sessions.length - 1];
        console.log(`Restoring timer for room ${room.id}, ends in ${Math.round((room.timer.endsAt - Date.now()) / 1000)}s`);
        scheduleTimerCompletion(room.id, room.timer.endsAt, currentSession.id);
      }
    }
    if (roomsWithTimers.length > 0) {
      console.log(`Restored ${roomsWithTimers.length} active timer(s)`);
    }
  } catch (error) {
    console.error('Error restoring active timers:', error);
  }

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
  app.post("/api/flip", async (req: Request, res: Response) => {
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
        users: [{ id: userId, nickname, emoji: getRandomEmoji(), isHost: true }],
        sessions: [],
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

  // Route to validate multiple rooms and get their details
  app.post("/api/rooms/validate", async (req, res) => {
    try {
      const { roomIds } = req.body;

      if (!roomIds || !Array.isArray(roomIds)) {
        res.status(400).json({ error: "roomIds array is required" });
        return;
      }

      const roomDetails: Record<string, { users: { nickname: string; emoji: string }[]; wavesCompleted: number } | null> = {};

      for (const roomId of roomIds) {
        const room = await db.rooms.get(roomId);
        if (room) {
          roomDetails[roomId] = {
            users: room.users.map(u => ({ nickname: u.nickname, emoji: u.emoji })),
            wavesCompleted: room.sessions?.length || 0,
          };
        } else {
          roomDetails[roomId] = null;
        }
      }

      res.json({ roomDetails });
    } catch (error) {
      console.error('Error validating rooms:', error);
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
      const newUser: User = { id: userId, nickname, emoji: getRandomEmoji(), isHost: false };

      // Add the user to the room
      const updatedRoom = await db.rooms.addUser(roomId, newUser);

      // Emit user-joined event to all clients in the room
      io.to(roomId).emit('user-joined', {
        userId: newUser.id,
        nickname: newUser.nickname,
        emoji: newUser.emoji,
      });

      // Return the updated room and the user ID
      res.json({ room: updatedRoom, userId });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Route to start a timer in a room
  app.post("/api/rooms/:roomId/timer", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userId, durationMinutes = 25 } = req.body;

      if (!userId || typeof userId !== "string") {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      if (typeof durationMinutes !== "number" || durationMinutes <= 0 || durationMinutes > 120) {
        res.status(400).json({ error: "durationMinutes must be a number between 1 and 120" });
        return;
      }

      const room = await db.rooms.get(roomId);

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      // Verify the user is in the room
      const userInRoom = room.users.find((u) => u.id === userId);
      if (!userInRoom) {
        res.status(403).json({ error: "User is not in this room" });
        return;
      }

      const now = Date.now();

      // Set the timer
      room.timer = {
        endsAt: now + durationMinutes * 60 * 1000,
        durationMinutes,
        startedBy: userId,
      };

      // Create a new pomo session - only the starter is a participant initially
      // Other users have 60 seconds to join the wave
      const JOIN_WINDOW_SECONDS = 60;
      const session: PomoSession = {
        id: Math.random().toString(36).substring(2, 15),
        startedAt: now,
        startedBy: userId,
        participants: [userId], // Only the starter joins automatically
        durationMinutes,
        joinDeadline: now + JOIN_WINDOW_SECONDS * 1000,
      };

      // Initialize sessions array if it doesn't exist (for backwards compatibility)
      if (!room.sessions) {
        room.sessions = [];
      }
      room.sessions.push(session);

      await db.rooms.update(room);

      // Emit wave-started event to all clients in the room
      io.to(roomId).emit('wave-started', {
        sessionId: session.id,
        startedBy: userId,
        starterName: userInRoom.nickname,
        endsAt: room.timer.endsAt,
        joinDeadline: session.joinDeadline,
      });

      // Schedule server-side timer completion
      // This ensures clients get notified even if their tab is backgrounded
      scheduleTimerCompletion(roomId, room.timer.endsAt, session.id);

      res.json({ room });
    } catch (error) {
      console.error("Error starting timer:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Route to join an active wave
  app.post("/api/rooms/:roomId/wave/join", async (req, res) => {
    try {
      const { roomId } = req.params;
      const { userId } = req.body;

      if (!userId || typeof userId !== "string") {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const room = await db.rooms.get(roomId);

      if (!room) {
        res.status(404).json({ error: "Room not found" });
        return;
      }

      // Verify the user is in the room
      const userInRoom = room.users.find((u) => u.id === userId);
      if (!userInRoom) {
        res.status(403).json({ error: "User is not in this room" });
        return;
      }

      // Check if there's an active timer
      if (!room.timer || room.timer.endsAt <= Date.now()) {
        res.status(400).json({ error: "No active wave to join" });
        return;
      }

      // Get the current session (most recent)
      if (!room.sessions || room.sessions.length === 0) {
        res.status(400).json({ error: "No active session" });
        return;
      }

      const currentSession = room.sessions[room.sessions.length - 1];

      // Check if user is already a participant
      if (currentSession.participants.includes(userId)) {
        res.status(400).json({ error: "Already joined this wave" });
        return;
      }

      // Check if join deadline has passed
      const now = Date.now();
      if (currentSession.joinDeadline && now > currentSession.joinDeadline) {
        res.status(400).json({ error: "Join deadline has passed" });
        return;
      }

      // Add user to participants
      currentSession.participants.push(userId);
      await db.rooms.update(room);

      // Emit user-joined-wave event to all clients in the room
      io.to(roomId).emit('user-joined-wave', {
        sessionId: currentSession.id,
        userId,
        nickname: userInRoom.nickname,
        emoji: userInRoom.emoji,
      });

      res.json({ room });
    } catch (error) {
      console.error("Error joining wave:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint for Render
  app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
  });

  // Start the server (using httpServer for Socket.io support)
  const server = httpServer.listen(PORT, () => {
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
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise rejection:', reason);
    gracefulShutdown();
  });
}

main().catch((error) => {
  console.error("Server failed to start:", error);
});
