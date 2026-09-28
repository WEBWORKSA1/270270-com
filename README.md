# 270270.com: 270270 · Number Lab

**Decode the luck in any number.** This is a free, responsive platform on Chinese number meanings. It is monetised with AdSense, YouTube, B2B lead generation, donations, sponsorships and contests.

- **Live (GitHub Pages):** https://webworksa1.github.io/270270-com/
- **Research & idea selection:** [docs/RESEARCH.md](docs/RESEARCH.md)
- **Competitor audit (31 sites):** [docs/COMPETITOR-AUDIT.md](docs/COMPETITOR-AUDIT.md)
- **Phase-wise build prompt:** [docs/BUILD-PROMPT.md](docs/BUILD-PROMPT.md)

## How it's built and hosted (free)
GitHub Pages builds the site with **Jekyll** automatically, so there is no build step and no paid service.

- **Source:** `main` is the working branch. **GitHub Pages serves `gh-pages`**. To publish, open a pull request from `main` into `gh-pages` and merge it. Alternatively, switch *Settings → Pages → Source* to `main` / root and publish on every push.
- **Page content:** fragments live in `tools/pages/**.html`. Each root stub (e.g. `index.html`, `guide-*.html`) pulls its fragment in via `include_relative` and `_includes/frag.html`.
- **Programmatic number pages:** `n/<code>.html` are 3-line stubs rendered by `_layouts/number.html` from `_data/numbers.json`. **To add a number**, add an entry to `_data/numbers.json` and create `n/<code>.html` containing `code: "<code>"` in the front matter. `python3 tools/make_stubs.py` regenerates all the stubs.
- **Shell:** `_layouts/default.html` holds the header, footer, the required top contact bar, the cookie banner and the exit modal.

## Structure
| Path | What it contains |
|---|---|
| `tools/pages/**.html` | Page content fragments (edit these) |
| `_data/numbers.json` | Digit meanings and 70+ dictionary entries |
| `_layouts/`, `_includes/` | Jekyll templates |
| `assets/js/config.js` | **Settings:** AdSense, payment links, YouTube channel, fundraising goal, FormSubmit alias |
| `assets/js/engine.js` | Scoring engine (decoder, price finder, lunar/zodiac, date finder) |
| `assets/js/app.js` | UI: forms, donations, ads, videos, tools |
| `_config.yml` | Site settings: canonical URL, contact URL, AdSense ID, GA4, OG image |

## Go-live checklist
1. **Forms:** submit any form once. FormSubmit.co then emails an activation link to the site inbox; click it. Optionally paste the random alias it gives you into `FORM_ALIAS` in `config.js`.
2. **AdSense:** after approval, set `adsense_client` in `_config.yml` and `ADSENSE_CLIENT` in `assets/js/config.js`, and fill `ads.txt`.
3. **Payments:** PayPal Donate works out of the box. Add Ko-fi, Buy Me a Coffee, Stripe or GitHub Sponsors links in `config.js` as needed.
4. **YouTube:** set `YOUTUBE_CHANNEL` in `config.js`.
5. **Custom domain:**
   - At the registrar, add A records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153.
   - Add a CNAME record for `www` pointing to `webworksa1.github.io`.
   - In Settings → Pages → Custom domain, enter `270270.com`, then tick "Enforce HTTPS".
6. Submit `sitemap.xml` to Google Search Console.

## Privacy of the contact inbox
The owner's email address is never written in plain text in any site file. It is stored as shifted char codes in `config.js` and decoded only at submit or click time.

## Legal
© 270270.com. All rights reserved. See `legal.html` for the trademark and copyright disclosure. "270270" is used only as a domain and site name; no rights are claimed in the number itself.
