# Phase-wise build prompt for 270270.com (270270 · Number Lab)

You can paste each phase into an AI coding assistant in order. Phases 0 to 7 are implemented in this repository; phases 8 and 9 are the growth roadmap.

---

## Phase 0: Master context (paste first, every session)

> You are building **270270.com**, brand name **"270270 · Number Lab"**. It is an English-first, bilingual-flavoured (Chinese characters + pinyin) platform that decodes the cultural meaning and "luck" of any number in Chinese tradition. It covers phone numbers, car plates, prices, dates, addresses, and internet slang such as 520 and 666.
>
> **Audience:** the global Chinese diaspora (40–60 M), Mandarin learners, travellers, couples planning weddings, and businesses selling to Chinese consumers. **Do not target mainland China**, because AdSense and YouTube are blocked there.
>
> **Stack and hosting**
> - Static HTML5 + CSS + vanilla JS, with no framework and no build server required.
> - Hosted free on **GitHub Pages** (repo `webworksa1/270270-com`).
> - All paths must be **relative**, so the site works at both `webworksa1.github.io/270270-com/` and `270270.com`.
> - A small Python generator (`tools/build.py`) renders shared header/footer and programmatic number pages. A GitHub Actions workflow runs it and publishes to the `gh-pages` branch.
>
> **Global rules**
> 1. On top of **every page**, show a slim bar: "Contact, if you are interested in this website / domain name / Sponsorship / Advertisement / Partnership", linked to `https://web.works/contact` (opens in a new tab).
> 2. The **only** email for the whole site is the owner's inbox. It must **never appear in HTML, visible text, or plain JS strings**.
>    - Store it obfuscated (char-code shift) in `assets/js/config.js`.
>    - Decode it only at submit or click time.
>    - All forms post via AJAX to FormSubmit (free), with a honeypot and `_captcha` off.
>    - After activation, swap in FormSubmit's random alias so even the obfuscated address can be removed.
> 3. **Trademark hygiene:** "270270" is used only as a domain / brand name. Do not use, imitate or link as affiliation any third-party mark (e.g. "270toWin", zodiac app brands). Ship a `legal.html` with trademark, copyright and cultural disclaimers.
> 4. All "luck scores" are labelled **cultural entertainment / education**, not advice.
> 5. **Performance:** Lighthouse 90+. Lazy-load YouTube (click-to-play thumbnails), no ad above tool inputs, CLS-safe reserved ad boxes.
> 6. **Accessibility:** semantic landmarks, labelled inputs, focus rings, `prefers-reduced-motion`, 4.5:1 contrast in both themes.
>
> **Design system**
> - Rice-paper background `#FBF7F0`, ink `#1A1A1A`, vermilion `#C8102E` CTAs, gold `#C9A227` scores, jade `#2E7D6B` for "lucky", plum `#6B4E71` for "caution". Never use red to mean "bad".
> - Dark mode is lacquer `#121212` with gold.
> - Fonts: Fraunces (display), Inter (UI), Noto Serif SC (汉字).
> - Motifs: seal-stamp badges, red-envelope cards, cloud-line dividers.

## Phase 1: Information architecture and scaffolding

