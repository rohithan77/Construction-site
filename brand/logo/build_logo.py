"""Builds the Root & Rise logo suite as self-contained SVGs (text converted to outlines).

    python3 brand/logo/build_logo.py

Needs: fonttools, brotli, uharfbuzz. Uses the Fraunces files shipped with the intro film
and the system Inter.
"""
import io
import os

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
FRAUNCES = os.path.join(REPO, "video/intro/fonts/Fraunces.woff2")
FRAUNCES_I = os.path.join(REPO, "video/intro/fonts/Fraunces-Italic.woff2")
INTER = "/usr/share/fonts/opentype/inter/Inter-SemiBold.otf"

INK, CREAM, TERRA, TERRA_LIT, SAGE = "#1C1B19", "#F7F4ED", "#B5694A", "#DE9A78", "#7E8A6C"

_cache = {}


def _font(path, variations):
    key = (path, tuple(sorted(variations.items())))
    if key not in _cache:
        tt = TTFont(path)
        if variations and "fvar" in tt:
            tt = instancer.instantiateVariableFont(tt, variations)
        buf = io.BytesIO()
        tt.flavor = None
        tt.save(buf)
        data = buf.getvalue()
        hbf = hb.Font(hb.Face(data))
        _cache[key] = (TTFont(io.BytesIO(data)), hbf)
    return _cache[key]


def text_path(text, path, size, variations=None, tracking=0.0, features=None):
    """Return (svg path d, advance width) for `text` at `size` px, baseline at y=0."""
    tt, hbf = _font(path, variations or {})
    upem = tt["head"].unitsPerEm
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbf, buf, features or {"kern": True, "liga": True})
    gs = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    s = size / upem
    x = 0.0
    ds = []
    n = len(buf.glyph_infos)
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        tp = TransformPen(pen, (s, 0, 0, -s, x + pos.x_offset * s, -pos.y_offset * s))
        gs[order[info.codepoint]].draw(tp)
        ds.append(pen.getCommands())
        x += pos.x_advance * s + (tracking * size if i < n - 1 else 0)
    return " ".join(d for d in ds if d), x


# ── the mark ────────────────────────────────────────────────────────────────
# A house standing in front of a rising sun, its roots spreading into the earth below
# the horizon. The doorway is a glowing leaf / lamp flame: the life lived inside.
import math


def _bez(p0, p1, p2, p3, n=40):
    out = []
    for i in range(n + 1):
        t = i / n
        a, b, c, d = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t * t, t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return out


def _taper(pts, w0, w1):
    L, R = [], []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        a, b = pts[max(i - 1, 0)], pts[min(i + 1, n - 1)]
        dx, dy = b[0] - a[0], b[1] - a[1]
        l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l
        w = (w0 + (w1 - w0) * (i / (n - 1)) ** 0.8) / 2
        L.append((x + nx * w, y + ny * w))
        R.append((x - nx * w, y - ny * w))
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in L + R[::-1]) + "Z"


def _branch(parent, t, d):
    x, y = _bez(*parent, n=200)[int(t * 200)]
    return ((x, y), (x + d[0][0], y + d[0][1]), (x + d[1][0], y + d[1][1]), (x + d[2][0], y + d[2][1]))


def _mirror(b):
    return tuple((200 - x, y) for x, y in b)


_P = ((100, 112), (86, 116), (68, 128), (52, 152))   # primary: sweeps down-out, echoing the roof pitch
_S = ((100, 113), (93, 124), (86, 142), (84, 170))   # secondary: steeper
_H = ((99, 112), (86, 113), (68, 114), (44, 121))    # shallow surface root
_T = ((100, 111), (101, 132), (98, 154), (100, 182))  # taproot
_ROOTS = [(_T, 7.5, 1.2)]
for _b, _w0, _w1 in [
    (_P, 6.2, 1.0), (_S, 4.6, 0.9), (_H, 3.4, 0.7),
    (_branch(_P, 0.55, ((-8, 1), (-14, 6), (-20, 16))), 2.6, 0.6),
    (_branch(_S, 0.6, ((-5, 4), (-10, 10), (-12, 18))), 2.0, 0.5),
    (_branch(_H, 0.6, ((-4, 5), (-8, 9), (-14, 12))), 1.8, 0.5),
]:
    _ROOTS += [(_b, _w0, _w1), (_mirror(_b), _w0, _w1)]
