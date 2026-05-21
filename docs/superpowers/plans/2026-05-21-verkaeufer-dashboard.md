# Verkäufer Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `dashboard-verkaeufer.html` — a seller dashboard showing 3 hardcoded property cards and live buyer inquiry rows from localStorage, with a click-to-filter interaction linking the two sections.

**Architecture:** Three-file delivery — HTML shell, a JS IIFE (auth guard + data rendering + filter logic), and CSS additions to the shared `dashboard.css`. A pre-patch to `contact-gate.js` adds `name` to stored records so the seller can see who submitted each inquiry. No new dependencies; reuses all existing CSS custom properties and the `window.LafayetteAuth` API.

**Tech Stack:** Vanilla JS (ES5 IIFE pattern, matching existing codebase), CSS custom properties, localStorage

---

## File Map

| File | Action | What changes |
|---|---|---|
| `assets/js/contact-gate.js` | **Modify** line 92–97 | Add `name: session.name` to stored record |
| `assets/css/pages/dashboard.css` | **Extend** | Append Verkäufer-specific classes at end of file |
| `dashboard-verkaeufer.html` | **Create** | Full page HTML |
| `assets/js/dashboard-verkaeufer.js` | **Create** | Auth guard + property cards + inquiry rows + filter |

---

## Task 1 — Patch `contact-gate.js` to store sender name

**Files:**
- Modify: `assets/js/contact-gate.js:92-97`

The current record object (line 92–97) does not include the sender's name, so the seller dashboard has no name to display. Add `name: session.name`.

- [ ] **Open `assets/js/contact-gate.js` and find this block (around line 92):**

```js
      var record   = {
        date:     new Date().toISOString(),
        property: sel ? sel.value : '',
        message:  nachrEl ? nachrEl.value : '',
        role:     session.role
      };
```

- [ ] **Replace it with:**

```js
      var record   = {
        date:     new Date().toISOString(),
        name:     session.name || '',
        property: sel ? sel.value : '',
        message:  nachrEl ? nachrEl.value : '',
        role:     session.role
      };
```

- [ ] **Verify manually:** Open `kontakt.html` while logged in as `kaeufer@demo.de` / `demo1234`, submit a test enquiry, then open DevTools → Application → Local Storage → find `lre_contacts`. Confirm the newest record has a `name` field with value `"Max Mustermann"`.

- [ ] **Commit:**

```bash
git add assets/js/contact-gate.js
git commit -m "fix: store sender name in lre_contacts records"
```

---

## Task 2 — Extend `dashboard.css` with Verkäufer-specific classes

**Files:**
- Modify: `assets/css/pages/dashboard.css` (append to end of file)

- [ ] **Append the following to the end of `assets/css/pages/dashboard.css`:**

