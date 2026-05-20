# Hero Refinement + Leistungen Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scale up the homepage hero text/CTA for 2K readability, add full site-wide responsive breakpoints, and replace the static Leistungen grid with an interactive split-panel layout.

**Architecture:** Pure HTML/CSS/JS — no build step, no framework. All changes are isolated to their respective CSS files and one new JS file. The Leistungen panel swap is handled by ~20 lines of vanilla JS that toggles `.active` classes.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, clamp), vanilla JS (ES6), Google Fonts (already loaded)

---

## File Map

| File | Action | What changes |
|---|---|---|
| `assets/css/pages/home.css` | Modify | Hero clamp, max-width, eyebrow size + all responsive @media blocks |
| `assets/css/components/buttons.css` | Modify | `btn-ghost` border opacity bump |
| `assets/css/components/page-hero.css` | Modify | Mobile breakpoint for inner-page hero title |
| `assets/css/pages/leistungen.css` | Rewrite | Split panel layout, nav, panels, process steps, responsive |
| `leistungen.html` | Modify | Replace `.leist-grid` + `.process-steps` with `.leist-split` structure |
| `assets/js/leistungen.js` | Create | Panel swap logic (~20 lines) |

---

## Task 1: Hero base text scale

**Files:**
- Modify: `assets/css/pages/home.css` (lines 27–71)
- Modify: `assets/css/components/buttons.css` (line 5)

- [ ] **Step 1: Update hero-headline clamp**

In `assets/css/pages/home.css`, change line 30:
```css
/* was: font-size: clamp(52px, 7vw, 88px); */
font-size: clamp(64px, 5.5vw, 110px);
```

- [ ] **Step 2: Add max-width to hero-body**

In `assets/css/pages/home.css`, add `max-width` to `.hero-body` (after line 17):
```css
.hero-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 var(--space-lg) 60px;
  max-width: 720px;
}
```

- [ ] **Step 3: Increase eyebrow legibility**

In `assets/css/pages/home.css`, change `.hero-eyebrow` font-size from `10px` to `11px`:
```css
.hero-eyebrow {
  font-family: var(--font-body);
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--color-text-faint);
  text-transform: uppercase;
  margin-bottom: 16px;
}
```

- [ ] **Step 4: Bump btn-ghost border visibility**

In `assets/css/components/buttons.css`, change `.btn-ghost` border from `rgba(255,255,255,0.4)` to `rgba(255,255,255,0.55)`:
```css
.btn-ghost {
  display: inline-block;
  align-self: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.55);
  padding: 14px 32px;
  font-family: var(--font-body);
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  transition: background var(--transition-base);
}
```

- [ ] **Step 5: Verify in browser**

Open `index.html` in a browser. The headline should be visibly larger than before. On a 1920px+ wide window, the headline should feel commanding rather than lost in the viewport.

- [ ] **Step 6: Commit**

```bash
git add assets/css/pages/home.css assets/css/components/buttons.css
git commit -m "feat: scale hero headline to 110px max, improve btn-ghost border"
```

---

## Task 2: Homepage responsive breakpoints

**Files:**
- Modify: `assets/css/pages/home.css` (append to end of file)

- [ ] **Step 1: Append all responsive rules to home.css**

Add this entire block at the end of `assets/css/pages/home.css`:

```css
/* ============ RESPONSIVE ============ */

/* Hero — mobile */
@media (max-width: 479px) {
  .hero-headline { font-size: clamp(38px, 11vw, 52px); }
  .hero-body { padding: 0 24px 40px; }
  .hero .btn-ghost { display: block; text-align: center; }
  .hero-scroll { display: none; }
}

/* Hero — small tablet */
@media (min-width: 480px) and (max-width: 767px) {
  .hero-headline { font-size: clamp(48px, 9vw, 68px); }
  .hero-body { padding: 0 36px 48px; }
}

/* Hero — iPad / large tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .hero-headline { font-size: clamp(56px, 7vw, 84px); }
  .hero-body { padding: 0 44px 56px; }
}

/* Stats bar — 2×2 on mobile */
@media (max-width: 639px) {
  .stats-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .stat-item {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .stat-item:nth-child(2n) { border-right: none; }
  .stat-item:nth-child(3),
  .stat-item:nth-child(4) { border-bottom: none; }
}

/* Featured properties — single column on mobile */
@media (max-width: 767px) {
  .featured { padding: var(--space-md) var(--space-sm); }
  .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .view-all { margin-left: 0; }
  .prop-grid { grid-template-columns: 1fr; }
}

/* Philosophy — stacked on mobile */
@media (max-width: 767px) {
  .philosophy {
    grid-template-columns: 1fr;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-sm);
  }
  .philosophy__person-col { align-items: center; }
}

/* Services — single column on mobile */
@media (max-width: 767px) {
  .services { padding: var(--space-md) var(--space-sm); }
  .services-grid { grid-template-columns: 1fr; }
}

/* Contact CTA — stacked on mobile */
@media (max-width: 639px) {
  .contact-cta {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: var(--space-md) var(--space-sm);
  }
  .cta-btns { flex-direction: column; width: 100%; }
  .cta-btn-ghost,
  .cta-btn-wa { text-align: center; }
}
```

