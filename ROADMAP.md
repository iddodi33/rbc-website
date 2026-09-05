# Roadmap

## v1, target: end of September 2026

The date depends on three things, none of them code: the squads finalised, both sponsor conversations closed, and real copy on story, sponsors and contact. Until those land the site stays behind noindex.

- [ ] Shell: layout, nav, Leather and Chalk design system, home page, deploy pipeline. Iddo, solo, first.
- [ ] Our Story / Community page. Iddo, after shell is merged.
- [ ] Team and Roster, D4, D6 and D2 shown as three separate rosters. Iddo, after shell is merged.
- [ ] Fixtures block on the home page. Built and live, rendered from `fixtures.json`. PENDING: the league has not published dates, so every fixture shows TBC. Drop the dates into `fixtures.json` when they land, nothing else needs to change. Also pending: confirmation that the second list really is Division 6, its header was cropped in the source screenshot. Iddo.
- [ ] Sponsors page: current sponsors (Blackbird, Neighborhood Threat Barber) shown properly, open "partner with us" contact path, no tier pricing published. Shared.
- [ ] Shop: jersey and tee, cart-style flow (item, size, quantity, multiple items per order), Stripe Checkout, order written to Supabase, confirmation email to buyer, summary email to Iddo and Phil, manual relay to teamwear.ie for bulk fulfillment, pickup or delivery captured on the form. Phil, after shell is merged.
- [ ] Instagram feed, RBC's own account only. Phil, after shell is merged.
- [ ] Contact page. Whoever finishes their vertical first.
- [ ] Remove noindex and robots.txt. LAUNCH DAY, AND NOT BEFORE. Every page carries `<meta name="robots" content="noindex, nofollow">` and robots.txt disallows everything, because the site is on a public URL with placeholder copy on it. They come out together, and nothing is indexed until they do — so if the site is live and getting no search traffic, this is why. Whoever launches.
- [ ] ASK BOTH SPONSORS FOR FULL-SIZE PHOTOGRAPHS. Both files currently on the sponsors page are too small: the Blackbird night shot is 548x364 and the Neighbourhood Threat shopfront is 443x451, and both are held at their own intrinsic width by `.photo--lowres` so they are never upscaled. The cost is that neither can fill its column, and the shopfront in particular is nearly square and reads as a phone snapshot beside the club's own photography. Ask Blackbird and Neighbourhood Threat for originals, or re-shoot both — a landscape frame of each would sit properly in the layout. Drop `.photo--lowres` when they land. Shared.
- [ ] Blackbird logo artwork, ideally white on transparency like the Neighbourhood Threat file, so it needs no treatment on the black footer bar. Until it arrives the footer strip sets the name as a wordmark. Shared.

## Explicitly not in v1
- Season record tracking (photo plus scores form)
- DMBB league table for D4, D6 and D2
- Any blog, news feed, or content requiring regular upkeep
- Priced, published sponsor tiers or a formal pitch document
- Automated ordering with teamwear.ie
- Custom cart or checkout code (using Stripe Checkout instead)

## v2 candidates, revisit after launch
- Season record per team (D4, D6, D2): photo upload plus two typed final scores after each game, no OCR, no scoresheet parsing
- Ask DMBB directly whether they'll share a season data export for D4, D6 and D2, before considering any scraping of dmbb.ie
- Revisit the merch process once past 20-30 orders, the manual relay to teamwear.ie won't scale further than that
- Revisit Phil's personal Revolut for payments once RBC has its own business account
- Priced sponsor tiers and a proper pitch document, once the site and branding are live and sponsors can see the value
