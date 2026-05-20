# Auth-Aware UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire CTA login gating across the site, pre-fill the Kontakt form for logged-in users with a property dropdown, and save contact submissions to localStorage.

**Architecture:** A single new `contact-gate.js` IIFE runs on every page with gated CTAs. It reads `window.LafayetteAuth` (set by `auth.js` which loads first) to intercept clicks and manage the Kontakt form state. HTML gets `data-gate="contact"` / `data-property` attributes; CSS gets three new state styles appended to `kontakt.css`.

**Tech Stack:** Vanilla JS (ES5 IIFE, matches existing codebase), HTML data attributes, localStorage, CSS custom properties

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `assets/js/contact-gate.js` | **Create** | CTA interception + kontakt page auth state |
| `assets/css/pages/kontakt.css` | Append | Pre-filled fields, login prompt, success notice |
| `index.html` | Modify | Add data-gate/data-property to 6 CTAs + add script tag |
| `leistungen.html` | Modify | Add data-gate to 4 panel CTAs + add script tag |
| `objekte/musterhaus.html` | Modify | Replace sidebar form with gated CTA + add script tag |
| `kontakt.html` | Modify | New field IDs, remove role select, add property select + add script tag |

---

## Task 1: Create `contact-gate.js`

**Files:**
- Create: `assets/js/contact-gate.js`

- [ ] **Step 1: Create the file with this exact content**

```js
(function () {
  'use strict';

  var CONTACTS_KEY = 'lre_contacts';

  function getPathPrefix() {
    return (/[/\\]objekte[/\\]/i.test(window.location.href)) ? '../' : '';
  }

  /* ---- CTA gating ---- */
  function initGate() {
    var gates = document.querySelectorAll('[data-gate="contact"]');
    if (!gates.length) return;

    gates.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();

        if (!window.LafayetteAuth || !window.LafayetteAuth.isLoggedIn()) {
          window.LafayetteAuth.requireAuth(window.location.href);
          return;
        }

        // data-gate-follow: logged-in users follow the element's own href (e.g. WhatsApp)
        if (el.dataset.gateFollow === 'true') {
          window.open(el.href, '_blank', 'noopener,noreferrer');
          return;
        }

        var property = el.dataset.property || '';
        var prefix   = getPathPrefix();
        var dest     = prefix + 'kontakt.html';
        if (property) dest += '?property=' + encodeURIComponent(property);
        window.location.href = dest;
      });
    });
  }

  /* ---- Kontakt page ---- */
  function initKontakt() {
    var formWrap = document.getElementById('k-form-wrap');
    if (!formWrap) return;

    /* Logged out: replace form with login prompt */
    if (!window.LafayetteAuth || !window.LafayetteAuth.isLoggedIn()) {
      formWrap.innerHTML =
        '<div class="k-login-prompt">' +
          '<div class="k-login-prompt__title">Bitte melden Sie sich an.</div>' +
          '<p class="k-login-prompt__body">Als Mitglied des Lafayette-Netzwerks können Sie direkt und diskret Anfragen stellen.</p>' +
          '<a href="anmelden.html?redirect=kontakt.html" class="k-login-prompt__btn">Anmelden / Registrieren</a>' +
        '</div>';
      return;
    }

    /* Logged in: pre-fill name + email */
    var session  = window.LafayetteAuth.getSession();
    var parts    = session.name.trim().split(' ');
    var vorname  = parts[0] || '';
    var nachname = parts.slice(1).join(' ') || '';

    function prefill(id, value) {
      var el = document.getElementById(id);
      if (!el) return;
      el.value = value;
      el.setAttribute('readonly', '');
      el.classList.add('form-input--prefilled');
    }
    prefill('k-vorname',  vorname);
    prefill('k-nachname', nachname);
    prefill('k-email',    session.email);

    /* Pre-select property dropdown from ?property= URL param */
    var params   = new URLSearchParams(window.location.search);
    var property = params.get('property') || '';
    var sel      = document.getElementById('k-property');
    if (sel && property) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === property) {
          sel.selectedIndex = i;
          break;
        }
      }
    }

    /* Submit: save to localStorage, show success */
    var form = document.getElementById('k-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nachrEl  = document.getElementById('k-nachricht');
      var record   = {
        date:     new Date().toISOString(),
        property: sel ? sel.value : '',
        message:  nachrEl ? nachrEl.value : '',
        role:     session.role
      };
      var contacts = [];
      try { contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; } catch (_) {}
      contacts.unshift(record);
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));

      formWrap.innerHTML =
        '<div class="k-success">' +
          '<div class="k-success__title">Anfrage gesendet.</div>' +
          '<p class="k-success__body">Wir melden uns in Kürze bei Ihnen. Ihre Anfrage wurde in Ihrem Dashboard gespeichert.</p>' +
          '<a href="index.html" class="k-success__link">Zur Startseite</a>' +
        '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGate();
    initKontakt();
  });

})();
```