- [ ] **Step 2: Verify at 375px (mobile)**

Resize browser to 375px wide. Check:
- Hero headline is ~42–48px, not clipped
- Stats bar shows as 2×2 grid
- Property grid is single column
- Philosophy stacks (portrait above text)
- Services single column
- CTA section stacks with full-width buttons

- [ ] **Step 3: Verify at 768px (iPad)**

Resize to 768px. Check:
- Hero headline is ~56–64px
- Property grid still readable (single column is fine here)
- No horizontal overflow anywhere (scroll `document.body.scrollWidth === window.innerWidth` in console)

- [ ] **Step 4: Commit**

```bash
git add assets/css/pages/home.css
git commit -m "feat: add full responsive breakpoints to homepage"
```

---

## Task 3: Inner page hero responsive

**Files:**
- Modify: `assets/css/components/page-hero.css` (append to end)

- [ ] **Step 1: Add mobile breakpoint to page-hero.css**

Append to end of `assets/css/components/page-hero.css`:

```css
/* ============ RESPONSIVE ============ */
@media (max-width: 479px) {
  .page-hero {
    padding: calc(68px + 20px) var(--space-sm) 32px;
  }
  .page-hero__title {
    font-size: 36px;
    letter-spacing: 1px;
  }
}
```

- [ ] **Step 2: Verify in browser**

Open `leistungen.html` at 375px. The page hero title ("Was wir für Sie tun.") should be 36px and not overflow.

- [ ] **Step 3: Commit**

```bash
git add assets/css/components/page-hero.css
git commit -m "feat: add mobile responsive breakpoint to page-hero component"
```

---

## Task 4: Leistungen HTML restructure

**Files:**
- Modify: `leistungen.html` — replace the `<main>` content block

- [ ] **Step 1: Replace main content in leistungen.html**

Replace everything between `<!-- ======= SERVICES GRID ======= -->` and `<!-- ======= FOOTER ======= -->` (the entire `<main>` element) with:

```html
  <!-- ======= SPLIT PANEL ======= -->
  <main>
    <section class="section cream">

      <div class="leist-split">

        <!-- Left: service nav -->
        <nav class="leist-nav" aria-label="Leistungen Navigation">
          <button class="leist-nav__item active" data-target="01">
            <span class="leist-nav__num">01</span>
            <span class="leist-nav__name">Kauf &amp; Investition</span>
          </button>
          <button class="leist-nav__item" data-target="02">
            <span class="leist-nav__num">02</span>
            <span class="leist-nav__name">Verkauf &amp; Vermarktung</span>
          </button>
          <button class="leist-nav__item" data-target="03">
            <span class="leist-nav__num">03</span>
            <span class="leist-nav__name">Secret Sales</span>
          </button>
          <button class="leist-nav__item" data-target="04">
            <span class="leist-nav__num">04</span>
            <span class="leist-nav__name">Beratung &amp; Netzwerk</span>
          </button>
        </nav>

        <!-- Right: content panels -->
        <div class="leist-content">

          <div class="leist-panel active" id="leist-01">
            <div class="leist-panel__tagline">Zugang zu Objekten außerhalb des Marktes.</div>
            <div class="leist-panel__divider"></div>
            <p class="leist-panel__body">Wir verschaffen Ihnen Zugang zu exklusiven, nicht-öffentlichen Immobilien. Basierend auf Ihren Anforderungen identifizieren wir gezielt Objekte aus unserem privaten Netzwerk — diskret, schnell und ohne öffentliche Ausschreibung.</p>
            <a href="kontakt.html" class="leist-panel__cta">Anfrage stellen →</a>
          </div>

          <div class="leist-panel" id="leist-02">
            <div class="leist-panel__tagline">Ihre Immobilie. Unser Netzwerk. Kein Kompromiss.</div>
            <div class="leist-panel__divider"></div>
            <p class="leist-panel__body">Ihre Immobilie verdient eine Vermarktung auf höchstem Niveau. Wir entwickeln eine individuelle Strategie, sprechen qualifizierte Interessenten direkt an und begleiten den gesamten Transaktionsprozess.</p>
            <a href="kontakt.html" class="leist-panel__cta">Anfrage stellen →</a>
          </div>

          <div class="leist-panel" id="leist-03">
            <div class="leist-panel__tagline">Diskretion ohne Ausnahme.</div>
            <div class="leist-panel__divider"></div>
            <p class="leist-panel__body">Kauf und Verkauf außerhalb des Marktes — ausschließlich für HNWIs, Family Offices, Fonds und CEOs im deutschsprachigen Raum. Keine öffentliche Bekanntmachung. Keine Kompromisse bei Diskretion.</p>
            <a href="kontakt.html" class="leist-panel__cta">Anfrage stellen →</a>
          </div>

          <div class="leist-panel" id="leist-04">
            <div class="leist-panel__tagline">Von der ersten Anfrage bis zum Notartermin.</div>
            <div class="leist-panel__divider"></div>
            <p class="leist-panel__body">Von der ersten Markteinschätzung bis zur notariellen Beurkundung stehen wir Ihnen als verlässlicher Partner zur Seite. Unser Netzwerk aus Rechtsanwälten, Notaren und Finanzierungspartnern ermöglicht ganzheitliche Begleitung.</p>
            <a href="kontakt.html" class="leist-panel__cta">Anfrage stellen →</a>
          </div>

        </div>

      </div>

      <!-- ======= PROCESS BAR ======= -->
      <div class="process-steps">
        <div class="process-step">
          <div class="process-step-num">01</div>
          <div class="process-step-name">Erstkontakt</div>
          <p class="process-step-desc">Vertrauliches Gespräch zur Klärung Ihrer Anforderungen und Ziele.</p>
        </div>
        <div class="process-step">
          <div class="process-step-num">02</div>
          <div class="process-step-name">Qualifizierung</div>
          <p class="process-step-desc">Aufnahme in unser exklusives Netzwerk und Abstimmung der Suchkriterien.</p>
        </div>
        <div class="process-step">
          <div class="process-step-num">03</div>
          <div class="process-step-name">Matching</div>
          <p class="process-step-desc">Gezielte Objektauswahl und diskrete Vorstellung passender Immobilien.</p>
        </div>
        <div class="process-step">
          <div class="process-step-num">04</div>
          <div class="process-step-name">Transaktion</div>
          <p class="process-step-desc">Begleitung von Verhandlung, Due Diligence und Notartermin bis zum Abschluss.</p>
        </div>
      </div>

    </section>
  </main>
```

