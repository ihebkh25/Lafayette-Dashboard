# Käufer Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `dashboard-kaeufer.html` — a buyer-only dashboard that shows the user's name, inquiry count, and contact history read from `localStorage['lre_contacts']`.

**Architecture:** Three new files (HTML, CSS, JS). The JS IIFE reads `window.LafayetteAuth` (already set by `auth.js`) and `localStorage`, then populates the page. Auth guard redirects non-kaeufer sessions to login. The sidebar layout mirrors the Leistungen split panel.

**Tech Stack:** Vanilla JS (ES5 IIFE), CSS custom properties, localStorage API

---

## File Map

| File | Action |
|---|---|
| `assets/css/pages/dashboard.css` | **Create** — all dashboard layout + component styles |
| `assets/js/dashboard-kaeufer.js` | **Create** — auth guard + data population from localStorage |
| `dashboard-kaeufer.html` | **Create** — complete page HTML |

---

## Task 1: Dashboard CSS

**Files:**
- Create: `assets/css/pages/dashboard.css`

- [ ] **Step 1: Create `assets/css/pages/dashboard.css` with this exact content**

```css
/* ============ DASHBOARD LAYOUT ============ */

.dash-layout {
  display: flex;
  min-height: calc(100vh - 68px);
  margin-top: 68px;
}

.dash-sidebar {
  width: 180px;
  background: var(--color-green);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: sticky;
  top: 68px;
  height: calc(100vh - 68px);
  flex-shrink: 0;
}

.dash-content {
  flex: 1;
  background: var(--color-cream);
  padding: var(--space-lg);
  overflow-y: auto;
}

/* ============ SIDEBAR NAV ============ */

.dash-sidenav {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.dash-sidenav__item {
  display: block;
  padding: 12px 20px;
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color var(--transition-base), border-color var(--transition-base);
}

.dash-sidenav__item:hover { color: rgba(255, 255, 255, 0.75); }

.dash-sidenav__item.active {
  color: var(--color-white);
  border-left-color: rgba(255, 255, 255, 0.5);
}

.dash-sidenav__logout {
  margin: 0 20px 8px;
  padding: 10px 0;
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: color var(--transition-base);
}

.dash-sidenav__logout:hover { color: rgba(255, 255, 255, 0.6); }

/* ============ WELCOME ============ */

.dash-welcome { margin-bottom: var(--space-md); }

.dash-eyebrow {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--color-green);
  opacity: 0.55;
  margin-bottom: 8px;
}

.dash-headline {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: 36px;
  color: var(--color-charcoal);
  letter-spacing: 1px;
}

/* ============ STATS ============ */

.dash-stats {
  display: flex;
  gap: 12px;
  margin-bottom: var(--space-lg);
}

.dash-stat {
  flex: 1;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  padding: 16px 20px;
}

.dash-stat-num {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: 32px;
  color: var(--color-green);
  line-height: 1;
}

.dash-stat-lbl {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.35);
  margin-top: 6px;
}

/* ============ SECTION ============ */

.dash-section { margin-bottom: var(--space-lg); }

.dash-section-title {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--color-green);
  opacity: 0.55;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border);
}

/* ============ INQUIRY ROWS ============ */

.dash-inquiry-row {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-top: none;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dash-inquiry-row:first-child { border-top: 1px solid var(--color-border); }

.dash-inquiry-prop {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-charcoal);
  margin-bottom: 4px;
}

.dash-inquiry-meta {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--color-text-muted);
}

.dash-inquiry-tag {
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--color-green);
  background: rgba(13, 61, 34, 0.06);
  border: 1px solid rgba(13, 61, 34, 0.15);
  padding: 5px 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ============ EMPTY STATE ============ */

.dash-empty {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  padding: 40px 24px;
  text-align: center;
}

.dash-empty p {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.dash-empty-btn {
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-green);
  text-decoration: none;
  border-bottom: 1px solid rgba(13, 61, 34, 0.3);
  padding-bottom: 2px;
}

/* ============ BOTTOM CTA ============ */

.dash-cta {
  background: var(--color-green);
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.dash-cta-text {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: 20px;
  color: var(--color-white);
  letter-spacing: 0.5px;
}

.dash-cta-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 10px 22px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition-base);
}

.dash-cta-btn:hover { background: rgba(255, 255, 255, 0.08); }

/* ============ RESPONSIVE ============ */

@media (max-width: 767px) {
  .dash-layout { flex-direction: column; }

  .dash-sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    align-items: center;
    padding: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .dash-sidebar::-webkit-scrollbar { display: none; }

  .dash-sidenav {
    flex-direction: row;
    flex: 1;
  }

  .dash-sidenav__item {
    border-left: none;
    border-bottom: 2px solid transparent;
    padding: 14px 16px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .dash-sidenav__item.active {
    border-left-color: transparent;
    border-bottom-color: rgba(255, 255, 255, 0.5);
  }

  .dash-sidenav__logout {
    margin: 0;
    padding: 14px 16px;
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .dash-content { padding: var(--space-md) var(--space-sm); }

  .dash-stats { flex-wrap: wrap; }
  .dash-stat { min-width: calc(50% - 6px); }

  .dash-cta { flex-direction: column; align-items: flex-start; gap: 16px; }
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/css/pages/dashboard.css
git commit -m "feat: add dashboard CSS — sidebar layout, stats, inquiry rows, responsive"
```

