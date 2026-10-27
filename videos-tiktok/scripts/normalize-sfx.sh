#!/usr/bin/env bash
# Brings every sound effect to the same perceived level so mix volumes in the scenes mean
# the same thing for every file: RMS around -22 dB, peaks never above -4 dBFS.
# Usage: scripts/normalize-sfx.sh public/sfx-real public/sfx-norm
set -euo pipefail
src="$1"; dst="$2"
mkdir -p "$dst"
for f in "$src"/*.mp3; do
  name=$(basename "$f" .mp3)
  [[ "$name" == music-* ]] && continue
  stats=$(ffmpeg -nostdin -i "$f" -af volumedetect -f null - 2>&1)
  mean=$(echo "$stats" | sed -n 's/.*mean_volume: \(-*[0-9.]*\) dB/\1/p')
  peak=$(echo "$stats" | sed -n 's/.*max_volume: \(-*[0-9.]*\) dB/\1/p')
  gain=$(python3 -c "print(round(min(-22 - $mean, -4 - $peak), 2))")
  ffmpeg -nostdin -loglevel error -y -i "$f" -af "volume=${gain}dB,aresample=44100" -ac 2 "$dst/$name.wav"
  echo "$name mean=$mean peak=$peak gain=${gain}dB"
done
