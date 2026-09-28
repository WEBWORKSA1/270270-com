# 270270.com: 270270 · Number Lab

**Decode the luck in any number.** This is a free, static and responsive platform on Chinese number meanings. It is monetised with AdSense, YouTube, B2B lead generation, donations, sponsorships and contests.

- **Live (GitHub Pages):** https://webworksa1.github.io/270270-com/
- **Research & idea selection:** [docs/RESEARCH.md](docs/RESEARCH.md)
- **Competitor audit (31 sites):** [docs/COMPETITOR-AUDIT.md](docs/COMPETITOR-AUDIT.md)
- **Phase-wise build prompt:** [docs/BUILD-PROMPT.md](docs/BUILD-PROMPT.md)

## How it's built and deployed
The `main` branch holds the **sources**. On every push, the GitHub Actions workflow `.github/workflows/deploy.yml` does two things:
1. It runs `python3 tools/build.py`, which renders every page with the shared layout and generates 70+ `n/<number>.html` pages, `assets/js/data.js` and `sitemap.xml`.
2. It publishes the result to the **`gh-pages`** branch, which GitHub Pages serves on the free plan.

## Structure
| Path | What it contains |
|---|---|
| `tools/pages/**.html` | Page content fragments (edit these) |
| `tools/numbers.json` | Digit meanings and 70+ dictionary entries (the source for `n/*.html`) |
| `tools/build.py` | Generator: layout, number pages, `data.js`, sitemap |
| `assets/js/config.js` | **Settings:** AdSense, payment links, YouTube channel, fundraising goal, FormSubmit alias |
| `assets/js/engine.js` | Scoring engine (decoder, price finder, lunar/zodiac, date finder) |
| `assets/js/app.js` | UI: forms, donations, ads, videos, tools |

## Go-live checklist
1. **Forms:** submit any form once. FormSubmit.co then emails an activation link to the site inbox; click it. Optionally paste the random alias it gives you into `FORM_ALIAS` in `config.js`.
2. **AdSense:** after approval, set `ADSENSE_CLIENT` in both `tools/build.py` and `assets/js/config.js`, and fill `ads.txt`.
3. **Payments:** PayPal Donate works out of the box. Add Ko-fi, Buy Me a Coffee, Stripe or GitHub Sponsors links in `config.js` as needed.
4. **YouTube:** set `YOUTUBE_CHANNEL` in `config.js`.
5. **Custom domain:**
   - At the registrar, add A records for `@` pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153.
   - Add a CNAME record for `www` pointing to `webworksa1.github.io`.
   - Add a file `CNAME` containing `270270.com` to the repo root, then in Settings → Pages tick "Enforce HTTPS".
6. Submit `sitemap.xml` to Google Search Console.

## Privacy of the contact inbox
The owner's email address is never written in plain text in any file. It is stored as shifted char codes in `config.js` and decoded only at submit or click time.

## Legal
© 270270.com. All rights reserved. See `legal.html` for the trademark and copyright disclosure. "270270" is used only as a domain and site name; no rights are claimed in the number itself.
