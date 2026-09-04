# Decisions Log

One line per entry. Add one every time either of you overrides the other's agent, changes something in CLAUDE.md, ROADMAP.md, or ARCHITECTURE.md, or makes a call that isn't written down anywhere else. Newest entry at the top.

Format: `YYYY-MM-DD — who — what was decided — why`

## Log

- 2026-09-04 — Iddo — Typefaces are Archivo (display: headings, nav, buttons) and Source Serif 4 (body), loaded from Google Fonts via `<link>` — no typeface was specified anywhere in the docs; Archivo gives the tight athletic "chalk" half and Source Serif the warm "leather" half. Google Fonts keeps the no-build-step constraint. Revisit if a cookie/GDPR banner becomes necessary, since it is a third-party request — self-hosting the two `.woff2` files is the fallback and needs no other change
- 2026-09-04 — Iddo — Added a fifth colour token, `--accent-ink` #8F4A1E, for small text and links on paper only — #C1682D on #F7F4EF is 3.62:1, which fails the WCAG AA 4.5:1 body-text threshold. #8F4A1E is 6.05:1. It is a text-only darkening of the accent, not a new brand colour: nothing visual (fills, rules, borders, display type) may use it, and on #141414 the plain accent is 4.64:1 and passes, so this token is not needed there
- 2026-09-04 — Iddo — Nav label for roster.html is "Roster", not "Team" — matches the filename, so there is no ambiguity for Phil or for a later find-and-replace
- 2026-09-04 — Iddo — The site header and footer are black (#141414) bars — the supplied club mark is white artwork on an opaque black background, not a transparent PNG, so it needs a dark surface to sit on. `mix-blend-mode: screen` knocks the black box out against the bar. If a transparent or paper-background version of the logo is ever produced, this can be revisited
- 2026-09-04 — Iddo — No templating engine: the header and footer are duplicated byte-identically across all six pages, and the current-page marker is driven by a `data-page` attribute on `<body>` rather than per-page nav markup — keeps the shared blocks a single find-and-replace, and keeps the marker working without JS. A generator script produced the six files once and was deliberately not committed, since committing it would amount to a build step
- 2026-09-04 — Iddo — The `/supabase/functions/` folders from ARCHITECTURE.md were NOT created in the shell branch — those two functions are Stripe/Shop work, which is Phil's area, and this session was scoped to static only. Git cannot track empty directories anyway, so creating them would have meant committing placeholder files into his area. Phil creates them on his branch

- Pre-launch — Iddo & Phil — Stack is static HTML, CSS, and JS plus two Supabase Edge Functions, no app framework — only two things in the whole build need server-side code, a framework would add complexity with no benefit
- Pre-launch — Iddo & Phil — Hosting is Vercel — carried over from an earlier "Vercel is fine" answer, flip to GitHub Pages here if that changes
- Pre-launch — Iddo & Phil — Merch orders relay to teamwear.ie manually, no automated email to their inbox — keeps the process manual until there's a proven market, and we don't yet know how they want to receive orders
- Pre-launch — Iddo & Phil — Sponsor tiers exist (3) but are not priced or published at launch — website and branding come first, tier pricing and the pitch document come later
- Pre-launch — Iddo & Phil — Iddo builds the shell solo, merged before Roster or Shop start — avoids two competing design systems forming in parallel
- Pre-launch — Iddo & Phil — Leather and Chalk palette locked: black #141414, paper #F7F4EF, accent #C1682D, tint #EFD3B4 — ties the basketball identity to something warmer without losing the black and white anchor
- Pre-launch — Iddo & Phil — Team & Roster covers D4 and D7, seniors only, no underage teams — confirms no safeguarding or GDPR question on publishing roster data