- [ ] **Step 2: Verify file was created**

Open `assets/js/contact-gate.js` and confirm it starts with `(function () {` and ends with `})();`. Confirm `CONTACTS_KEY`, `initGate`, `initKontakt`, and `DOMContentLoaded` listener are all present.

- [ ] **Step 3: Commit**

```bash
git add assets/js/contact-gate.js
git commit -m "feat: add contact-gate.js — CTA gating and logged-in kontakt form logic"
```

---

## Task 2: CSS additions to `kontakt.css`

**Files:**
- Modify: `assets/css/pages/kontakt.css` (append to end)

- [ ] **Step 1: Append to end of `assets/css/pages/kontakt.css`**

```css
/* ============ PRE-FILLED FIELDS ============ */
.form-input--prefilled {
  opacity: 0.55;
  cursor: default;
  background: var(--color-white);
}
.form-input--prefilled:focus {
  outline: none;
  box-shadow: none;
  border-color: var(--color-border);
}

/* ============ LOGIN PROMPT ============ */
.k-login-prompt { padding: 40px 0; }
.k-login-prompt__title {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 24px;
  color: var(--color-charcoal);
  letter-spacing: 1px;
  margin-bottom: 14px;
  line-height: 1.2;
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

/* ============ SUCCESS NOTICE ============ */
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
  transition: border-color var(--transition-base);
}
.k-success__link:hover { border-color: var(--color-green); }
```

- [ ] **Step 2: Commit**

```bash
git add assets/css/pages/kontakt.css
git commit -m "feat: add pre-filled field, login prompt, and success notice styles"
```

---

## Task 3: Add `data-gate` to `index.html` and `leistungen.html`

**Files:**
- Modify: `index.html`
- Modify: `leistungen.html`

- [ ] **Step 1: Update hero CTA in `index.html`**

Find (line ~50):
```html
        <a href="kontakt.html" class="btn-ghost">Kontakt aufnehmen</a>
```
Replace with:
```html
        <a href="kontakt.html" class="btn-ghost" data-gate="contact">Kontakt aufnehmen</a>
```

- [ ] **Step 2: Update 3 property card CTAs in `index.html`**

Find Card 1 CTA (line ~101):
```html
              <a href="objekte/musterhaus.html" class="prop-card__cta">Anfrage stellen →</a>
```
Replace with:
```html
              <a href="objekte/musterhaus.html" class="prop-card__cta" data-gate="contact" data-property="Prestige Villa München-Harlaching">Anfrage stellen →</a>
```

Find Card 2 CTA (line ~117):
```html
              <a href="objekte.html" class="prop-card__cta">Anfrage stellen →</a>
```
Replace with:
```html
              <a href="objekte.html" class="prop-card__cta" data-gate="contact" data-property="Mehrfamilienhaus Oberhaching">Anfrage stellen →</a>
```

Find Card 3 CTA (line ~133):
```html
              <a href="objekte.html" class="prop-card__cta">Anfrage stellen →</a>
```
Replace with:
```html
              <a href="objekte.html" class="prop-card__cta" data-gate="contact" data-property="Residential Mallorca">Anfrage stellen →</a>
```

- [ ] **Step 3: Update contact section CTAs in `index.html`**

Find (lines ~197–198):
```html
        <a href="kontakt.html" class="cta-btn-ghost">Anfrage senden</a>
        <a href="https://wa.me/4915140767073" class="cta-btn-wa" target="_blank" rel="noopener noreferrer">WhatsApp</a>
```
Replace with:
```html
        <a href="kontakt.html" class="cta-btn-ghost" data-gate="contact">Anfrage senden</a>
        <a href="https://wa.me/4915140767073" class="cta-btn-wa" target="_blank" rel="noopener noreferrer" data-gate="contact" data-gate-follow="true">WhatsApp</a>
```

- [ ] **Step 4: Add `contact-gate.js` script tag to `index.html`**

Find at end of body (line ~233):
```html
  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
```
Replace with:
```html
  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
  <script src="assets/js/contact-gate.js"></script>
```

- [ ] **Step 5: Update 4 panel CTAs in `leistungen.html`**

In `leistungen.html`, find all four `.leist-panel__cta` links:
```html
            <a href="kontakt.html" class="leist-panel__cta">Anfrage stellen →</a>
```
Each of the 4 occurrences becomes:
```html
            <a href="kontakt.html" class="leist-panel__cta" data-gate="contact">Anfrage stellen →</a>
```
(Use replace_all — all 4 are identical and can be replaced at once.)

