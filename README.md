# Pomowave

A collaborative Pomodoro timer app with an ocean theme. Work together with friends on focused 25-minute productivity sessions called "waves."

## Live Deployment

- **Frontend:** https://pomowave-919t.onrender.com
- **Backend:** https://pomowave.onrender.com

Pushing to the main branch triggers automatic redeployment on Render.

## Features

- **Collaborative Rooms** - Create rooms and invite others via shareable codes (e.g., `cat-red-forest`)
- **Pomodoro Waves** - 25-minute focused work sessions with a 60-second join window
- **Real-time Updates** - See who's in your room and track completed pomos
- **Notifications** - Browser and audio notifications with ocean-themed sounds
- **Ocean Theme** - Beach-themed UI with animated waves and 16 ocean animal avatars

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- React Router 7
- TanStack React Query 5
- Vite 6

**Backend:**
- Express 4 + TypeScript
- Redis for data persistence
- LowDB for local fallback

## Getting Started

### Prerequisites

- Node.js
- Redis (optional for local development)

### Installation

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd server && npm install
```

### Development

Run the server and client in separate terminals:

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

Dev logs are available at:
- Server: `server/server-dev.log`
- Client: `client/client-dev.log`

## Commands

| Command | Description |
|---------|-------------|
| `cd client && npm run dev` | Start client dev server |
| `cd client && npm run build` | Build client for production |
| `cd client && npm run lint` | Lint client code |
| `cd client && npx playwright test` | Run client e2e tests |
| `cd server && npm run dev` | Start server dev server |
| `cd server && npm run build` | Build server for production |
| `cd server && npm run lint` | Lint server code |
| `cd server && npm test` | Run server tests |

## License

MIT
