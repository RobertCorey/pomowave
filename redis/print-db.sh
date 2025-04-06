#!/bin/bash

# Script to print the PomoWave database contents in Redis

echo "PomoWave Database Contents:"
echo "=========================="
echo

# Get all PomoWave keys
keys=$(redis-cli KEYS "pomowave:*")

if [ -z "$keys" ]; then
  echo "No PomoWave data found in Redis"
  exit 0
fi

# For each key, print its type, name and value
for key in $keys; do
  type=$(redis-cli TYPE "$key")
  echo "[$type] $key:"
  
  case $type in
    string)
      redis-cli GET "$key" | jq . 2>/dev/null || redis-cli GET "$key"
      ;;
    hash)
      redis-cli HGETALL "$key"
      ;;
    list)
      redis-cli LRANGE "$key" 0 -1
      ;;
    set)
      redis-cli SMEMBERS "$key"
      ;;
    zset)
      redis-cli ZRANGE "$key" 0 -1 WITHSCORES
      ;;
    *)
      echo "Unknown type: $type"
      ;;
  esac
  
  echo "------------------------"
done

echo
echo "Total PomoWave keys: $(echo "$keys" | wc -w)"