- [ ] **Step 2: Commit (HTML only — CSS not written yet, page will look broken)**

```bash
git add leistungen.html
git commit -m "feat: restructure leistungen HTML for split-panel layout"
```

---

## Task 5: Leistungen CSS split panel

**Files:**
- Rewrite: `assets/css/pages/leistungen.css`

- [ ] **Step 1: Replace entire contents of leistungen.css**

```css
/* ============ LEISTUNGEN — SPLIT PANEL ============ */

.leist-split {
  display: grid;
  grid-template-columns: 38% 62%;
  min-height: 520px;
  border: 1px solid var(--color-border);
}

/* ---- Left nav ---- */
.leist-nav {
  background: var(--color-green);
  display: flex;
  flex-direction: column;
  padding: var(--space-md) 0;
}

.leist-nav__item {
  background: none;
  border: none;
  border-left: 3px solid transparent;
  padding: 28px var(--space-md);
  text-align: left;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity var(--transition-base), border-color var(--transition-base);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leist-nav__item:hover { opacity: 0.75; }

.leist-nav__item.active {
  opacity: 1;
  border-left-color: rgba(255, 255, 255, 0.55);
}

.leist-nav__num {
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
}

.leist-nav__name {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 22px;
  color: var(--color-white);
  letter-spacing: 0.5px;
  line-height: 1.15;
}

/* ---- Right content ---- */
.leist-content {
  background: var(--color-white);
  padding: var(--space-lg);
  display: flex;
  align-items: center;
}

.leist-panel {
  display: none;
  flex-direction: column;
  max-width: 560px;
}

.leist-panel.active {
  display: flex;
  animation: leistFadeIn 0.2s ease;
}

@keyframes leistFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.leist-panel__tagline {
  font-family: var(--font-display);
  font-weight: 200;
  font-style: italic;
  font-size: 32px;
  line-height: 1.3;
  color: var(--color-charcoal);
  letter-spacing: 0.5px;
  margin-bottom: 24px;
}

.leist-panel__divider {
  width: 32px;
  height: 1px;
  background: var(--color-green);
  opacity: 0.3;
  margin-bottom: 24px;
}

.leist-panel__body {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.85;
  margin-bottom: 32px;
}

.leist-panel__cta {
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--color-green);
  text-decoration: none;
  border-bottom: 1px solid rgba(13, 61, 34, 0.3);
  padding-bottom: 2px;
  align-self: flex-start;
  transition: border-color var(--transition-base);
}

.leist-panel__cta:hover { border-color: var(--color-green); }

/* ---- Process steps ---- */
.process-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--color-border);
  border-top: none;
  background: var(--color-cream);
}

.process-step {
  padding: 36px 32px;
  border-right: 1px solid var(--color-border);
}

.process-step:last-child { border-right: none; }

.process-step-num {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: 44px;
  color: rgba(13, 61, 34, 0.18);
  line-height: 1;
  margin-bottom: 14px;
}

.process-step-name {
  font-family: var(--font-body);
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-green);
  margin-bottom: 10px;
  border-left: 2px solid var(--color-green);
  padding-left: 8px;
}

.process-step-desc {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

/* ============ RESPONSIVE ============ */

/* Tablet: horizontal scrolling tab bar */
@media (max-width: 959px) {
  .leist-split {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .leist-nav {
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0;
    scrollbar-width: none;
  }
  .leist-nav::-webkit-scrollbar { display: none; }

  .leist-nav__item {
    border-left: none;
    border-bottom: 3px solid transparent;
    padding: 18px 24px;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .leist-nav__item.active {
    border-left-color: transparent;
    border-bottom-color: rgba(255, 255, 255, 0.55);
  }

  .leist-nav__name { font-size: 16px; }

  .leist-content {
    padding: var(--space-md);
    min-height: 320px;
  }

  .process-steps {
    grid-template-columns: 1fr 1fr;
  }
  .process-step:nth-child(2) { border-right: none; }
  .process-step:nth-child(3) { border-top: 1px solid var(--color-border); }
  .process-step:nth-child(4) { border-top: 1px solid var(--color-border); border-right: none; }
}

/* Mobile: vertical stacked nav */
@media (max-width: 479px) {
  .leist-nav {
    flex-direction: column;
    overflow-x: visible;
  }

  .leist-nav__item {
    border-bottom: none;
    border-left: 3px solid transparent;
    white-space: normal;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 16px 20px;
  }

  .leist-nav__item.active {
    border-bottom-color: transparent;
    border-left-color: rgba(255, 255, 255, 0.55);
  }

  .leist-panel__tagline { font-size: 24px; }
  .leist-content { padding: var(--space-md) var(--space-sm); }

  .process-steps { grid-template-columns: 1fr; }
  .process-step {
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  .process-step:last-child { border-bottom: none; }
  .process-step:nth-child(3),
  .process-step:nth-child(4) { border-top: none; }
}
```

