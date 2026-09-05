# Rathmines BC Website — CLAUDE.md

Read this file, ROADMAP.md, ARCHITECTURE.md, and DECISIONS.md at the start of every session, before writing any code.

## What this is
The public website and merch shop for Rathmines Basketball Club (RBC), Dublin. Joint build between Iddo and Phil. Goals: drive 4-5 new sponsorships, build community pride, sell a small merch run. Community first, basketball second.

## Stack
- Static multi-page site, plain HTML/CSS/JS, no app framework
- Data: Supabase
- Payments: Stripe Checkout, hosted page, no card data in our code
- Server-side logic: two Supabase Edge Functions only, `create-checkout-session` and `stripe-webhook`
- Hosting: Vercel
- Domain: rathminesbc.ie

Full detail in ARCHITECTURE.md. Don't introduce a framework, a second backend, or a new hosting target without a line in DECISIONS.md explaining why.

## Brand
Leather and Chalk. Black `#141414`, paper `#F7F4EF`, accent `#C1682D`, accent tint `#EFD3B4`. No other colors.

## Ownership, don't edit outside your own area

| Area | Owner |
|---|---|
| Shell: layout, nav, design system, home, deploy config | Iddo |
| Team & Roster (men's D4, men's D6, women's D2), Our Story | Iddo |
| Shop, Instagram/social embed | Phil |
| Sponsors page | Shared, ask before editing |

Shell is built and merged solo by Iddo before Roster or Shop branches start.

## Hard rules
- Never put a Stripe secret key or Supabase service role key in a client-side file or a commit
- Never auto-email teamwear.ie. Orders go to Supabase, the buyer, and Iddo plus Phil only. Bulk ordering with teamwear.ie is manual.
- No blog or news feed, nothing that needs ongoing content upkeep beyond social media
- Sponsor tiers are not priced or published yet, three tiers exist internally only
- No underage teams involved. Three senior squads, one team per division: men's D4, men's D6, women's D2. Roster data for all three is fine to publish as-is
- Last season's record, get it right, it is the strongest fact the site has. Both men's teams were promoted: D5 to D4, and D7 to D6. Separately, the men's D4 team won the D5 playoff and the women's team won the D2 playoff. Promotion is decided on final league position; the playoff is a separate top-four knockout and does not decide promotion, so never write one as the cause of the other. The women were NOT promoted, they were in D2 last season and are in D2 now. The playoff trophies have no competition name beyond the league's own, do not invent one

## Process
- Branch per feature, small PRs, merge daily
- Whoever merges runs the app first
- One line in DECISIONS.md every time you override the other's agent or a prior decision
- Separate dev data in Supabase, don't both write test rows to the same live project
