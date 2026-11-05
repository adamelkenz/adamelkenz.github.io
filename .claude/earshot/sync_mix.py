"""Place earshot kit sounds on a video's cue frames, mix, mux, and (optionally) listen back to check sync.

    earshot-python .claude/earshot/sync_mix.py --video film.mp4 --cues cues.json \
        --kit audio/kit.json [--kit-out audio/kit] [--music music.wav] [--music-db -6] \
        [--target-lufs -16] -o film_sound.mp4 [--wav soundtrack.wav] [--check]

cues.json (the same file `earshot timeline --cues` reads):
    {"fps": 30, "events": [
        {"f": 45,  "role": "whoosh.short"},              # frame number (needs fps) ...
        {"t": 2.5, "role": "pop", "gain_db": -3},        # ... or seconds; gain_db = extra trim on top of the kit
        {"t": 4.0, "role": "bell", "pitch": "E5"}]}       # bell: pick the take of that pitch
  role = a kit role (tick, hit, land, pop, whoosh.short, whoosh.long, riser, swell, key, click, snap, bell, text, ...)

Each take is placed by the sync point earshot measured on it (kit.lock.json): its onset on the frame for hits,
pops, clicks; a whoosh's loudest 5 ms on the frame; a riser's end / climax on the hit; shifted by the role's
offset_ms when the kit has one (launch preset). Level: the role's bed_db over the music under the cue when the kit
and a music bed allow it, otherwise level_db. Runs of one role are spaced by min_gap_ms. With the kit's
mix.stop_down the music steps down before the listed roles and comes back on the hit.

--check then runs `earshot timeline` on the result with the same cues and prints, per cue, where a sound was heard
(offset_ms = sound minus picture; within one frame is the goal).
"""
import argparse
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

from earshot import audio
from earshot.forge import kit as K

SR = K.SR


def read_cues(path):
    d = json.load(open(path, encoding='utf-8'))
    fps = None
    if isinstance(d, dict):
        fps = d.get('fps')
        d = d.get('events') or d.get('cues') or []
    out = []
    for i, c in enumerate(d):
        if isinstance(c, (int, float)):
            sys.exit(f'sync_mix: cue {i} has no role (use objects: {{"t": 1.2, "role": "pop"}})')
        role = c.get('role') or c.get('kind')
        if 't' in c or 'time' in c:
            t = float(c.get('t', c.get('time')))
        elif 'f' in c or 'frame' in c:
            if not fps:
                sys.exit('sync_mix: cues use frame numbers but the file has no "fps"')
            t = float(c.get('f', c.get('frame'))) / float(fps)
        else:
            sys.exit(f'sync_mix: cue {i} has neither t nor f')
        out.append({**c, 't': t, 'role': role, 'i': i})
    return out, fps


def probe_duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
                       capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def stereo(y):
    y = np.asarray(y, np.float64)
    if y.ndim == 1:
        return np.stack([y, y], 1)
    return y[:, :2] if y.shape[1] >= 2 else np.repeat(y, 2, 1)


def add_at(buf, y, start_s, gain_db):
    y = stereo(y) * 10 ** (gain_db / 20)
    s = int(round(start_s * SR))
    if s < 0:
        y, s = y[-s:], 0
    e = min(len(buf), s + len(y))
    if e > s:
        buf[s:e] += y[:e - s]


def pick_take(role_lock, cue, n_used):
    takes = role_lock['takes']
    want = cue.get('pitch')
    if want is not None:
        from earshot.forge import knobs
        lab = knobs.label(want)
        same = [t for t in takes if t.get('pitch') is not None and knobs.label(t['pitch']) == lab]
        if not same:
            sys.exit(f"sync_mix: cue {cue['i']}: no {cue['role']} take at pitch {want} "
                     f"(kit has {sorted({str(t.get('pitch')) for t in takes})})")
        takes = same
    return takes[n_used % len(takes)]


