# Verkäufer Dashboard — Design Spec

**Date:** 2026-05-21
**Status:** Approved
**Part of:** 4-part dashboard system (A ✅ → B ✅ → C ✅ → **D**)
**Depends on:** Sub-project A (LafayetteAuth) + Sub-project B (lre_contacts localStorage) + dashboard-kaeufer

---

## Scope

One new page — `dashboard-verkaeufer.html` — with its own JS and additions to the shared `dashboard.css`. Shows the logged-in seller's property listings and received buyer inquiries. Accessible only when logged in as role `verkaeufer`.

Demo account: `verkaeufer@demo.de` / `demo1234` (name: Anna Müller).

---

## Layout

Identical sidebar + cream content shell as `dashboard-kaeufer.html`.

```
┌─────────────────────────────────────────────────┐
│  Nav bar (dark green, same as site nav)         │
├──────────────┬──────────────────────────────────┤
│  Sidebar     │  Content area (cream)            │
│  (dark green │                                  │
│   180px)     │  Welcome headline                │
│              │  Stats row                       │
│  Übersicht ◄ │  Meine Objekte (card grid)       │
│  Meine Obj.  │  Eingegangene Anfragen (rows)    │
│  Anfragen    │  CTA strip                       │
│  ─────       │                                  │
│  Abmelden    │                                  │
└──────────────┴──────────────────────────────────┘
```

---

## Files

| File | Action | Responsibility |
|---|---|---|
| `dashboard-verkaeufer.html` | **Create** | Page HTML |
| `assets/css/pages/dashboard.css` | **Extend** | Add Verkäufer-specific classes |
| `assets/js/dashboard-verkaeufer.js` | **Create** | Auth guard + data population + filter interaction |

---

## HTML Structure (`dashboard-verkaeufer.html`)

Standard page shell — same CSS/JS includes as other pages.

**Script load order** (all before `</body>`):
```html
<script src="assets/js/nav.js"></script>
<script src="assets/js/auth.js"></script>
<script src="assets/js/dashboard-verkaeufer.js"></script>
```

**Layout skeleton:**
```html
<body>
  <nav id="main-nav"><!-- standard nav --></nav>

  <div class="dash-layout">
    <aside class="dash-sidebar">
      <nav class="dash-sidenav">
        <a href="#"               class="dash-sidenav__item active">Übersicht</a>
        <a href="#dash-properties" class="dash-sidenav__item">Meine Objekte</a>
        <a href="#dash-inquiries"  class="dash-sidenav__item">Anfragen</a>
      </nav>
      <button class="dash-sidenav__logout" id="dash-logout">Abmelden</button>
    </aside>

    <main class="dash-content">

      <!-- Welcome -->
      <section class="dash-welcome">
        <div class="dash-eyebrow">Willkommen zurück</div>
        <h1 class="dash-headline" id="dash-name"><!-- filled by JS --></h1>
      </section>

      <!-- Stats -->
      <div class="dash-stats">
        <div class="dash-stat">
          <div class="dash-stat-num">3</div>
          <div class="dash-stat-lbl">Objekte inseriert</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-num" id="dash-count-inquiries">—</div>
          <div class="dash-stat-lbl">Anfragen eingegangen</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-num">Verkäufer</div>
          <div class="dash-stat-lbl">Ihr Profil</div>
        </div>
      </div>

      <!-- Meine Objekte -->
      <section class="dash-section" id="dash-properties">
        <div class="dash-section-title">Meine Objekte</div>
        <div class="dash-prop-grid" id="dash-prop-grid"><!-- filled by JS --></div>
      </section>

      <!-- Eingegangene Anfragen -->
      <section class="dash-section" id="dash-inquiries">
        <div class="dash-section-title">Eingegangene Anfragen</div>
        <div id="dash-filter-bar" class="dash-filter-bar hidden">
          <span id="dash-filter-label"></span>
          <button class="dash-filter-clear" id="dash-filter-clear">Alle anzeigen ×</button>
        </div>
        <div id="dash-inquiry-list"><!-- filled by JS --></div>
      </section>

      <!-- CTA -->
      <div class="dash-cta">
        <div class="dash-cta-text">Neues Objekt einreichen.</div>
        <a href="kontakt.html" class="dash-cta-btn">Kontakt aufnehmen →</a>
      </div>

    </main>
  </div>
</body>
```

---

## Mock Properties (seeded in JS)

Three hardcoded properties. The `name` field must exactly match the `property` field stored in `lre_contacts` records for the filter to work.

| # | Name | Type | Detail | Status | Days active |
|---|---|---|---|---|---|
| 1 | Prestige Villa München-Harlaching | Residential | 480m² · 6 Einheiten | Aktiv | 12 |
| 2 | Mehrfamilienhaus Oberhaching | Residential | 8 Einheiten | In Verhandlung | 28 |
| 3 | Residential Mallorca | Ausland | 320m² · Villa | Abgeschlossen | 45 |

These names **must exactly match** the `value` attributes in the `#k-property` select in `kontakt.html` (already set). The filter cross-reference only works if the strings are identical.

Status badge colours:
- **Aktiv** → green (`rgba(13,61,34,…)`)
- **In Verhandlung** → gold/amber (`rgba(138,109,59,…)`)
- **Abgeschlossen** → grey (`rgba(0,0,0,…)`)

