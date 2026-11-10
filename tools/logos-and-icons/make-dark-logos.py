"""Builds on-black variants of the panel logos (transparent, no plate).

Run from the project root:  python -I tools/logos-and-icons/make-dark-logos.py
Needs Pillow. Sources stay untouched; outputs:
  public/logos/marietta-dark.svg  blue #00447b -> lighter tint of the same hue
  public/logos/cambridge-dark.png near-black pixels -> white, colours and alpha kept
The spiral cards keep using the originals (marietta.svg).
"""
from pathlib import Path
from PIL import Image

LOGOS = Path("public/logos")
MARIETTA_LIGHT = "#6db3ff"  # same hue family as #00447b, 8:1 on black

svg = (LOGOS / "marietta.svg").read_text(encoding="utf-8")
assert "#00447b" in svg
(LOGOS / "marietta-dark.svg").write_text(svg.replace("#00447b", MARIETTA_LIGHT), encoding="utf-8")

im = Image.open(LOGOS / "cambridge.png").convert("RGBA")
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a and max(r, g, b) < 90:  # dark ink only; red/gold crest stays
            px[x, y] = (255, 255, 255, a)
im.save(LOGOS / "cambridge-dark.png", optimize=True)
print("ok")
