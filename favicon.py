"""Generates favicon.svg, favicon.ico (16/32/48) and apple-touch-icon.png from
one polygon, so the three can't drift. Run: python favicon.py  (needs Pillow)

Mark: the Mission Peak ridge as seen from Lake Elizabeth, central Fremont
(37.5475, -121.9660), looking east-southeast. Left to right: Mission Peak
(2,520 ft, 8.5 km away), the saddle (~2,310 ft), then Mount Allison
(2,664 ft, 9.95 km) as the lower second summit; Monument Peak is only a
shoulder further right. Allison is the tallest, but it looks lower than
Mission from Fremont because it's farther away.

KEYS are (azimuth, elevation angle) in degrees along the skyline, traced
through the USGS 3DEP elevation grid with earth curvature and standard
refraction: Mission's summit, the saddle, Allison, and the right flank
(smoothed over 1 degree) running past the edge so the hill leaves the frame.
That part gets one vertical exaggeration, VE.

Composition: Mission's summit sits at (U/phi^2, U/phi^2), so the mark height
is U/phi and the summit is on the golden section. Its west flank is drawn,
not traced: a straight, shallow line of slope 1/phi that starts past the
left edge. A monotone cubic joins everything, so nothing overshoots the
summits.
Colours: the site's bronze (#D2A662 on #17140F) moved halfway toward
Realty ONE Group's gold #C5A95E and black #000000.
"""
from PIL import Image, ImageDraw

PHI = (1 + 5 ** 0.5) / 2
U = 32                      # design box, px at 32x32
BG, FG = "#0C0A08", "#CCA860"
VE = 4                      # vertical exaggeration, applied to the whole profile
FRAME = 15.5                # degrees of azimuth across the icon
RADIUS = 0.2                # corner radius as a fraction of the size

KEYS = [
    (117.3, 5.020),         # Mission Peak
    (119.9, 4.273),         # saddle
    (122.7, 4.516),         # Mount Allison
    (127.0, 3.962), (131.0, 3.367), (135.0, 2.417),
]


def pchip(xs, ys, steps=48):
    """Monotone cubic through the points: no overshoot past a summit."""
    d = [(ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]) for i in range(len(xs) - 1)]
    m = [d[0]] + [0 if d[i - 1] * d[i] <= 0 else 2 / (1 / d[i - 1] + 1 / d[i])
                  for i in range(1, len(d))] + [d[-1]]
    out = []
    for i in range(len(d)):
        h = xs[i + 1] - xs[i]
        for j in range(steps):
            t = j / steps
            out.append((xs[i] + t * h,
                        (2 * t ** 3 - 3 * t ** 2 + 1) * ys[i] + (t ** 3 - 2 * t ** 2 + t) * h * m[i]
                        + (3 * t ** 2 - 2 * t ** 3) * ys[i + 1] + (t ** 3 - t ** 2) * h * m[i + 1]))
    return out + [(xs[-1], ys[-1])]


def ridge():
    summit = KEYS[0]
    h = U / FRAME                               # units per degree of azimuth
    g = U / PHI ** 2                            # golden section: summit x and y
    az0 = summit[0] - g / h
    pts = [((a - az0) * h, g + (summit[1] - e) * h * VE) for a, e in KEYS]
    # west flank: a straight line of slope 1/phi, starting past the left edge
    flank = [(g - d, g + d / PHI) for d in (g + 6, g, g * 0.6, g * 0.25)]
    pts = flank + pts
    line = pchip([x for x, _ in pts], [y for _, y in pts])
    line = [p for p in line if -2 <= p[0] <= U + 2]
    return line + [(line[-1][0], U + 1), (line[0][0], U + 1)]


RIDGE = ridge()


def svg():
    pts = " ".join(f"{x:.3f},{y:.3f}" for x, y in RIDGE)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {U} {U}">\n'
            f'<clipPath id="c"><rect width="{U}" height="{U}" rx="{U * RADIUS:g}"/></clipPath>\n'
            f'<g clip-path="url(#c)">\n'
            f'<rect width="{U}" height="{U}" fill="{BG}"/>\n'
            f'<polygon points="{pts}" fill="{FG}"/>\n'
            f'</g>\n</svg>\n')


def raster(px, rounded=True):
    big = px * 16
    f = big / U
    im = Image.new("RGBA", (big, big), BG)
    ImageDraw.Draw(im).polygon([(x * f, y * f) for x, y in RIDGE], fill=FG)
    if rounded:
        mask = Image.new("L", (big, big), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, big - 1, big - 1), radius=RADIUS * big, fill=255)
        im.putalpha(mask)
    return im.resize((px, px), Image.LANCZOS)


if __name__ == "__main__":
    with open("favicon.svg", "w", newline="\n") as fh:
        fh.write(svg())
    icons = [raster(s) for s in (16, 32, 48)]
    icons[2].save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[:2])
    # iOS masks the corners itself, so the touch icon is full-bleed
    raster(180, rounded=False).convert("RGB").save("apple-touch-icon.png")