- [ ] **Step 2: Open leistungen.html and verify split panel appearance**

Open `leistungen.html` in browser. Check:
- Left panel is dark green, right panel is white
- Service 01 (Kauf & Investition) is visible in the right panel with italic tagline
- Services 02–04 are dimmed (opacity 0.4) in the left nav
- Process steps show below with green left-border accent on the step name

At this point clicking the nav items does nothing (JS not written yet). That's expected.

- [ ] **Step 3: Commit**

```bash
git add assets/css/pages/leistungen.css
git commit -m "feat: add split-panel CSS for Leistungen page"
```

---

## Task 6: Leistungen panel swap JS

**Files:**
- Create: `assets/js/leistungen.js`
- Modify: `leistungen.html` — add `<script>` tag before `</body>`

- [ ] **Step 1: Create assets/js/leistungen.js**

```js
document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.leist-nav__item');
  const panels = document.querySelectorAll('.leist-panel');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;

      navItems.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById('leist-' + target).classList.add('active');
    });
  });
});
```

- [ ] **Step 2: Add script tag to leistungen.html**

Before the closing `</body>` tag (after the `nav.js` script tag), add:
```html
  <script src="assets/js/leistungen.js"></script>
```

- [ ] **Step 3: Verify interaction**

Open `leistungen.html`. Click each of the four service items in the left panel:
- The clicked item becomes fully opaque with a white left border
- The right panel swaps to the correct content with a subtle fade-in
- Clicking back to a previous service works
- No console errors

- [ ] **Step 4: Verify responsiveness**

Resize to 768px: nav becomes a horizontal scrollable tab bar across the top, content below.
Resize to 375px: nav becomes a vertical stacked list, same JS-driven swap works.

- [ ] **Step 5: Commit**

```bash
git add assets/js/leistungen.js leistungen.html
git commit -m "feat: add panel swap JS for Leistungen split panel"
```

---

## Self-review notes

- Task 4 HTML uses `id="leist-01"` — Task 6 JS uses `'leist-' + target` where `data-target="01"`. These match.
- `.leist-nav__item.active` left-border rule is overridden at tablet breakpoint (`border-left-color: transparent`) so the bottom border takes over. This is intentional.
- `process-step:nth-child(3)` and `:nth-child(4)` get `border-top` at tablet breakpoint because the grid wraps to a second row.
- `btn-ghost` mobile override is scoped to `.hero .btn-ghost` in Task 2 so it only applies on the homepage hero, not to other usages of the component.
