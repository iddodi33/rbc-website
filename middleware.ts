// Gate for /playbook-d6/*. Vercel Routing Middleware, runs before any static file is served,
// so the page, the videos and the PDFs are all behind the same check.
//
// Needs two environment variables set in Vercel (never committed):
//   PLAYBOOK_CODE    the shared team code
//   PLAYBOOK_SECRET  a long random string used to sign the cookie
// If either is missing the gate fails closed: nothing is served.
//
// Rotating PLAYBOOK_SECRET signs everyone out. Changing PLAYBOOK_CODE stops
// new sign-ins; existing cookies stay valid until they expire, so rotate both
// when a season ends.

import { next } from "@vercel/functions";

const COOKIE = "rbc_playbook";
const BASE = "/playbook-d6";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const enc = new TextEncoder();

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(value)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function digest(s: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

async function hasValidCookie(req: Request, secret: string): Promise<boolean> {
  const c = readCookie(req, COOKIE);
  if (!c) return false;
  const [expiry, sig] = c.split(".");
  if (!expiry || !sig) return false;
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now() / 1000) return false;
  return safeEqual(sig, await sign(expiry, secret));
}

const headers = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex, nofollow",
};

function loginPage(error: boolean, status: number): Response {
  const html = `<!DOCTYPE html>
<html lang="en-IE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>D6 playbook | Rathmines Basketball Club</title>
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/base.css">
<link rel="stylesheet" href="/css/layout.css">
<link rel="icon" href="/assets/img/logo.png">
<style>
  .gate{min-height:100vh;display:grid;place-items:center;padding:var(--space-6)}
  .gate__box{width:100%;max-width:26rem;background:var(--surface-raised);border:1px solid var(--rule-strong);border-radius:var(--radius-md);padding:var(--space-8) var(--space-6)}
  .gate__box img{display:block;margin:0 auto var(--space-4);height:4.5rem;width:auto}
  .gate__box h1{font-size:var(--step-3);margin:0 0 var(--space-2);text-align:center}
  .gate__box p{margin:0 0 var(--space-5);text-align:center;color:var(--text-muted)}
  .gate__box label{display:block;font-weight:var(--weight-bold);margin-bottom:var(--space-2)}
  .gate__box input{width:100%;min-height:3rem;padding:var(--space-2) var(--space-3);font:inherit;border:2px solid var(--black);border-radius:var(--radius-md);background:var(--paper);margin-bottom:var(--space-4)}
  .gate__box .btn{width:100%}
  .gate__err{color:var(--accent-ink);font-weight:var(--weight-bold);margin:0 0 var(--space-4)!important}
</style>
</head>
<body>
<main class="gate">
  <form class="gate__box" method="post" action="${BASE}/">
    <img src="/assets/img/logo.png" alt="" width="114" height="107">
    <h1>D6 playbook</h1>
    <p>For Rathmines men's D6 players. Enter the team code.</p>
    ${error ? '<p class="gate__err" role="alert">That code is not right. Try again.</p>' : ""}
    <label for="code">Team code</label>
    <input id="code" name="code" type="password" autocomplete="current-password" autocapitalize="none" required autofocus>
    <button class="btn btn--primary" type="submit">Enter</button>
  </form>
</main>
</body>
</html>`;
  return new Response(html, { status, headers });
}

export default async function middleware(req: Request): Promise<Response> {
  const code = process.env.PLAYBOOK_CODE;
  const secret = process.env.PLAYBOOK_SECRET;
  if (!code || !secret) {
    return new Response("Playbook is not configured.", { status: 503, headers: { "cache-control": "no-store" } });
  }

  const url = new URL(req.url);
  if (url.pathname === BASE) return Response.redirect(url.origin + BASE + "/", 301);

  if (await hasValidCookie(req, secret)) {
    return next({ headers: { "cache-control": "private, no-store", "x-robots-tag": "noindex, nofollow" } });
  }

  if (req.method === "POST") {
    let submitted = "";
    try {
      submitted = String((await req.formData()).get("code") ?? "").trim();
    } catch { /* bad body, treated as wrong code */ }

    if (submitted && safeEqual(await digest(submitted), await digest(code))) {
      const expiry = String(Math.floor(Date.now() / 1000) + MAX_AGE);
      const value = `${expiry}.${await sign(expiry, secret)}`;
      return new Response(null, {
        status: 303,
        headers: {
          location: BASE + "/",
          "set-cookie": `${COOKIE}=${value}; Path=${BASE}; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          "cache-control": "no-store",
        },
      });
    }
    await new Promise((r) => setTimeout(r, 800)); // slows guessing
    return loginPage(true, 401);
  }

  return loginPage(false, 401);
}

export const config = { matcher: ["/playbook-d6", "/playbook-d6/:path*"] };