ROOTS_D = " ".join(_taper(_bez(*b), w0, w1) for b, w0, w1 in _ROOTS)
HOUSE_D = "M58 92 L100 55 L142 92 L132 92 L132 111 L68 111 L68 92 Z"
LEAF_D = "M100 111 C88 102 89 91 100 82 C111 91 112 102 100 111Z"
MARK_VIEW = (14, 14, 172, 172)  # x, y, w, h
_uid = [0]


def mark(variant="color"):
    """variant: color | dark | flat | mono"""
    _uid[0] += 1
    u = f"rr{_uid[0]}"
    mono = variant == "mono"
    dark = variant == "dark"
    flat = variant in ("flat", "mono")
    sky = "none" if mono else (INK if dark else CREAM)
    ring = CREAM if dark else INK
    earth = INK if not dark else "#2a2420"
    sun = INK if mono else (TERRA if flat else f"url(#{u}s)")
    roots = CREAM if mono else (TERRA_LIT if flat else f"url(#{u}r)")
    house = CREAM if (dark or mono) else INK
    leaf = INK if mono else ("#F2C38B" if flat else f"url(#{u}g)")
    wick = CREAM if mono else TERRA
    rings = "" if mono else (
        f'<circle cx="100" cy="111" r="69" fill="none" stroke="{TERRA}" stroke-width="1.2" opacity="0.55"/>'
        f'<circle cx="100" cy="111" r="77" fill="none" stroke="{TERRA}" stroke-width="1" opacity="0.3"/>')
    glow = "" if flat else f'<ellipse cx="100" cy="112" rx="46" ry="22" fill="url(#{u}h)"/>'
    return f"""
  <defs>
    <clipPath id="{u}c"><circle cx="100" cy="100" r="84"/></clipPath>
    <radialGradient id="{u}s" cx="100" cy="112" r="62" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F2B98C"/><stop offset="0.55" stop-color="#D9875F"/><stop offset="1" stop-color="#B5694A"/></radialGradient>
    <linearGradient id="{u}r" x1="0" y1="110" x2="0" y2="182" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F6CD96"/><stop offset="1" stop-color="#B5694A"/></linearGradient>
    <radialGradient id="{u}g" cx="100" cy="104" r="16" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF6E4"/><stop offset="1" stop-color="#F2B66F"/></radialGradient>
    <radialGradient id="{u}h" cx="100" cy="112" r="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#E9A36F" stop-opacity="0.38"/><stop offset="1" stop-color="#E9A36F" stop-opacity="0"/></radialGradient>
  </defs>
  <g clip-path="url(#{u}c)">
    <rect x="0" y="0" width="200" height="111" fill="{sky}"/>
    <circle cx="100" cy="111" r="60" fill="{sun}"/>{rings}
    <rect x="0" y="111" width="200" height="100" fill="{earth}"/>{glow}
    <path d="{ROOTS_D}" fill="{roots}"/>
  </g>
  <path d="{HOUSE_D}" fill="{house}"/>
  <path d="{LEAF_D}" fill="{leaf}"/>
  <path d="M100 110 V97" stroke="{wick}" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="84" fill="none" stroke="{ring}" stroke-width="3"/>"""


def svg(w, h, body, bg=None, view=None):
    vb = view or (0, 0, w, h)
    rect = f'<rect x="{vb[0]}" y="{vb[1]}" width="{vb[2]}" height="{vb[3]}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:.0f}" height="{h:.0f}" '
            f'viewBox="{vb[0]} {vb[1]} {vb[2]:.2f} {vb[3]:.2f}" role="img" aria-label="Root &amp; Rise Constructions">'
            f"{rect}{body}\n</svg>\n")


