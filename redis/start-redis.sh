#!/bin/bash

# Script to start Redis for PomoWave development

echo "Starting Redis..."
brew services start redis
echo "✅ Redis service started"

echo
echo "You can connect to Redis using:"
echo "redis-cli"
echo
echo "To stop Redis when you're done:"
echo "brew services stop redis"
echo "or use ./stop-redis.sh"