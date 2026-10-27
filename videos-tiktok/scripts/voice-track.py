"""Builds a voice-only track from src/<video>/timeline.json (for mix checks).

Usage: python3 scripts/voice-track.py datacenters out/datacenters-voice.wav
"""
import json
import subprocess
import sys

video, out = sys.argv[1], sys.argv[2]
timeline = json.load(open(f'src/{video}/timeline.json'))
inputs, chains = [], []
for i, line in enumerate(timeline['lines']):
    inputs += ['-i', f"public/{line['voice']}"]
    ms = int(line['from'] / timeline['fps'] * 1000)
    chains.append(f'[{i}]adelay={ms}|{ms}[a{i}]')
labels = ''.join(f'[a{i}]' for i in range(len(timeline['lines'])))
graph = ';'.join(chains) + f";{labels}amix=inputs={len(timeline['lines'])}:normalize=0[out]"
subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-y', *inputs, '-filter_complex', graph, '-map', '[out]', out], check=True)
print(out)