```css
/* ============ VERKÄUFER — PROPERTY CARD GRID ============ */

.dash-prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 4px;
}

.dash-prop-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  padding: 16px;
  cursor: pointer;
  transition: border-color var(--transition-base);
}

.dash-prop-card:hover { border-color: var(--color-green); }

.dash-prop-card.active { border: 2px solid var(--color-green); }

.dash-prop-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.dash-prop-type {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-green);
  opacity: 0.5;
}

/* Status badges */
.dash-prop-status {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 3px 7px;
}

.dash-prop-status--aktiv {
  color: var(--color-green);
  background: rgba(13, 61, 34, 0.08);
  border: 1px solid rgba(13, 61, 34, 0.2);
}

.dash-prop-status--verhandlung {
  color: #7a5c20;
  background: rgba(138, 109, 59, 0.08);
  border: 1px solid rgba(138, 109, 59, 0.2);
}

.dash-prop-status--abgeschlossen {
  color: #888;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.dash-prop-name {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-charcoal);
  margin-bottom: 4px;
  line-height: 1.35;
}

.dash-prop-detail {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}

.dash-prop-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: 8px;
  margin-top: 4px;
}

.dash-prop-stat { text-align: center; }

.dash-prop-stat-num {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: 20px;
  color: var(--color-green);
  line-height: 1;
}

.dash-prop-stat-lbl {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.35);
  margin-top: 3px;
}

/* ============ VERKÄUFER — FILTER BAR ============ */

.dash-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(13, 61, 34, 0.06);
  border: 1px solid rgba(13, 61, 34, 0.15);
  padding: 8px 14px;
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--color-green);
  letter-spacing: 1px;
}

.dash-filter-bar.hidden { display: none; }

.dash-filter-clear {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-green);
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.65;
  text-decoration: underline;
}

/* ============ VERKÄUFER — INQUIRY ROWS ============ */

.dash-inquiry-sender {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-charcoal);
  margin-bottom: 4px;
}

.dash-inquiry-row--dimmed { opacity: 0.25; }

/* ============ RESPONSIVE — VERKÄUFER ============ */

@media (max-width: 767px) {
  .dash-prop-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Commit:**

```bash
git add assets/css/pages/dashboard.css
git commit -m "feat: add Verkäufer dashboard CSS classes"
```

---

## Task 3 — Create `dashboard-verkaeufer.html`

**Files:**
- Create: `dashboard-verkaeufer.html`

- [ ] **Create `dashboard-verkaeufer.html` with this exact content:**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Verkäufer Dashboard — Lafayette Real Estate</title>
  <link rel="icon" href="data:,">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;1,200;1,300&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="assets/css/variables.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components/navbar.css">
  <link rel="stylesheet" href="assets/css/pages/dashboard.css">
</head>
<body>

  <!-- ======= NAVBAR ======= -->
  <nav id="main-nav" aria-label="Hauptnavigation" class="scrolled">
    <a href="index.html" class="nav-logo">
      <div class="nav-logo__name">Lafayette</div>
      <div class="nav-logo__sub">Real Estate</div>
    </a>
    <div class="nav-links">
      <a href="objekte.html">Objekte</a>
      <a href="leistungen.html">Leistungen</a>
      <a href="ueber-uns.html">&Uuml;ber uns</a>
      <a href="kontakt.html">Kontakt</a>
      <a href="anmelden.html" class="nav-links__cta">Anmelden</a>
    </div>
  </nav>

  <!-- ======= DASHBOARD ======= -->
  <div class="dash-layout">

    <!-- Sidebar -->
    <aside class="dash-sidebar">
      <nav class="dash-sidenav">
        <a href="#"                class="dash-sidenav__item active">&Uuml;bersicht</a>
        <a href="#dash-properties" class="dash-sidenav__item">Meine Objekte</a>
        <a href="#dash-inquiries"  class="dash-sidenav__item">Anfragen</a>
      </nav>
      <button class="dash-sidenav__logout" id="dash-logout">Abmelden</button>
    </aside>

    <!-- Content -->
    <main class="dash-content">

      <!-- Welcome -->
      <section class="dash-welcome">
        <div class="dash-eyebrow">Willkommen zur&uuml;ck</div>
        <h1 class="dash-headline" id="dash-name"></h1>
      </section>

      <!-- Stats row -->
      <div class="dash-stats">
        <div class="dash-stat">
          <div class="dash-stat-num">3</div>
          <div class="dash-stat-lbl">Objekte inseriert</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-num" id="dash-count-inquiries">&mdash;</div>
          <div class="dash-stat-lbl">Anfragen eingegangen</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-num">Verk&auml;ufer</div>
          <div class="dash-stat-lbl">Ihr Profil</div>
        </div>
      </div>

      <!-- Meine Objekte -->
      <section class="dash-section" id="dash-properties">
        <div class="dash-section-title">Meine Objekte</div>
        <div class="dash-prop-grid" id="dash-prop-grid"></div>
      </section>

      <!-- Eingegangene Anfragen -->
      <section class="dash-section" id="dash-inquiries">
        <div class="dash-section-title">Eingegangene Anfragen</div>
        <div id="dash-filter-bar" class="dash-filter-bar hidden">
          <span id="dash-filter-label"></span>
          <button class="dash-filter-clear" id="dash-filter-clear">Alle anzeigen &times;</button>
        </div>
        <div id="dash-inquiry-list"></div>
      </section>

      <!-- CTA strip -->
      <div class="dash-cta">
        <div class="dash-cta-text">Neues Objekt einreichen.</div>
        <a href="kontakt.html" class="dash-cta-btn">Kontakt aufnehmen &rarr;</a>
      </div>

    </main>
  </div>

  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
  <script src="assets/js/dashboard-verkaeufer.js"></script>
</body>
</html>
```

