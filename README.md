# Paolo Bonaccorsi, Real Estate

The website for Paolo Bonaccorsi, a real estate salesperson serving Fremont and
the East Bay.

**Live:** https://somehippie.github.io/paolo-bonaccorsi-re/

## About

A single-page static site built on the shared Paolo Bonaccorsi design system,
"re" flavor. Its character comes from the East Bay itself: drafting film,
survey ink and the gold of the hills in summer.

| | |
|---|---|
| Typeface | Public Sans, the US civic typeface, with tabular figures for licence numbers |
| Ground | Faceplate grey in light, charcoal in dark, shared with the Small Tech LLC site |
| Accent | A sky blue taken from the Small Tech LLC hero photo, darkened for contrast in light mode; used for links, the primary button and the focus ring |
| Mark | The ridge line in summer-hills gold (`favicon.svg`), used only for the mark |
| Signature component | The TitleBlock: the licence and broker disclosure, drawn like the title block on a survey drawing |

Corners follow meaning: square for records like the TitleBlock, 3px for buttons,
6px for panels. There are no shadows; depth comes from stepping paper, surface
and surface-2.

## Licensing disclosure

The site carries the required California DRE disclosures:

- Paolo Bonaccorsi, DRE #02339106
- American United Mortgage Corp, DRE #01864229

Both numbers link to the DRE public lookup, in the top bar and in the TitleBlock
in the footer. If either number or the brokerage affiliation changes, update
`index.html` and redeploy. These are regulatory details, not decorative copy.

## Stack

No build step, no dependencies, no framework. One HTML file plus the design
system's stylesheets, and a few lines of inline script for the theme switch.

| | |
|---|---|
| Fonts | Public Sans, via Google Fonts |
| Hosting | GitHub Pages, deployed from `main` at root |
| Theming | CSS custom properties, light and dark, following the system preference; a switch in the masthead overrides it, remembered in `localStorage` |

## Structure

```
index.html               the site: markup and page layout
design/tokens.css        design system tokens and type styles (generated, do not edit)
design/components.css    flavor roles, Button and TitleBlock styles
design/components/       usage notes and examples for Button and TitleBlock
```

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
minimum in both themes. Keyboard focus shows a solid 2px sky-blue outline.
The page has no scroll animations, so there is no motion to reduce.

## v2 preview

**Preview:** https://somehippie.github.io/paolo-bonaccorsi-re/v2/ (hidden from search engines; the homepage above is unchanged)

A next-generation version of the same page, built on the same design system: no new colours, fonts, sizes, spacing values or radii, no shadows, gradients or scroll effects. Everything is static and runs in the visitor's browser. Nothing a visitor types leaves the page.

| Addition | What it does |
|---|---|
| Fremont is five towns | A survey-style schematic map of the five towns that became Fremont in 1956. Each label is a button; picking one draws its outline and shows sourced facts. That outline is the page's one motion moment, and it respects reduced motion. |
| Run the numbers | Buying (monthly cost) and selling (estimated proceeds) calculators, shareable links (`#numbers?...`), save-to-compare, and print layouts that carry the DRE disclosures. |
| Where the market stood | A dated, sourced snapshot: C.A.R. county and regional figures, Freddie Mac rates. |
| How it works now | The post-2024 path for buyers and sellers, including the written buyer agreement, with checklists saved in the visitor's browser. |
| Contact | Writes the email in the visitor's own mail app, with an optional link to their calculator numbers. |
| Under the hood | JSON-LD (`RealEstateAgent`), an Open Graph image generated from the ridge mark (`v2/og.py`), a skip link, no-JavaScript fallbacks, and a custom 404 page ready for promotion (`v2/404.html`). |

### Promote v2 to the homepage

```
python v2/promote.py
```

It copies the v2 files to the root, rewrites the `../` paths, removes the preview's noindex line and points the link-preview image at the root. Then check `index.html` at 390px and 1280px in light and dark, delete `v2/`, and commit.

### Refresh the market snapshot monthly

| What | Where it lives | Source |
|---|---|---|
| Alameda County and Bay Area medians, county sales change, California days to sell | `.snapshot` in `v2/index.html` | C.A.R. monthly Home Sales and Price Report, county table |
| 30- and 15-year rates | `.snapshot`, the rate field and its help text in `v2/index.html`, `RATES` in `v2/site.js` | Freddie Mac Primary Mortgage Market Survey, weekly |
| Example price | `b-price` and `s-price` values and their help text | The same C.A.R. county median |
| Property tax default | `b-tax` value and help text | Alameda County rate for tax rate area 12-013, new each fiscal year |

Change the "Updated" date in the snapshot when you do.

### If the brokerage changes

Update the broker's name and DRE number in the disclosure bar, the masthead lockup, the About paragraph, the Financing context card, the TitleBlock, the JSON-LD block and `404.html`, and update both DRE lookup links. A new palette goes in `design/tokens.css`, which is generated from the design kit.

### How this was built

Designed and built by Claude Opus 5.5 (Anthropic) in a Cowork session on November 27, 2026, from Paolo's brief, the design system, and a research pass: 2026 agent-site patterns, DRE advertising guidelines (RE 27), MLO endorsement rules, AB 2992 and the NAR practice changes, fair-housing language, and Fremont's history. The credit lives here rather than on the page, so a later model's refresh can be compared against the same baseline.

Baseline, measured locally in Chromium:

| | Live homepage | v2 |
|---|---|---|
| HTML, page CSS and JS, gzipped | 4.1 KB | 25.4 KB |
| Requests, excluding font files | 6 | 8 |
| Cumulative layout shift | 0 | 0 |
| DOM elements | 109 | 837 |
| Page height at 390px | 3,797 px | 11,715 px |
| Colour pairs below WCAG AA | 0 | 0 |
| Console errors | 0 | 0 |

## Rights

Copyright Paolo Bonaccorsi. All rights reserved.

This repository is public so the site can be served by GitHub Pages. That is not
an invitation to reuse the design or copy.
