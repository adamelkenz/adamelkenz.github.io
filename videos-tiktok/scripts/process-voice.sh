#!/usr/bin/env bash
# Turns the ElevenLabs mp3 clips into the wav files the timeline and video use:
# optional speed-up and pitch shift (tempo, pitch in src/<video>/voice.json), a bit of warmth and presence.
# Usage: scripts/process-voice.sh statuts
set -euo pipefail
video="$1"
tempo=$(node -e "console.log(require('./src/$video/voice.json').tempo ?? 1)")
# Optional "pitch" in semitones (negative = deeper), applied with Rubber Band at the same time as the tempo.
pitch=$(node -e "console.log(Math.pow(2, (require('./src/$video/voice.json').pitch ?? 0) / 12))")
for mp3 in public/$video/voice/line-*.mp3; do
  ffmpeg -nostdin -loglevel error -y -i "$mp3" \
    -af "rubberband=tempo=$tempo:pitch=$pitch:pitchq=quality:transients=smooth,bass=g=3:f=120,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,aresample=44100" \
    "${mp3%.mp3}.wav"
done
