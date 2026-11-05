#!/usr/bin/env bash
# Installs earshot (https://github.com/Leonxlnx/earshot, MIT) so Claude can "listen" to the
# audio it puts in videos: measure sync to picture, loudness, what each sound reads as.
#
# Idempotent: re-running skips what is already there. Usable as the cloud environment's
# setup script line:   bash adamelkenz.github.io/.claude/earshot/install.sh
#
# Env:
#   EARSHOT_DIR          where earshot is cloned (default: $HOME/earshot)
#   EARSHOT_REF          git tag / commit to install (default: v0.4.0)
#   EARSHOT_SKIP_MODELS  1 = do not pre-download the two listening models (~1.1 GB);
#                        they then download on first use instead.
set -euo pipefail

EARSHOT_DIR="${EARSHOT_DIR:-$HOME/earshot}"
EARSHOT_REF="${EARSHOT_REF:-v0.4.0}"
PY="$EARSHOT_DIR/.venv/bin/python"

log() { printf '[earshot-install] %s\n' "$*"; }

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  log "ffmpeg/ffprobe missing, installing"
  (apt-get update -qq && apt-get install -y -qq ffmpeg) >/dev/null
fi

if [ ! -d "$EARSHOT_DIR/.git" ]; then
  log "cloning earshot $EARSHOT_REF into $EARSHOT_DIR"
  git clone --quiet --depth 1 --branch "$EARSHOT_REF" https://github.com/Leonxlnx/earshot.git "$EARSHOT_DIR"
fi

if [ ! -x "$PY" ]; then
  log "creating venv"
  python3 -m venv "$EARSHOT_DIR/.venv"
fi

if ! "$PY" -c "import earshot, torch" >/dev/null 2>&1; then
  log "installing torch (CPU) and earshot"
  "$PY" -m pip install --quiet --upgrade pip
  "$PY" -m pip install --quiet torch --index-url https://download.pytorch.org/whl/cpu
  "$PY" -m pip install --quiet -e "$EARSHOT_DIR[mcp]"
fi

# `earshot` on PATH
BIN_DIR=/usr/local/bin
[ -w "$BIN_DIR" ] || { BIN_DIR="$HOME/.local/bin"; mkdir -p "$BIN_DIR"; }
cat > "$BIN_DIR/earshot" <<EOF
#!/usr/bin/env bash
exec "$PY" -m earshot "\$@"
EOF
chmod +x "$BIN_DIR/earshot"

if [ "${EARSHOT_SKIP_MODELS:-0}" != "1" ]; then
  log "fetching the listening models (pinned revisions, ~1.1 GB, skipped if cached)"
  # Plain HTTPS downloads (huggingface.co -> us.aws.cdn.hf.co): the Xet protocol's cas-server.xethub.hf.co is
  # not on the cloud environment's allowlist and hangs on retries instead of falling back.
  HF_HUB_DISABLE_XET=1 "$PY" -m earshot doctor --fetch >/dev/null
fi

log "ready: $("$PY" -c 'import earshot; print(earshot.__version__)' 2>/dev/null || echo installed) -> $BIN_DIR/earshot"
