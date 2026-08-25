#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f "frontend/dist/index.html" ]; then
    echo "Building frontend..."
    npm run build
fi

echo "Starting isitdone server..."
npm run start
