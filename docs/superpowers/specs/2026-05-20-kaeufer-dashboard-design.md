# Käufer Dashboard — Design Spec

**Date:** 2026-05-20
**Status:** Approved
**Part of:** 4-part dashboard system (A ✅ → B ✅ → **C** → D)
**Depends on:** Sub-project A (LafayetteAuth) + Sub-project B (lre_contacts localStorage)

---

## Scope

One new page — `dashboard-kaeufer.html` — with its own CSS and JS. Shows the logged-in buyer's inquiry history from localStorage. Accessible only when logged in as role `kaeufer`.

---

## Layout

Sidebar + content split — matching the Leistungen split panel pattern:

```
┌─────────────────────────────────────────────────┐
│  Nav bar (dark green, same as site nav)         │
├──────────────┬──────────────────────────────────┤
│  Sidebar     │  Content area (cream)            │
│  (dark green │                                  │
│   180px)     │  Welcome headline                │
│              │  Stats row                       │
│  Übersicht ◄ │  Inquiry history list            │
│  Anfragen    │  CTA strip                       │
│  Objekte     │                                  │
│  ─────       │                                  │
│  Abmelden    │                                  │
└──────────────┴──────────────────────────────────┘
```

---

## Files

| File | Action | Responsibility |
|---|---|---|
| `dashboard-kaeufer.html` | **Create** | Page HTML |
| `assets/css/pages/dashboard.css` | **Create** | Dashboard layout + component styles |
| `assets/js/dashboard-kaeufer.js` | **Create** | Auth guard + data population from localStorage |

---

## HTML structure (`dashboard-kaeufer.html`)

Standard page shell — same CSS/JS includes as other pages, plus the two new files.

**Script load order** (all before `</body>`):
```html
<script src="assets/js/nav.js"></script>
<script src="assets/js/auth.js"></script>
<script src="assets/js/dashboard-kaeufer.js"></script>
```

**Layout skeleton:**
```html
<body>
  <nav id="main-nav"><!-- standard nav --></nav>

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
        <h1 class="dash-headline" id="dash-name"><!-- filled by JS --></h1>
      </section>

      <!-- Stats -->
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
          <div class="dash-stat-num" id="dash-role-label">Käufer</div>
          <div class="dash-stat-lbl">Ihr Profil</div>
        </div>
      </div>

      <!-- Inquiry history -->
      <section class="dash-section" id="dash-inquiries">
        <div class="dash-section-title">Ihre Anfragen</div>
        <div id="dash-inquiry-list"><!-- filled by JS --></div>
      </section>

      <!-- Bottom CTA -->
      <div class="dash-cta">
        <div class="dash-cta-text">Neue Objekte entdecken.</div>
        <a href="objekte.html" class="dash-cta-btn">Alle Objekte ansehen</a>
      </div>

    </main>
  </div>

</body>
```

---

## JS — `assets/js/dashboard-kaeufer.js`

Runs on `DOMContentLoaded`. Three responsibilities:

### 1. Auth guard
```js
var session = window.LafayetteAuth && window.LafayetteAuth.getSession();
if (!session || session.role !== 'kaeufer') {
  window.location.href = 'anmelden.html';
  return;  // stop execution
}
```

### 2. Populate session data
```js
document.getElementById('dash-name').textContent = session.name;
// Role label is already "Käufer" in HTML — no change needed
```

### 3. Populate inquiry history
Read `localStorage['lre_contacts']`, filter to `role === 'kaeufer'` (future-proof), render rows:

**If records exist:**
```html
<!-- One per record, newest first (already sorted by unshift in contact-gate.js) -->
<div class="dash-inquiry-row">
  <div class="dash-inquiry-body">
    <div class="dash-inquiry-prop">Prestige Villa München-Harlaching</div>
    <div class="dash-inquiry-meta">20. Mai 2026 · "Ich interessiere mich sehr…"</div>
  </div>
  <div class="dash-inquiry-tag">Gesendet</div>
</div>
```

**Date formatting:** `new Date(record.date).toLocaleDateString('de-DE', { day:'numeric', month:'long', year:'numeric' })`

**Message preview:** first 40 chars of `record.message`, suffix `…` if truncated. If message is empty, show `"Kein Nachrichtentext"`.

**Property label:** `record.property || "Allgemeine Anfrage"`

**If no records:**
```html
<div class="dash-empty">
  <p>Noch keine Anfragen gesendet.</p>
  <a href="objekte.html" class="dash-empty-btn">Objekte entdecken →</a>
</div>
```

### 4. Logout button
```js
document.getElementById('dash-logout').addEventListener('click', function () {
  window.LafayetteAuth.logout();
});
```

### 5. Stat count
```js
document.getElementById('dash-count-inquiries').textContent = contacts.length;
```

---

## CSS — `assets/css/pages/dashboard.css`

Full layout + all component styles. Uses only existing CSS custom properties from `variables.css`.

### Layout
```css
.dash-layout {
  display: flex;
  min-height: calc(100vh - 68px);  /* subtract nav height */
  margin-top: 68px;                /* push below fixed nav */
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
  padding: var(--space-lg) var(--space-lg);
  overflow-y: auto;
}
```

### Sidebar nav
```css
.dash-sidenav { display: flex; flex-direction: column; flex: 1; }
.dash-sidenav__item {
  display: block;
  padding: 12px 20px;
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color var(--transition-base), border-color var(--transition-base);
}
.dash-sidenav__item:hover { color: rgba(255,255,255,0.75); }
.dash-sidenav__item.active {
  color: var(--color-white);
  border-left-color: rgba(255,255,255,0.5);
}
.dash-sidenav__logout {
  margin: 0 20px 8px;
  padding: 10px 0;
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: color var(--transition-base);
}
.dash-sidenav__logout:hover { color: rgba(255,255,255,0.6); }
```

### Welcome + stats
```css
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
  color: rgba(0,0,0,0.35);
  margin-top: 6px;
}
```

### Section + inquiry rows
```css
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
  background: rgba(13,61,34,0.06);
  border: 1px solid rgba(13,61,34,0.15);
  padding: 5px 10px;
  white-space: nowrap;
  flex-shrink: 0;
}
```

### Empty state + CTA strip
```css
.dash-empty {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  padding: 32px 24px;
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
  border-bottom: 1px solid rgba(13,61,34,0.3);
  padding-bottom: 2px;
}
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
  border: 1px solid rgba(255,255,255,0.4);
  padding: 10px 22px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition-base);
}
.dash-cta-btn:hover { background: rgba(255,255,255,0.08); }
```

### Responsive (tablet/mobile)
```css
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
  }
  .dash-sidenav { flex-direction: row; }
  .dash-sidenav__item { border-left: none; border-bottom: 2px solid transparent; padding: 14px 16px; white-space: nowrap; }
  .dash-sidenav__item.active { border-bottom-color: rgba(255,255,255,0.5); }
  .dash-sidenav__logout { margin: 0; padding: 14px 16px; border-left: 1px solid rgba(255,255,255,0.08); }
  .dash-content { padding: var(--space-md) var(--space-sm); }
  .dash-stats { flex-wrap: wrap; }
  .dash-stat { min-width: calc(50% - 6px); }
}
```

---

## Out of Scope

- Profile editing
- Saved/favourited properties
- Notification system
- Seller dashboard (`dashboard-verkaeufer.html`) — Sub-project D
