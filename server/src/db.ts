import Redis from 'ioredis';
import { Room, User } from './types';

// Initialize Redis client
// This will use environment variables in production and fallback to defaults in development
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Prefix for keys to avoid collisions
const KEY_PREFIX = 'pomowave:';

// Database operations
export const db = {
  // Initialize database (run this at startup)
  async init(): Promise<void> {
    try {
      await redisClient.ping();
      console.log('Redis connection established');
    } catch (error) {
      console.error('Redis connection error:', error);
      // In development, continue with in-memory fallback
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using in-memory fallback for development');
      } else {
        throw error; // In production, fail if Redis is unavailable
      }
    }
  },

  // Clean up resources (run this at shutdown)
  async close(): Promise<void> {
    await redisClient.quit();
    console.log('Redis connection closed');
  },

  // Coin face operations
  coinFace: {
    async get(): Promise<string | null> {
      const face = await redisClient.get(`${KEY_PREFIX}coinFace`);
      return face;
    },

    async set(face: "heads" | "tails"): Promise<void> {
      await redisClient.set(`${KEY_PREFIX}coinFace`, face);
    }
  },

  // Room operations
  rooms: {
    async create(room: Room): Promise<void> {
      await redisClient.set(
        `${KEY_PREFIX}room:${room.id}`, 
        JSON.stringify(room),
        'EX',
        60 * 60 * 24 // Expire after 24 hours (to prevent stale rooms)
      );
    },

    async get(roomId: string): Promise<Room | null> {
      const roomData = await redisClient.get(`${KEY_PREFIX}room:${roomId}`);
      if (!roomData) return null;
      return JSON.parse(roomData) as Room;
    },

    async update(room: Room): Promise<void> {
      await redisClient.set(
        `${KEY_PREFIX}room:${room.id}`, 
        JSON.stringify(room),
        'EX',
        60 * 60 * 24 // Reset expiration with each update
      );
    },

    async addUser(roomId: string, user: User): Promise<Room | null> {
      const room = await this.get(roomId);
      if (!room) return null;
      
      room.users.push(user);
      await this.update(room);
      return room;
    }
  }
};

// Fallback in-memory database for development/testing
// This will be used if Redis is not available in development
let inMemoryFallback: {
  face: "heads" | "tails" | null;
  rooms: Record<string, Room>;
} = { face: null, rooms: {} };

// Monkey patch Redis in development if the connection fails
if (process.env.NODE_ENV !== 'production') {
  redisClient.on('error', (error) => {
    console.warn('Redis error, using in-memory fallback:', error.message);
    
    // Monkey patch the db methods to use in-memory storage instead
    db.coinFace.get = async () => inMemoryFallback.face;
    db.coinFace.set = async (face) => { inMemoryFallback.face = face; };
    
    db.rooms.create = async (room) => { inMemoryFallback.rooms[room.id] = room; };
    db.rooms.get = async (roomId) => inMemoryFallback.rooms[roomId] || null;
    db.rooms.update = async (room) => { inMemoryFallback.rooms[room.id] = room; };
    db.rooms.addUser = async (roomId, user) => {
      const room = inMemoryFallback.rooms[roomId];
      if (!room) return null;
      room.users.push(user);
      return room;
    };
  });
}