> Create the repo structure:
>
> - **Top-level pages:** `index.html`, `decoder.html`, `tools.html`, `dictionary.html`, `zodiac.html`, `dates.html`, `guides.html`, `guides/*.html`, `videos.html`, `business.html` (lead-gen), `support.html` (donations), `contests.html`, `careers.html`, `advertise.html`, `about.html`, `contact.html`, `legal.html`, `privacy.html`, `terms.html`, `404.html`
> - **Programmatic pages:** `n/<number>.html`
> - **Assets:** `assets/css/style.css`, `assets/js/{config,data,engine,app}.js`
> - **Root files:** `ads.txt`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.svg`, `.nojekyll`
>
> Build a Python generator that holds one layout template (top contact bar, sticky header with mega-nav, theme toggle, mobile drawer, footer with 4 link columns + newsletter + legal line). It should write every page from content blocks.

## Phase 2: Core engine and flagship tool (Number Decoder)

> Build `engine.js`, a pure function `analyze(numberString, {dialect})` that returns:
> - a per-digit breakdown (汉字, pinyin, homophones, polarity)
> - matched combos from the dictionary, using longest-match first (e.g. 168, 520, 1314, 250, 748)
> - pattern bonuses (AABB, ABAB, ABCABC "好事成双", all-same, ascending)
> - a 1–99 luck score with a grade: 大吉 Great / 吉 Lucky / 平 Neutral / 慎 Caution / 凶 Avoid
> - a plain-English reading and warnings
>
> Mandarin and Cantonese toggles must change the readings (e.g. 7 is vulgar in Cantonese; 5 = 唔 "not", so 58 means "won't prosper" in Cantonese).
>
> The `decoder.html` UI needs:
> - a big numeric input with `inputmode="numeric"` and results as you type
> - a score dial, digit cards, combo chips and pattern notes
> - a **shareable URL** (`?n=`), copy link, WhatsApp/X/Facebook/Email share, and embed code
> - "Try" chips (270270, 520, 1314, 168, 888, 250, 4444)
> - modes: Phone, Plate, Price, Address, Date

## Phase 3: Tool suite

> - **Lucky Price Finder:** input a price and get the nearest lucky prices above and below (endings 8, 88, 68, 168, 888; no 4). Show each price's score.
> - **Zodiac Finder:** birth date → animal, element and lucky/unlucky numbers. Use `Intl.DateTimeFormat('en-u-ca-chinese')` for lunar-year-accurate results; the lunar new year boundary must be respected.
> - **Lucky Date Finder:** purpose (wedding, business opening, moving, signing, launch) plus a month range. List the top dates, scored by date digits and lunar day, with a lunar 7th-month (Ghost Month) penalty for weddings and moving.
> - **Number of the Day** (deterministic from the date) and a **Fortune Cookie** micro-game.
> - **Phone / Plate Analyzer:** decoder presets that end in a premium-number inquiry CTA.

## Phase 4: Content and SEO engine

> - **Slang dictionary:** 70+ entries (code, 汉字, pinyin, meaning, category, safety tag) with search and category filters.
> - Each entry generates `n/<code>.html` with a unique title and meta description, a static breakdown, the live decoder pre-filled, FAQ + `FAQPage` JSON-LD, related numbers, and a breadcrumb + `BreadcrumbList` JSON-LD.
> - **Guides:** pillar "Chinese Lucky Numbers: the complete guide", unlucky numbers, pricing for Chinese customers, choosing wedding dates, phone and plate numbers, and "The 270270 story". Each has a byline, updated date, read time, table of contents, callouts and a CTA.
> - Add Open Graph and Twitter cards, canonical URLs, `sitemap.xml`, `robots.txt` and `Organization`/`WebSite` JSON-LD with a SearchAction.

## Phase 5: Monetisation

> - **AdSense:** set the publisher ID once in `tools/build.py` (for the head script and verification meta) and in `config.js` (for slot rendering). Render `<ins class="adsbygoogle">` only in reserved `.ad-slot` boxes: after the tool result, in-article after the 2nd H2, a sidebar on desktop, and a footer leaderboard. Until the ID is set, the slots show **house ads** promoting Advertise and Business Audit. Ship an `ads.txt` template.
> - **YouTube:** `videos.html` with a category-filtered grid, click-to-load embeds (privacy-enhanced `youtube-nocookie.com`), a "Subscribe to our channel" CTA from config, and related videos embedded on guide and number pages.
> - **Affiliate** / sponsored-tool slots ("Lucky Date Finder presented by…").
> - A **cookie consent banner**. The EEA/UK needs a Google-certified CMP once AdSense is live.

## Phase 6: Lead generation (highest-value section)

> `business.html`, "Chinese-Market Number & Name Audit":
> - problem → proof (price facts) → sample audit → **3 tiers** (Starter $199 / Growth $499 recommended / Enterprise from $1,499) → FAQ → a **multi-step form**
> - The form has 4 steps and a progress bar:
>   1. Goal
>   2. Business details
>   3. What to audit (conditional checkboxes: prices, phone, address, launch date, brand name, domain)
>   4. Contact + budget + timeline + consent
> - Plus a honeypot, AJAX submit, success state, and UTM + referrer + decoder-query capture in hidden fields.
>
> Secondary lead streams:
> - a "Premium lucky number / domain inquiry" form
> - "Ask an Expert" (auspicious date selection)
> - a "Daily Lucky Number" email capture (birthdate + zodiac) in the footer and after every tool result
> - an exit-intent modal on tool pages (desktop only, once per session)

## Phase 7: Community, donations, contests, careers, partnerships

> - **support.html:** red-envelope donation tiers ($8 Lucky / $18 Prosper / $88 Double Fortune / $168 All-the-way / custom), one-time or monthly. Include a transparent fund-allocation bar (Operations 30%, Content & Video 25%, Marketing & Promotion 20%, Hiring Talent 15%, Contest Prizes 10%), a goal progress bar, a supporter wall, and sponsorship tiers. Payment is via PayPal Donate (email decoded at click time) plus optional Ko-fi / Buy Me a Coffee / Stripe links from config, with a pledge form as fallback.
> - **contests.html:** monthly contest (e.g. "Best Lucky Number Story", "Design a 270270 red envelope"). Include a countdown, prize list, entry form with file-link field, judging criteria, past winners, and official rules (no purchase necessary, eligibility, void where prohibited, Québec note).
> - **careers.html:** open roles (bilingual writer, short-video creator, feng shui / almanac expert, community moderator, SEO/growth, sponsorship sales). Include an application form with a portfolio link and "Become an expert" flow.
> - **advertise.html:** audience stats (placeholder until live), media-kit request, ad formats and price guide, sponsorship / partnership form, plus the web.works/contact link.

## Phase 8: QA, launch and hosting (done)

> 1. Run a link checker and verify there is no plain email anywhere (`grep`).
> 2. Test responsiveness at 360 / 768 / 1280 px with Playwright screenshots.
> 3. Push to `github.com/webworksa1/270270-com` (branch `main`). The Actions workflow builds and publishes to `gh-pages`, and **GitHub Pages** serves it from `gh-pages` / root.
> 4. For the custom domain, add a `CNAME` file containing `270270.com`. At the registrar, set A records to 185.199.108.153 / .109.153 / .110.153 / .111.153 and `www` as a CNAME to `webworksa1.github.io`. Then tick "Enforce HTTPS".
> 5. Submit the sitemap to Google Search Console and Bing, apply for AdSense, and activate FormSubmit through the first-submission email.

## Phase 9: Growth roadmap (next)

> - Expand to 500+ number pages (all 3-digit combos with genuine readings).
> - Add a **Lucky Number Price Index** (HK plate auctions, phone numbers).
> - Build a zh-Hant/zh-Hans UI toggle with hreflang.
> - Add a YouTube Shorts pipeline with one Short per dictionary entry, embedded on its page.
> - Add a paid PDF report (Personal Lucky Number Report, $9) and a membership (ad-free + saved numbers).
> - Add a user-submitted number stories wall (moderated) and a newsletter automation.
> - Pitch a partnership with wedding planners, realtors and Chinese-market agencies.
