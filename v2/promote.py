"""Promote the v2 preview to the site root. Run from the repository root:

    python v2/promote.py

Copies the v2 page files to the root, rewrites the ../ paths, removes the preview's
noindex line, and points og:image at the root copy. It overwrites the root index.html
(git history keeps the old one) and leaves v2/ in place, so you can check the result
locally before deleting v2/ and committing.
"""
import pathlib, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
V2 = ROOT / 'v2'

html = (V2 / 'index.html').read_text(encoding='utf-8')

# Guard: the root page may have gained services (or other headings) since v2 was built.
# Refuse to overwrite them silently; carry them into v2/index.html first.
import re
def headings(text):
    return {re.sub(r'\s+', ' ', h).strip() for h in re.findall(r'<h3[^>]*>(.*?)</h3>', text, re.S)}
missing = headings((ROOT / 'index.html').read_text(encoding='utf-8')) - headings(html)
if missing and '--force' not in sys.argv:
    sys.exit('promote.py: the root page has headings v2 lacks: ' + ', '.join(sorted(missing))
             + '\nAdd them to v2/index.html (or rerun with --force if they were removed on purpose).')
preview_lines = ('<!-- Preview build. Remove this line when promoting v2 to the site root. -->\n'
                 '<meta name="robots" content="noindex">\n')
if preview_lines not in html:
    sys.exit('promote.py: the noindex block is missing or edited; check v2/index.html by hand.')
html = html.replace(preview_lines, '')
for old, new in [('../design/', 'design/'), ('../favicon', 'favicon'), ('../apple-touch-icon', 'apple-touch-icon'),
                 ('../hills', 'hills'), ('/paolo-bonaccorsi-re/v2/og.png', '/paolo-bonaccorsi-re/og.png')]:
    html = html.replace(old, new)
if '../' in html:
    sys.exit('promote.py: a ../ path is left in index.html; fix it before promoting.')

(ROOT / 'index.html').write_text(html, encoding='utf-8', newline='\n')
for name in ('site.css', 'site.js', 'og.png', 'og.py', '404.html'):
    shutil.copy2(V2 / name, ROOT / name)
print('Promoted. Open index.html at 390px and 1280px in light and dark, then delete v2/ and commit.')
