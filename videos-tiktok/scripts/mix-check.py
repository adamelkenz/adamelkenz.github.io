"""Flags moments where the mix sticks out above the voice level (sound effects too loud).

Usage: python3 scripts/mix-check.py out/marches-audio.wav [threshold_lu]
Prints integrated loudness, the typical (median) short-term level, and every 0.1 s window
whose momentary loudness exceeds the median by more than the threshold (default 4 LU).
"""
import re
import statistics
import subprocess
import sys

path = sys.argv[1]
threshold = float(sys.argv[2]) if len(sys.argv) > 2 else 4.0
err = subprocess.run(
    ['ffmpeg', '-nostdin', '-i', path, '-af', 'ebur128=metadata=1,ametadata=print:key=lavfi.r128.M', '-f', 'null', '-'],
    capture_output=True, text=True,
).stderr
times = [float(x) for x in re.findall(r'pts_time:([\d.]+)', err)]
values = [float(x) for x in re.findall(r'lavfi\.r128\.M=(-?[\d.]+)', err)]
integrated = re.findall(r'I:\s+(-?[\d.]+) LUFS', err)[-1]
speech = [v for v in values if v > -40]
median = statistics.median(speech)
print(f'integrated {integrated} LUFS, median momentary {median:.1f} LUFS')
spikes = [(t, v) for t, v in zip(times, values) if v > median + threshold]
groups = []
for t, v in spikes:
    if groups and t - groups[-1][1] < 0.35:
        groups[-1][1] = t
        groups[-1][2] = max(groups[-1][2], v)
    else:
        groups.append([t, t, v])
for start, end, peak in groups:
    print(f'  {start:6.1f}s–{end:5.1f}s  peak {peak:.1f} (+{peak - median:.1f} LU)')
print(f'{len(groups)} spike(s)')