---

## JS — `assets/js/dashboard-verkaeufer.js`

Runs on `DOMContentLoaded`. Seven responsibilities:

### 1. Auth guard
```js
var session = window.LafayetteAuth && window.LafayetteAuth.getSession();
if (!session || session.role !== 'verkaeufer') {
  window.location.href = 'anmelden.html';
  return;
}
```

### 2. Populate session name
```js
document.getElementById('dash-name').textContent = session.name;
```

### 3. Read & count inquiries from localStorage
```js
var contacts = [];
try { contacts = JSON.parse(localStorage.getItem('lre_contacts')) || []; } catch (_) {}
document.getElementById('dash-count-inquiries').textContent = contacts.length;
```

### 4. Render property cards
Iterate the 3 hardcoded properties. For each, count matching `contacts` entries where `record.property === prop.name`. Render into `#dash-prop-grid`:

```html
<div class="dash-prop-card" data-prop-name="Prestige Villa München-Harlaching">
  <div class="dash-prop-top">
    <div class="dash-prop-type">Residential</div>
    <span class="dash-prop-status dash-prop-status--aktiv">Aktiv</span>
  </div>
  <div class="dash-prop-name">Prestige Villa<br>München-Harlaching</div>
  <div class="dash-prop-detail">480m² · 6 Einheiten</div>
  <div class="dash-prop-footer">
    <div class="dash-prop-stat">
      <div class="dash-prop-stat-num">2</div><!-- live count -->
      <div class="dash-prop-stat-lbl">Anfragen</div>
    </div>
    <div class="dash-prop-stat">
      <div class="dash-prop-stat-num">12</div>
      <div class="dash-prop-stat-lbl">Tage aktiv</div>
    </div>
  </div>
</div>
```

Each card gets a `click` listener → calls `applyFilter(propName)`.

### 5. Render inquiry rows
Read all `contacts` entries (newest first — already stored newest-first by `contact-gate.js` via `unshift`). Render into `#dash-inquiry-list`:

**Date formatting:** `new Date(record.date).toLocaleDateString('de-DE', { day:'numeric', month:'long', year:'numeric' })`

**Message preview:** first 40 chars of `record.message` + `…` if truncated. Empty → `"Kein Nachrichtentext"`.

**Property label:** `record.property || "Allgemeine Anfrage"`

**Each row:**
```html
<div class="dash-inquiry-row" data-prop-name="Prestige Villa München-Harlaching">
  <div class="dash-inquiry-body">
    <div class="dash-inquiry-sender">Max Mustermann</div>
    <div class="dash-inquiry-meta">Prestige Villa München-Harlaching · 20. Mai 2026 · "Ich interessiere mich sehr…"</div>
  </div>
  <div class="dash-inquiry-tag">Neu</div>
</div>
```

Note: **no email shown** — only `record.name`.

**Empty state (no contacts at all):**
```html
<div class="dash-empty">
  <p>Noch keine Anfragen eingegangen.</p>
</div>
```

### 6. Filter interaction
```js
var activeFilter = null;

function applyFilter(propName) {
  if (activeFilter === propName) {
    // toggle off
    activeFilter = null;
  } else {
    activeFilter = propName;
  }
  renderFilter();
}

function renderFilter() {
  // Update card .active class
  // Show/hide #dash-filter-bar
  // Set #dash-filter-label text: "Gefiltert: " + activeFilter
  // For each inquiry row: toggle class .dash-inquiry-row--dimmed
  //   (row is dimmed when activeFilter is set AND row's data-prop-name !== activeFilter)
}
```

Clicking an already-active card toggles the filter off. "Alle anzeigen ×" button calls `applyFilter(null)` (clears filter).

Dimmed rows use `opacity: 0.25` — they stay visible in the list rather than disappearing.

### 7. Logout button
```js
document.getElementById('dash-logout').addEventListener('click', function () {
  window.LafayetteAuth.logout();
});
```

---

## CSS additions to `assets/css/pages/dashboard.css`

New classes only — existing Käufer classes are unchanged.

```css
/* Property card grid */
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
.dash-prop-card.active {
  border: 2px solid var(--color-green);
}

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
  background: rgba(13,61,34,0.08);
  border: 1px solid rgba(13,61,34,0.2);
}
.dash-prop-status--verhandlung {
  color: #7a5c20;
  background: rgba(138,109,59,0.08);
  border: 1px solid rgba(138,109,59,0.2);
}
.dash-prop-status--abgeschlossen {
  color: #888;
  background: rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.1);
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
  color: rgba(0,0,0,0.35);
  margin-top: 3px;
}

/* Filter bar */
.dash-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(13,61,34,0.06);
  border: 1px solid rgba(13,61,34,0.15);
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

/* Sender name (no email) */
.dash-inquiry-sender {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-charcoal);
  margin-bottom: 4px;
}

/* Dimmed row (filtered out) */
.dash-inquiry-row--dimmed { opacity: 0.25; }

/* Responsive */
@media (max-width: 767px) {
  .dash-prop-grid { grid-template-columns: 1fr; }
}
```

---

## Out of Scope

- Editing or removing listed properties
- Replying to inquiries from the dashboard
- Notification badges / unread counts
- Profile editing
- English version
