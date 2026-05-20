# Hero Refinement + Leistungen Redesign

**Date:** 2026-05-20  
**Status:** Approved

## Scope

Two independent changes to the Lafayette Real Estate demo site:

1. **Homepage hero** — scale text + CTA up for readability at 2K, add full responsive breakpoints across all pages where missing.
2. **Leistungen page** — replace the static 2×2 grid with an interactive split-panel layout.

---

## 1. Hero Section

### Current problems

- Headline uses `clamp(52px, 7vw, 88px)` — hits the 88px ceiling at ~1260px wide, so on 2K (2560px) it looks undersized relative to the viewport.
- CTA padding (`btn-ghost` component) is too tight; letter-spacing makes text hard to read at high DPI.
- No responsive CSS at all — content distorts on mobile/tablet.

### Changes to `assets/css/pages/home.css`

**Headline:**
```css
font-size: clamp(64px, 5.5vw, 110px);
```

**Hero body — add max-width:**
```css
.hero-body {
  max-width: 720px;
}
```

**Eyebrow + tagline — increase legibility:**
```css
.hero-eyebrow { font-size: 11px; letter-spacing: 3.5px; }
.hero-tagline  { font-size: 11px; letter-spacing: 3px; }
```

**CTA (`btn-ghost` in `components/buttons.css`):**
```css
padding: 14px 30px;
font-size: 10px;
border-color: rgba(255, 255, 255, 0.55);
```

### Responsive breakpoints

Add a `@media` block to `home.css` (and equivalent rules to other pages):

| Breakpoint | Headline | `.hero-body` padding | CTA |
|---|---|---|---|
| `< 480px` | `clamp(38px, 11vw, 52px)` | `0 24px 40px` | `display: block; text-align: center; width: 100%` |
| `480px–768px` | `clamp(48px, 9vw, 68px)` | `0 36px 48px` | inline |
| `768px–1024px` | `clamp(56px, 7vw, 84px)` | `0 44px 56px` | inline |
| `1024px+` | `clamp(64px, 5.5vw, 110px)` | `0 52px 60px` | inline |

### Site-wide responsiveness (all pages)

The following sections currently have no mobile rules and need stacking behavior:

- **Stats bar** (`< 640px`): 2×2 grid instead of 4-column flex row.
- **Property grid** (`.prop-grid`, `< 768px`): single column, main card full-width.
- **Philosophy** (`.philosophy`, `< 768px`): stack — portrait above, text below.
- **Services grid** (`.services-grid`, `< 768px`): single column.
- **Contact CTA** (`.contact-cta`, `< 640px`): stack vertically, buttons full-width.
- **Leistungen process steps** (`.process-steps`, `< 768px`): 2-column, `< 480px` single column.
- **Page hero** (`.page-hero`, `< 480px`): reduce title size, tighten padding.

---

## 2. Leistungen Page

### Current problems

- Static 2×2 grid with only a hover background change — no interactivity.
- Process steps below are visually disconnected.
- No indication which service a user is currently reading.

### New layout: split panel

**HTML structure change** — replace `.leist-grid` and `.process-steps` with:

```html
<div class="leist-split">
  <!-- Left: nav panel -->
  <nav class="leist-nav">
    <button class="leist-nav__item active" data-target="01">
      <span class="leist-nav__num">01</span>
      <span class="leist-nav__name">Kauf &amp; Investition</span>
    </button>
    <button class="leist-nav__item" data-target="02">…</button>
    <button class="leist-nav__item" data-target="03">…</button>
    <button class="leist-nav__item" data-target="04">…</button>
  </nav>

  <!-- Right: content panel -->
  <div class="leist-content">
    <div class="leist-panel active" id="leist-01">
      <div class="leist-panel__tagline">Zugang zu Objekten außerhalb des Marktes.</div>
      <div class="leist-panel__divider"></div>
      <p class="leist-panel__body">…</p>
      <a href="kontakt.html" class="leist-panel__cta">Anfrage stellen →</a>
    </div>
    <!-- panels 02, 03, 04 -->
  </div>
</div>
```

### CSS — `assets/css/pages/leistungen.css` (full rewrite)

Key rules:
- `.leist-split`: `display: grid; grid-template-columns: 38% 62%;` at `≥ 960px`
- `.leist-nav`: `background: var(--color-green)`, full height, padding `var(--space-lg) var(--space-md)`
- `.leist-nav__item`: block button, no default styles, left border `3px solid transparent`; `.active` state: `border-color: white`, full opacity
- `.leist-panel`: `display: none`; `.active`: `display: flex; flex-direction: column`
- `.leist-panel__tagline`: Cormorant Garamond italic, 28–34px
- Transition on panel swap: 200ms opacity fade via JS class toggle

### JS — `assets/js/leistungen.js` (new file, ~25 lines)

```js
document.querySelectorAll('.leist-nav__item').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    document.querySelectorAll('.leist-nav__item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.leist-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('leist-' + target).classList.add('active');
  });
});
```

### Process steps

Keep the 4-step process strip below the split panel. Increase step number size to 44px and add a green left-border accent on `.process-step-name`.

### Leistungen responsive

- `768px–959px`: split panel collapses — nav becomes a horizontal tab bar (overflow-x: auto) above the content panel.
- `< 768px`: horizontal tab bar (compact, no descriptions, just number + name).
- `< 480px`: tab bar becomes a vertical stacked list. Same JS handles the panel swap — only the CSS layout changes (nav stacks above content, full-width).

---

## Files Changed

| File | Change |
|---|---|
| `assets/css/pages/home.css` | Hero font scale + all responsive breakpoints |
| `assets/css/components/buttons.css` | `btn-ghost` padding + border |
| `assets/css/base.css` | Optional: shared responsive utilities |
| `assets/css/pages/leistungen.css` | Full rewrite for split panel |
| `leistungen.html` | New split-panel HTML structure |
| `assets/js/leistungen.js` | New — panel swap JS (~25 lines) |

---

## Out of scope

- No changes to Objekte, Über Uns, Kontakt, or Anmelden pages beyond shared responsive rules.
- No changes to color palette, typography tokens, or fonts.
- No backend or WordPress work.