---

## Task 2: Dashboard JS

**Files:**
- Create: `assets/js/dashboard-kaeufer.js`

- [ ] **Step 1: Create `assets/js/dashboard-kaeufer.js` with this exact content**

```js
(function () {
  'use strict';

  var CONTACTS_KEY = 'lre_contacts';

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (_) {
      return iso;
    }
  }

  function truncate(str, max) {
    if (!str || !str.trim()) return 'Kein Nachrichtentext';
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* 1 — Auth guard: only kaeufer role allowed */
    var session = window.LafayetteAuth && window.LafayetteAuth.getSession();
    if (!session || session.role !== 'kaeufer') {
      window.location.href = 'anmelden.html';
      return;
    }

    /* 2 — Populate name */
    var nameEl = document.getElementById('dash-name');
    if (nameEl) nameEl.textContent = session.name;

    /* 3 — Load contacts from localStorage */
    var contacts = [];
    try {
      contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)) || [];
    } catch (_) {}

    /* 4 — Update inquiry count stat */
    var countEl = document.getElementById('dash-count-inquiries');
    if (countEl) countEl.textContent = String(contacts.length);

    /* 5 — Render inquiry list */
    var listEl = document.getElementById('dash-inquiry-list');
    if (listEl) {
      if (!contacts.length) {
        listEl.innerHTML =
          '<div class="dash-empty">' +
            '<p>Noch keine Anfragen gesendet.</p>' +
            '<a href="objekte.html" class="dash-empty-btn">Objekte entdecken →</a>' +
          '</div>';
      } else {
        var html = '';
        contacts.forEach(function (r) {
          var prop    = r.property || 'Allgemeine Anfrage';
          var date    = formatDate(r.date);
          var preview = truncate(r.message, 40);
          html +=
            '<div class="dash-inquiry-row">' +
              '<div class="dash-inquiry-body">' +
                '<div class="dash-inquiry-prop">' + prop + '</div>' +
                '<div class="dash-inquiry-meta">' + date + ' · “' + preview + '”</div>' +
              '</div>' +
              '<div class="dash-inquiry-tag">Gesendet</div>' +
            '</div>';
        });
        listEl.innerHTML = html;
      }
    }

    /* 6 — Logout button */
    var logoutBtn = document.getElementById('dash-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        window.LafayetteAuth.logout();
      });
    }

  });

})();
```

- [ ] **Step 2: Verify logic**

Check that:
- Auth guard uses `session.role !== 'kaeufer'` (not a loose check)
- `truncate` returns `'Kein Nachrichtentext'` for empty/null message
- `formatDate` has a try/catch to handle malformed ISO strings gracefully
- `contacts` is always an array (fallback `|| []` and try/catch)
- Inquiry rows use `…` for ellipsis, `·` for middle dot, `“`/`”` for German quotes

- [ ] **Step 3: Commit**

```bash
git add assets/js/dashboard-kaeufer.js
git commit -m "feat: add dashboard-kaeufer.js — auth guard and localStorage data population"
```

---

## Task 3: Dashboard HTML page

**Files:**
- Create: `dashboard-kaeufer.html`

