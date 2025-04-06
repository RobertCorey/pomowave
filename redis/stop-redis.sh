#!/bin/bash

# Script to stop Redis for PomoWave development

echo "Stopping Redis..."
brew services stop redis
echo "✅ Redis service stopped"