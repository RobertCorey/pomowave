import Redis from 'ioredis';
import { Room, User } from './types';

// Initialize Redis client
// This will use the REDIS_URL environment variable
const redisClient = new Redis(process.env.REDIS_URL);

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
      // Redis is required in both development and production
      throw new Error(`Redis connection failed: ${error.message}. Redis is required to run the application.`);
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