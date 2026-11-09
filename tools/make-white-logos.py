"""Makes the white, transparent logo versions used on the black site.
Run: python -I tools/make-white-logos.py  (needs Pillow)
Inputs (tools/logo-src/, not shipped): cambridge.png, cristorey-wordmark-white.png; marietta.svg is read from public/img/logos.
- marietta.svg  -> public/img/logos/marietta-white.svg (every fill turned white)
- cambridge.png -> public/img/logos/cambridge-white.png (white, opacity follows how dark each pixel was, so the crest keeps its detail)
- cristorey-wordmark-white.png -> public/img/logos/cristorey-white.png (already white on transparent, copied as is)"""
import re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "logo-src"
OUT = ROOT / "public" / "img" / "logos"

svg = (OUT / "marietta.svg").read_text(encoding="utf-8")
svg = re.sub(r"fill:#[0-9a-fA-F]{3,6}", "fill:#ffffff", svg)
(OUT / "marietta-white.svg").write_text(svg, encoding="utf-8")


def white_from_darkness(name: str) -> None:
    im = Image.open(SRC / f"{name}.png").convert("RGBA")
    px = im.load()
    out = Image.new("RGBA", im.size, (255, 255, 255, 0))
    op = out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
            op[x, y] = (255, 255, 255, round(a * (1 - 0.7 * lum)))
    out.save(OUT / f"{name}-white.png")


white_from_darkness("cambridge")
(OUT / "cristorey-white.png").write_bytes((SRC / "cristorey-wordmark-white.png").read_bytes())