- [ ] **Commit:**

```bash
git add dashboard-verkaeufer.html
git commit -m "feat: add Verkäufer dashboard HTML shell"
```

---

## Task 4 — Create `assets/js/dashboard-verkaeufer.js`

**Files:**
- Create: `assets/js/dashboard-verkaeufer.js`

- [ ] **Create `assets/js/dashboard-verkaeufer.js` with this exact content:**

```js
(function () {
  'use strict';

  var CONTACTS_KEY = 'lre_contacts';

  var PROPERTIES = [
    {
      name:    'Prestige Villa München-Harlaching',
      type:    'Residential',
      detail:  '480m² · 6 Einheiten',
      status:  'Aktiv',
      modifier: 'aktiv',
      days:    12
    },
    {
      name:    'Mehrfamilienhaus Oberhaching',
      type:    'Residential',
      detail:  '8 Einheiten',
      status:  'In Verhandlung',
      modifier: 'verhandlung',
      days:    28
    },
    {
      name:    'Residential Mallorca',
      type:    'Ausland',
      detail:  '320m² · Villa',
      status:  'Abgeschlossen',
      modifier: 'abgeschlossen',
      days:    45
    }
  ];

  var activeFilter = null;

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('de-DE', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (_) { return iso; }
  }

  function truncate(str, max) {
    if (!str || !str.trim()) return 'Kein Nachrichtentext';
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  function renderCards(contacts) {
    var grid = document.getElementById('dash-prop-grid');
    if (!grid) return;

    var html = '';
    PROPERTIES.forEach(function (prop) {
      var count = contacts.filter(function (r) {
        return r.property === prop.name;
      }).length;

      html +=
        '<div class="dash-prop-card" data-prop-name="' + prop.name + '">' +
          '<div class="dash-prop-top">' +
            '<div class="dash-prop-type">' + prop.type + '</div>' +
            '<span class="dash-prop-status dash-prop-status--' + prop.modifier + '">' + prop.status + '</span>' +
          '</div>' +
          '<div class="dash-prop-name">' + prop.name + '</div>' +
          '<div class="dash-prop-detail">' + prop.detail + '</div>' +
          '<div class="dash-prop-footer">' +
            '<div class="dash-prop-stat">' +
              '<div class="dash-prop-stat-num">' + count + '</div>' +
              '<div class="dash-prop-stat-lbl">Anfragen</div>' +
            '</div>' +
            '<div class="dash-prop-stat">' +
              '<div class="dash-prop-stat-num">' + prop.days + '</div>' +
              '<div class="dash-prop-stat-lbl">Tage aktiv</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.dash-prop-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var name = card.getAttribute('data-prop-name');
        applyFilter(activeFilter === name ? null : name);
      });
    });
  }

  function renderInquiries(contacts) {
    var listEl = document.getElementById('dash-inquiry-list');
    if (!listEl) return;

    if (!contacts.length) {
      listEl.innerHTML =
        '<div class="dash-empty"><p>Noch keine Anfragen eingegangen.</p></div>';
      return;
    }

    var html = '';
    contacts.forEach(function (r) {
      var sender  = r.name || 'Unbekannt';
      var prop    = r.property || 'Allgemeine Anfrage';
      var date    = formatDate(r.date);
      var preview = truncate(r.message, 40);
      html +=
        '<div class="dash-inquiry-row" data-prop-name="' + prop + '">' +
          '<div class="dash-inquiry-body">' +
            '<div class="dash-inquiry-sender">' + sender + '</div>' +
            '<div class="dash-inquiry-meta">' + prop + ' · ' + date + ' · &ldquo;' + preview + '&rdquo;</div>' +
          '</div>' +
          '<div class="dash-inquiry-tag">Neu</div>' +
        '</div>';
    });
    listEl.innerHTML = html;
  }

  function applyFilter(propName) {
    activeFilter = propName;

    /* Update card highlight */
    document.querySelectorAll('.dash-prop-card').forEach(function (card) {
      card.classList.toggle('active', card.getAttribute('data-prop-name') === activeFilter);
    });

    /* Show / hide filter bar */
    var bar   = document.getElementById('dash-filter-bar');
    var label = document.getElementById('dash-filter-label');
    if (bar) bar.classList.toggle('hidden', !activeFilter);
    if (label && activeFilter) label.textContent = 'Gefiltert: ' + activeFilter;

    /* Dim non-matching inquiry rows */
    document.querySelectorAll('#dash-inquiry-list .dash-inquiry-row').forEach(function (row) {
      var match = !activeFilter || row.getAttribute('data-prop-name') === activeFilter;
      row.classList.toggle('dash-inquiry-row--dimmed', !match);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* 1 — Auth guard */
    var session = window.LafayetteAuth && window.LafayetteAuth.getSession();
    if (!session || session.role !== 'verkaeufer') {
      window.location.href = 'anmelden.html';
      return;
    }

    /* 2 — Populate name */
    var nameEl = document.getElementById('dash-name');
    if (nameEl) nameEl.textContent = session.name;

    /* 3 — Load contacts */
    var contacts = [];
    try { contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; } catch (_) {}

    /* 4 — Update inquiry count stat */
    var countEl = document.getElementById('dash-count-inquiries');
    if (countEl) countEl.textContent = String(contacts.length);

    /* 5 — Render property cards */
    renderCards(contacts);

    /* 6 — Render inquiry rows */
    renderInquiries(contacts);

    /* 7 — Filter bar clear button */
    var clearBtn = document.getElementById('dash-filter-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () { applyFilter(null); });

    /* 8 — Logout */
    var logoutBtn = document.getElementById('dash-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', function () {
      window.LafayetteAuth.logout();
    });

  });

})();
```

