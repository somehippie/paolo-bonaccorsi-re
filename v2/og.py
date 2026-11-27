"""Generates og.png (1200x630), the link-preview image, from the same ridge profile as
../favicon.py, so the mark and the preview can't drift. Run: python og.py  (needs Pillow)

The favicon frames the ridge in a 32-unit square. The preview widens that window to the
left and lets Mission Peak's west flank (a straight line of slope 1/phi) run on until it
meets the bottom edge. Mission's summit sits on the vertical golden section, 1/phi of the
way across, and the ridge keeps the favicon's height, so the mark reads the same at
1200 px as at 16 px. No text: the page title and description carry the words.
"""
import importlib.util, pathlib
from PIL import Image, ImageDraw

HERE = pathlib.Path(__file__).resolve().parent
FAV = HERE / 'favicon.py' if (HERE / 'favicon.py').exists() else HERE.parent / 'favicon.py'
spec = importlib.util.spec_from_file_location('favicon', FAV)
fav = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fav)          # defines RIDGE from KEYS; writes nothing

W, H = 1200, 630
U, PHI = fav.U, fav.PHI
S = H / U                              # px per design unit (the full 32-unit height)
g = U / PHI ** 2                       # summit x and y in design units (golden section)

# Window: summit at W/phi across the image.
x0 = g - (W / S) / PHI                 # left edge of the window, in design units
x1 = x0 + W / S                        # right edge

# Profile from the favicon, minus its closing corners.
line = [p for p in fav.RIDGE if p[1] <= U]
line = [p for p in line if p[0] >= 0]  # keep the traced part, from the summit side
# West flank: the favicon's straight line of slope 1/phi, extended to the bottom edge.
flank = []
d = 0.0
while True:
    x, y = g - d, g + d / PHI
    if y > U or x < x0 - 1:
        break
    flank.append((x, y))
    d += 0.25
flank.reverse()
# East end: continue the last segment's slope to the right edge of the window.
(xa, ya), (xb, yb) = line[-2], line[-1]
slope = (yb - ya) / (xb - xa)
tail = [(xb + t, yb + slope * t) for t in (2, 4, 6) if xb + t <= x1 + 1]
pts = [p for p in flank if p[0] < line[0][0]] + line + tail + [(x1 + 1, tail[-1][1] if tail else yb)]
poly = pts + [(x1 + 1, U + 1), (pts[0][0], U + 1)]

big = 2
im = Image.new('RGB', (W * big, H * big), fav.BG)
ImageDraw.Draw(im).polygon([((x - x0) * S * big, y * S * big) for x, y in poly], fill=fav.FG)
im = im.resize((W, H), Image.LANCZOS)
im.save(HERE / 'og.png', optimize=True)
print('og.png', im.size, 'summit at x =', round((g - x0) * S), 'px')
