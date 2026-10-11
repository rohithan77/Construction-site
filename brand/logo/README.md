# Root & Rise — logo

`brand-board.png` / `brand-board.html` explain the concept: the mark is a seed made of an
house in front of a rising sun, roots spreading below the horizon, and a glowing
leaf-shaped doorway (a lamp lit inside).

| File | Use |
|---|---|
| `logo-horizontal.svg` / `-reversed.svg` | Website header, letterheads, signage |
| `logo-stacked.svg` / `-reversed.svg` | Square spaces, social profile banners, end cards |
| `mark.svg`, `mark-reversed.svg`, `mark-flat.svg`, `mark-mono.svg` | The symbol on its own (`flat` for print without gradients, `mono` for embossing, engraving and single-colour print) |
| `favicon.svg` | Browser tab / app icon. Flat colours (no gradients) so it stays crisp at 16 px |

All text is converted to outlines, so the SVGs need no fonts installed.
Rebuild with `python3 brand/logo/build_logo.py` (needs `fonttools brotli uharfbuzz`).