- [ ] **Commit:**

```bash
git add assets/js/dashboard-verkaeufer.js
git commit -m "feat: add Verkäufer dashboard JS — auth guard, property cards, filter"
```

---

## Task 5 — Manual verification

No automated test framework in this project. Verify by opening the pages in a browser.

- [ ] **Open `anmelden.html` in a browser. Log in as `verkaeufer@demo.de` / `demo1234`.** Expected: redirected to `dashboard-verkaeufer.html`. Nav shows "Anna M. ▾" user menu.

- [ ] **Verify the three stat boxes** show: `3 · Objekte inseriert`, `— · Anfragen eingegangen` (or a number if you already submitted inquiries), `Verkäufer · Ihr Profil`.

- [ ] **Verify Meine Objekte** shows three cards: "Prestige Villa München-Harlaching" (Aktiv, green badge), "Mehrfamilienhaus Oberhaching" (In Verhandlung, amber badge), "Residential Mallorca" (Abgeschlossen, grey badge). Each card has an Anfragen count and a Tage aktiv count at the bottom.

- [ ] **Verify Eingegangene Anfragen** shows the empty state ("Noch keine Anfragen eingegangen.") if no inquiries exist in localStorage, OR shows rows with sender name (no email) if inquiries were submitted.

- [ ] **Test the filter:** Click "Prestige Villa München-Harlaching" card. Expected: card gets a thick green border, a green filter bar appears below the card grid reading "Gefiltert: Prestige Villa München-Harlaching", inquiry rows for other properties dim to 25% opacity. Click the same card again — filter clears. Also test the "Alle anzeigen ×" button.

- [ ] **Test the cross-dashboard story:** Log out, log in as `kaeufer@demo.de` / `demo1234`, go to `kontakt.html`, submit an inquiry selecting "Prestige Villa München-Harlaching" from the dropdown. Log out, log in as `verkaeufer@demo.de` / `demo1234`, open `dashboard-verkaeufer.html`. The new inquiry should appear in "Eingegangene Anfragen" with sender name "Max Mustermann". The Anfragen count on the Villa card should reflect it.

- [ ] **Test auth guard:** While logged out (or logged in as `kaeufer@demo.de`), navigate directly to `dashboard-verkaeufer.html`. Expected: immediate redirect to `anmelden.html`.

- [ ] **Test mobile layout:** Resize browser to below 768px. Expected: sidebar becomes a horizontal scrollable tab bar, property card grid collapses to single column.

- [ ] **Commit:**

```bash
git add -A
git commit -m "feat: Verkäufer dashboard — complete (Sub-project D)"
```
