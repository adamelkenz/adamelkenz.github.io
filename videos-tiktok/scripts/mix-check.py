"""Flags moments where sound effects rise above the voice.

Usage: python3 scripts/mix-check.py <final.mp4> <voice-only.wav> [threshold_lu]
Compares momentary loudness (400 ms windows) of the final mix with the voice-only track
(scripts/voice-track.py) while the voice is speaking, and lists the moments where the mix
exceeds its usual level above the voice by more than the threshold (default 3 LU).
"""
import re
import statistics
import subprocess
import sys


def momentary(path):
    err = subprocess.run(
        ['ffmpeg', '-nostdin', '-i', path, '-af', 'ebur128=metadata=1,ametadata=print:key=lavfi.r128.M', '-f', 'null', '-'],
        capture_output=True, text=True,
    ).stderr
    times = [round(float(x), 1) for x in re.findall(r'pts_time:([\d.]+)', err)]
    values = [float(x) for x in re.findall(r'lavfi\.r128\.M=(-?[\d.]+)', err)]
    integrated = re.findall(r'I:\s+(-?[\d.]+) LUFS', err)[-1]
    return dict(zip(times, values)), integrated


mix_path, voice_path = sys.argv[1], sys.argv[2]
threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 3.0
mix, integrated = momentary(mix_path)
voice, _ = momentary(voice_path)
diffs = [(t, mix[t] - voice[t]) for t in mix if t in voice and voice[t] > -35]
base = statistics.median(d for _, d in diffs)
print(f'integrated {integrated} LUFS')
groups = []
for t, d in diffs:
    over = d - base
    if over <= threshold:
        continue
    if groups and t - groups[-1][1] < 0.35:
        groups[-1][1] = t
        groups[-1][2] = max(groups[-1][2], over)
    else:
        groups.append([t, t, over])
for start, end, peak in groups:
    print(f'  {start:6.1f}s–{end:5.1f}s  +{peak:.1f} LU above the voice')
print(f'{len(groups)} moment(s) above +{threshold} LU')
