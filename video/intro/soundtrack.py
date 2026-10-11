"""Original ambient score for the Root & Rise intro film (66 s).

Synthesised from scratch (no samples) so it is royalty-free:
warm detuned pads following the story's chapters, a felt-piano motif at each
chapter start, a soft impact when the idea touches the ground, a pulse that
carries the build, and a swell into the end card.

    python3 soundtrack.py  →  out/soundtrack.wav
"""
import os
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt
from scipy.io import wavfile

SR = 48000
DUR = 66.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)


def hz(note):
    names = {"C": -9, "C#": -8, "D": -7, "D#": -6, "E": -5, "F": -4, "F#": -3, "G": -2, "G#": -1, "A": 0, "A#": 1, "B": 2}
    n, o = note[:-1], int(note[-1])
    return 440.0 * 2 ** ((names[n] + (o - 4) * 12) / 12)


def smooth(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def window(a, b, fade_in, fade_out):
    return smooth((t - a) / fade_in) * smooth((b - t) / fade_out)


def lowpass(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def highpass(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def pad_voice(freq, a, b, bright=6.0, amp=1.0, fin=2.5, fout=2.5):
    """Band-limited detuned 'analog' pad note, rendered only where audible."""
    i0, i1 = max(0, int((a - 0.1) * SR)), min(N, int((b + 0.1) * SR))
    tt = t[i0:i1]
    out = np.zeros((2, i1 - i0))
    for det, pan in ((-0.11, 0.2), (0.0, 0.5), (0.12, 0.8)):
        f = freq * 2 ** (det / 12)
        ph = rng.uniform(0, 2 * np.pi)
        lfo = 1 + 0.002 * np.sin(2 * np.pi * 0.17 * tt + ph)
        s = np.zeros_like(tt)
        for k in range(1, 14):
            if f * k > 9000:
                break
            s += np.sin(2 * np.pi * f * k * tt * lfo + ph * k) * np.exp(-k / bright) / k
        out[0] += s * (1 - pan)
        out[1] += s * pan
    env = smooth((tt - a) / fin) * smooth((b - tt) / fout)
    full = np.zeros((2, N))
    full[:, i0:i1] = out * env * amp
    return full


def piano(freq, at, amp=1.0, decay=2.8):
    """Soft felt-piano: inharmonic partials, quick attack, long decay."""
    i0 = int(at * SR)
    L = min(N - i0, int(SR * (decay * 2.5)))
    tt = np.arange(L) / SR
    s = np.zeros(L)
    for k, (a, d) in enumerate([(1.0, 1.0), (0.42, 0.6), (0.2, 0.4), (0.1, 0.28), (0.05, 0.2)], start=1):
        fk = freq * k * (1 + 0.0004 * k * k)
        s += a * np.sin(2 * np.pi * fk * tt) * np.exp(-tt / (decay * d))
    s *= 1 - np.exp(-tt / 0.006)  # felt hammer
    s = lowpass(s, 3200)
    out = np.zeros(N)
    out[i0:i0 + L] = s * amp
    return out


def bell(freq, at, amp=1.0):
    i0 = int(at * SR)
    L = min(N - i0, SR * 5)
    tt = np.arange(L) / SR
    s = (np.sin(2 * np.pi * freq * tt) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * tt) * np.exp(-tt / 0.6)
         + 0.18 * np.sin(2 * np.pi * freq * 5.4 * tt) * np.exp(-tt / 0.25))
    s *= np.exp(-tt / 1.8) * (1 - np.exp(-tt / 0.003))
    out = np.zeros(N)
    out[i0:i0 + L] = s * amp
    return out


def impact(at, amp=1.0):
    i0 = int(at * SR)
    L = min(N - i0, SR * 6)
    tt = np.arange(L) / SR
    f = 34 + 70 * np.exp(-tt / 0.12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(ph) * np.exp(-tt / 1.4)
    noise = lowpass(rng.standard_normal(L), 900) * np.exp(-tt / 0.25) * 0.35
    out = np.zeros(N)
    out[i0:i0 + L] = (boom + noise) * amp * (1 - np.exp(-tt / 0.004))
    return out


def thump(at, amp=1.0):
    i0 = int(at * SR)
    L = min(N - i0, int(SR * 0.9))
    tt = np.arange(L) / SR
    f = 46 + 50 * np.exp(-tt / 0.05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.22) * (1 - np.exp(-tt / 0.002))
    out = np.zeros(N)
    out[i0:i0 + L] = s * amp
    return out


def stereo(mono, pan=0.5):
    return np.stack([mono * np.sqrt(1 - pan), mono * np.sqrt(pan)])


mix = np.zeros((2, N))

# ── Pads: one chord per chapter ────────────────────────────────────────────
CHORDS = [
    (0.6, 8.0, ["D3", "A3", "E4", "F#4"], 0.55, 4.0),       # the idea — open, fragile
    (6.8, 15.2, ["D3", "A3", "C#4", "E4", "F#4"], 0.8, 5.5),  # the land — dawn
    (14.4, 24.0, ["B2", "F#3", "A3", "D4", "E4"], 0.85, 4.0),  # the roots — deeper, darker
    (23.0, 34.0, ["G2", "D3", "B3", "F#4", "A4"], 0.95, 6.5),  # the rise
    (33.0, 44.0, ["E3", "B3", "D4", "F#4", "G4"], 0.9, 7.0),   # the light
    (43.0, 52.8, ["F#2", "D3", "A3", "C#4", "E4"], 0.95, 7.0),  # the life
    (51.8, 59.6, ["G2", "D3", "B3", "F#4", "A4"], 1.0, 7.5),   # the sanctuary
    (58.6, 66.0, ["D2", "A2", "D3", "F#3", "A3", "E4"], 1.05, 6.0),  # resolve
]
for a, b, notes, amp, bright in CHORDS:
    for n in notes:
        mix += pad_voice(hz(n), a, b, bright=bright, amp=amp * 0.06)

# low drone that grounds the whole piece
drone = np.sin(2 * np.pi * hz("D2") * t) + 0.4 * np.sin(2 * np.pi * hz("A2") * t)
mix += stereo(drone * window(1.0, 64.5, 6, 3) * 0.035)

# ── The idea: shimmering bells around the spark ────────────────────────────
for at, n in [(1.0, "F#5"), (1.9, "A5"), (2.7, "E6"), (3.4, "D6"), (4.1, "A5"), (4.7, "F#5"), (5.2, "E5")]:
    mix += stereo(bell(hz(n), at, 0.05), rng.uniform(0.25, 0.75))
# riser into the landing
rise = highpass(rng.standard_normal(N), 2500) * smooth((t - 3.2) / 2.45) * (t < 5.65)
mix += stereo(lowpass(rise, 7000) * 0.025)
mix += stereo(impact(5.65, 0.55))

# ── Felt-piano motif at each chapter ───────────────────────────────────────
MOTIFS = [
    (8.2, ["A4", "F#4", "E4", "D4"]),
    (15.6, ["F#4", "D4", "B3"]),
    (24.4, ["D4", "F#4", "A4", "B4"]),
    (34.2, ["B4", "A4", "G4", "F#4", "E4"]),
    (44.6, ["E4", "F#4", "A4", "C#5"]),
    (53.0, ["D5", "A4", "F#4", "A4"]),
    (61.6, ["F#4", "A4", "D5"]),
]
for at, notes in MOTIFS:
    for i, n in enumerate(notes):
        mix += stereo(piano(hz(n), at + i * 0.55, 0.11), 0.4 + 0.05 * i)

# underground: a low, slow pulse like footings settling
for at in np.arange(16.0, 23.0, 1.7):
    mix += stereo(thump(at, 0.18))

# ── Build pulse: carries the rise and the life chapters ───────────────────
bpm = 76
beat = 60 / bpm
for k, at in enumerate(np.arange(24.0, 52.5, beat)):
    level = 0.22 * smooth((at - 24) / 3) * (1 - 0.35 * smooth((at - 33) / 2) * smooth((44 - at) / 2))
    mix += stereo(thump(at, level * (1.0 if k % 2 == 0 else 0.65)))
    # soft shaker on the off-beat
    i0 = int((at + beat / 2) * SR)
    L = int(SR * 0.12)
    if i0 + L < N:
        sh = highpass(rng.standard_normal(L), 6000) * np.exp(-np.arange(L) / SR / 0.03)
        seg = np.zeros(N)
        seg[i0:i0 + L] = sh * level * 0.12
        mix += stereo(seg, 0.65)

# ── Swell into the end card + final hit ────────────────────────────────────
swell = lowpass(rng.standard_normal(N), 4000) * smooth((t - 55.5) / 3.3) * (t < 59.0)
mix += stereo(swell * 0.035)
mix += stereo(impact(59.3, 0.35))
for i, n in enumerate(["D3", "A3", "D4", "F#4"]):
    mix += stereo(piano(hz(n), 59.35 + i * 0.03, 0.08, decay=4.5), 0.35 + 0.1 * i)

# ── Space: synthetic hall reverb ───────────────────────────────────────────
ir_len = int(SR * 3.2)
irt = np.arange(ir_len) / SR
ir = rng.standard_normal((2, ir_len)) * np.exp(-irt / 0.9)
ir[:, : int(SR * 0.02)] = 0
ir = np.stack([lowpass(ir[0], 5500), lowpass(ir[1], 5000)])
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([fftconvolve(mix[0], ir[0])[:N], fftconvolve(mix[1], ir[1])[:N]])
out = mix * 0.72 + wet * 0.42

# master: gentle low cut, soft clip, fades, normalise
out = np.stack([highpass(out[0], 28), highpass(out[1], 28)])
out = np.tanh(out * 1.4) / 1.4
out *= smooth(t / 1.2) * smooth((DUR - t) / 1.6)
out /= np.max(np.abs(out)) / 0.89

os.makedirs(os.path.join(os.path.dirname(__file__), "out"), exist_ok=True)
path = os.path.join(os.path.dirname(__file__), "out", "soundtrack.wav")
wavfile.write(path, SR, (out.T * 32767).astype(np.int16))
print("wrote", path)
