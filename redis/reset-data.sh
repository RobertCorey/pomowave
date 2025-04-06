#!/bin/bash

# Script to reset PomoWave data in Redis
# This will delete all keys in the pomowave namespace

echo "⚠️  This will delete all PomoWave data in Redis."
echo "Are you sure you want to continue? (y/n)"
read confirmation

if [ "$confirmation" != "y" ]; then
  echo "Operation cancelled."
  exit 0
fi

echo "Connecting to Redis and deleting PomoWave data..."
redis-cli KEYS "pomowave:*" | xargs -r redis-cli DEL

echo "✅ PomoWave data has been reset"
echo "Current PomoWave keys in Redis:"
redis-cli KEYS "pomowave:*"