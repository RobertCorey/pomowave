#!/bin/bash

# Script to start Redis for PomoWave development

echo "Checking Redis status..."
if brew services info redis | grep -q "started"; then
  echo "✅ Redis is already running"
else
  echo "Starting Redis..."
  brew services start redis
  
  # Wait for Redis to start and verify connection
  max_attempts=10
  attempt=1
  success=false
  
  while [ $attempt -le $max_attempts ] && [ "$success" = false ]; do
    if brew services info redis | grep -q "started"; then
      # Try to connect to Redis to verify it's ready
      if redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis successfully started and ready"
        success=true
      else
        echo "Waiting for Redis to accept connections... (attempt $attempt/$max_attempts)"
        sleep 1
      fi
    else
      echo "Waiting for Redis service to start... (attempt $attempt/$max_attempts)"
      sleep 1
    fi
    attempt=$((attempt+1))
  done
  
  if [ "$success" = false ]; then
    echo "❌ Failed to start Redis. Please check the logs with 'brew services log redis'"
  fi
fi

echo
echo "You can connect to Redis using:"
echo "redis-cli"
echo
echo "To stop Redis when you're done:"
echo "brew services stop redis"
echo "or use ./stop-redis.sh"