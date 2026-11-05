---
name: earshot
description: Use whenever a video in this repo gets sound (a site's showreel or hero video, a promo reel or social clip for a client, a Remotion / HyperFrames / ffmpeg-made film) or whenever you must choose, place, sync or judge a sound you cannot hear. earshot (installed from github.com/Leonxlnx/earshot) renders sound effects from code, places each one on its picture frame by its measured onset / peak, and listens back so sync, level and "what it sounds like" are measured instead of guessed. Never say a sound fits or is in sync without an earshot reading behind it.
---

# earshot in this repo: sound that lands on the frame

You cannot hear. earshot is your ears: it measures where each sound starts and peaks, checks it against the picture,
and describes what it sounds like. Quote its numbers when you report ("cue 4 pop heard +3 ms, within a frame";
"-15.8 LUFS"). Taste stays with the user: give evidence, not opinions dressed as hearing.

## Setup (each new cloud session)
```bash
command -v earshot >/dev/null || bash .claude/earshot/install.sh     # ~5-10 min (pip downloads), models ~1.1 GB
EARSHOT_PY="$HOME/earshot/.venv/bin/python"                          # the Python that has earshot (for scripts)
```
Start the install in the background (`run_in_background`) as soon as you know a video will get sound, and write
the cue list while it runs.
`earshot measure`, `sfx`, `kit` need no models (seconds). `timeline`, `sheet`, `critique`, `describe`, `match`
load two models first (~20-40 s per CLI call): for many calls, write one Python script with `from earshot import api`.
Full upstream manual: `$HOME/earshot/skills/earshot/SKILL.md`, bank and kits: `$HOME/earshot/docs/SFX.md`.

## The sync workflow (do every step)
1. **Cue list from the picture, exact.** Every visible event that should make a sound, as a frame number with the
   film's fps, in `cues.json`:
   `{"fps": 30, "events": [{"f": 12, "role": "whoosh.short"}, {"f": 45, "role": "pop"}, {"t": 6.2, "role": "hit"}]}`
   - Animation made in code: take the frame numbers from the code (keyframes, `interpolate` ranges, scene starts),
     never estimate them by eye.
   - An existing video: get the hard cuts with
     `$EARSHOT_PY -c "from earshot import video; import json; print(json.dumps(video.cuts('in.mp4')))"`
     (on the coiffure showreel it found 12 cuts where ffmpeg's scene filter at 0.25 found 10), then add the in-shot
     moments (a text landing, a logo resolving) from a frame strip:
     `ffmpeg -i in.mp4 -vf "fps=10,scale=320:-1,tile=8x4" strip_%02d.png` and Read the PNGs.
   - Roles: `tick tock hit land land.light pop whoosh.short whoosh.long riser swell suck drop key key.space
     key.return click click.confirm snap bell text`. A whoosh syncs on its loudest moment (put the cue on the
     movement's apex / the cut), hits, pops, clicks on their onset, a riser or swell on its end / climax (the hit).
   - Restraint: one sound per meaningful event, not one per frame of motion. One big hit for the logo / reveal.
2. **A kit.** `earshot kit init --preset calm -o <work>/kit.json` (calm: text-led, elegant: salons, beauty;
   crisp: energetic product reels; minimal: few designed effects; launch: cut to music, levels set against the
   music bed). Browse `earshot sfx list --kind hit` (or `--category ui_pop`), audition one with
   `earshot sfx render ui_pop/soft -o /tmp/x.wav --pitch A4` and swap a role's `sound` in kit.json when needed.
   `earshot kit check <work>/kit.json --out <work>/kit` must show no warning on a take you use.
   **Whooshes: add `"offset_ms": 37` to `whoosh.short` / `whoosh.long`** in calm, crisp and minimal kits (launch
   already has it). Those presets put the whoosh's peak on the frame, so its attack is heard a frame early: measured
   on the showreel at 25 fps, -37 to -40 ms without it, -3 to -5 ms with it. 37 ms is the median the launch preset
   measured on professional films (whoosh peak just after the cut).
3. **Place, mix, mux, listen back in one command:**
   ```bash
   $EARSHOT_PY .claude/earshot/sync_mix.py --video in.mp4 --cues cues.json --kit <work>/kit.json \
       [--music music.wav --music-db -4] --target-lufs -16 -o out.mp4 --check
   ```
   It places each take so its measured sync point lands on its frame (plus the role's `offset_ms` in the launch
   preset), levels it (`bed_db` over the music, else `level_db`), spaces runs (`min_gap_ms`), steps the music down
   before big hits, keeps the true peak at -1 dBTP (a look-ahead limiter for up to 6 dB), muxes AAC 192k, then
   runs `earshot timeline` on the muxed file and prints, per cue, where the attack was heard against where the
   take's measured onset says it should be, flagging anything a frame or more off (`<-- check`). About 20 s for a
   25 s film once the models are cached; the kit renders in ~13 s the first time, then from cache.
4. **Look at it.** `earshot sheet out.mp4 -o sheet.png --cues cues.json` and Read the PNG: cue markers are green
   (within a frame), amber (within 100 ms) or red (no sound). Optional scorecard against professional launch films:
   `earshot critique out.mp4 --fast`.
5. **Fix and repeat** until every cue is within a frame: a red cue = no audible sound there (raise its `gain_db`
   in the cue or the role's `level_db`, or the sound is masked by the music); a constant offset = a wrong cue frame
   (fix the frame, not the sound); a pile-up = two sounds too close (drop one). Change one thing at a time.
6. **Report** the numbers from the check (cues within a frame, median offset, LUFS, true peak), what you changed,
   and what was not checked.

## Repo rules
- Everything committed here is published by GitHub Pages: commit only the final video (and its small `cues.json` /
  `kit.json` if useful), never the kit's WAV takes or scratch renders (they re-render byte for byte from kit.json).
  Work in the scratchpad.
- Hero / background videos on these sites play `autoplay muted loop`: browsers only autoplay muted video, so their
  sound is heard only if the visitor unmutes. Sound matters most for videos with controls and for social / ad
  reels made for the client. Do not remove `muted` from an autoplay video.
- The bank's sounds are made in code (synthesis), not recordings. If the user wants real recorded sound, say so and
  source licensed recordings instead (upstream skill `$HOME/earshot/skills/real-sound`).
- earshot measures, it does not judge taste, cannot understand speech, and hears 50 Hz-14 kHz with its models. Say
  these limits when they matter. Its tags are hints: on an effects-only test track the timeline named the sections
  "funk music?" and "ukulele music?". Trust the timings and meters, not those labels.
