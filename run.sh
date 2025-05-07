#!/bin/bash
# Helper shell script to run builds
set -euo pipefail

MODE=${1:-prod}
BRANCH=${2:-rc-v1}
LATEST_RELEASE="v1"

echo "🚀 Starting subspace-api in '$MODE' mode (branch: $BRANCH)..."
echo "🧹 Ensuring all subspace-api containers are stopped..."
docker compose down || true
docker compose -f docker-compose.dev.yml down || true


case "$MODE" in
  prod)
    echo "📦 Pulling latest image from GitHub Container Registry..."
    docker compose pull && docker compose up -d
    ;;

  rc|dev)
    echo "🔀 Switching to branch '$BRANCH'..."
    git fetch origin "$BRANCH"
    git checkout "$BRANCH"
    git pull origin "$BRANCH"

    echo "🔧 Building $BRANCH build locally..."
    docker compose -f docker-compose.dev.yml build
    docker compose -f docker-compose.dev.yml up -d
    ;;

  *)
    echo "Unknown mode: $MODE"
    echo "Usage: $0 [dev|rc|prod] [branch (optional)]"
    echo "Note: dev and rc flags currently do the same thing!"
    exit 1
    ;;
esac

echo "✅ Done! Mode: $MODE | Branch: $BRANCH"