def stop_down_env(n, cues, lock):
    """the music's gain curve: a step down before each hit-like cue the kit's mix.stop_down names, back on the hit"""
    env = np.ones(n)
    sd = (lock.get('mix') or {}).get('stop_down')
    if not sd:
        return env
    roles = set(sd.get('before') or [])
    depth = float(np.mean(sd.get('depth_db') or [8, 8]))
    length = float(np.mean(sd.get('length_s') or [0.4, 0.4]))
    g = 10 ** (-depth / 20)
    for c in cues:
        if c['role'] not in roles:
            continue
        a, b = int((c['t'] - length) * SR), int(c['t'] * SR)
        a = max(0, a)
        if b <= a:
            continue
        ramp = min(int(0.05 * SR), b - a)
        seg = np.full(b - a, g)
        seg[:ramp] = np.linspace(1, g, ramp)
        env[a:b] = np.minimum(env[a:b], seg)
        up = min(int(0.03 * SR), n - b)
        if up > 0:
            env[b:b + up] = np.minimum(env[b:b + up], np.linspace(g, 1, up))
    return env


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    p.add_argument('--video', help='the picture (mp4); its length sets the soundtrack length')
    p.add_argument('--cues', required=True)
    p.add_argument('--kit', required=True, help='kit.json (earshot kit init --preset calm|crisp|minimal|launch)')
    p.add_argument('--kit-out', help='where the takes go (default: <kit dir>/kit)')
    p.add_argument('--music', help='an optional music bed')
    p.add_argument('--music-db', type=float, default=0.0, help='gain on the music bed (dB)')
    p.add_argument('--duration', type=float, help='soundtrack length in s (default: the video, else last sound)')
    p.add_argument('--target-lufs', type=float, help='normalise the final mix to this integrated loudness')
    p.add_argument('-o', '--out', help='output video with the soundtrack muxed in')
    p.add_argument('--wav', help='also write the soundtrack WAV here (default: next to -o)')
    p.add_argument('--check', action='store_true', help='listen back with earshot timeline (loads the models)')
    a = p.parse_args(argv)

    kit_out = a.kit_out or os.path.join(os.path.dirname(os.path.abspath(a.kit)), 'kit')
    lock = K.render(a.kit, kit_out)
    print(lock['summary'])
    cues, fps = read_cues(a.cues)

    # runs of one role keep the role's min_gap_ms
    by_role = {}
    for c in cues:
        by_role.setdefault(c['role'], []).append(c)
    for role, cs in by_role.items():
        rl = lock['roles'].get(role)
        if rl and rl.get('min_gap_ms'):
            cs.sort(key=lambda c: c['t'])
            for c, t in zip(cs, K.space_run([c['t'] for c in cs], rl['min_gap_ms'])):
                if abs(t - c['t']) > 1e-6:
                    print(f"  cue {c['i']} {role} moved {1000 * (t - c['t']):+.0f} ms (min gap {rl['min_gap_ms']:g} ms)")
                c['t'] = t

    music = None
    if a.music:
        music = stereo(audio.load(a.music)) * 10 ** (a.music_db / 20)

    dur = a.duration or (probe_duration(a.video) if a.video else None)
    plan, used = [], {}
    for c in sorted(cues, key=lambda c: c['t']):
        rl = lock['roles'].get(c['role'], 'missing')
        if rl == 'missing':
            sys.exit(f"sync_mix: cue {c['i']}: role {c['role']!r} is not in the kit "
                     f"({', '.join(r for r in lock['roles'] if lock['roles'][r])})")
        if rl is None:
            print(f"  cue {c['i']} {c['role']} skipped: the role is off in this kit")
            continue
        take = pick_take(rl, c, used.get(c['role'], 0))
        used[c['role']] = used.get(c['role'], 0) + 1
        bed = None
        if music is not None and rl.get('bed_db') is not None:
            try:
                bed = K.bed_level(music, c['t'])
            except K.KitError:
                bed = None
        g = K.gain_db(take, rl, bed) + float(c.get('gain_db', 0.0))
        start = K.place(take, rl, c['t'])
        plan.append({'cue': c['i'], 't': round(c['t'], 4), 'role': c['role'], 'file': take['file'],
                     'align': rl['align'], 'offset_ms': rl.get('offset_ms', 0.0), 'start': start,
                     'gain_db': round(g, 2), 'bed_lufs': bed, 'end': start + take['dur_s']})

    if dur is None:
        ends = [x['end'] for x in plan] + ([len(music) / SR] if music is not None else [])
        dur = max(ends) + 0.5
    n = int(round(dur * SR))
    mix = np.zeros((n, 2))
    if music is not None:
        m = music[:n] * stop_down_env(min(n, len(music)), cues, lock)[:, None]
        mix[:len(m)] += m
    for x in plan:
        y, sr = sf.read(os.path.join(kit_out, x['file']), dtype='float64')
        if sr != SR:
            import soxr
            y = soxr.resample(y, sr, SR)
        add_at(mix, y, x['start'], x['gain_db'])

    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    lufs = meter.integrated_loudness(mix) if np.any(mix) else float('-inf')
    if a.target_lufs is not None and np.isfinite(lufs):
        mix *= 10 ** ((a.target_lufs - lufs) / 20)
        lufs = a.target_lufs
    peak = float(np.max(np.abs(mix))) if n else 0.0
    ceiling = 10 ** (-1.0 / 20)
    if peak > ceiling:                              # never clip: pull the whole mix under -1 dBFS
        mix *= ceiling / peak
        print(f'  mix peaked at {20 * np.log10(peak):+.1f} dBFS: lowered {20 * np.log10(peak / ceiling):.1f} dB')
        lufs = meter.integrated_loudness(mix)

    wav = a.wav or (os.path.splitext(a.out)[0] + '.soundtrack.wav' if a.out else 'soundtrack.wav')
    sf.write(wav, mix.astype(np.float32), SR, subtype='PCM_24')

    print(f'\n{len(plan)} sounds placed, {dur:.2f} s, {lufs:.1f} LUFS integrated -> {wav}')
    print(f"  {'cue':>3} {'t (s)':>7} {'role':14s} {'take':22s} {'sync on':7s} {'offset':>7} {'start':>8} {'gain':>6}")
    for x in plan:
        print(f"  {x['cue']:>3} {x['t']:7.3f} {x['role']:14s} {x['file']:22s} {x['align']:7s} "
              f"{x['offset_ms']:+6.0f}ms {x['start']:8.3f} {x['gain_db']:+6.1f}")

    if a.out:
        if not a.video:
            sys.exit('sync_mix: -o needs --video')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-i', wav, '-map', '0:v:0', '-map', '1:a:0',
                        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{dur:.3f}',
                        '-movflags', '+faststart', a.out], check=True)
        print(f'muxed -> {a.out}')

    if a.check:
        # listen to the finished file: the same cues (after spacing), each named by its role and cue number
        from earshot import api
        target = a.out or wav
        kw = {} if a.out else ({'video': a.video} if a.video else {})
        heard_cues = json.dumps({'fps': fps, 'events': [{'t': x['t'], 'kind': x['role'], 'id': x['cue']}
                                                        for x in plan]})
        r = api.timeline(target, cues=heard_cues, detail='low', **kw)
        sy = (r.get('sync') or {}).get('cues') or {}
        want = {x['cue']: x['offset_ms'] for x in plan}
        frame_ms = 1000.0 / fps if fps else 40.0
        print(f"\nlistened back ({'within 1 frame' if fps else 'within 40 ms'} = {frame_ms:.1f} ms; "
              'offset = sound minus picture, negative = early; "aimed" = the role\'s intended offset_ms):')
        bad = 0
        for row in sy.get('items') or []:
            off, aim = row.get('offset_ms'), want.get(row.get('id'), 0.0)
            ok = off is not None and abs(off - aim) <= frame_ms
            bad += not ok
            print(f"  cue {row.get('id', '?'):>3} {row.get('kind', ''):14s} t={row['t']:7.3f}  heard "
                  f"{'-' if off is None else f'{off:+.1f} ms':>10}  aimed {aim:+.0f} ms  {row.get('status')}"
                  f"{'' if ok else '  <-- check'}")
        print('  stats:', json.dumps(sy.get('stats') or {}))
        print(f"  {len(sy.get('items') or []) - bad} of {len(sy.get('items') or [])} cues heard within a frame "
              'of their aim' + ('' if not bad else '; open `earshot sheet` on the result to see the others'))


if __name__ == '__main__':
    main()
