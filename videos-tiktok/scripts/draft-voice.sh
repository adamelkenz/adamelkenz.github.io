#!/usr/bin/env bash
# Free placeholder voice (Piper TTS) used to lay out the edit before the final voice-over.
# Usage: PIPER=/path/to/piper MODEL=/path/to/fr_FR-tom-medium.onnx scripts/draft-voice.sh halloween
set -euo pipefail
video="$1"
out="public/$video/voice"
mkdir -p "$out"
i=0
node -e "for (const l of require('./src/$video/lines.json')) console.log(l)" | while IFS= read -r line; do
  n=$(printf '%02d' "$i")
  echo "$line" | "$PIPER" -m "$MODEL" --length_scale 1.0 --sentence_silence 0.15 -f "$out/raw-$n.wav" 2>/dev/null
  sr=$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of csv=p=0 "$out/raw-$n.wav")
  # Slightly deeper and warmer, with a touch of room.
  ffmpeg -nostdin -loglevel error -y -i "$out/raw-$n.wav" \
    -af "asetrate=$sr*0.9,aresample=44100,atempo=1.111,bass=g=5:f=110,aecho=0.8:0.5:45|80:0.12|0.08,loudnorm=I=-16:TP=-1.5,aresample=44100" \
    "$out/line-$n.wav"
  rm "$out/raw-$n.wav"
  i=$((i + 1))
done
