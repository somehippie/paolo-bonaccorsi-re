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
| Ground | Drafting-film white in light, cyanotype blue in dark |
| Accent | Survey blue for links, the primary button and the focus ring |
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

No build step, no dependencies, no framework, no JavaScript. One HTML file plus
the design system's stylesheets.

| | |
|---|---|
| Fonts | Public Sans, via Google Fonts |
| Hosting | GitHub Pages, deployed from `main` at root |
| Theming | CSS custom properties, light and dark, following the system preference |

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
minimum in both themes. Keyboard focus shows a solid 2px survey-blue outline.
The page has no scroll animations, so there is no motion to reduce.

## Rights

Copyright Paolo Bonaccorsi. All rights reserved.

This repository is public so the site can be served by GitHub Pages. That is not
an invitation to reuse the design or copy.
