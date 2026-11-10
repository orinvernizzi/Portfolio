"""PNG screenshots (1500x900) of the Catch Analysis web app -> public/diagrams/catch.<lang>.webp.
The shots come from the app's own dev-only demo mode (/?demo, invented in-memory data, no account),
see capture.md. Usage: python tools/catch-mock/to-webp.py <folder with catch-en.png and catch-es.png>
"""
import os
import sys

from PIL import Image

src = sys.argv[1]
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
for lang in ('en', 'es'):
    im = Image.open(os.path.join(src, f'catch-{lang}.png')).convert('RGB')
    assert im.size == (1500, 900), im.size
    out = os.path.join(root, 'public', 'diagrams', f'catch.{lang}.webp')
    for q in (82, 78, 74, 70):
        im.save(out, 'WEBP', quality=q, method=6)
        size = os.path.getsize(out)
        if size < 150_000:
            break
    print(lang, 'quality', q, size, 'bytes')
