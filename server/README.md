# Pomowave Server

Backend service for the Pomowave application.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm run start

# Run tests
npm test
```

## Database

The application requires Redis for data persistence. Both local development and production deployments need Redis to be running.

### Redis Configuration

Configure the Redis connection using environment variables:

1. Copy the example environment file to create your local configuration:

```bash
cp .env.example .env
```

2. The default configuration is ready for local development:

```
# .env file
REDIS_URL=redis://localhost:6379
```

For Render deployment, the Redis URL is configured through the Render Dashboard environment variables.

### Local Redis Setup

For local development, Redis must be installed and running:

1. Install Redis locally using Homebrew (macOS):

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis
```

Alternatively, use a Docker container:

```bash
# Using Docker
docker run --name redis -p 6379:6379 -d redis
```

2. The default local Redis URL is preconfigured, but you can override it in your `.env` file if needed:

```
REDIS_URL=redis://localhost:6379
```

See the `/redis/README.md` file for more detailed Redis setup instructions.

## API Endpoints

### Coin Flipping
- `GET /api/coin-face` - Get current coin face
- `POST /api/flip` - Flip the coin (returns new face)

### Room Management
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomId` - Get a room by ID
- `POST /api/rooms/:roomId/join` - Join an existing room

### Health Check
- `GET /healthz` - Health check endpoint for Render

## Deployment

The server is deployed on Render with the following settings:

- Web Service: `backend`
- Root Directory: `server`
- Build Command: `npm run build:render`
- Start Command: `npm run start`
- Health Check Path: `/healthz`