#!/usr/bin/env bash
# Turns the ElevenLabs mp3 clips into the wav files the timeline and video use:
# optional speed-up (tempo in src/<video>/voice.json), a bit of warmth and presence.
# Usage: scripts/process-voice.sh statuts
set -euo pipefail
video="$1"
tempo=$(node -e "console.log(require('./src/$video/voice.json').tempo ?? 1)")
for mp3 in public/$video/voice/line-*.mp3; do
  ffmpeg -nostdin -loglevel error -y -i "$mp3" \
    -af "atempo=$tempo,bass=g=3:f=120,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,aresample=44100" \
    "${mp3%.mp3}.wav"
done
