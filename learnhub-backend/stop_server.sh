#!/bin/bash
# stop_server.sh
echo "Stopping any running FastAPI servers..."

# Port 8000'de çalışan işlemleri bul ve öldür
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null

echo "All FastAPI servers stopped."