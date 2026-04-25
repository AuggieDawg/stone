#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./scripts/copy-pumpjack-video.sh /path/to/your/video.mp4"
  echo "Example: ./scripts/copy-pumpjack-video.sh ~/repos/silverpines-product/public/videos/my-pumpjack-video.mp4"
  exit 1
fi

SOURCE="$1"
DEST="public/videos/pump-jacks.mp4"

if [ ! -f "$SOURCE" ]; then
  echo "Video not found: $SOURCE"
  exit 1
fi

mkdir -p public/videos
cp "$SOURCE" "$DEST"
echo "Copied video to $DEST"
