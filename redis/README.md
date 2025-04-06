# Redis Setup for Local Development

This guide will help you set up Redis locally on macOS for development purposes.

## Installation

The easiest way to install Redis on macOS is using Homebrew:

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Redis
brew install redis
```

## Starting and Stopping Redis

After installation, you can start Redis as a service that runs in the background:

```bash
# Start Redis service
brew services start redis

# Check if Redis is running
brew services info redis

# Stop Redis service when you're done
brew services stop redis
```

Alternatively, you can run Redis temporarily in a terminal:

```bash
# Run Redis server in the foreground
redis-server
```

## Redis CLI

Redis comes with a command-line interface (CLI) for interacting with the database:

```bash
# Connect to Redis server
redis-cli

# Once connected, you can run commands like:
> PING                  # Should return PONG if connected
> SET test "Hello"      # Set a key
> GET test              # Get a key's value
> KEYS *                # List all keys (be careful in production)
> DEL test              # Delete a key
> FLUSHALL              # Clear all keys (CAUTION: destructive operation)
> exit                  # Exit the CLI
```

## Project-specific Redis Commands

For the PomoWave application, you can use these commands to inspect data:

```bash
# Connect to Redis
redis-cli

# List all keys in our application namespace
> KEYS pomowave:*

# Get coin face
> GET pomowave:coinFace

# Get room data (replace ROOM_ID with actual room ID)
> GET pomowave:room:ROOM_ID
```

## Troubleshooting

If you're having issues connecting to Redis:

1. Check if Redis is running: `brew services info redis`
2. Try restarting Redis: `brew services restart redis`
3. Check Redis logs: `brew services log redis`
4. Check Redis configuration: `cat $(brew --prefix)/etc/redis.conf`

## Redis GUI Tools (optional)

If you prefer a graphical interface, these tools are available:

- [RedisInsight](https://redis.com/redis-enterprise/redis-insight/) - Official Redis GUI
- [Medis](https://github.com/luin/medis) - GUI for macOS
- [TablePlus](https://tableplus.com/) - Database manager that supports Redis

## Useful Scripts

The scripts in this directory can help you manage Redis for development:

- `start-redis.sh` - Starts Redis server
- `stop-redis.sh` - Stops Redis server
- `reset-data.sh` - Clears all PomoWave data from Redis
- `print-db.sh` - Prints all PomoWave data in Redis (useful for debugging)