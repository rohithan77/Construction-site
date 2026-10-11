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
# Above the ground line: the arch (home / doorway / sanctum niche) and the leaf-flame
# (seed, life, the lamp lit inside), split by a sliver of light.
# Below: the same forms again in fine line, the foundation and the root. Together
# the silhouette closes into a seed.
MARK_VIEW = (40, 34, 120, 142)  # x, y, w, h


_uid = [0]


def mark(stroke=INK, accent=TERRA, slit=None, fine=None, simple=False):
    """`slit` is unused: the sliver of light is cut out with a mask so it works on any background."""
    fine = fine or accent
    _uid[0] += 1
    m = f"rr-light-{_uid[0]}"
    sw, top = (4, 72) if simple else (2, 75)
    base = 122 if simple else 118
    cut = (f'<mask id="{m}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">'
           f'<rect width="200" height="200" fill="#fff"/><path d="M100 {base + 1} V{top}" stroke="#000" stroke-width="{sw}"/></mask>')
    if simple:  # favicon / small sizes: heavier, no fine line
        return f"""
  <path d="M60 122 V80 A40 40 0 0 1 140 80 V122" fill="none" stroke="{stroke}" stroke-width="12"/>
  {cut}<path d="M100 50 C118 70 121 101 100 122 C79 101 82 70 100 50Z" fill="{accent}" mask="url(#{m})"/>
  <path d="M42 122 H158" stroke="{stroke}" stroke-width="6"/>"""
    return f"""
  <path d="M64 118 V78 A36 36 0 0 1 136 78 V118" fill="none" stroke="{stroke}" stroke-width="7"/>
  <path d="M64 118 V132 A36 36 0 0 0 136 132 V118" fill="none" stroke="{fine}" stroke-width="2"/>
  {cut}<path d="M100 55 C114.5 72 117.5 99 100 118 C82.5 99 85.5 72 100 55Z" fill="{accent}" mask="url(#{m})"/>
  <path d="M100 118 C109 128 111 142 100 154 C89 142 91 128 100 118Z M100 118 V168" fill="none" stroke="{fine}" stroke-width="2"/>
  <path d="M44 118 H156" stroke="{stroke}" stroke-width="2.5"/>"""


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


def lockup_horizontal(ink, accent, fine, sub, slit, bg=None):
    mh = 120  # rendered mark height
    k = mh / MARK_VIEW[3]
    mw = MARK_VIEW[2] * k
    wb, ww, wh = wordmark(ink, accent, sub)
    pad = 24
    gx = mw + 34
    H = mh + pad * 2
    wy = pad + (mh - wh) / 2 - 6
    body = (f'<g transform="translate({pad} {pad}) scale({k:.4f}) translate({-MARK_VIEW[0]} {-MARK_VIEW[1]})">'
            f"{mark(ink, accent, slit, fine)}</g>"
            f'<g transform="translate({pad + gx:.2f} {wy:.2f})">{wb}</g>')
    W = pad + gx + ww + pad
    return svg(W, H, body, bg)


def lockup_stacked(ink, accent, fine, sub, slit, bg=None):
    mh = 150
    k = mh / MARK_VIEW[3]
    mw = MARK_VIEW[2] * k
    wb, ww, wh = wordmark(ink, accent, sub)
    pad = 32
    W = max(mw, ww) + pad * 2
    body = (f'<g transform="translate({(W - mw) / 2:.2f} {pad}) scale({k:.4f}) translate({-MARK_VIEW[0]} {-MARK_VIEW[1]})">'
            f"{mark(ink, accent, slit, fine)}</g>"
            f'<g transform="translate({(W - ww) / 2:.2f} {pad + mh + 26:.2f})">{wb}</g>')
    return svg(W, pad + mh + 26 + wh + pad, body, bg)


def write(name, content):
    with open(os.path.join(HERE, name), "w") as f:
        f.write(content)
    print("wrote", name)


if __name__ == "__main__":
    vw = MARK_VIEW
    write("mark.svg", svg(vw[2] * 4, vw[3] * 4, mark(), view=vw))
    write("mark-reversed.svg", svg(vw[2] * 4, vw[3] * 4, mark(CREAM, TERRA_LIT, INK), bg=INK, view=vw))
    write("mark-mono.svg", svg(vw[2] * 4, vw[3] * 4, mark(INK, INK, CREAM), view=vw))
    write("favicon.svg", svg(64, 64, mark(INK, TERRA, CREAM, simple=True), bg=CREAM, view=(30, 26, 140, 140)))
    write("logo-horizontal.svg", lockup_horizontal(INK, TERRA, TERRA, SAGE, CREAM))
    write("logo-horizontal-reversed.svg", lockup_horizontal(CREAM, TERRA_LIT, TERRA_LIT, "#B9C2A8", INK, bg=INK))
    write("logo-stacked.svg", lockup_stacked(INK, TERRA, TERRA, SAGE, CREAM))
    write("logo-stacked-reversed.svg", lockup_stacked(CREAM, TERRA_LIT, TERRA_LIT, "#B9C2A8", INK, bg=INK))
