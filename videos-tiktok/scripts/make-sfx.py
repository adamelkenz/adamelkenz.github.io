"""Synthesise the sound effects used by the videos (royalty-free, no samples).

Usage: python3 scripts/make-sfx.py public/sfx
"""
import os
import sys
import wave

import numpy as np
from scipy import signal

SR = 44100
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack, release, curve=4.0):
    """Attack/exponential release envelope over n samples."""
    a = int(SR * attack)
    e = np.ones(n)
    if a > 0:
        e[:a] = np.linspace(0, 1, a)
    r = n - a
    e[a:] = np.exp(-curve * np.linspace(0, 1, r)) if release else 1
    return e


def bandpass(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lowpass(x, f, order=2):
    sos = signal.butter(order, f, btype="low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def highpass(x, f, order=2):
    sos = signal.butter(order, f, btype="high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def sweep_filter(x, f0, f1, q=2.0, steps=60):
    """Band-pass whose centre glides from f0 to f1 (block-wise)."""
    out = np.zeros_like(x)
    blocks = np.array_split(np.arange(len(x)), steps)
    for i, idx in enumerate(blocks):
        f = f0 * (f1 / f0) ** (i / max(1, steps - 1))
        lo, hi = max(20, f / q), min(SR / 2 - 100, f * q)
        sos = signal.butter(2, [lo, hi], btype="band", fs=SR, output="sos")
        seg = x[max(0, idx[0] - 2000): idx[-1] + 1]
        out[idx] = signal.sosfilt(sos, seg)[-len(idx):]
    return out


def sine_glide(f0, f1, dur, curve="exp"):
    n = int(SR * dur)
    if curve == "exp":
        f = f0 * (f1 / f0) ** np.linspace(0, 1, n)
    else:
        f = np.linspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def reverb(x, decay=1.2, mix=0.25):
    n = int(SR * decay)
    ir = rng.standard_normal(n) * np.exp(-6 * np.linspace(0, 1, n))
    ir = lowpass(ir, 5000)
    dry = np.concatenate([x, np.zeros(n)])
    wet = np.zeros(len(dry))
    conv = signal.fftconvolve(x, ir)[: len(dry)]
    wet[: len(conv)] = conv
    wet /= np.max(np.abs(wet)) + 1e-9
    return dry * (1 - mix) + wet * mix * np.max(np.abs(x))


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def save(path, x, peak=0.9):
    x = norm(x, peak)
    st = np.stack([x, x], axis=1)
    data = (st * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def whoosh(dur=0.55):
    n = int(SR * dur)
    x = rng.standard_normal(n)
    x = sweep_filter(x, 300, 3500, q=1.6)
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 2.2
    return x * shape


def impact():
    body = sine_glide(90, 32, 1.6) * env(int(SR * 1.6), 0.002, True, 3.2)
    n = len(body)
    crack = lowpass(rng.standard_normal(n), 2500) * env(n, 0.001, True, 40)
    click = highpass(rng.standard_normal(n), 3000) * env(n, 0.0005, True, 200)
    return reverb(body * 1.0 + crack * 0.5 + click * 0.25, 1.4, 0.2)


def sub_drop():
    s = sine_glide(120, 28, 2.2) * env(int(SR * 2.2), 0.01, True, 2.2)
    return reverb(s, 1.8, 0.25)


def riser(dur=2.2):
    n = int(SR * dur)
    x = sweep_filter(rng.standard_normal(n), 200, 7000, q=1.4, steps=90)
    tone = sine_glide(110, 880, dur) * 0.35 + sine_glide(165, 1320, dur) * 0.2
    shape = np.linspace(0, 1, n) ** 2.5
    return (x * 0.8 + tone) * shape


def tick():
    n = int(SR * 0.05)
    x = highpass(rng.standard_normal(n), 2500) * env(n, 0.0005, True, 60)
    x += np.sin(2 * np.pi * 2200 * t(0.05)) * env(n, 0.0005, True, 50) * 0.6
    return x


def pop():
    s = sine_glide(420, 1250, 0.09) * env(int(SR * 0.09), 0.002, True, 9)
    return s


def ching():
    dur = 1.4
    n = int(SR * dur)
    bells = sum(
        np.sin(2 * np.pi * f * t(dur)) * a * np.exp(-d * t(dur))
        for f, a, d in [(2093, 1, 3.5), (2637, 0.7, 4), (3136, 0.6, 5), (4186, 0.35, 6), (5274, 0.2, 7)]
    )
    cha = bandpass(rng.standard_normal(n), 2000, 8000) * env(n, 0.001, True, 30) * 0.6
    drawer = lowpass(rng.standard_normal(n), 400) * env(n, 0.002, True, 25) * 0.8
    return reverb(bells * 0.8 + cha + drawer, 0.8, 0.15)


def thunder():
    dur = 3.6
    n = int(SR * dur)
    brown = np.cumsum(rng.standard_normal(n))
    brown = highpass(brown, 25)
    rumble = lowpass(brown, 180) * env(n, 0.05, True, 1.6)
    rumble *= 1 + 0.6 * np.sin(2 * np.pi * 3.2 * t(dur)) * np.exp(-t(dur))
    crack = bandpass(rng.standard_normal(n), 300, 6000) * env(n, 0.001, True, 14)
    return reverb(norm(rumble) + crack * 0.9, 2.2, 0.3)


def glitch():
    dur = 0.45
    n = int(SR * dur)
    out = np.zeros(n)
    pos = 0
    while pos < n:
        seg = int(SR * rng.uniform(0.012, 0.05))
        f = rng.choice([180, 420, 880, 1600, 3200])
        sq = signal.square(2 * np.pi * f * np.arange(seg) / SR)
        if rng.random() < 0.4:
            sq = rng.standard_normal(seg)
        out[pos: pos + seg] = sq[: n - pos] * rng.uniform(0.3, 1)
        pos += seg
    out = np.round(out * 6) / 6  # bitcrush
    return out * env(n, 0.001, True, 2)


def stamp():
    n = int(SR * 0.6)
    thud = sine_glide(160, 50, 0.6) * env(n, 0.001, True, 14)
    slap = bandpass(rng.standard_normal(n), 600, 5000) * env(n, 0.0005, True, 45)
    return thud + slap * 0.8


def crickets():
    dur = 2.4
    n = int(SR * dur)
    out = np.zeros(n)
    carrier = np.sin(2 * np.pi * 4600 * t(dur))
    for start in np.arange(0.05, dur - 0.3, 0.55):
        for k in range(3):
            s = int(SR * (start + k * 0.045))
            m = int(SR * 0.03)
            out[s: s + m] += np.hanning(m)
    return carrier * out


def clock_tick():
    n = int(SR * 0.12)
    wood = bandpass(rng.standard_normal(n), 1200, 3500) * env(n, 0.0005, True, 70)
    tone = np.sin(2 * np.pi * 1800 * t(0.12)) * env(n, 0.0005, True, 60)
    return wood + tone * 0.4


def bell_toll():
    dur = 5.0
    base = 196
    partials = [(0.5, 0.8, 0.6), (1, 1, 0.9), (1.19, 0.6, 1.2), (1.5, 0.5, 1.4), (2, 0.45, 1.7), (2.52, 0.3, 2.2), (3.01, 0.2, 2.8)]
    x = sum(np.sin(2 * np.pi * base * r * t(dur) + i) * a * np.exp(-d * t(dur)) for i, (r, a, d) in enumerate(partials))
    strike = bandpass(rng.standard_normal(len(x)), 800, 4000) * env(len(x), 0.0005, True, 80) * 0.5
    return reverb(x + strike, 2.5, 0.35)


def paper():
    dur = 0.7
    n = int(SR * dur)
    crackle = bandpass(rng.standard_normal(n), 1500, 9000)
    gate = (rng.random(n) < 0.02).astype(float)
    gate = np.convolve(gate, np.hanning(300), "same")
    return crackle * (0.25 + gate) * np.sin(np.pi * np.linspace(0, 1, n))


def heartbeat():
    dur = 1.0
    n = int(SR * dur)
    out = np.zeros(n)
    for s0, a in [(0.0, 1.0), (0.22, 0.7)]:
        s = int(SR * s0)
        m = int(SR * 0.25)
        out[s: s + m] += sine_glide(70, 40, 0.25)[:m] * env(m, 0.004, True, 12) * a
    return lowpass(out, 300)


def drone(dur=75.0):
    n = int(SR * dur)
    tt = t(dur)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * tt)
    x = np.zeros(n)
    for f, a in [(55, 1), (55.4, 0.8), (82.4, 0.5), (110.2, 0.25), (130.8, 0.15)]:
        x += signal.sawtooth(2 * np.pi * f * tt) * a
    x = lowpass(x, 420) * (0.6 + 0.4 * lfo)
    wind = sweep_filter(rng.standard_normal(n), 300, 900, q=1.3, steps=200)
    wind *= 0.3 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * tt + 1))
    fade = np.minimum(1, np.minimum(tt / 2.0, (dur - tt) / 3.0))
    return (norm(x) * 0.8 + norm(wind) * 0.35) * fade


def swell(dur=4.0):
    n = int(SR * dur)
    tt = t(dur)
    x = sum(np.sin(2 * np.pi * f * tt) * a for f, a in [(110, 1), (164.8, 0.6), (220, 0.5), (277.2, 0.3), (329.6, 0.25)])
    shimmer = bandpass(rng.standard_normal(n), 3000, 9000) * 0.05
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return reverb((x + shimmer) * shape, 2.0, 0.3)


EFFECTS = {
    "whoosh": whoosh,
    "impact": impact,
    "sub-drop": sub_drop,
    "riser": riser,
    "tick": tick,
    "pop": pop,
    "ching": ching,
    "thunder": thunder,
    "glitch": glitch,
    "stamp": stamp,
    "crickets": crickets,
    "clock-tick": clock_tick,
    "bell": bell_toll,
    "paper": paper,
    "heartbeat": heartbeat,
    "drone": drone,
    "swell": swell,
}

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "public/sfx"
    os.makedirs(out_dir, exist_ok=True)
    for name, fn in EFFECTS.items():
        save(os.path.join(out_dir, f"{name}.wav"), fn())
        print("ok", name)
