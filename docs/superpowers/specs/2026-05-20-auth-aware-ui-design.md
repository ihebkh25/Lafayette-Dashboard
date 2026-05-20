# Auth-Aware UI — Sub-project B Design Spec

**Date:** 2026-05-20
**Status:** Approved
**Part of:** 4-part dashboard system (A ✅ → **B** → C → D)
**Depends on:** Sub-project A (LafayetteAuth session module)

---

## Scope

Site-wide auth-awareness: CTA login gating, pre-filled Kontakt form for logged-in users, property dropdown on Kontakt, contact history saved to localStorage. Does **not** cover dashboard pages (Sub-projects C & D).

---

## Architecture

One new file — `assets/js/contact-gate.js` — handles all behaviour in this sub-project. It is an IIFE that runs on every page that has gated CTAs or the Kontakt form. It reads `window.LafayetteAuth` (set by `auth.js` which loads first) and never modifies it.

```
auth.js  →  sets window.LafayetteAuth
contact-gate.js  →  reads window.LafayetteAuth, intercepts CTAs, manages kontakt form
```

---

## 1. CTA Gating

### Mechanism

Every contact CTA gets two HTML attributes:
- `data-gate="contact"` — marks it for interception
- `data-property="<name>"` — (optional) property name to pass to kontakt.html

`contact-gate.js` queries `[data-gate="contact"]` on `DOMContentLoaded`, then for each element:
- Prevents default navigation
- If **not logged in**: calls `LafayetteAuth.requireAuth(window.location.href)` → redirects to `anmelden.html?redirect=<currentPage>`
- If **logged in**: checks for `data-gate-follow="true"` on the element — if present, follows the element's own `href` unchanged (used for WhatsApp). Otherwise builds `kontakt.html?property=<encoded>` (or bare `kontakt.html` if no property) and navigates there. Uses the same `pathPrefix` pattern as `auth.js` for subdirectory support (`objekte/` prefix).

### CTA Inventory

| Page | Element | data-property |
|---|---|---|
| `index.html` | `a.btn-ghost` (hero "Kontakt aufnehmen") | _(none)_ |
| `index.html` | `a.prop-card__cta` × 3 (property cards) | "Prestige Villa München-Harlaching", "Mehrfamilienhaus Oberhaching", "Residential Mallorca" |
| `index.html` | `a.cta-btn-ghost` (contact section "Anfrage senden") | _(none)_ |
| `index.html` | `a.cta-btn-wa` (WhatsApp) | _(none)_ — also gets `data-gate-follow="true"` |
| `leistungen.html` | `a.leist-panel__cta` × 4 | _(none)_ |
| `objekte.html` | `.prop-card__cta` per card | per property name |
| `objekte/musterhaus.html` | replace sidebar form with gated CTA button | "Prestige Villa München-Harlaching" |

**Nav "Kontakt" link is NOT gated** — users can always reach the Kontakt page. Gating occurs on the form itself once they land there.

### Musterhaus special case

The `objekte/musterhaus.html` sidebar currently has an inline enquiry form. This is replaced in HTML with a simple CTA button:

```html
<div id="musterhaus-cta-wrap">
  <a href="../kontakt.html" class="btn-solid"
     data-gate="contact"
     data-property="Prestige Villa München-Harlaching">
    Anfrage stellen
  </a>
</div>
```

The old `<form class="enquiry-form">` is removed entirely.

---

## 2. Kontakt Page

### HTML changes

- The `<div class="kontakt-form">` wrapper gets `id="k-form-wrap"`
- The existing form gets `id="k-form"`
- Name fields get `id="k-vorname"` and `id="k-nachname"` (currently `id="vorname"` / `id="nachname"`)
- Email field gets `id="k-email"` (currently `id="email"`)
- Existing role `<select>` is **removed** (role is known from session when logged in; irrelevant for guest because form is hidden)
- A new property `<select id="k-property">` is added after the email field:

```html
<div class="form-group" id="k-property-group">
  <label class="form-label" for="k-property">Objekt (optional)</label>
  <select class="form-select" id="k-property" name="property">
    <option value="">Kein bestimmtes Objekt</option>
    <option value="Prestige Villa München-Harlaching">Prestige Villa München-Harlaching</option>
    <option value="Mehrfamilienhaus Oberhaching">Mehrfamilienhaus Oberhaching</option>
    <option value="Residential Mallorca">Residential Mallorca</option>
  </select>
</div>
```

- Textarea gets `id="k-nachricht"` (currently `id="nachricht"`)
- Submit button gets `id="k-submit"`
- `<script src="assets/js/contact-gate.js"></script>` added before `</body>`

### Logged-out behaviour (handled by contact-gate.js)

On load, if `LafayetteAuth.isLoggedIn()` is false:
1. `#k-form-wrap` inner HTML is replaced with `.k-login-prompt`:

