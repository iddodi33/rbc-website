# Rathmines Basketball Club — rathminesbc.ie

Public website and merch shop for Rathmines Basketball Club, Dublin.

Static HTML, CSS and JS. **No build step, no bundler, no npm install.** If you
find yourself needing one, that is a decision — write a line in `DECISIONS.md`
first.

## Run it locally

The site is plain static files, so any static server will do. Pick one:

```bash
python -m http.server 8000
```

```bash
npx serve .
```

```bash
php -S localhost:8000
```

Then open <http://localhost:8000>.

You can also open `index.html` directly in a browser by double-clicking it.
Everything on the shell works that way today. Use a server once Supabase or
Stripe are wired in, because `file://` breaks fetch and CORS.

VS Code users: the Live Server extension works and gives you auto-reload.

## Layout

```
/
  index.html      Home
  story.html      Our Story
  roster.html     Team & Roster (D4, D7)
  sponsors.html   Sponsors
  shop.html       Shop
  contact.html    Contact
  /css
    tokens.css    Design tokens. Palette, type scale, spacing, breakpoints.
    base.css      Element defaults, typography, focus, buttons, links.
    layout.css    Header, nav, footer, page furniture, home page sections.
  /js
    nav.js        Mobile nav toggle and current-page marking.
  /assets
    /img          Logos and photography.
```

Load order matters: `tokens.css`, then `base.css`, then `layout.css`.

## House rules for editing

- **The header and footer markup is byte-identical across all six pages.**
  There is no templating engine. If you change either one, change it in all six
  files in the same commit — a find-and-replace across `*.html` is the intended
  workflow, so do not reformat or re-indent those blocks.
- **Only four colours**, plus one text-only derivative. They live in
  `css/tokens.css`. Do not introduce a fifth.
- **Never commit a secret.** No Stripe secret key, no Supabase service role key,
  in any file that ships to the browser. `.env` is gitignored; keep it that way.
- Branch per feature, small PRs, merge daily. Whoever merges runs the site first.

## Who owns what

| Area | Owner |
|---|---|
| Shell: layout, nav, design system, home, deploy config | Iddo |
| Team & Roster, Our Story | Iddo |
| Shop, Instagram/social embed | Phil |
| Sponsors page | Shared — ask before editing |

## Accessibility baseline

Do not regress these:

- Every page has `header` / `nav` / `main` / `footer` landmarks and a skip link.
- Visible focus ring on everything focusable. Never `outline: none` without a
  replacement of equal or better visibility.
- Body text meets WCAG AA (4.5:1). `--accent` is **not** AA-safe for small text
  on paper — use `--accent-ink` there. See the comment in `tokens.css`.
- Works from 360px wide up.
