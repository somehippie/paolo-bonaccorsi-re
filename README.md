# Paolo Bonaccorsi, Real Estate

The website for Paolo Bonaccorsi, a real estate salesperson serving Fremont and
the East Bay.

**Live:** https://somehippie.github.io/paolo-bonaccorsi-re/

## About

A single-page static site. The design is the deliberate counterpart to
[small-tech-llc](https://github.com/somehippie/small-tech-llc): where that site
runs cool and engineered, this one runs warm and grounded. Same token
architecture and the same contrast standard, opposite temperature and opposite
typographic voice.

| | Small Tech | This site |
|---|---|---|
| Temperature | cool blue-grey | warm sand |
| Display face | Archivo grotesque | Fraunces serif |
| Body face | Inter | Source Sans 3 |
| Accent | pine green | bronze |

## Licensing disclosure

The site carries the required California DRE disclosures:

- Paolo Bonaccorsi, DRE #02339106
- American United Mortgage Corp, DRE #01864229

If either number or the brokerage affiliation changes, update `index.html` and
redeploy. These are regulatory details, not decorative copy.

## Stack

No build step, no dependencies, no framework. One HTML file with inline CSS and
JavaScript.

| | |
|---|---|
| Fonts | Fraunces, Source Sans 3, via Google Fonts |
| Hosting | GitHub Pages, deployed from `main` at root |
| Theming | CSS custom properties, light and dark, following the system preference |

## Structure

```
index.html   entire site: markup, styles, scripts
```

The hero art is an inline SVG contour illustration of the Fremont hills. It is
marked in the source as a placeholder for a professional headshot.

## Local development

Open `index.html` in a browser.

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

Pages rebuilds automatically on every push to `main`. A deploy takes roughly
thirty seconds. The CDN caches for ten minutes, so hard-refresh when verifying a
change.

## Accessibility

Every text colour is checked against its background and meets WCAG AA at
minimum, most reaching AAA. Decorative elements such as the contour strokes and
the progress bar are held to the 3:1 threshold that non-text graphics require.

## Rights

Copyright Paolo Bonaccorsi. All rights reserved.

This repository is public so the site can be served by GitHub Pages. That is not
an invitation to reuse the design or copy.
