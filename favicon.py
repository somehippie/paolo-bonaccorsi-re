"""Generates favicon.svg, favicon.ico (16/32/48) and apple-touch-icon.png from
one polygon, so the three can't drift. Run: python favicon.py  (needs Pillow)

Mark: Mission Peak from the Fremont side, a steep summit with the long
shoulder ridge running south. Peak height = icon width / phi.
Colours: the site's bronze (#D2A662 on #17140F) moved halfway toward
Realty ONE Group's gold #C5A95E and black #000000.
"""
from PIL import Image, ImageDraw

PHI = (1 + 5 ** 0.5) / 2
U = 32                      # design box, px at 32x32
BG, FG = "#0C0A08", "#CCA860"
APEX_Y = U - U / PHI        # 12.22: peak rises U/phi from the bottom edge
PEAK = [(-1, 32), (13, APEX_Y), (20, 20.5), (33, 25), (33, 32)]
RADIUS = 0.2                # corner radius as a fraction of the size


def svg():
    pts = " ".join(f"{x:.3f},{y:.3f}" for x, y in PEAK)
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
    ImageDraw.Draw(im).polygon([(x * f, y * f) for x, y in PEAK], fill=FG)
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
