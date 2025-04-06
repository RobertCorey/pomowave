# Developer Setup

## Running the Application

### Redis Setup (Required for full functionality)

1. **Install Redis** (one-time setup):
   ```
   # Install using Homebrew
   brew install redis
   
   # Or use the setup script
   cd redis
   ./start-redis.sh
   ```

2. **Start Redis** before running the server:
   ```
   # Check if Redis is running
   brew services info redis
   
   # Start Redis if needed
   brew services start redis
   
   # Or use the script
   cd redis
   ./start-redis.sh
   ```

### Starting the Application

1. **Server**: Open a terminal and run:
   ```
   cd server
   npm run dev
   ```
   This will start the server on port 3000.

2. **Client**: Open a second terminal and run:
   ```
   cd client
   npm run dev
   ```
   This will start the client development server.

Please keep both terminals open while developing. The terminals will show real-time logs of the application which are helpful for debugging.

## Redis Management

The application uses Redis for data persistence. While there is a fallback to in-memory storage for development, using Redis locally provides a more production-like environment.

- **Start Redis**: `brew services start redis` or use `./redis/start-redis.sh`
- **Stop Redis**: `brew services stop redis` or use `./redis/stop-redis.sh`
- **Reset Data**: Use `./redis/reset-data.sh` to clear all application data in Redis
- **Redis CLI**: Use `redis-cli` to interact with Redis directly

See the [Redis README](/redis/README.md) for more detailed instructions on working with Redis.

## Development Best Practices

- **Always verify local development works before production**: Make sure all features work correctly in the local development environment before creating PRs or deploying to production. This includes running tests and manual verification.

- **Database changes**: When making database-related changes, ensure the application works both with and without the external database service (Redis), as the fallback mechanism should support local development.

- **Clean up log messages**: Reduce noisy logs in development mode, especially for expected conditions like Redis connection failures in local environment.