def wordmark(ink, accent, sub):
    """'Root & Rise' over justified 'CONSTRUCTIONS'. Returns (svg body, width, height) at origin."""
    size = 64
    d1, w1 = text_path("Root", FRAUNCES, size, {"wght": 620, "opsz": 144}, -0.022)
    da, wa = text_path("&", FRAUNCES_I, size, {"wght": 380, "opsz": 144})
    d2, w2 = text_path("Rise", FRAUNCES, size, {"wght": 620, "opsz": 144}, -0.022)
    gap = size * 0.16
    total = w1 + gap + wa + gap + w2
    cap = size * 0.70  # approx cap height above baseline
    base = cap
    body = (f'<path transform="translate(0 {base:.2f})" d="{d1}" fill="{ink}"/>'
            f'<path transform="translate({w1 + gap:.2f} {base:.2f})" d="{da}" fill="{accent}"/>'
            f'<path transform="translate({w1 + gap + wa + gap:.2f} {base:.2f})" d="{d2}" fill="{ink}"/>')
    # CONSTRUCTIONS justified to the wordmark width
    ssize = 13.5
    letters = "CONSTRUCTIONS"
    _, wn = text_path(letters, INTER, ssize, None, 0)
    track = (total - wn) / (len(letters) - 1) / ssize
    ds, ws = text_path(letters, INTER, ssize, None, track)
    sy = base + 34
    body += f'<path transform="translate(0 {sy:.2f})" d="{ds}" fill="{sub}"/>'
    return body, total, sy + 2


def lockup_horizontal(ink, accent, sub, variant="color", bg=None):
    mh = 136  # rendered mark height
    k = mh / MARK_VIEW[3]
    mw = MARK_VIEW[2] * k
    wb, ww, wh = wordmark(ink, accent, sub)
    pad = 24
    gx = mw + 34
    H = mh + pad * 2
    wy = pad + (mh - wh) / 2 - 6
    body = (f'<g transform="translate({pad} {pad}) scale({k:.4f}) translate({-MARK_VIEW[0]} {-MARK_VIEW[1]})">'
            f"{mark(variant)}</g>"
            f'<g transform="translate({pad + gx:.2f} {wy:.2f})">{wb}</g>')
    W = pad + gx + ww + pad
    return svg(W, H, body, bg)


def lockup_stacked(ink, accent, sub, variant="color", bg=None):
    mh = 150
    k = mh / MARK_VIEW[3]
    mw = MARK_VIEW[2] * k
    wb, ww, wh = wordmark(ink, accent, sub)
    pad = 32
    W = max(mw, ww) + pad * 2
    body = (f'<g transform="translate({(W - mw) / 2:.2f} {pad}) scale({k:.4f}) translate({-MARK_VIEW[0]} {-MARK_VIEW[1]})">'
            f"{mark(variant)}</g>"
            f'<g transform="translate({(W - ww) / 2:.2f} {pad + mh + 26:.2f})">{wb}</g>')
    return svg(W, pad + mh + 26 + wh + pad, body, bg)


def write(name, content):
    with open(os.path.join(HERE, name), "w") as f:
        f.write(content)
    print("wrote", name)


if __name__ == "__main__":
    vw = MARK_VIEW
    write("mark.svg", svg(vw[2] * 3, vw[3] * 3, mark("color"), view=vw))
    write("mark-reversed.svg", svg(vw[2] * 3, vw[3] * 3, mark("dark"), bg=INK, view=vw))
    write("mark-flat.svg", svg(vw[2] * 3, vw[3] * 3, mark("flat"), view=vw))
    write("mark-mono.svg", svg(vw[2] * 3, vw[3] * 3, mark("mono"), view=vw))
    write("favicon.svg", svg(64, 64, mark("flat"), view=vw))
    write("logo-horizontal.svg", lockup_horizontal(INK, TERRA, SAGE))
    write("logo-horizontal-reversed.svg", lockup_horizontal(CREAM, TERRA_LIT, "#B9C2A8", "dark", bg=INK))
    write("logo-stacked.svg", lockup_stacked(INK, TERRA, SAGE))
    write("logo-stacked-reversed.svg", lockup_stacked(CREAM, TERRA_LIT, "#B9C2A8", "dark", bg=INK))
