# Auth Foundation (Sub-project A) — Design Spec

**Date:** 2026-05-20
**Status:** Approved
**Part of:** 4-part dashboard system (A → B → C → D)

---

## Scope

This spec covers the auth foundation only — the session module, nav user menu, login form wiring, and registration form simplification. It does **not** cover CTA gating, dashboard pages, or enhanced inquiry forms (those are Sub-projects B–D).

---

## Architecture

A single `auth.js` file exposes `window.LafayetteAuth` and auto-runs an `initNav()` call on `DOMContentLoaded`. Every page in the site already includes `<script src="assets/js/auth.js"></script>`, so no per-page changes are needed except for `anmelden.html`.

Session state is stored in `localStorage` under key `lre_session` as a plain JSON object. There is no server, no real password hashing — this is a client-side demo.

---

## Demo Accounts

Two hardcoded accounts baked into `auth.js`:

| Email | Password | Role | Display name |
|---|---|---|---|
| `kaeufer@demo.de` | `demo1234` | `kaeufer` | Max Mustermann |
| `verkaeufer@demo.de` | `demo1234` | `verkaeufer` | Anna Müller |

---

## Session Object

Stored as JSON in `localStorage['lre_session']`:

```json
{
  "email": "kaeufer@demo.de",
  "role": "kaeufer",
  "name": "Max Mustermann"
}
```

`null` / missing key = logged out.

---

## `LafayetteAuth` API

```js
window.LafayetteAuth = {
  login(email, password)     // → { ok: true, user } | { ok: false, error: string }
  logout()                   // clears lre_session, redirects to index.html
  getSession()               // → session object | null
  isLoggedIn()               // → boolean
  requireAuth(returnUrl)     // if not logged in: redirect to anmelden.html?redirect=<encodedUrl>
}
```

`requireAuth(returnUrl)` encodes `returnUrl` with `encodeURIComponent` before appending as query param.

---

## Nav — User Menu (logged-in state)

When `isLoggedIn()` is true, `initNav()` finds `a.nav-links__cta[href="anmelden.html"]` and replaces it in-place with an injected user menu:

```html
<div class="nav-user-menu" id="nav-user-menu">
  <button class="nav-user-btn" aria-haspopup="true" aria-expanded="false">
    <span class="nav-user-name"><!-- first name + last initial --></span>
    <span class="nav-user-chevron" aria-hidden="true">▾</span>
  </button>
  <div class="nav-user-dropdown" role="menu">
    <a href="dashboard-kaeufer.html" class="nav-user-dropdown__item" role="menuitem">Dashboard</a>
    <button class="nav-user-dropdown__item nav-logout-btn" role="menuitem">Abmelden</button>
  </div>
</div>
```

The `href` on the Dashboard link is set based on role:
- `kaeufer` → `dashboard-kaeufer.html`
- `verkaeufer` → `dashboard-verkaeufer.html`

Display name is shortened to first name + last name initial (e.g. "Max M.").

**Dropdown behaviour:**
- Click on `nav-user-btn` toggles class `open` on `.nav-user-menu`
- Click anywhere outside closes it (document click listener)
- "Abmelden" button calls `LafayetteAuth.logout()`

**CSS additions to `navbar.css`:**

```css
.nav-user-menu { position: relative; }

.nav-user-btn {
  background: none;
  border: 1px solid rgba(255,255,255,0.35);
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color var(--transition-base);
}
.nav-user-btn:hover { border-color: rgba(255,255,255,0.65); }

.nav-user-chevron { font-size: 7px; opacity: 0.6; transition: transform var(--transition-base); }
.nav-user-menu.open .nav-user-chevron { transform: rotate(180deg); }

.nav-user-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  z-index: 200;
}
.nav-user-menu.open .nav-user-dropdown { display: block; }

.nav-user-dropdown__item {
  display: block;
  width: 100%;
  padding: 12px 18px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-charcoal);
  text-decoration: none;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-base);
}
.nav-user-dropdown__item:last-child { border-bottom: none; }
.nav-user-dropdown__item:hover { background: var(--color-cream); }
.nav-logout-btn { color: var(--color-text-muted); }
```

---

## Login Form Changes (`anmelden.html` + `auth.js`)

**On page load:**
- If already logged in → redirect immediately to the role-based dashboard (`dashboard-kaeufer.html` or `dashboard-verkaeufer.html`) — no redirect loop needed since anmelden.html is excluded from `requireAuth` calls

**Demo credentials strip:**
A read-only info box hardcoded in the HTML below the login form (not injected by JS — it should always be visible):
```
Demo-Zugang: kaeufer@demo.de  /  verkaeufer@demo.de
Passwort: demo1234
```
Styled like the existing `.discretion-note` but with a subtle info tone.

**Form submit:**
1. Prevent default
2. Call `LafayetteAuth.login(email, password)`
3. On `ok: false` → show inline error `<p class="form-error">E-Mail oder Passwort ungültig.</p>` below the submit button
4. On `ok: true` → read `?redirect=` from `window.location.search`, `decodeURIComponent` it; if present navigate there, else navigate to role-based dashboard URL

**CSS addition to `auth.css`:**
```css
.form-error {
  font-family: var(--font-body);
  font-size: 11px;
  color: #c0392b;
  margin-top: 10px;
  padding: 10px 14px;
  background: rgba(192,57,43,0.06);
  border-left: 2px solid rgba(192,57,43,0.4);
}
```

---

## Registration Form Changes (`anmelden.html`)

**Role dropdown** — replace existing 5-option `<select>` with exactly 2 options:
```html
<option value="" disabled selected>Bitte wählen…</option>
<option value="kaeufer">Käufer</option>
<option value="verkaeufer">Verkäufer</option>
```

**Form submit:**
1. Prevent default
2. Hide the form
3. Show a confirmation notice in its place:

```
Ihre Anfrage wurde übermittelt.
Für den Demo-Zugang verwenden Sie bitte:
kaeufer@demo.de oder verkaeufer@demo.de — Passwort: demo1234
```

No account is actually created.

---

## Files Changed

| File | Change |
|---|---|
| `assets/js/auth.js` | Full rewrite — session module + nav init |
| `assets/css/components/navbar.css` | Add user menu + dropdown styles |
| `assets/css/pages/auth.css` | Add `.form-error` style + demo strip style |
| `anmelden.html` | Simplify role dropdown, add form submit JS hooks |

---

## Out of Scope

- CTA login gating (Sub-project B)
- `dashboard-kaeufer.html` and `dashboard-verkaeufer.html` pages (Sub-projects C & D)
- Enhanced buyer inquiry form (Sub-project B)
- Any server-side logic or real password hashing
