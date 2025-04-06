#!/bin/bash

# Script to reset PomoWave data in Redis

echo "Resetting PomoWave data in Redis..."
redis-cli EVAL "local keys = redis.call('keys', 'pomowave:*'); for i=1,#keys,5000 do redis.call('del', unpack(keys, i, math.min(i+4999, #keys))); end; return #keys" 0
echo "✅ PomoWave data has been reset"

echo
echo "You can verify with:"
echo "redis-cli KEYS pomowave:*"