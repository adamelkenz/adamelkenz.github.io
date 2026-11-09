#!/usr/bin/env bash
# Prepares Lemo-Opuscar (https://github.com/lemomo-ai/lemo-opuscar, MIT) for cloud sessions: the style library in
# ~/lemo-opuscar, its package tiers (core, voice, music), the Whisper model its voice check uses, and an ffmpeg 7+.
# The skill itself is vendored in .claude/skills/lemo-opuscar/ (upstream commit in UPSTREAM).
#
# Idempotent: re-running skips what is already there. Usable as the cloud environment's setup script line:
#   bash adamelkenz.github.io/.claude/lemo-opuscar/install.sh
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SETUP="$HERE/../skills/lemo-opuscar/scripts/setup.sh"
log() { printf '[lemo-opuscar-install] %s\n' "$*"; }

# ffmpeg 7+: Ubuntu 24.04 ships 6.1, whose loudnorm under-reports audio length (the library's mux.sh then rejects the
# file). The PyPI wheel imageio-ffmpeg carries a static, recent ffmpeg (x264, libass subtitles, drawtext, loudnorm).
# The system ffprobe 6.1 stays: the pipeline only asks it for durations and stream types.
ffv=$(ffmpeg -version 2>/dev/null | sed -n '1s/^ffmpeg version n\{0,1\}\([0-9][0-9]*\)\..*/\1/p')
if [ -z "$ffv" ] || [ "$ffv" -lt 7 ]; then
  log "ffmpeg ${ffv:-missing}: installing a static ffmpeg 7+ from PyPI (imageio-ffmpeg)"
  tmp=$(mktemp -d)
  if python3 -m pip download --quiet --disable-pip-version-check --no-deps --only-binary=:all: -d "$tmp" "imageio-ffmpeg>=0.6" \
     && python3 -m zipfile -e "$tmp"/imageio_ffmpeg-*.whl "$tmp/x" \
     && install -m 0755 "$tmp"/x/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-* /usr/local/bin/ffmpeg; then
    log "ffmpeg: $(/usr/local/bin/ffmpeg -version | head -1 | cut -d' ' -f1-3) -> /usr/local/bin/ffmpeg"
  else
    log "could not install ffmpeg 7+; films still render, but the library's mux.sh needs it for the final loudness pass"
  fi
  rm -rf "$tmp"
fi

# Hugging Face downloads (Whisper) over plain HTTPS: the Xet transfer host is not on the environment's allowlist.
export HF_HUB_DISABLE_XET=1

log "library and packages (core, voice, music; first run ~5-10 min)"
sh "$SETUP" >/dev/null || { log "could not fetch the library"; exit 0; }
sh "$SETUP" deps voice music 2>&1 | tail -3

# The voice check (core/tts/asr_check.py --lang fr) loads Whisper 'small' for any language but English; fetch it now
# so the first film needs no download. French voice: Kokoro's only French voice, ff_siwis, with "lang": "fr-fr".
PY="$HOME/lemo-opuscar/.venv/bin/python"
if [ -x "$PY" ]; then
  "$PY" -c "from faster_whisper import download_model; download_model('small')" >/dev/null 2>&1 \
    && log "whisper small model cached" || log "whisper model not fetched (it downloads on first use)"
fi
log "ready: LIB=$HOME/lemo-opuscar"
