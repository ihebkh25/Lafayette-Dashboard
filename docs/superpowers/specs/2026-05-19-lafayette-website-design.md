# Lafayette Real Estate — Website Design Spec

**Date:** 2026-05-19  
**Client:** Lafayette Real Estate GmbH & Co KG  
**Platform:** WordPress  
**Language:** German (DE only — English deferred to Phase 2)  
**Design Approach:** Prestige — Cinematic hero, dark green brand sections, cream/white content sections

---

## 1. Brand Identity

### Colors
| Token | Hex | Usage |
|---|---|---|
| Forest Green | `#0D3D22` | Primary brand color — navbar, hero, stats bar, dark sections, badges, CTA buttons |
| Warm Cream | `#FAF8F4` | Page background for content sections |
| White | `#FFFFFF` | Property cards, form fields, content panels |
| Charcoal | `#1A1A1A` | Body text and headings on light backgrounds |
| Champagne Gold | `#C9A96E` | Accent only — hover states, dividers, selection indicators. Use sparingly. |
| Border | `#E5E0D8` | Card and section borders |

### Typography
| Role | Font | Weight | Size | Letter-spacing |
|---|---|---|---|---|
| H1 (Hero) | Cormorant Garamond | 200 | 52–88px (clamp) | 3px |
| H2 (Section headings) | Cormorant Garamond | 300 | 34px | 1px |
| H3 (Property names, sub-headings) | Cormorant Garamond | 300 | 22px | 0.5px |
| Labels / Tags | Inter | 400 | 9–10px | 4px, uppercase |
| Body | Inter | 300 | 13–15px | normal |
| Caption / Metadata | Inter | 400 | 10–11px | 1px |

Both fonts loaded from Google Fonts. Cormorant Garamond for all display/headline text; Inter for all UI and body text.

### Logo
- Tree illustration (warm taupe/grey) above "LAFAYETTE" in wide-tracked caps
- "REAL ESTATE" in small spaced caps below
- On dark backgrounds: white version
- On light backgrounds: Forest Green version
- Source file: provided in `/assets/`

---

## 2. Website Purpose & Philosophy

Lafayette is an **off-market, members-only** real estate platform targeting HNWIs, Family Offices, Funds, and CEOs in the DACH region. The website model is **Hybrid**: brand-forward with a curated property showcase. Properties are visible (images, category, location) but **no prices are shown** — all enquiries go through a contact form or direct message to Ludwig Zoller.

This is not a mass-market portal. The website is a credibility surface and a discreet gateway into the Lafayette network.

---

## 3. Sitemap (6 page templates + 1 dynamic detail template)

```
/                          Home
/objekte                   Objekte (property listing grid)
/objekte/[slug]            Objekt-Detail (individual property page)
/leistungen                Leistungen (services)
/ueber-uns                 Über Uns (about + team)
/kontakt                   Kontakt (contact form)
/anmelden                  Anmelden / Registrieren (auth page)
```

The **Anmelden** link is present in the global header on all pages.

---

## 4. Global Components

### Navbar
- Fixed/sticky, full-width
- Transparent over hero sections, transitions to `#0D3D22` with `backdrop-filter: blur(8px)` on scroll (threshold: 60px)
- Left: Lafayette logo (name + "Real Estate" sub-label)
- Right: `Objekte` · `Leistungen` · `Über Uns` · `Kontakt` · **[Anmelden]** ghost button
- Active page highlighted with white text + subtle bottom border

### Footer
- Background: `#0A2E18` (darker green)
- Three-column layout: Brand blurb + address | Navigation links | Contact details
- Bottom bar: copyright + Amtsgericht München registration number
- Links: Impressum, Datenschutz

---

## 5. Page Designs

### 5.1 Home (`/`)

Sections in order:

1. **Hero** — Full-viewport, cinematic. Property photo as full-bleed background with dark green gradient overlay (heavier bottom-left). Navbar transparent. Headline (`Außergewöhnliche Immobilien.`) bottom-left anchored in Cormorant Garamond 200. Eyebrow label above, tagline + divider + ghost CTA below. Vertical scroll indicator bottom-right.

2. **Stats Bar** — Full-width `#0D3D22` strip. 4 columns separated by faint borders:
   - `15+` Objekte vermittelt
   - `5` Länder
   - `€ 50M+` Transaktionsvolumen
   - `100%` Diskret

3. **Featured Properties** — Cream background. Section label + H2 heading left, "Alle Objekte ansehen →" link right. Asymmetric 2-column grid: 1 large card (left, spanning 2 rows) + 2 stacked smaller cards (right). No prices — "Anfrage stellen →" CTA on each card.

4. **Philosophy Strip** — Full-width `#0D3D22`. Two-column layout:
   - Left: Ludwig Zoller round portrait (210px circle, border `rgba(255,255,255,0.15)`), name in Cormorant Garamond, "CEO & Co-Founder" in Inter uppercase
   - Right: Body text from company philosophy + ghost "Mehr über Lafayette" CTA

5. **Services** — Cream background. 3-column bordered grid: Kauf & Investition · Verkauf & Vermarktung · Secret Sales. Each has large faint number, service name (H3), divider, description.

6. **Contact CTA** — Full-width `#0D3D22`. Left: H2 headline. Right: "Anfrage senden" ghost button + "WhatsApp" secondary button.

7. **Footer**

---

### 5.2 Objekte (`/objekte`)

- **Page hero**: `#0D3D22` background, breadcrumb, H1 "Unsere Referenzen.", subtitle
- **Filter bar**: White sticky bar below hero. Chips: Alle · Residential · Commercial · Mixed Use · Ausland. Active chip = Forest Green fill.
- **Property grid**: 3-column responsive grid on cream background. Each card: photo (200px height) with category badge overlay, location name (H3), type/description, divider, "Details ansehen →"
- No prices shown on any card.

