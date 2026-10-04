# Paolo Bonaccorsi, real estate site

Static one-page site for Paolo Bonaccorsi, California real estate salesperson serving Fremont and the East Bay. Hosted on GitHub Pages. No build step: `index.html` plus favicons.

## Design system

This site uses the shared Paolo Bonaccorsi design system, "re" flavor.

| Source | Path |
|---|---|
| Local copy (always read this first) | `design/tokens.css`, `design/components.css`, `design/components/TitleBlock/README.md` |

The files in design/ are a trimmed copy of the design system containing only this site's flavor. Missing files, missing other-flavor rules and comment differences are intentional. Stop and ask only if a token value or a rule this site uses differs from the live system.

## Rules

Link `design/tokens.css` and `design/components.css` from `index.html`, and set `data-flavor="re"` on `<body>`. Load fonts from Google Fonts: Public Sans, weights 400 to 700.

Use only `re-` tokens through the shared roles (`--paper`, `--surface`, `--surface-2`, `--ink`, `--ink-soft`, `--ink-faint`, `--rule`, `--accent`, `--on-accent`). Do not add new colours, fonts, font sizes, spacing values or radii. Use the type classes `re-display`, `re-h2`, `re-h3`, `re-body`, `re-figure`, `re-small`. Put every licence number, price and measurement in `re-figure`.

Radius follows meaning: `radius-0` for records and tables, `radius-sm` for buttons and inputs, `radius-md` for panels and image frames. No box shadows; depth comes from stepping paper, surface, surface-2.

The TitleBlock component (`design/components/TitleBlock`) must appear on every page, at minimum in the footer: Paolo Bonaccorsi, CA DRE #02339106; responsible broker American United Mortgage Corp, CA DRE #01864229; both numbers link to the DRE public lookup. Never remove or shorten it. The ridge mark is `favicon.svg`.

Buttons use `btn btn-primary` and `btn btn-secondary`, sentence case, labels that name what happens, no arrows.

## Retired patterns, do not reintroduce

Cream background, Fraunces or any serif display, bronze accent. Uppercase tracked labels above headings. Numbered markers on things that are not steps. Fade-up scroll reveals, the scroll progress bar, gradient washes, the blurred sticky header.

## Voice

First person singular, plain and specific, sentence case. Keep existing copy unless asked. Never mention Paolo's other businesses on this site.

## Workflow

Before committing, open `index.html` locally and check light and dark at 390px and 1280px widths. Keep keyboard focus visible and respect reduced motion. Do not push without Paolo's go-ahead.
