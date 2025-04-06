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

The application uses Redis for data persistence. In development mode, if Redis is not available, an in-memory fallback will be used automatically.

### Redis Configuration

Configure the Redis connection using environment variables:

```
# .env file
REDIS_URL=redis://red-xxxxxxxxxxxxxxxxxxxx:6379
```

For Render deployment, the Redis URL is automatically configured through the Render Dashboard.

### Local Redis Setup

For local development with Redis:

1. Install Redis locally or use a Docker container:

```bash
# Using Docker
docker run --name redis -p 6379:6379 -d redis
```

2. Update the `.env` file with your local Redis URL:

```
REDIS_URL=redis://localhost:6379
```

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