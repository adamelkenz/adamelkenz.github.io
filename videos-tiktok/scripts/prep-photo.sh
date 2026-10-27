#!/usr/bin/env bash
# Downloads a Pixabay photo and crops it to a vertical 1242x2208 JPEG (a bit larger than
# 1080x1920 so it can be slowly zoomed and panned). Needs PIXABAY_API_KEY.
# Usage: scripts/prep-photo.sh <video> <name> <pixabayId> [focusX 0..1, default 0.5]
set -euo pipefail
video="$1"; name="$2"; id="$3"; focus="${4:-0.5}"
raw="${RAW_DIR:-/tmp}/pixabay-photo-$id.jpg"
is_image() { [ -s "$1" ] && file -b --mime-type "$1" | grep -q '^image/'; }
# Pixabay rate-limits image downloads: retry with a growing pause.
for attempt in 1 2 3 4 5; do
  is_image "$raw" && break
  url=$(curl -s "https://pixabay.com/api/?key=$PIXABAY_API_KEY&id=$id" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).hits[0].largeImageURL))")
  curl -s -o "$raw" "$url"
  is_image "$raw" || sleep $((attempt * 15))
done
is_image "$raw" || { echo "download failed for Pixabay photo #$id" >&2; exit 1; }
mkdir -p "public/$video/photos"
ffmpeg -nostdin -loglevel error -y -i "$raw" \
  -vf "scale=1242:2208:force_original_aspect_ratio=increase:flags=lanczos,crop=1242:2208:(iw-1242)*$focus:(ih-2208)/2,unsharp=5:5:0.6" \
  -q:v 3 "public/$video/photos/$name.jpg"
echo "public/$video/photos/$name.jpg <- Pixabay photo #$id"