```html
<div class="k-login-prompt">
  <div class="k-login-prompt__title">Bitte melden Sie sich an.</div>
  <p class="k-login-prompt__body">Als Mitglied des Lafayette-Netzwerks können Sie direkt und diskret Anfragen stellen.</p>
  <a href="anmelden.html?redirect=kontakt.html" class="k-login-prompt__btn">Anmelden / Registrieren</a>
</div>
```

The left column (phone, email, address, Ludwig portrait) remains fully visible.

### Logged-in behaviour (handled by contact-gate.js)

On load, if logged in:
1. Pre-fill `#k-vorname` with the first word of `session.name`; `#k-nachname` with everything after the first space (e.g. "Max Mustermann" → "Max" / "Mustermann"; "Anna-Lena Müller" → "Anna-Lena" / "Müller")
2. Pre-fill `#k-email` with `session.email`
3. Mark name and email inputs as `readonly` and add class `form-input--prefilled` (styled differently — dimmed text, no focus ring)
4. Read `?property=` from URL; if present, set matching `<option>` as selected in `#k-property`
5. Attach submit handler to `#k-form`:
   - `e.preventDefault()`
   - Build record: `{ date: new Date().toISOString(), property: k-property.value, message: k-nachricht.value, role: session.role }`
   - Prepend to `localStorage['lre_contacts']` array (create if absent)
   - Replace `#k-form-wrap` inner HTML with `.k-success` notice

### Success notice HTML (injected by JS)

```html
<div class="k-success">
  <div class="k-success__title">Anfrage gesendet.</div>
  <p class="k-success__body">Wir melden uns in Kürze bei Ihnen. Ihre Anfrage wurde in Ihrem Dashboard gespeichert.</p>
  <a href="index.html" class="k-success__link">Zur Startseite</a>
</div>
```

---

## 3. localStorage Contact History

Key: `lre_contacts`
Format: JSON array, newest first

```json
[
  {
    "date": "2026-05-20T14:32:00.000Z",
    "property": "Prestige Villa München-Harlaching",
    "message": "Ich interessiere mich sehr für dieses Objekt.",
    "role": "kaeufer"
  }
]
```

Read by Sub-project C (Käufer dashboard) to display contact history. No max length enforced in this sub-project.

---

## 4. CSS additions

**`assets/css/pages/kontakt.css`** — append:

```css
/* Pre-filled fields */
.form-input--prefilled {
  opacity: 0.55;
  cursor: default;
}
.form-input--prefilled:focus { outline: none; box-shadow: none; }

/* Login prompt */
.k-login-prompt { padding: 40px 0; }
.k-login-prompt__title {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 24px;
  color: var(--color-charcoal);
  letter-spacing: 1px;
  margin-bottom: 14px;
}
.k-login-prompt__body {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.8;
  margin-bottom: 28px;
}
.k-login-prompt__btn {
  display: inline-block;
  background: var(--color-green);
  color: var(--color-white);
  padding: 13px 28px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  text-decoration: none;
  transition: background var(--transition-base);
}
.k-login-prompt__btn:hover { background: var(--color-green-dark); }

/* Success notice */
.k-success { padding: 40px 0; }
.k-success__title {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 28px;
  color: var(--color-charcoal);
  letter-spacing: 1px;
  margin-bottom: 16px;
}
.k-success__body {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.8;
  margin-bottom: 28px;
}
.k-success__link {
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--color-green);
  text-decoration: none;
  border-bottom: 1px solid rgba(13, 61, 34, 0.3);
  padding-bottom: 2px;
}
```

---

## 5. Files Changed

| File | Change |
|---|---|
| `assets/js/contact-gate.js` | **Create** — CTA gating + kontakt page logic |
| `assets/css/pages/kontakt.css` | Append — pre-filled, login prompt, success styles |
| `index.html` | Add `data-gate` + `data-property` to 6 CTAs |
| `leistungen.html` | Add `data-gate` to 4 panel CTAs |
| `objekte.html` | Add `data-gate` + `data-property` to property card CTAs |
| `objekte/musterhaus.html` | Replace sidebar form with gated CTA button; add contact-gate.js |
| `kontakt.html` | Restructure form (new ids, remove role select, add property select); add contact-gate.js |

`contact-gate.js` is added only to pages where it's needed (the 5 pages with gated CTAs + kontakt.html). Pages without CTAs (ueber-uns.html, anmelden.html) don't need it.

---

## Out of Scope

- Seller-specific UI changes on public pages (Sub-project D)
- Dashboard pages reading `lre_contacts` (Sub-project C)
- Email sending or real form submission
- WhatsApp deep-link with property context (the WhatsApp CTA gates logged-out users but opens the plain wa.me link for logged-in users via `data-gate-follow="true"`)
