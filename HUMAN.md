# Developer Setup

## Running the Application

### Redis Setup (Required)

1. **Install Redis** (one-time setup):
   ```
   # Install using Homebrew
   brew install redis
   ```

2. **Start Redis** before running the server:
   ```
   # Start Redis
   brew services start redis
   
   # Check Redis status
   brew services info redis
   ```

   Alternatively, you can use helper scripts:
   ```
   # Start Redis
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

The application requires Redis for data persistence. Redis must be running for both local development and production environments.

- **Start Redis**: `brew services start redis` or use `./redis/start-redis.sh`
- **Stop Redis**: `brew services stop redis` or use `./redis/stop-redis.sh`
- **Reset Data**: Use `./redis/reset-data.sh` to clear all application data in Redis
- **Redis CLI**: Use `redis-cli` to interact with Redis directly

See the [Redis README](/redis/README.md) for more detailed instructions on working with Redis.

## Development Best Practices

- **Always verify local development works before production**: Make sure all features work correctly in the local development environment before creating PRs or deploying to production. This includes running tests and manual verification.

- **Database changes**: When making database-related changes, ensure you test thoroughly with Redis in both development and production environments.

- **Clean up log messages**: Reduce noisy logs in development mode where appropriate.