**Initial properties from PDF references:**
- München-Harlaching — Residential · Prestige
- Oberhaching — Residential · MFH
- Leipzig — Office · DGNB Gold
- Mallorca — Residential · Prestige · Ausland
- Wiesbaden — Residential & Retail · MFH
- Lissabon — Mixed Use · Portfolio · Ausland

---

### 5.3 Objekt-Detail (`/objekte/[slug]`)

- **Hero**: Full-width property photo (480px height). Dark green gradient overlay at bottom. Category badge, property location as H1, type as subtitle — all overlaid on photo.
- **Body**: 2-column layout:
  - **Main (left)**: 3-cell specs bar (units, area, price "Auf Anfrage") → section label → property description in body copy
  - **Sidebar (right, white background)**: "Anfrage stellen" label, Ludwig Zoller contact card (round photo + name + title), enquiry form (name, email, phone optional, message, submit button)

---

### 5.4 Leistungen (`/leistungen`)

- **Page hero**: Same pattern as Objekte
- **2×2 service grid** (cream/white, bordered): 01 Kauf & Investition · 02 Verkauf & Vermarktung · 03 Secret Sales · 04 Beratung & Netzwerk. Each card: large faint number, service name, green divider, description.
- **4-step process bar** (white, bordered): 01 Erstkontakt → 02 Qualifizierung → 03 Matching → 04 Transaktion

---

### 5.5 Über Uns (`/ueber-uns`)

- **Page hero**: Same pattern
- **Intro section** (cream): 2-column — left: Ludwig Zoller photo (380px height, offset frame decoration), right: name + title + two paragraphs of bio + credentials bullet list (M.Sc., B.Sc., AEQUIFIN, network)
- **Network strip** (`#0D3D22`): 4-column — HNWIs · Family Offices · Fonds · CEOs

---

### 5.6 Kontakt (`/kontakt`)

- **Page hero**: Same pattern
- **Split layout** (no padding wrapper, full-bleed columns):
  - Left (`#0D3D22`): "Direktkontakt" label, H2 headline, contact details (phone, email, address), Ludwig mini-card at bottom (round photo, name, role)
  - Right (cream): Structured enquiry form — Vorname/Nachname (2-col row), E-Mail, "Ich bin interessiert als" dropdown (Käufer/Verkäufer/Investor/Fonds/Sonstiges), Nachricht textarea, submit button, privacy note

---

### 5.7 Anmelden / Registrieren (`/anmelden`)

- **No standard page hero**. Full-height split layout directly below navbar.
- **Left panel**: Property photo background with dark overlay. Brand copy: "Exklusiver Zugang." headline + body text explaining membership benefits. 4 bullet perks (off-market access, direct contact, early notifications, full discretion).
- **Right panel** (cream): 
  - **Tabs**: Anmelden | Registrieren (green underline active indicator)
  - **Login tab**: Email, password, "Passwort vergessen?" link, Submit, OR divider, "Mit Google anmelden" button (real Google SVG)
  - **Registration tab**: First/last name (2-col), email, password, "Ich bin interessiert als" dropdown, Submit. Discretion note: accounts are **manually reviewed** before activation.
  - Both tabs include a discretion notice below the form.
- Navbar simplified: logo left, "← Zurück zur Website" text link right.

---

## 6. Interaction Patterns

| Pattern | Behavior |
|---|---|
| Property card hover | Photo scales to 1.04, card shadow appears |
| Navbar on scroll | Transparent → Forest Green with blur, transition 0.35s |
| Auth tabs | JS tab switch, no page reload |
| Filter chips (Objekte) | Active chip = Forest Green fill (WordPress: AJAX filter or page reload) |
| Form inputs | Border highlights Forest Green on focus |
| CTA buttons | Ghost buttons: subtle background fill on hover |

---

## 7. WordPress Implementation Notes

- **Theme approach**: Custom theme or heavily customised child theme (Astra/GeneratePress as base). Avoid page-builder-only approaches that limit CSS control.
- **Fonts**: Enqueue Cormorant Garamond + Inter from Google Fonts in `functions.php`
- **Auth / Membership**: Use **WooCommerce Memberships** or **Ultimate Member** plugin for account registration, login, and manual approval flow. Google OAuth via **Google OAuth Login** or **WP Google Login** plugin.
- **Property listings**: Custom Post Type `objekt` with meta fields: category (taxonomy), location, type, description, image gallery. No price field — enquiry only.
- **Contact/Enquiry forms**: **Contact Form 7** or **Gravity Forms** with email notification to `office@lafayette-real-estate.de`
- **Multilingual**: Not in scope for Phase 1. WPML can be added in Phase 2.
- **GDPR**: Cookie consent banner required (German law). Datenschutz and Impressum pages required.

---

## 8. Assets & Content Needed from Client

- [ ] Lafayette logo in SVG (white version + Forest Green version)
- [ ] Professional headshot of Ludwig Zoller (high-res, for round portrait use)
- [ ] Property photography for all 6 reference objects
- [ ] Final copy for philosophy text, service descriptions, bio
- [ ] Stats bar figures confirmation (15+ objects, €50M+ volume)
- [ ] Impressum and Datenschutzerklärung text (legal requirement)

---

## 9. Out of Scope (Phase 1)

- English language version
- Blog / News section
- Separate Käufer / Verkäufer journey pages
- Dedicated Netzwerk / Membership application page
- Interactive map for property locations
- Video hero background

These are candidates for Phase 2 once the site is live and content is established.