- [ ] **Step 6: Add `contact-gate.js` script tag to `leistungen.html`**

Find at end of body:
```html
  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
  <script src="assets/js/leistungen.js"></script>
```
Replace with:
```html
  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
  <script src="assets/js/leistungen.js"></script>
  <script src="assets/js/contact-gate.js"></script>
```

- [ ] **Step 7: Commit**

```bash
git add index.html leistungen.html
git commit -m "feat: gate contact CTAs on index and leistungen pages"
```

---

## Task 4: Musterhaus sidebar — replace form with gated CTA

**Files:**
- Modify: `objekte/musterhaus.html`

- [ ] **Step 1: Replace the sidebar enquiry form**

In `objekte/musterhaus.html`, find the entire `<form class="enquiry-form" ...>...</form>` block (lines ~91–109) and replace it with a gated CTA link. The sidebar structure becomes:

```html
    <div class="detail-sidebar">
      <div class="section-label">Anfrage stellen</div>

      <!-- Ludwig contact card -->
      <div class="contact-card">
        <div class="contact-avatar">
          <img src="../assets/images/ludwig_company.jpg" alt="Ludwig Zoller — CEO Lafayette Real Estate">
        </div>
        <div>
          <div class="contact-name">Ludwig Zoller</div>
          <div class="contact-role">CEO &amp; Co-Founder</div>
        </div>
      </div>

      <!-- Gated CTA (replaces inline form) -->
      <a href="../kontakt.html"
         class="btn-solid"
         data-gate="contact"
         data-property="Prestige Villa München-Harlaching"
         style="display:inline-block;margin-top:28px;text-align:center;width:100%;">
        Anfrage stellen
      </a>
    </div>
```

- [ ] **Step 2: Add `contact-gate.js` script tag**

Find at end of body:
```html
  <script src="../assets/js/nav.js"></script>
  <script src="../assets/js/auth.js"></script>
```
Replace with:
```html
  <script src="../assets/js/nav.js"></script>
  <script src="../assets/js/auth.js"></script>
  <script src="../assets/js/contact-gate.js"></script>
```

- [ ] **Step 3: Commit**

```bash
git add objekte/musterhaus.html
git commit -m "feat: replace musterhaus inline form with gated CTA button"
```

---

## Task 5: Restructure `kontakt.html` form

**Files:**
- Modify: `kontakt.html`

- [ ] **Step 1: Add `id="k-form-wrap"` to the form container div**

Find (line ~83):
```html
      <div class="kontakt-form">
```
Replace with:
```html
      <div class="kontakt-form" id="k-form-wrap">
```

- [ ] **Step 2: Add `id="k-form"` to the form element**

Find (line ~85):
```html
        <form class="k-form" action="#" method="post">
```
Replace with:
```html
        <form class="k-form" id="k-form" action="#" method="post">
```

- [ ] **Step 3: Rename field IDs — Vorname**

Find:
```html
          <label class="form-label" for="vorname">Vorname</label>
          <input class="form-input" type="text" id="vorname" name="vorname" placeholder="Max" required>
```
Replace with:
```html
          <label class="form-label" for="k-vorname">Vorname</label>
          <input class="form-input" type="text" id="k-vorname" name="vorname" placeholder="Max" required>
```

- [ ] **Step 4: Rename field IDs — Nachname**

Find:
```html
          <label class="form-label" for="nachname">Nachname</label>
          <input class="form-input" type="text" id="nachname" name="nachname" placeholder="Mustermann" required>
```
Replace with:
```html
          <label class="form-label" for="k-nachname">Nachname</label>
          <input class="form-input" type="text" id="k-nachname" name="nachname" placeholder="Mustermann" required>
```

- [ ] **Step 5: Rename field IDs — E-Mail**

Find:
```html
          <label class="form-label" for="email">E-Mail</label>
          <input class="form-input" type="email" id="email" name="email" placeholder="max@beispiel.de" required>
```
Replace with:
```html
          <label class="form-label" for="k-email">E-Mail</label>
          <input class="form-input" type="email" id="k-email" name="email" placeholder="max@beispiel.de" required>
```

- [ ] **Step 6: Remove role select, add property select**

Find and remove the entire role form-group (lines ~103–113):
```html
          <div class="form-group">
            <label class="form-label" for="interesse">Ich bin interessiert als</label>
            <select class="form-select" id="interesse" name="interesse" required>
              <option value="" disabled selected>Bitte wählen…</option>
              <option value="kaeufer">Käufer</option>
              <option value="verkaeufer">Verkäufer</option>
              <option value="investor">Investor / Family Office</option>
              <option value="fonds">Fonds / institutioneller Investor</option>
              <option value="sonstiges">Sonstiges</option>
            </select>
          </div>
```