- [ ] **Step 1: Create `dashboard-kaeufer.html` with this exact content**

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mein Dashboard — Lafayette Real Estate</title>
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
      <a href="ueber-uns.html">Über uns</a>
      <a href="kontakt.html">Kontakt</a>
      <a href="anmelden.html" class="nav-links__cta">Anmelden</a>
    </div>
  </nav>

  <!-- ======= DASHBOARD ======= -->
  <div class="dash-layout">

    <!-- Sidebar -->
    <aside class="dash-sidebar">
      <nav class="dash-sidenav">
        <a href="dashboard-kaeufer.html" class="dash-sidenav__item active">Übersicht</a>
        <a href="#dash-inquiries"        class="dash-sidenav__item">Anfragen</a>
        <a href="objekte.html"           class="dash-sidenav__item">Objekte</a>
      </nav>
      <button class="dash-sidenav__logout" id="dash-logout">Abmelden</button>
    </aside>

    <!-- Content -->
    <main class="dash-content">

      <!-- Welcome -->
      <section class="dash-welcome">
        <div class="dash-eyebrow">Willkommen zurück</div>
        <h1 class="dash-headline" id="dash-name"></h1>
      </section>

      <!-- Stats row -->
      <div class="dash-stats">
        <div class="dash-stat">
          <div class="dash-stat-num" id="dash-count-inquiries">—</div>
          <div class="dash-stat-lbl">Anfragen gesendet</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-num">3</div>
          <div class="dash-stat-lbl">Objekte verfügbar</div>
        </div>
        <div class="dash-stat">
          <div class="dash-stat-num">Käufer</div>
          <div class="dash-stat-lbl">Ihr Profil</div>
        </div>
      </div>

      <!-- Inquiry history -->
      <section class="dash-section" id="dash-inquiries">
        <div class="dash-section-title">Ihre Anfragen</div>
        <div id="dash-inquiry-list"></div>
      </section>

      <!-- CTA strip -->
      <div class="dash-cta">
        <div class="dash-cta-text">Neue Objekte entdecken.</div>
        <a href="objekte.html" class="dash-cta-btn">Alle Objekte ansehen</a>
      </div>

    </main>
  </div>

  <script src="assets/js/nav.js"></script>
  <script src="assets/js/auth.js"></script>
  <script src="assets/js/dashboard-kaeufer.js"></script>
</body>
</html>
```

- [ ] **Step 2: End-to-end browser verification**

**Test A — Auth guard (logged out):**
Open `dashboard-kaeufer.html` in browser while `localStorage` has no session.
Expected: Immediately redirected to `anmelden.html`.

**Test B — Auth guard (wrong role):**
Set localStorage: `localStorage.setItem('lre_session', JSON.stringify({email:'verkaeufer@demo.de',role:'verkaeufer',name:'Anna Müller'}))`. Open `dashboard-kaeufer.html`.
Expected: Immediately redirected to `anmelden.html`. Clean up: `localStorage.removeItem('lre_session')`.

**Test C — Logged in as Käufer, no inquiries:**
Set session: `localStorage.setItem('lre_session', JSON.stringify({email:'kaeufer@demo.de',role:'kaeufer',name:'Max Mustermann'}))`. Clear contacts: `localStorage.removeItem('lre_contacts')`. Open `dashboard-kaeufer.html`.
Expected:
- Nav shows user menu "Max M. ▾" (injected by auth.js)
- Headline reads "Max Mustermann."
- Inquiry count stat shows "0"
- Inquiry list shows empty state: "Noch keine Anfragen gesendet." with "Objekte entdecken →" link

**Test D — Logged in with inquiries:**
Add mock contacts: `localStorage.setItem('lre_contacts', JSON.stringify([{date:'2026-05-20T14:00:00.000Z',property:'Prestige Villa München-Harlaching',message:'Ich interessiere mich sehr für dieses Objekt.',role:'kaeufer'},{date:'2026-05-18T10:00:00.000Z',property:'Mehrfamilienhaus Oberhaching',message:'Bitte kontaktieren Sie mich.',role:'kaeufer'}]))`. Reload.
Expected:
- Inquiry count shows "2"
- Two inquiry rows appear, newest first
- Each row shows property name, formatted date, truncated message preview, "Gesendet" tag

**Test E — Logout:**
Click "Abmelden" in the sidebar.
Expected: Session cleared, redirected to `index.html`, nav shows "Anmelden".

**Test F — Mobile layout:**
Resize to 375px wide.
Expected: Sidebar becomes a horizontal scroll bar at the top, content stacks below, stats wrap to 2×2 grid.

- [ ] **Step 3: Commit**

```bash
git add dashboard-kaeufer.html
git commit -m "feat: add dashboard-kaeufer.html — buyer dashboard page"
```

---

## Self-review notes

- `dashboard-kaeufer.js` uses `…` / `·` / `“` / `”` instead of literal Unicode to avoid any encoding issues with the IIFE string concatenation.
- The nav on the dashboard has `class="scrolled"` hardcoded — this gives it a solid green background immediately (no transparent-until-scroll effect), which is appropriate since the dashboard has no hero image behind it.
- `auth.js` runs before `dashboard-kaeufer.js` and will replace the "Anmelden" nav link with the user menu. The HTML keeps the fallback "Anmelden" link so the page degrades gracefully if JS fails before auth.js runs.
- The "3 Objekte verfügbar" stat is hardcoded for the demo (matches the 3 properties that exist in the site).
- `contacts` is not filtered by role in the JS — all entries in `lre_contacts` are shown. The auth guard ensures only a kaeufer can reach this page, and sub-project B only writes contacts when a kaeufer submits the form. No cross-contamination with verkaeufer records in this demo.
