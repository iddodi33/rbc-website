# Architecture

## Stack
Static HTML, CSS, and JS, no app framework. Same pattern as the trials and summer skills apps already built for RBC.

Hosting: Vercel, for the custom domain and preview deploys. Carried over from an earlier "Vercel is fine" answer. If GitHub Pages is preferred instead, flip this line and note why in DECISIONS.md, nothing else here changes.

Domain: rathminesbc.ie

## Data
Supabase project, owned by RBC, not a personal account.

Starting tables, extend as needed:
- `orders`: buyer name, email, items (jsonb: item, size, quantity), pickup or delivery, status, created_at
- `sponsors`: name, logo_url, tier (internal only, not rendered publicly until tiers are priced), blurb
- `roster`: name, division (D4, D6 or D2), team (men's for D4 and D6, women's for D2 — one team per division, so team is implied by division)

## Payments
- Stripe Checkout, hosted page, card data never touches our own code
- Server-side logic is limited to two Supabase Edge Functions:
  - `create-checkout-session`: receives the cart from the browser, creates the Stripe session using the secret key, returns the redirect URL
  - `stripe-webhook`: receives Stripe's payment confirmation, writes the order to Supabase, sends a confirmation email to the buyer and a summary email to Iddo and Phil
- Everything else, including the plain order insert in the happy path, goes straight from the browser via the Supabase client with row-level security
- Payment account: currently Phil's personal Revolut. Worth confirming with Revolut or moving to a business account before go-live, personal accounts aren't meant for commercial use under their terms
- No automatic email to teamwear.ie. Bulk fulfillment orders are relayed manually by Iddo or Phil

## Email
Transactional email for order confirmations: Resend. Pairs cleanly with Supabase Edge Functions and has a free tier that comfortably covers this volume. Not yet confirmed between Iddo and Phil, swap freely and log the change in DECISIONS.md if you do.

## Folder structure, starting point

/
index.html
story.html
roster.html
sponsors.html
shop.html
contact.html
/css
/js
/assets (photos, video, logos)
/supabase
/functions
create-checkout-session/
stripe-webhook/
CLAUDE.md
ROADMAP.md
ARCHITECTURE.md
DECISIONS.md


## Brand tokens
```css
--black: #141414;
--paper: #F7F4EF;
--accent: #C1682D;
--accent-tint: #EFD3B4;
```