Replace it with the property select:
```html
          <div class="form-group">
            <label class="form-label" for="k-property">Objekt (optional)</label>
            <select class="form-select" id="k-property" name="property">
              <option value="">Kein bestimmtes Objekt</option>
              <option value="Prestige Villa München-Harlaching">Prestige Villa München-Harlaching</option>
              <option value="Mehrfamilienhaus Oberhaching">Mehrfamilienhaus Oberhaching</option>
              <option value="Residential Mallorca">Residential Mallorca</option>
            </select>
          </div>
```

- [ ] **Step 7: Rename Nachricht field ID**

Find:
```html
          <label class="form-label" for="nachricht">Ihre Nachricht</label>
          <textarea class="form-textarea" id="nachricht" name="nachricht" rows="5" placeholder="Beschreiben Sie kurz Ihr Anliegen…" required></textarea>
```
Replace with:
```html
          <label class="form-label" for="k-nachricht">Ihre Nachricht</label>
          <textarea class="form-textarea" id="k-nachricht" name="nachricht" rows="5" placeholder="Beschreiben Sie kurz Ihr Anliegen…" required></textarea>
```

- [ ] **Step 8: Add `contact-gate.js` script tag**

Find at end of body:
```html
  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
```
Replace with:
```html
  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
  <script src="assets/js/contact-gate.js"></script>
```

- [ ] **Step 9: End-to-end browser verification**

**Test A — Logged-out CTA gating:**
Open `index.html`. Clear localStorage (`localStorage.clear()`). Click "Kontakt aufnehmen" in the hero.
Expected: Redirected to `anmelden.html?redirect=index.html`.

**Test B — WhatsApp pass-through:**
While logged out, click "WhatsApp" in the contact section.
Expected: Redirected to login (gated). NOT opened to WhatsApp.
Then log in as `kaeufer@demo.de` / `demo1234`. Click WhatsApp.
Expected: Opens `wa.me/...` in a new tab. Does NOT go to `kontakt.html`.

**Test C — Logged-in property inquiry:**
Logged in as Käufer. Click "Anfrage stellen →" on the München-Harlaching card.
Expected: Navigated to `kontakt.html?property=Prestige%20Villa%20M%C3%BCnchen-Harlaching`.

**Test D — Kontakt page logged-out:**
Open `kontakt.html` directly while logged out.
Expected: Left column (phone, email, address, portrait) is visible. Right column shows login prompt with "Anmelden / Registrieren" button. No form visible.

**Test E — Kontakt page logged-in with property:**
Navigate to `kontakt.html?property=Prestige%20Villa%20M%C3%BCnchen-Harlaching` while logged in.
Expected: Vorname="Max", Nachname="Mustermann", Email="kaeufer@demo.de" pre-filled and readonly (dimmed). Objekt dropdown shows "Prestige Villa München-Harlaching" pre-selected. Textarea is blank.

**Test F — Submit and localStorage:**
Fill in a message, submit the form.
Expected: Form replaced by success notice. Check localStorage: `JSON.parse(localStorage.getItem('lre_contacts'))` should return an array with one object `{ date, property: "Prestige Villa München-Harlaching", message: "...", role: "kaeufer" }`.

**Test G — Musterhaus sidebar:**
Open `objekte/musterhaus.html` while logged out. Click "Anfrage stellen".
Expected: Redirected to `anmelden.html?redirect=<musterhaus-url>`.
Log in, return to musterhaus. Click "Anfrage stellen".
Expected: Navigated to `../kontakt.html?property=Prestige%20Villa%20M%C3%BCnchen-Harlaching`.

- [ ] **Step 10: Commit**

```bash
git add kontakt.html
git commit -m "feat: restructure kontakt form — new ids, property dropdown, remove role select"
```

---

## Self-review notes

- `contact-gate.js` must be loaded AFTER `auth.js` on every page — plan ensures this by inserting it after the `auth.js` script tag.
- `data-gate-follow="true"` causes the WhatsApp link to open in a new tab (window.open with noopener). The outer `e.preventDefault()` still fires but is immediately overridden by window.open — this is correct behaviour.
- The form field IDs in Task 5 (`k-vorname`, `k-nachname`, `k-email`, `k-property`, `k-nachricht`) exactly match what `initKontakt()` in Task 1 queries via `document.getElementById`.
- `musterhaus.html` uses `../assets/js/contact-gate.js` (relative path with `../`) consistent with the existing `../assets/js/auth.js` path already in that file.
- The property option values in `#k-property` exactly match the `data-property` attribute values used on the CTAs — both use the full German name ("Prestige Villa München-Harlaching" etc.) — so URL encoding and matching will work correctly.
