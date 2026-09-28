# Competitor & inspiration audit: 31 sites

*Visited September 2026. Some sites blocked automated access; the notes below say which rows were substituted and which come from general knowledge.*

| # | Site | What it does | Features adopted for 270270.com |
|---|---|---|---|
| 1 | chinahighlights.com | China travel / culture guides | Table-of-contents guides, zodiac → lucky-number table, trust stack, repeated inquiry CTA |
| 2 | travelchinaguide.com | China travel encyclopedia | One page per digit (hub & spoke), breadcrumbs, byline + updated date, sidebar ad slots |
| 3 | yourchineseastrology.com | Chinese astrology portal | Auspicious date selector by purpose, lunar converter, zodiac finder |
| 4 | mdbg.net | Chinese dictionary | Tone-coloured pinyin, dark/light theme, donation button |
| 5 | lingoace.com (blog) | Mandarin tutoring | Slang entry format with a **safety rating**, FAQ block, soft CTA |
| 6 | thechairmansbao.com | Graded reader | Callout boxes, "Top combos" table, institutional "Enquire" CTA |
| 7 | chineseclass101.com | Courses | "Join free, no card needed", tiered plans |
| 8 | hellochinese.cc | Gamified app | Gradient accents, social-proof counters |
| 9 | skritter.com | SRS app | 3 pricing tiers with a highlighted recommended tier |
| 10 | Wikipedia: Chinese numerology | Reference | Citation layer for digit meanings and price facts |
| 11 | CNN (HK vanity plates) | News | Hard price data for the "Lucky Number Price Index" |
| 12 | td.gov.hk | Plate auctions | Past-results dataset model |
| 13 | hko.gov.hk | Lunar conversion | Authoritative lunar data (we use the browser's built-in Chinese calendar via `Intl`) |
| 14 | timeanddate.com | Calendar tools | Countdowns, date tools, ad-free upsell |
| 15 | cafeastrology.com | Astrology | Free reports, recurring weekly content |
| 16 | horoscope.com | Horoscopes | Fortune-cookie game, 12-sign selector, newsletter everywhere |
| 17 | astrology.com | Horoscopes | Compatibility tool, **dark-mode toggle** |
| 18 | numerology.com | Numerology | **Birthdate → daily-number email capture**, report upsell |
| 19 | number.academy | Number encyclopedia | **Programmatic per-number pages** |
| 20 | numberempire.com | Math tools | AdSense-funded free tools |
| 21 | whats-your-sign.com | Symbolism | Friendly personal donation ask, affiliate links |
| 22 | calculator.net | Calculators | Tool directory, fast, no signup |
| 23 | omnicalculator.com | Calculators | Instant results as you type, "How it works" explainer, careers page |
| 24 | 270towin.com | Election maps | **Shareable tool-state URL**, embed code, share buttons (UX only; no brand use) |
| 25 | fengshuimall.com | Feng shui shop | Shop by outcome, yearly forecasts |
| 26 | fengshuinexus.com | Feng shui education | **"Ask an Expert" form**, expert directory, ebook lead magnets |
| 27 | numberbarn.com | Vanity phone numbers | Pattern search → inquiry flow |
| 28 | ko-fi.com | Tips | Goal bar, embeddable button |
| 29 | buymeacoffee.com | Tips | Preset amounts, **public supporter wall** |
| 30 | patreon.com | Memberships | Tier perks (name in credits, early access) |
| 31 | hubspot.com (forms) | Forms | **Multi-step, conditional forms**, spam honeypot, thank-you states |
| + | canva.com | Design | Question-style hero with one primary CTA |
| + | kickstarter.com | Crowdfunding | Progress bar, days left, reward tiers (general knowledge; the fetch returned metadata only) |

## Design direction adopted

**Palette**
- Vermilion `#C8102E` for CTAs
- Imperial gold `#C9A227` for scores
- Ink `#1A1A1A` on rice paper `#FBF7F0`
- Jade `#2E7D6B` for "lucky" and muted plum for "caution". Red is never used as "bad", because red is lucky in China.
- Dark mode is lacquer black with gold.

**Type**
- Fraunces (display)
- Inter (UI)
- Noto Serif SC (汉字)

**Motifs**
- Seal-stamp badges
- Red-envelope donation cards
- Cloud-line dividers (祥云)
- One red CTA per viewport

**Layout**
- Home: decoder hero → trending chips → tool grid → today's number → zodiac grid → guides and videos → lead CTA → supporter wall.
- Ads sit **below** tool results, never above the input.
