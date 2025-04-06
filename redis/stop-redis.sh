#!/bin/bash

# Script to stop Redis for PomoWave development

echo "Stopping Redis..."
brew services stop redis

# Verify Redis has stopped
if brew services info redis | grep -q "stopped"; then
  echo "✅ Redis successfully stopped"
else
  echo "❌ Failed to stop Redis. You may need to stop it manually with 'brew services stop redis'"
fi