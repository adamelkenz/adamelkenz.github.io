#!/usr/bin/env bash
# Downloads a Pixabay video and turns it into a light 1080x1920 clip (center crop, no audio).
# Needs PIXABAY_API_KEY. Usage: scripts/prep-stock.sh <video> <name> <pixabayId> [start] [duration]
set -euo pipefail
video="$1"; name="$2"; id="$3"; start="${4:-0}"; dur="${5:-8}"
raw="${RAW_DIR:-/tmp}/pixabay-$id.mp4"
if [ ! -s "$raw" ]; then
  url=$(curl -s "https://pixabay.com/api/videos/?key=$PIXABAY_API_KEY&id=$id" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const v=JSON.parse(s).hits[0].videos;console.log((v.large.url||v.medium.url))})")
  curl -s -o "$raw" "$url"
fi
mkdir -p "public/$video/stock"
ffmpeg -nostdin -loglevel error -y -ss "$start" -t "$dur" -i "$raw" -an \
  -vf "scale=-2:1920:flags=lanczos,crop=1080:1920,fps=30,format=yuv420p" \
  -c:v libx264 -crf 22 -preset medium "public/$video/stock/$name.mp4"
echo "public/$video/stock/$name.mp4 <- Pixabay #$id"
