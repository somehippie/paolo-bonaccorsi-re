# Deploying these two sites (free, Cloudflare Pages)

Each folder is a standalone static site — one `index.html`, no build step. Repeat this per site.

## 1. Push to GitHub

```
cd small-tech-llc
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/somehippie/small-tech-llc.git
git push -u origin main
```

Do the same for `paolo-bonaccorsi-re`, with its own repo name (e.g. `paolo-bonaccorsi-re`) — create each empty repo on GitHub first (no README/license, so the push isn't rejected).

## 2. Connect to Cloudflare Pages

1. cloudflare.com → Workers & Pages → Create → Pages → Connect to Git
2. Pick the repo, leave build command blank, output directory `/`
3. Deploy — you get a free `*.pages.dev` URL immediately

## 3. Point a custom domain (once you have one)

Workers & Pages → your project → Custom domains → Add. If the domain is also on Cloudflare's registrar or DNS, this is a couple of clicks and propagates in minutes.

## Before either site goes live

- Small Tech LLC: swap `hello@smalltech.llc` for a real inbox you control
- Real estate: replace the photo slot with an actual headshot, and confirm with American United Mortgage Corp that the disclosure lockup and language are fine as written
