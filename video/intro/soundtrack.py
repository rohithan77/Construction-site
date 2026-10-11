"""Original score for the Root & Rise intro film (66 s), synthesised from scratch (royalty-free).

A gentle piano-and-strings piece in D major with soft nature (wind, birdsong at dawn and in the
garden). No drums, no impacts. It is timed to the film: the spark lands at 5.65 s, the melody
begins as the land appears, and the final chord arrives with the end card at 59.4 s.

    python3 soundtrack.py  →  out/soundtrack.wav
"""
import os

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
DUR = 66.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
mix = np.zeros((2, N))

NAMES = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}


def hz(n):
    return 440.0 * 2 ** ((NAMES[n[:-1]] + (int(n[-1]) - 4) * 12) / 12)


def sos_filter(x, f, kind="low", order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output="sos"), x)


def add(sig, t0, pan=0.5, gain=1.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    seg = sig[: N - i0] * gain
    mix[0, i0:i0 + len(seg)] += seg * np.sqrt(1 - pan)
    mix[1, i0:i0 + len(seg)] += seg * np.sqrt(pan)


# ── felt piano ───────────────────────────────────────────────────────────────
def piano(note, vel=0.5, hold=4.0):
    f = hz(note)
    tail = min(hold + 2.5, 9.0)
    t = np.arange(int(SR * tail)) / SR
    out = np.zeros_like(t)
    scale = (261.6 / f) ** 0.55
    B = 0.00018
    for k in range(1, 17):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        amp = (abs(np.sin(np.pi * k / 7.3)) + 0.25) / k ** 1.15 * vel ** (0.6 + 0.12 * k)
        tau1 = 0.45 * scale / (1 + 0.18 * k)
        tau2 = 3.6 * scale / (1 + 0.12 * k)
        env = 0.55 * np.exp(-t / tau1) + 0.45 * np.exp(-t / tau2)
        det = 1 + (0.0004 if k < 7 else 0)
        ph = rng.uniform(0, 6.28)
        out += amp * env * 0.5 * (np.sin(2 * np.pi * fk * t + ph) + np.sin(2 * np.pi * fk * det * t + ph))
    out *= 1 - np.exp(-t / 0.004)
    # damper after the hold
    out *= np.where(t > hold, np.exp(-(t - hold) / 0.35), 1.0)
    # felt hammer knock
    knock = sos_filter(rng.standard_normal(int(SR * 0.03)), 1400) * np.exp(-np.arange(int(SR * 0.03)) / SR / 0.006)
    out[: len(knock)] += knock * 0.02 * vel
    out = sos_filter(out, 1400 + 2600 * vel)
    return out


# ── strings ensemble ─────────────────────────────────────────────────────────
def strings(notes, t0, t1, level, attack=1.8, release=2.2, bright=1250):
    i0, i1 = int(max(t0, 0) * SR), min(N, int((t1 + release) * SR))
    t = np.arange(i1 - i0) / SR
    L = np.zeros_like(t)
    R = np.zeros_like(t)
    for n in notes:
        f0 = hz(n)
        for u, (cents, pan) in enumerate(((-7, 0.25), (-2, 0.6), (3, 0.4), (8, 0.75))):
            f = f0 * 2 ** (cents / 1200)
            vib = 1 + 0.0022 * np.sin(2 * np.pi * (5.0 + 0.3 * u) * t + rng.uniform(0, 6.28)) * np.clip(t / 2.0, 0, 1)
            phase = 2 * np.pi * f * np.cumsum(vib) / SR + rng.uniform(0, 6.28)
            s = np.zeros_like(t)
            for k in range(1, 18):
                if f * k > 7000:
                    break
                s += np.sin(k * phase) / k
            L += s * np.sqrt(1 - pan)
            R += s * np.sqrt(pan)
    env = np.clip(t / attack, 0, 1) ** 1.5 * np.clip((t1 - t0 + release - t) / release, 0, 1) ** 1.2
    L = sos_filter(L, bright, order=2) * env
    R = sos_filter(R, bright, order=2) * env
    g = level / (len(notes) * 4)
    mix[0, i0:i1] += L * g
    mix[1, i0:i1] += R * g


# ── nature ───────────────────────────────────────────────────────────────────
def bird_call(t0, pan, kind):
    pitch = rng.uniform(0.85, 1.2)
    patterns = {
        "trill": [(2900, 3600, 0.05)] * 6,
        "sweet": [(3200, 4300, 0.09), (4300, 3500, 0.12), (3000, 3900, 0.08)],
        "whistle": [(2400, 2400, 0.22), (2900, 2300, 0.3)],
    }
    t = t0
    for f0, f1, d in patterns[kind]:
        n = int(SR * d)
        tt = np.arange(n) / SR
        f = f0 * pitch * (f1 / f0) ** (tt / d)
        ph = 2 * np.pi * np.cumsum(f) / SR
        env = np.sin(np.pi * tt / d) ** 2
        add((np.sin(ph) + 0.12 * np.sin(2 * ph)) * env, t, pan, 0.016)
        t += d + rng.uniform(0.03, 0.07)


def wind(level):
    w = rng.standard_normal(N)
    w = sos_filter(sos_filter(w, 900), 160, "high")
    lfo = 0.55 + 0.45 * np.sin(2 * np.pi * 0.07 * np.arange(N) / SR + 1.0) * np.sin(2 * np.pi * 0.023 * np.arange(N) / SR)
    mix[0] += w * lfo * level
    mix[1] += np.roll(w, 2200) * lfo * level


# ═════════════════════════════ the score ═════════════════════════════
T0 = 6.0                      # melody begins as the land appears
BEAT = (59.4 - T0) / 64       # 16 bars of 4 → final chord lands on the end card
bar = lambda i: T0 + 4 * i * BEAT

# intro: a soft pad and starlight notes around the spark
strings(["D3", "A3", "E4", "F#4"], 0.3, 6.6, 0.55, attack=3.0, bright=1000)
for at, n in [(0.9, "A5"), (1.8, "F#5"), (2.6, "E6"), (3.3, "D6"), (4.0, "A5"), (4.7, "F#5"), (5.3, "E5")]:
    add(piano(n, 0.28, 3.0), at, rng.uniform(0.35, 0.65), 0.7)
add(piano("D2", 0.42, 5.0), 5.65, 0.5, 0.9)      # the idea touches the ground: a warm low note
add(piano("A2", 0.3, 5.0), 5.66, 0.5, 0.6)

CHORDS = [  # (bass, arpeggio, strings voicing)
    ("D2", ["A3", "D4", "E4"], ["D3", "A3", "F#4"]),
    ("C#2", ["E3", "A3", "C#4"], ["C#3", "E3", "A3"]),
    ("B1", ["F#3", "B3", "D4"], ["B2", "F#3", "D4"]),
    ("G1", ["D3", "A3", "B3"], ["G2", "D3", "B3"]),
    ("B1", ["F#3", "B3", "D4"], ["B2", "F#3", "D4"]),
    ("G1", ["D3", "A3", "B3"], ["G2", "D3", "B3"]),
    ("D2", ["A3", "D4", "F#4"], ["D3", "A3", "F#4"]),
    ("A1", ["E3", "A3", "C#4"], ["A2", "E3", "C#4"]),
    ("G1", ["D3", "G3", "B3"], ["G2", "D3", "B3", "D4"]),
    ("F#2", ["A3", "D4", "F#4"], ["F#2", "A3", "D4", "F#4"]),
    ("E2", ["B3", "E4", "G4"], ["E3", "B3", "G4"]),
    ("A1", ["E3", "A3", "C#4"], ["A2", "E3", "C#4", "E4"]),
    ("G1", ["D3", "G3", "B3"], ["G2", "D3", "B3", "D4"]),
    ("F#2", ["A3", "C#4", "F#4"], ["F#2", "C#3", "A3", "F#4"]),
    ("E2", ["B3", "D4", "G4"], ["E2", "B3", "D4", "G4"]),
    ("A1", ["A3", "D4", "E4"], ["A2", "E3", "A3", "E4"]),
]
MELODY = [
    [(0, "F#5", 2), (2, "E5", 1), (3, "D5", 1)], [(0, "E5", 3), (3, "C#5", 1)], [(0, "D5", 2), (2, "F#5", 2)], [(0, "B4", 2), (2, "A4", 2)],
    [(1, "D5", 1), (2, "C#5", 1), (3, "B4", 1)], [(0, "D5", 3), (3, "E5", 1)], [(0, "F#5", 2), (2, "A5", 2)], [(0, "G5", 1), (1, "F#5", 1), (2, "E5", 2)],
    [(0, "D5", 2), (2, "B4", 1), (3, "D5", 1)], [(0, "A5", 3), (3, "F#5", 1)], [(0, "G5", 2), (2, "E5", 2)], [(0, "C#5", 1), (1, "E5", 1), (2, "A5", 2)],
    [(0, "B5", 2), (2, "A5", 1), (3, "G5", 1)], [(0, "A5", 2), (2, "F#5", 2)], [(0, "G5", 1), (1, "F#5", 1), (2, "E5", 1), (3, "D5", 1)], [(0, "E5", 2), (2, "C#5", 2)],
]
STRING_LEVEL = [0.35, 0.35, 0.4, 0.4, 0.55, 0.55, 0.6, 0.65, 0.75, 0.75, 0.8, 0.85, 0.95, 0.95, 1.0, 1.05]

for i, (bass, arp, voicing) in enumerate(CHORDS):
    t = bar(i)
    add(piano(bass, 0.42, 4 * BEAT + 0.4), t, 0.45, 0.8)
    if i < 4:   # gentle quarter notes while the land is studied
        pattern, step = [arp[0], arp[1], arp[2], arp[1]], BEAT
    else:       # flowing eighths as the home rises
        pattern, step = [arp[0], arp[1], arp[2], arp[1], arp[2], arp[1], arp[0], arp[1]], BEAT / 2
    for k, n in enumerate(pattern):
        add(piano(n, 0.3 if i < 4 else 0.27, step * 2.5), t + k * step, 0.4 + 0.05 * (k % 3), 0.55)
    for b, n, d in MELODY[i]:
        add(piano(n, 0.52 + 0.02 * (i // 4), d * BEAT + 0.3), t + b * BEAT, 0.55, 0.95)
    strings(voicing, t - 0.3, t + 4 * BEAT + 0.3, STRING_LEVEL[i] * 0.5, attack=1.4, release=1.6)

# end card: the home, complete
END = 59.4
for n, v in [("D2", 0.5), ("A2", 0.42), ("D3", 0.4), ("F#3", 0.38), ("A3", 0.38), ("D5", 0.55)]:
    add(piano(n, v, 6.0), END + rng.uniform(0, 0.02), 0.5, 0.9)
add(piano("F#5", 0.4, 4.5), END + 1.6, 0.6, 0.8)
add(piano("A5", 0.38, 4.0), END + 2.4, 0.4, 0.75)
add(piano("D6", 0.34, 3.6), END + 3.3, 0.5, 0.7)
strings(["D3", "A3", "D4", "F#4", "A4"], END - 0.4, 64.6, 0.6, attack=1.2, release=1.4)
strings(["D2"], END - 0.4, 64.6, 0.4, attack=1.2, release=1.4, bright=600)

# nature: a breath of wind throughout, birds at dawn and in the garden
wind(0.004)
for at in np.sort(rng.uniform(8.5, 15.0, 7)):
    bird_call(at, rng.uniform(0.15, 0.85), rng.choice(["sweet", "trill", "whistle"]))
for at in np.sort(rng.uniform(44.5, 57.0, 10)):
    bird_call(at, rng.uniform(0.15, 0.85), rng.choice(["sweet", "trill", "whistle"]))

# ── room: a warm hall ───────────────────────────────────────────────────────
ir_n = int(SR * 3.0)
irt = np.arange(ir_n) / SR
ir = rng.standard_normal((2, ir_n)) * np.exp(-irt / 0.75)
ir[:, : int(SR * 0.025)] = 0
for d, g in [(0.011, 0.5), (0.019, 0.38), (0.027, 0.3), (0.037, 0.22)]:
    ir[0, int(SR * d)] += g
    ir[1, int(SR * (d + 0.003))] += g
ir = np.stack([sos_filter(ir[0], 4200), sos_filter(ir[1], 3900)])
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([fftconvolve(mix[0], ir[0])[:N], fftconvolve(mix[1], ir[1])[:N]])
out = mix * 0.78 + wet * 0.38

# master
out = np.stack([sos_filter(out[0], 35, "high"), sos_filter(out[1], 35, "high")])
t = np.arange(N) / SR
out *= np.clip(t / 0.8, 0, 1) * np.clip((DUR - t) / 2.0, 0, 1)
rms = np.sqrt((out ** 2).mean())
out *= 0.12 / rms                      # ≈ -18 dBFS RMS: gentle, web-friendly
out = np.tanh(out * 1.1) / 1.1
out *= 0.9 / max(0.9, np.abs(out).max())

os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "out"), exist_ok=True)
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "soundtrack.wav")
wavfile.write(path, SR, (out.T * 32767).astype(np.int16))
print("wrote", path)
