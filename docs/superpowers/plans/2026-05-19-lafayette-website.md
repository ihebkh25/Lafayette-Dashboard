# Lafayette Real Estate Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a custom WordPress theme for Lafayette Real Estate — a luxury off-market Immobilien agency in Munich — matching the approved Prestige design (dark green hero, cream content sections, Cormorant Garamond + Inter typography).

**Architecture:** Custom WordPress theme (no page builder) with a `objekt` Custom Post Type for properties, Contact Form 7 for enquiries, and Ultimate Member for user registration with manual approval. All design decisions are documented in `docs/superpowers/specs/2026-05-19-lafayette-website-design.md`. The approved HTML mockups in `.superpowers/brainstorm/` are the authoritative visual reference.

**Tech Stack:** WordPress 6.x, PHP 8.1+, Vanilla JS (ES6), CSS custom properties, PHPUnit + WP_Mock for PHP tests, Jest for JS tests, Contact Form 7, Ultimate Member, WP Google Login, Advanced Custom Fields (ACF Free)

---

## File Map

```
wp-content/themes/lafayette/
├── style.css                          Theme header + CSS entry point
├── functions.php                      Require inc/ files, theme support
├── index.php                          WP fallback (blank)
├── front-page.php                     Homepage
├── page-objekte.php                   Property listing grid
├── single-objekt.php                  Property detail
├── page-leistungen.php                Services
├── page-ueber-uns.php                 About / team
├── page-kontakt.php                   Contact
├── page-anmelden.php                  Login / Register
├── header.php                         Global navbar
├── footer.php                         Global footer
├── 404.php                            404 page
│
├── template-parts/
│   ├── page-hero.php                  Reusable dark-green page hero (inner pages)
│   ├── property-card.php              Reusable property card partial
│   └── enquiry-form.php              Reusable CF7 enquiry form partial
│
├── inc/
│   ├── enqueue.php                    Register/enqueue all styles and scripts
│   ├── cpt.php                        Register 'objekt' CPT + 'objekt-kategorie' taxonomy
│   ├── acf-fields.php                 Register ACF field groups for objekt
│   ├── auth.php                       Ultimate Member hooks: manual approval emails
│   └── nav-walker.php                 Custom nav walker for styled menu links
│
├── assets/
│   ├── css/
│   │   ├── variables.css              CSS custom properties (design tokens)
│   │   ├── base.css                   Reset, typography, body defaults
│   │   ├── components/
│   │   │   ├── navbar.css
│   │   │   ├── footer.css
│   │   │   ├── property-card.css
│   │   │   ├── buttons.css
│   │   │   ├── forms.css
│   │   │   └── page-hero.css
│   │   └── pages/
│   │       ├── home.css
│   │       ├── objekte.css
│   │       ├── objekt-detail.css
│   │       ├── leistungen.css
│   │       ├── ueber-uns.css
│   │       ├── kontakt.css
│   │       └── auth.css
│   ├── js/
│   │   ├── nav.js                     Navbar scroll transparency toggle
│   │   ├── filter.js                  Property filter chip logic (Objekte page)
│   │   └── auth.js                    Login/Register tab switching
│   └── images/
│       ├── logo-white.svg             Lafayette logo — white on dark
│       └── logo-green.svg            Lafayette logo — Forest Green on light
│
└── tests/
    ├── php/
    │   ├── bootstrap.php              PHPUnit + WP_Mock setup
    │   ├── test-cpt.php               Tests for objekt CPT registration
    │   └── test-auth.php             Tests for manual approval hooks
    └── js/
        ├── nav.test.js                Jest tests for navbar scroll
        ├── filter.test.js             Jest tests for filter chips
        └── auth.test.js              Jest tests for tab switching
```

---

## Task 1: Dev Environment & Theme Scaffold

**Files:**
- Create: `wp-content/themes/lafayette/style.css`
- Create: `wp-content/themes/lafayette/functions.php`
- Create: `wp-content/themes/lafayette/index.php`
- Create: `wp-content/themes/lafayette/assets/css/variables.css`
- Create: `wp-content/themes/lafayette/assets/css/base.css`
- Create: `wp-content/themes/lafayette/inc/enqueue.php`

- [ ] **Step 1: Verify WordPress is running locally**

  Use [LocalWP](https://localwp.com/) (recommended), MAMP, or XAMPP. Create a new site called `lafayette-dev`. Confirm you can access `http://lafayette-dev.local/wp-admin`.

- [ ] **Step 2: Create the theme directory**

  ```bash
  mkdir -p wp-content/themes/lafayette/{assets/{css/{components,pages},js,images},inc,template-parts,tests/{php,js}}
  ```

- [ ] **Step 3: Create `style.css`**

  ```css
  /*
  Theme Name: Lafayette Real Estate
  Theme URI: https://www.lafayette-real-estate.de
  Author: Lafayette Real Estate
  Description: Custom theme for Lafayette Real Estate — luxury off-market Immobilien agency.
  Version: 1.0.0
  Text Domain: lafayette
  */
  @import url('assets/css/variables.css');
  @import url('assets/css/base.css');
  @import url('assets/css/components/navbar.css');
  @import url('assets/css/components/footer.css');
  @import url('assets/css/components/property-card.css');
  @import url('assets/css/components/buttons.css');
  @import url('assets/css/components/forms.css');
  @import url('assets/css/components/page-hero.css');
  ```

- [ ] **Step 4: Create `assets/css/variables.css`**

  ```css
  :root {
    --color-green:       #0D3D22;
    --color-green-dark:  #0A2E18;
    --color-cream:       #FAF8F4;
    --color-white:       #FFFFFF;
    --color-charcoal:    #1A1A1A;
    --color-gold:        #C9A96E;
    --color-border:      #E5E0D8;
    --color-text-muted:  #666666;
    --color-text-light:  rgba(255,255,255,0.75);
    --color-text-faint:  rgba(255,255,255,0.4);

    --font-display: 'Cormorant Garamond', Georgia, serif;
    --font-body:    'Inter', -apple-system, sans-serif;

    --space-xs:  8px;
    --space-sm:  16px;
    --space-md:  32px;
    --space-lg:  52px;
    --space-xl:  80px;

    --transition-base: 0.25s ease;
    --transition-nav:  0.35s ease;
  }
  ```

- [ ] **Step 5: Create `assets/css/base.css`**

  ```css
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: var(--font-body);
    font-weight: 300;
    background: var(--color-cream);
    color: var(--color-charcoal);
    -webkit-font-smoothing: antialiased;
  }
  a { text-decoration: none; color: inherit; }
  img { display: block; max-width: 100%; }

  h1, h2, h3 {
    font-family: var(--font-display);
    font-weight: 300;
    line-height: 1.15;
  }
  .section-label {
    font-family: var(--font-body);
    font-size: 9px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--color-green);
    opacity: 0.7;
    margin-bottom: 10px;
  }
  .section-label--light {
    color: var(--color-text-faint);
    opacity: 1;
  }
  ```

- [ ] **Step 6: Create `inc/enqueue.php`**

  ```php
  <?php
  function lafayette_enqueue_assets(): void {
      $version = wp_get_theme()->get('Version');

      wp_enqueue_style(
          'google-fonts',
          'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;1,200;1,300&family=Inter:wght@300;400;500&display=swap',
          [],
          null
      );

      wp_enqueue_style(
          'lafayette-style',
          get_stylesheet_uri(),
          ['google-fonts'],
          $version
      );

      wp_enqueue_script(
          'lafayette-nav',
          get_template_directory_uri() . '/assets/js/nav.js',
          [],
          $version,
          true
      );
  }
  add_action('wp_enqueue_scripts', 'lafayette_enqueue_assets');
  ```

- [ ] **Step 7: Create `functions.php`**

  ```php
  <?php
  if (!defined('ABSPATH')) exit;

  require_once get_template_directory() . '/inc/enqueue.php';
  require_once get_template_directory() . '/inc/cpt.php';
  require_once get_template_directory() . '/inc/acf-fields.php';
  require_once get_template_directory() . '/inc/auth.php';

  function lafayette_theme_setup(): void {
      add_theme_support('title-tag');
      add_theme_support('post-thumbnails');
      add_theme_support('html5', ['search-form','comment-form','gallery','caption']);
      load_theme_textdomain('lafayette', get_template_directory() . '/languages');

      register_nav_menus([
          'primary' => __('Primary Navigation', 'lafayette'),
      ]);
  }
  add_action('after_setup_theme', 'lafayette_theme_setup');
  ```

- [ ] **Step 8: Create `index.php`** (required WP fallback)

  ```php
  <?php // Intentionally blank — all routing handled by specific templates.
  ```

- [ ] **Step 9: Activate the theme**

  Go to WP Admin → Appearance → Themes → activate "Lafayette Real Estate". Confirm the site loads without PHP errors.

- [ ] **Step 10: Commit**

  ```bash
  git add wp-content/themes/lafayette/
  git commit -m "feat: scaffold Lafayette theme with design tokens and enqueue"
  ```

---

## Task 2: Global Navbar

**Files:**
- Create: `header.php`
- Create: `assets/css/components/navbar.css`
- Create: `assets/js/nav.js`
- Create: `tests/js/nav.test.js`

- [ ] **Step 1: Write failing JS test for scroll behaviour**

  Create `tests/js/nav.test.js`:
  ```js
  // Run: npx jest tests/js/nav.test.js
  import { initNav } from '../../assets/js/nav.js';

  describe('navbar scroll behaviour', () => {
    beforeEach(() => {
      document.body.innerHTML = '<nav id="main-nav"></nav>';
      Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    });

    test('adds .scrolled class when scrollY > 60', () => {
      initNav();
      window.scrollY = 80;
      window.dispatchEvent(new Event('scroll'));
      expect(document.getElementById('main-nav').classList.contains('scrolled')).toBe(true);
    });

    test('removes .scrolled class when scrollY <= 60', () => {
      const nav = document.getElementById('main-nav');
      nav.classList.add('scrolled');
      initNav();
      window.scrollY = 20;
      window.dispatchEvent(new Event('scroll'));
      expect(nav.classList.contains('scrolled')).toBe(false);
    });
  });
  ```

- [ ] **Step 2: Run test — confirm it fails**

  ```bash
  npx jest tests/js/nav.test.js
  ```
  Expected: FAIL — `Cannot find module '../../assets/js/nav.js'`

- [ ] **Step 3: Create `assets/js/nav.js`**

  ```js
  export function initNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (typeof document !== 'undefined') initNav();
  ```

- [ ] **Step 4: Run test — confirm it passes**

  ```bash
  npx jest tests/js/nav.test.js
  ```
  Expected: PASS (2 tests)

- [ ] **Step 5: Create `assets/css/components/navbar.css`**

  ```css
  #main-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 0 var(--space-lg);
    height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    background: transparent;
    border-bottom: 1px solid transparent;
    transition: background var(--transition-nav), border-color var(--transition-nav);
  }
  #main-nav.scrolled {
    background: rgba(10, 40, 22, 0.97);
    border-bottom-color: rgba(255,255,255,0.07);
    backdrop-filter: blur(8px);
  }
  .nav-logo { display: flex; flex-direction: column; gap: 1px; }
  .nav-logo__name {
    font-family: var(--font-body); font-size: 13px; letter-spacing: 7px;
    font-weight: 400; color: white; text-transform: uppercase;
  }
  .nav-logo__sub {
    font-family: var(--font-body); font-size: 7px; letter-spacing: 4px;
    color: rgba(255,255,255,0.3); text-transform: uppercase;
  }
  .nav-links { display: flex; gap: 36px; align-items: center; }
  .nav-links a {
    font-family: var(--font-body); font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(255,255,255,0.55);
    transition: color var(--transition-base);
  }
  .nav-links a:hover,
  .nav-links a.current-menu-item { color: white; }
  .nav-links__cta {
    border: 1px solid rgba(255,255,255,0.35);
    padding: 9px 20px; margin-left: 8px;
    color: rgba(255,255,255,0.85) !important;
    transition: background var(--transition-base) !important;
  }
  .nav-links__cta:hover { background: rgba(255,255,255,0.08); }
  ```

- [ ] **Step 6: Create `header.php`**

  ```php
  <!DOCTYPE html>
  <html <?php language_attributes(); ?>>
  <head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
  </head>
  <body <?php body_class(); ?>>
  <?php wp_body_open(); ?>

  <nav id="main-nav">
    <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-logo">
      <span class="nav-logo__name">Lafayette</span>
      <span class="nav-logo__sub">Real Estate</span>
    </a>
    <div class="nav-links">
      <?php
      wp_nav_menu([
          'theme_location' => 'primary',
          'container'      => false,
          'items_wrap'     => '%3$s',
          'fallback_cb'    => false,
      ]);
      ?>
      <a href="<?php echo esc_url(home_url('/anmelden')); ?>" class="nav-links__cta">
        <?php esc_html_e('Anmelden', 'lafayette'); ?>
      </a>
    </div>
  </nav>
  ```

  > **WP Admin setup:** Go to Appearance → Menus. Create a menu with pages: Objekte, Leistungen, Über Uns, Kontakt. Assign to "Primary Navigation" location.

- [ ] **Step 7: Commit**

  ```bash
  git add header.php assets/css/components/navbar.css assets/js/nav.js tests/js/nav.test.js
  git commit -m "feat: add sticky transparent navbar with scroll transition"
  ```

---

## Task 3: Global Footer

**Files:**
- Create: `footer.php`
- Create: `assets/css/components/footer.css`

- [ ] **Step 1: Create `assets/css/components/footer.css`**

  ```css
  .site-footer {
    background: var(--color-green-dark);
    padding: var(--space-lg) var(--space-lg) var(--space-md);
    border-top: 1px solid rgba(255,255,255,0.05);
  }
  .footer-top {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: var(--space-lg);
    margin-bottom: 44px;
  }
  .footer-brand__name { font-family: var(--font-body); font-size: 14px; letter-spacing: 7px; color: white; text-transform: uppercase; }
  .footer-brand__sub  { font-family: var(--font-body); font-size: 7px; letter-spacing: 4px; color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 14px; }
  .footer-brand p     { font-family: var(--font-body); font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.8; font-weight: 300; }
  .footer-col h4 {
    font-family: var(--font-body); font-size: 8px;
    letter-spacing: 3px; text-transform: uppercase;
    color: rgba(255,255,255,0.3); margin-bottom: 14px;
  }
  .footer-col a {
    display: block; font-family: var(--font-body); font-size: 12px;
    color: rgba(255,255,255,0.5); margin-bottom: 8px;
    transition: color var(--transition-base); font-weight: 300;
  }
  .footer-col a:hover { color: rgba(255,255,255,0.85); }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding-top: 20px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .footer-bottom p { font-family: var(--font-body); font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }
  ```

- [ ] **Step 2: Create `footer.php`**

  ```php
  <footer class="site-footer">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="footer-brand__name">Lafayette</div>
        <div class="footer-brand__sub">Real Estate</div>
        <p>
          Lafayette Real Estate GmbH &amp; Co KG<br>
          Margarethenstraße 8<br>
          82049 Pullach bei München
        </p>
      </div>
      <div class="footer-col">
        <h4><?php esc_html_e('Navigation', 'lafayette'); ?></h4>
        <a href="<?php echo esc_url(home_url('/objekte')); ?>">Objekte</a>
        <a href="<?php echo esc_url(home_url('/leistungen')); ?>">Leistungen</a>
        <a href="<?php echo esc_url(home_url('/ueber-uns')); ?>">Über uns</a>
        <a href="<?php echo esc_url(home_url('/kontakt')); ?>">Kontakt</a>
      </div>
      <div class="footer-col">
        <h4><?php esc_html_e('Kontakt', 'lafayette'); ?></h4>
        <a href="tel:+4915140767073">+49 151 40767073</a>
        <a href="mailto:office@lafayette-real-estate.de">office@lafayette-real-estate.de</a>
        <a href="<?php echo esc_url(home_url('/impressum')); ?>">Impressum</a>
        <a href="<?php echo esc_url(home_url('/datenschutz')); ?>">Datenschutz</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <?php echo date('Y'); ?> Lafayette Real Estate GmbH &amp; Co KG · Alle Rechte vorbehalten.</p>
      <p>Amtsgericht München · HRB 106970</p>
    </div>
  </footer>
  <?php wp_footer(); ?>
  </body>
  </html>
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add footer.php assets/css/components/footer.css
  git commit -m "feat: add global footer with address, nav, legal links"
  ```

---

## Task 4: Objekt Custom Post Type & ACF Fields

**Files:**
- Create: `inc/cpt.php`
- Create: `inc/acf-fields.php`
- Create: `tests/php/bootstrap.php`
- Create: `tests/php/test-cpt.php`

**Prerequisite:** Install and activate the [ACF Free](https://wordpress.org/plugins/advanced-custom-fields/) plugin in WP Admin → Plugins.

- [ ] **Step 1: Create `tests/php/bootstrap.php`**

  ```php
  <?php
  require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
  WP_Mock::bootstrap();
  ```

- [ ] **Step 2: Write failing test for CPT registration**

  Create `tests/php/test-cpt.php`:
  ```php
  <?php
  use PHPUnit\Framework\TestCase;

  class TestCpt extends TestCase {
    public function setUp(): void {
      WP_Mock::setUp();
    }
    public function tearDown(): void {
      WP_Mock::tearDown();
    }

    public function test_objekt_cpt_is_registered(): void {
      WP_Mock::expectActionAdded('init', 'lafayette_register_objekt_cpt');
      require_once dirname(__DIR__, 2) . '/inc/cpt.php';
      WP_Mock::assertActionsCalled();
      $this->assertTrue(true);
    }

    public function test_objekt_kategorie_taxonomy_is_registered(): void {
      WP_Mock::expectActionAdded('init', 'lafayette_register_objekt_taxonomy');
      require_once dirname(__DIR__, 2) . '/inc/cpt.php';
      WP_Mock::assertActionsCalled();
      $this->assertTrue(true);
    }
  }
  ```

- [ ] **Step 3: Run test — confirm it fails**

  ```bash
  ./vendor/bin/phpunit tests/php/test-cpt.php
  ```
  Expected: FAIL — `lafayette_register_objekt_cpt action not added`

- [ ] **Step 4: Create `inc/cpt.php`**

  ```php
  <?php
  function lafayette_register_objekt_cpt(): void {
      register_post_type('objekt', [
          'labels' => [
              'name'          => 'Objekte',
              'singular_name' => 'Objekt',
              'add_new_item'  => 'Neues Objekt',
              'edit_item'     => 'Objekt bearbeiten',
          ],
          'public'        => true,
          'has_archive'   => false,
          'rewrite'       => ['slug' => 'objekte'],
          'supports'      => ['title', 'editor', 'thumbnail', 'excerpt'],
          'menu_icon'     => 'dashicons-building',
          'show_in_rest'  => true,
      ]);
  }
  add_action('init', 'lafayette_register_objekt_cpt');

  function lafayette_register_objekt_taxonomy(): void {
      register_taxonomy('objekt-kategorie', 'objekt', [
          'labels' => [
              'name'          => 'Kategorien',
              'singular_name' => 'Kategorie',
          ],
          'hierarchical'  => true,
          'rewrite'       => ['slug' => 'objekt-kategorie'],
          'show_in_rest'  => true,
      ]);
  }
  add_action('init', 'lafayette_register_objekt_taxonomy');
  ```

- [ ] **Step 5: Run test — confirm it passes**

  ```bash
  ./vendor/bin/phpunit tests/php/test-cpt.php
  ```
  Expected: PASS (2 tests)

- [ ] **Step 6: Create `inc/acf-fields.php`**

  ```php
  <?php
  // Register ACF field group for Objekt CPT programmatically.
  // These fields match the property detail layout in the spec.
  function lafayette_register_acf_fields(): void {
      if (!function_exists('acf_add_local_field_group')) return;

      acf_add_local_field_group([
          'key'      => 'group_objekt',
          'title'    => 'Objekt Details',
          'fields'   => [
              [
                  'key'   => 'field_objekt_location',
                  'label' => 'Standort',
                  'name'  => 'objekt_location',
                  'type'  => 'text',
              ],
              [
                  'key'   => 'field_objekt_type',
                  'label' => 'Typ (z.B. Prestige Villa)',
                  'name'  => 'objekt_type',
                  'type'  => 'text',
              ],
              [
                  'key'   => 'field_objekt_units',
                  'label' => 'Einheiten',
                  'name'  => 'objekt_units',
                  'type'  => 'text',
              ],
              [
                  'key'   => 'field_objekt_area',
                  'label' => 'Fläche (z.B. > 600 m²)',
                  'name'  => 'objekt_area',
                  'type'  => 'text',
              ],
              [
                  'key'   => 'field_objekt_gallery',
                  'label' => 'Bildergalerie',
                  'name'  => 'objekt_gallery',
                  'type'  => 'gallery',
              ],
          ],
          'location' => [[['param' => 'post_type', 'operator' => '==', 'value' => 'objekt']]],
      ]);
  }
  add_action('acf/init', 'lafayette_register_acf_fields');
  ```

- [ ] **Step 7: Flush rewrite rules**

  Go to WP Admin → Settings → Permalinks → click "Save Changes". Confirm `/objekte/` URLs resolve.

- [ ] **Step 8: Add 6 test properties in WP Admin**

  Go to WP Admin → Objekte → Add New. Create one entry for each property from the spec:
  - München-Harlaching | Residential · Prestige | 6 Einheiten | > 600 m²
  - Oberhaching | Residential · MFH | 6 Einheiten | > 600 m²
  - Leipzig | Office · DGNB Gold | — | > 10.000 m²
  - Mallorca | Residential · Ausland | — | > 500 m²
  - Wiesbaden | Residential & Retail | 10 Einheiten | > 800 m²
  - Lissabon | Mixed Use · Ausland | — | —

  Assign taxonomy terms: Residential, Commercial, Mixed Use, Ausland.

- [ ] **Step 9: Commit**

  ```bash
  git add inc/cpt.php inc/acf-fields.php tests/php/
  git commit -m "feat: register objekt CPT, taxonomy, and ACF fields"
  ```

---

## Task 5: Reusable Partials

**Files:**
- Create: `template-parts/page-hero.php`
- Create: `template-parts/property-card.php`
- Create: `template-parts/enquiry-form.php`
- Create: `assets/css/components/page-hero.css`
- Create: `assets/css/components/property-card.css`
- Create: `assets/css/components/buttons.css`
- Create: `assets/css/components/forms.css`

- [ ] **Step 1: Create `assets/css/components/page-hero.css`**

  ```css
  .page-hero {
    background: var(--color-green);
    padding: 60px var(--space-lg) 52px;
  }
  .page-hero__breadcrumb {
    font-family: var(--font-body); font-size: 9px; letter-spacing: 2px;
    color: rgba(255,255,255,0.3); text-transform: uppercase; margin-bottom: 18px;
  }
  .page-hero__title {
    font-family: var(--font-display); font-weight: 200;
    font-size: 52px; letter-spacing: 3px; color: white; line-height: 1.1;
  }
  .page-hero__subtitle {
    font-family: var(--font-body); font-size: 11px;
    color: rgba(255,255,255,0.4); letter-spacing: 2px;
    text-transform: uppercase; margin-top: 14px;
  }
  ```

- [ ] **Step 2: Create `template-parts/page-hero.php`**

  ```php
  <?php
  // Usage: get_template_part('template-parts/page-hero', null, [
  //   'breadcrumb' => 'Lafayette Real Estate → Objekte',
  //   'title'      => 'Unsere Referenzen.',
  //   'subtitle'   => 'Exklusive Objekte · Auf Anfrage',
  // ]);
  $breadcrumb = $args['breadcrumb'] ?? '';
  $title      = $args['title']      ?? get_the_title();
  $subtitle   = $args['subtitle']   ?? '';
  ?>
  <div class="page-hero">
    <?php if ($breadcrumb): ?>
      <div class="page-hero__breadcrumb"><?php echo esc_html($breadcrumb); ?></div>
    <?php endif; ?>
    <h1 class="page-hero__title"><?php echo esc_html($title); ?></h1>
    <?php if ($subtitle): ?>
      <div class="page-hero__subtitle"><?php echo esc_html($subtitle); ?></div>
    <?php endif; ?>
  </div>
  ```

- [ ] **Step 3: Create `assets/css/components/property-card.css`**

  ```css
  .prop-card {
    background: var(--color-white);
    border: 1px solid var(--color-border);
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow var(--transition-base);
  }
  .prop-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
  .prop-card__img { position: relative; overflow: hidden; height: 200px; }
  .prop-card__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
  .prop-card:hover .prop-card__img img { transform: scale(1.04); }
  .prop-card__badge {
    position: absolute; top: 12px; left: 12px;
    background: rgba(13,61,34,0.88); backdrop-filter: blur(4px);
    padding: 3px 9px; font-family: var(--font-body);
    font-size: 7.5px; letter-spacing: 2px; color: white; text-transform: uppercase;
  }
  .prop-card__body { padding: 18px 20px 20px; }
  .prop-card__location {
    font-family: var(--font-display); font-weight: 300;
    font-size: 20px; color: var(--color-charcoal); letter-spacing: 0.5px; margin-bottom: 4px;
  }
  .prop-card__type {
    font-family: var(--font-body); font-size: 9px;
    color: #888; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;
  }
  .prop-card__divider { width: 20px; height: 1px; background: var(--color-border); margin-bottom: 12px; }
  .prop-card__cta { font-family: var(--font-body); font-size: 9px; letter-spacing: 2px; color: var(--color-green); text-transform: uppercase; }
  ```

- [ ] **Step 4: Create `template-parts/property-card.php`**

  ```php
  <?php
  // Usage: get_template_part('template-parts/property-card', null, ['post_id' => $post->ID]);
  $post_id   = $args['post_id']   ?? get_the_ID();
  $location  = get_field('objekt_location', $post_id) ?: get_the_title($post_id);
  $type      = get_field('objekt_type', $post_id) ?: '';
  $terms     = get_the_terms($post_id, 'objekt-kategorie');
  $badge     = $terms && !is_wp_error($terms) ? esc_html($terms[0]->name) : '';
  $thumb_url = get_the_post_thumbnail_url($post_id, 'large') ?: '';
  $permalink = get_permalink($post_id);
  ?>
  <a href="<?php echo esc_url($permalink); ?>" class="prop-card">
    <div class="prop-card__img">
      <?php if ($thumb_url): ?>
        <img src="<?php echo esc_url($thumb_url); ?>" alt="<?php echo esc_attr($location); ?>" loading="lazy">
      <?php endif; ?>
      <?php if ($badge): ?>
        <div class="prop-card__badge"><?php echo $badge; ?></div>
      <?php endif; ?>
    </div>
    <div class="prop-card__body">
      <div class="prop-card__location"><?php echo esc_html($location); ?></div>
      <div class="prop-card__type"><?php echo esc_html($type); ?> · Auf Anfrage</div>
      <div class="prop-card__divider"></div>
      <div class="prop-card__cta">Details ansehen →</div>
    </div>
  </a>
  ```

- [ ] **Step 5: Create `assets/css/components/buttons.css`**

  ```css
  .btn-ghost {
    display: inline-block; align-self: flex-start;
    border: 1px solid rgba(255,255,255,0.4);
    padding: 14px 32px;
    font-family: var(--font-body); font-size: 10px;
    letter-spacing: 3px; text-transform: uppercase;
    color: rgba(255,255,255,0.85);
    transition: background var(--transition-base);
  }
  .btn-ghost:hover { background: rgba(255,255,255,0.08); }

  .btn-outline {
    display: inline-block;
    border: 1px solid var(--color-green);
    padding: 14px 32px;
    font-family: var(--font-body); font-size: 10px;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--color-green);
    transition: background var(--transition-base), color var(--transition-base);
  }
  .btn-outline:hover { background: var(--color-green); color: white; }

  .btn-solid {
    display: inline-block;
    background: var(--color-green); border: 1px solid var(--color-green);
    padding: 14px 32px;
    font-family: var(--font-body); font-size: 10px;
    letter-spacing: 3px; text-transform: uppercase; color: white;
    cursor: pointer; width: 100%;
    transition: background var(--transition-base);
  }
  .btn-solid:hover { background: var(--color-green-dark); }
  ```

- [ ] **Step 6: Create `assets/css/components/forms.css`**

  ```css
  .form-group { margin-bottom: 16px; }
  .form-group-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .form-label {
    display: block; font-family: var(--font-body); font-size: 9px;
    letter-spacing: 2.5px; text-transform: uppercase; color: #888; margin-bottom: 6px;
  }
  .form-input, .form-select, .form-textarea {
    width: 100%; border: 1px solid var(--color-border);
    padding: 13px 16px; background: white;
    font-family: var(--font-body); font-size: 13px; color: var(--color-charcoal);
    outline: none; transition: border-color var(--transition-base);
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--color-green); }
  .form-textarea { height: 110px; resize: none; }
  .form-select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23aaa'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 16px center; }
  .form-privacy { font-family: var(--font-body); font-size: 10px; color: #aaa; line-height: 1.65; margin-top: 8px; }
  ```

- [ ] **Step 7: Create `template-parts/enquiry-form.php`**

  ```php
  <?php
  // Usage: get_template_part('template-parts/enquiry-form', null, ['object_title' => $title]);
  // Requires Contact Form 7. Form ID 1 should be the enquiry form (configure in CF7 admin).
  $object_title = $args['object_title'] ?? '';
  $cf7_id       = get_option('lafayette_enquiry_form_id', 1); // Set via Options API or hard-code after CF7 setup
  ?>
  <div class="enquiry-form-wrap">
    <?php if (function_exists('wpcf7_get_contact_form')): ?>
      <?php echo do_shortcode('[contact-form-7 id="' . intval($cf7_id) . '" title="Objektanfrage"]'); ?>
    <?php else: ?>
      <p style="font-size:12px;color:#888">Bitte installieren Sie Contact Form 7.</p>
    <?php endif; ?>
  </div>
  ```

  > **CF7 setup:** Install Contact Form 7 → Add New form. Fields: Ihr Name (text), E-Mail (email), Telefon (tel, optional), Nachricht (textarea). Set mail recipient to `office@lafayette-real-estate.de`. Note the form ID and update `lafayette_enquiry_form_id` option.

- [ ] **Step 8: Commit**

  ```bash
  git add template-parts/ assets/css/components/
  git commit -m "feat: add reusable page-hero, property-card, enquiry-form partials and component CSS"
  ```

---

## Task 6: Homepage

**Files:**
- Create: `front-page.php`
- Create: `assets/css/pages/home.css`

- [ ] **Step 1: Create `assets/css/pages/home.css`**

  ```css
  /* ---- HERO ---- */
  .home-hero {
    position: relative; height: 100vh; min-height: 620px;
    background:
      linear-gradient(160deg, rgba(8,35,18,0.92) 0%, rgba(8,35,18,0.3) 65%),
      var(--hero-bg-image, #0D3D22) center/cover no-repeat;
    display: flex; flex-direction: column;
  }
  .home-hero__body { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; padding: 0 var(--space-lg) 60px; }
  .home-hero__eyebrow { font-family: var(--font-body); font-size: 10px; letter-spacing: 4px; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 16px; }
  .home-hero__headline { font-family: var(--font-display); font-weight: 200; font-size: clamp(52px, 7vw, 88px); line-height: 1.05; letter-spacing: 3px; color: white; max-width: 640px; }
  .home-hero__divider { width: 36px; height: 1px; background: rgba(255,255,255,0.3); margin: 24px 0; }
  .home-hero__tagline { font-family: var(--font-body); font-size: 11px; letter-spacing: 3px; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 32px; }
  .home-hero__scroll { position: absolute; bottom: 52px; right: var(--space-lg); display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .home-hero__scroll span { font-family: var(--font-body); font-size: 8px; letter-spacing: 3px; color: rgba(255,255,255,0.3); writing-mode: vertical-rl; text-transform: uppercase; }
  .home-hero__scroll-line { width: 1px; height: 44px; background: rgba(255,255,255,0.2); }

  /* ---- STATS BAR ---- */
  .stats-bar { background: var(--color-green); display: flex; }
  .stats-bar__item { flex: 1; text-align: center; padding: 28px 20px; border-right: 1px solid rgba(255,255,255,0.08); }
  .stats-bar__item:last-child { border-right: none; }
  .stats-bar__num { font-family: var(--font-display); font-weight: 200; font-size: 38px; color: white; line-height: 1; }
  .stats-bar__label { font-family: var(--font-body); font-size: 8px; letter-spacing: 2.5px; color: rgba(255,255,255,0.38); text-transform: uppercase; margin-top: 6px; }

  /* ---- FEATURED PROPERTIES ---- */
  .featured { background: var(--color-cream); padding: var(--space-xl) var(--space-lg); }
  .featured__header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
  .featured__view-all { font-family: var(--font-body); font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--color-green); border-bottom: 1px solid rgba(13,61,34,0.3); padding-bottom: 2px; white-space: nowrap; }
  .featured__grid { display: grid; grid-template-columns: 1.65fr 1fr; grid-template-rows: auto auto; gap: 16px; }
  .featured__main { grid-row: 1 / 3; }
  .featured__main .prop-card__img { height: 420px; }
  .featured__main .prop-card__location { font-size: 27px; }
  .featured__main .prop-card__body { padding: 22px 26px 26px; }

  /* ---- PHILOSOPHY ---- */
  .philosophy { background: var(--color-green); padding: var(--space-xl) var(--space-lg); display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
  .philosophy__portrait-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 18px; }
  .philosophy__portrait { width: 210px; height: 210px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.15); flex-shrink: 0; }
  .philosophy__portrait img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .philosophy__name { font-family: var(--font-display); font-weight: 300; font-size: 20px; letter-spacing: 1px; color: white; }
  .philosophy__role { font-family: var(--font-body); font-size: 9px; letter-spacing: 3px; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-top: 5px; }
  .philosophy__body { font-family: var(--font-body); font-weight: 300; font-size: 14px; line-height: 1.85; color: rgba(255,255,255,0.6); margin-bottom: 28px; }

  /* ---- SERVICES ---- */
  .services { background: var(--color-cream); padding: var(--space-xl) var(--space-lg); }
  .services__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--color-border); border: 1px solid var(--color-border); margin-top: 44px; }
  .services__item { background: var(--color-cream); padding: 40px 36px; transition: background var(--transition-base); }
  .services__item:hover { background: white; }
  .services__num { font-family: var(--font-display); font-weight: 200; font-size: 42px; color: rgba(13,61,34,0.15); line-height: 1; margin-bottom: 16px; }
  .services__name { font-family: var(--font-display); font-weight: 300; font-size: 22px; color: var(--color-charcoal); margin-bottom: 12px; }
  .services__divider { width: 24px; height: 1px; background: var(--color-green); opacity: 0.3; margin: 16px 0; }
  .services__desc { font-family: var(--font-body); font-weight: 300; font-size: 13px; color: var(--color-text-muted); line-height: 1.75; }

  /* ---- CONTACT CTA ---- */
  .home-cta { background: var(--color-green); padding: var(--space-xl) var(--space-lg); display: flex; align-items: center; justify-content: space-between; gap: 40px; }
  .home-cta__label { font-family: var(--font-body); font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 14px; }
  .home-cta__headline { font-family: var(--font-display); font-weight: 200; font-size: 38px; color: white; line-height: 1.2; letter-spacing: 1px; max-width: 480px; }
  .home-cta__btns { display: flex; gap: 16px; flex-shrink: 0; }
  ```

- [ ] **Step 2: Create `front-page.php`**

  ```php
  <?php get_header(); ?>

  <?php
  // Hero background: use featured image of the homepage WP page, fallback to first objekt thumbnail
  $hero_img = get_the_post_thumbnail_url(get_the_ID(), 'full');
  if (!$hero_img) {
      $first = get_posts(['post_type' => 'objekt', 'numberposts' => 1]);
      $hero_img = $first ? get_the_post_thumbnail_url($first[0]->ID, 'full') : '';
  }
  ?>

  <main>
    <!-- HERO -->
    <section class="home-hero" style="<?php echo $hero_img ? '--hero-bg-image: url(' . esc_url($hero_img) . ')' : ''; ?>">
      <div class="home-hero__body">
        <div class="home-hero__eyebrow">Exklusiv · Diskret · München</div>
        <h1 class="home-hero__headline">Außer&shy;gewöhn&shy;liche<br>Immo&shy;bilien.</h1>
        <div class="home-hero__divider"></div>
        <div class="home-hero__tagline">Für ein privates Netzwerk.</div>
        <a href="<?php echo esc_url(home_url('/kontakt')); ?>" class="btn-ghost">Kontakt aufnehmen</a>
      </div>
      <div class="home-hero__scroll">
        <div class="home-hero__scroll-line"></div>
        <span>Scroll</span>
      </div>
    </section>

    <!-- STATS BAR -->
    <div class="stats-bar">
      <div class="stats-bar__item"><div class="stats-bar__num">15+</div><div class="stats-bar__label">Objekte vermittelt</div></div>
      <div class="stats-bar__item"><div class="stats-bar__num">5</div><div class="stats-bar__label">Länder</div></div>
      <div class="stats-bar__item"><div class="stats-bar__num">€ 50M+</div><div class="stats-bar__label">Transaktionsvolumen</div></div>
      <div class="stats-bar__item"><div class="stats-bar__num">100%</div><div class="stats-bar__label">Diskret</div></div>
    </div>

    <!-- FEATURED PROPERTIES -->
    <section class="featured">
      <div class="featured__header">
        <div>
          <div class="section-label">Ausgewählte Referenzen</div>
          <h2 style="font-family:var(--font-display);font-weight:300;font-size:34px;letter-spacing:1px">Exklusive Objekte<br>auf Anfrage.</h2>
        </div>
        <a href="<?php echo esc_url(home_url('/objekte')); ?>" class="featured__view-all">Alle Objekte ansehen →</a>
      </div>
      <div class="featured__grid">
        <?php
        $featured = get_posts(['post_type' => 'objekt', 'numberposts' => 3, 'orderby' => 'date', 'order' => 'DESC']);
        foreach ($featured as $i => $post):
        ?>
          <div class="<?php echo $i === 0 ? 'featured__main' : 'prop-card-side'; ?>">
            <?php get_template_part('template-parts/property-card', null, ['post_id' => $post->ID]); ?>
          </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- PHILOSOPHY -->
    <section class="philosophy">
      <div class="philosophy__portrait-wrap">
        <div class="section-label section-label--light">Unsere Philosophie</div>
        <div class="philosophy__portrait">
          <?php
          $ludwig_img = get_template_directory_uri() . '/assets/images/ludwig_company.jpg';
          ?>
          <img src="<?php echo esc_url($ludwig_img); ?>" alt="Ludwig Zoller">
        </div>
        <div>
          <div class="philosophy__name">Ludwig Zoller</div>
          <div class="philosophy__role">CEO &amp; Co-Founder</div>
        </div>
      </div>
      <div>
        <div class="philosophy__body">Lafayette Real Estate ist eine Plattform für außergewöhnliche, exklusive Immobilien im privaten und gewerblichen Bereich. Lafayette steht ausschließlich einem exklusiven Mitgliederkreis für Kauf- und Verkaufsobjekte zur Verfügung.<br><br>Die Vermarktungsstrategie wird individuell auf Objekt-Charakteristika abgestimmt. Der Fokus liegt auf einer diskreten Ansprache ohne öffentliche Bekanntmachung — sogenannte Secret Sales.</div>
        <a href="<?php echo esc_url(home_url('/ueber-uns')); ?>" class="btn-ghost">Mehr über Lafayette</a>
      </div>
    </section>

    <!-- SERVICES -->
    <section class="services">
      <div class="section-label">Unsere Leistungen</div>
      <h2 style="font-family:var(--font-display);font-weight:300;font-size:34px;letter-spacing:1px">Was wir für Sie tun.</h2>
      <div class="services__grid">
        <?php
        $services = [
          ['01', 'Kauf &amp; Investition', 'Zugang zu exklusiven, nicht-öffentlichen Objekten. Wir identifizieren Immobilien, die Ihren Anforderungen entsprechen — diskret und zielgerichtet.'],
          ['02', 'Verkauf &amp; Vermarktung', 'Individuelle Vermarktungsstrategien abgestimmt auf Ihr Objekt. Direktansprache qualifizierter Interessenten aus unserem Netzwerk.'],
          ['03', 'Secret Sales', 'Kauf und Verkauf außerhalb des Marktes — ausschließlich für HNWIs, Family Offices, Fonds und CEOs im deutschsprachigen Raum.'],
        ];
        foreach ($services as [$num, $name, $desc]):
        ?>
        <div class="services__item">
          <div class="services__num"><?php echo $num; ?></div>
          <div class="services__name"><?php echo $name; ?></div>
          <div class="services__divider"></div>
          <div class="services__desc"><?php echo $desc; ?></div>
        </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- CONTACT CTA -->
    <section class="home-cta">
      <div>
        <div class="home-cta__label">Kontakt aufnehmen</div>
        <div class="home-cta__headline">Bereit für ein vertrauliches Gespräch?</div>
      </div>
      <div class="home-cta__btns">
        <a href="<?php echo esc_url(home_url('/kontakt')); ?>" class="btn-ghost">Anfrage senden</a>
        <a href="https://wa.me/4915140767073" class="btn-ghost" style="opacity:0.6" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </section>
  </main>

  <?php
  wp_enqueue_style('lafayette-home', get_template_directory_uri() . '/assets/css/pages/home.css', ['lafayette-style'], wp_get_theme()->get('Version'));
  get_footer();
  ?>
  ```

  > **WP Admin setup:** Go to Settings → Reading → set "Your homepage displays" to "A static page" → select the Homepage page.

- [ ] **Step 3: Copy `ludwig_company.jpg` into theme**

  ```bash
  cp assets/ludwig_company.jpg wp-content/themes/lafayette/assets/images/ludwig_company.jpg
  ```

- [ ] **Step 4: Visit the homepage in the browser and verify all 7 sections render correctly**

- [ ] **Step 5: Commit**

  ```bash
  git add front-page.php assets/css/pages/home.css
  git commit -m "feat: build homepage — hero, stats, featured properties, philosophy, services, CTA"
  ```

---

## Task 7: Objekte Page & Filter

**Files:**
- Create: `page-objekte.php`
- Create: `assets/css/pages/objekte.css`
- Create: `assets/js/filter.js`
- Create: `tests/js/filter.test.js`

- [ ] **Step 1: Write failing test for filter chips**

  Create `tests/js/filter.test.js`:
  ```js
  import { initFilter } from '../../assets/js/filter.js';

  describe('property filter chips', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="filter-chip active" data-filter="all">Alle</div>
        <div class="filter-chip" data-filter="residential">Residential</div>
        <div class="prop-card-wrap" data-categories="residential"></div>
        <div class="prop-card-wrap" data-categories="commercial"></div>
      `;
    });

    test('clicking a chip makes it active and deactivates others', () => {
      initFilter();
      document.querySelector('[data-filter="residential"]').click();
      expect(document.querySelector('[data-filter="residential"]').classList.contains('active')).toBe(true);
      expect(document.querySelector('[data-filter="all"]').classList.contains('active')).toBe(false);
    });

    test('"all" chip shows all cards', () => {
      initFilter();
      document.querySelector('[data-filter="residential"]').click();
      document.querySelector('[data-filter="all"]').click();
      const cards = document.querySelectorAll('.prop-card-wrap');
      cards.forEach(c => expect(c.style.display).not.toBe('none'));
    });

    test('category chip hides non-matching cards', () => {
      initFilter();
      document.querySelector('[data-filter="residential"]').click();
      const commercial = document.querySelector('[data-categories="commercial"]');
      expect(commercial.style.display).toBe('none');
    });
  });
  ```

- [ ] **Step 2: Run test — confirm it fails**

  ```bash
  npx jest tests/js/filter.test.js
  ```
  Expected: FAIL — `Cannot find module '../../assets/js/filter.js'`

- [ ] **Step 3: Create `assets/js/filter.js`**

  ```js
  export function initFilter() {
    const chips = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('.prop-card-wrap');
    if (!chips.length) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.dataset.filter;
        cards.forEach(card => {
          const cats = card.dataset.categories || '';
          card.style.display = (filter === 'all' || cats.includes(filter)) ? '' : 'none';
        });
      });
    });
  }

  if (typeof document !== 'undefined') initFilter();
  ```

- [ ] **Step 4: Run test — confirm it passes**

  ```bash
  npx jest tests/js/filter.test.js
  ```
  Expected: PASS (3 tests)

- [ ] **Step 5: Create `assets/css/pages/objekte.css`**

  ```css
  .filter-bar { background: white; padding: 18px var(--space-lg); display: flex; gap: 12px; align-items: center; border-bottom: 1px solid var(--color-border); flex-wrap: wrap; position: sticky; top: 68px; z-index: 10; }
  .filter-label { font-family: var(--font-body); font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-right: 6px; }
  .filter-chip { border: 1px solid #ddd; padding: 6px 14px; font-family: var(--font-body); font-size: 9px; letter-spacing: 1px; color: #555; cursor: pointer; transition: all var(--transition-base); }
  .filter-chip.active { background: var(--color-green); border-color: var(--color-green); color: white; }
  .obj-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: var(--space-xl) var(--space-lg); background: var(--color-cream); }
  ```

- [ ] **Step 6: Create `page-objekte.php`**

  ```php
  <?php get_header(); ?>

  <?php
  wp_enqueue_style('lafayette-objekte', get_template_directory_uri() . '/assets/css/pages/objekte.css', ['lafayette-style'], wp_get_theme()->get('Version'));
  wp_enqueue_script('lafayette-filter', get_template_directory_uri() . '/assets/js/filter.js', [], wp_get_theme()->get('Version'), true);
  ?>

  <?php get_template_part('template-parts/page-hero', null, [
    'breadcrumb' => 'Lafayette Real Estate → Objekte',
    'title'      => 'Unsere Referenzen.',
    'subtitle'   => 'Exklusive Objekte · Auf Anfrage',
  ]); ?>

  <div class="filter-bar">
    <span class="filter-label">Filtern:</span>
    <?php
    $chips = [
      'all'         => 'Alle',
      'residential' => 'Residential',
      'commercial'  => 'Commercial',
      'mixed-use'   => 'Mixed Use',
      'ausland'     => 'Ausland',
    ];
    foreach ($chips as $key => $label):
    ?>
      <div class="filter-chip <?php echo $key === 'all' ? 'active' : ''; ?>" data-filter="<?php echo esc_attr($key); ?>">
        <?php echo esc_html($label); ?>
      </div>
    <?php endforeach; ?>
  </div>

  <div class="obj-grid">
    <?php
    $objekte = get_posts(['post_type' => 'objekt', 'numberposts' => -1, 'orderby' => 'date', 'order' => 'DESC']);
    foreach ($objekte as $post):
      $terms = get_the_terms($post->ID, 'objekt-kategorie');
      $cat_slugs = $terms && !is_wp_error($terms) ? implode(' ', wp_list_pluck($terms, 'slug')) : '';
    ?>
      <div class="prop-card-wrap" data-categories="<?php echo esc_attr($cat_slugs); ?>">
        <?php get_template_part('template-parts/property-card', null, ['post_id' => $post->ID]); ?>
      </div>
    <?php endforeach; ?>
  </div>

  <?php get_footer(); ?>
  ```

  > **WP Admin:** Create a page titled "Objekte", set its slug to `objekte`. Under Page Attributes, set template to "page-objekte.php".

- [ ] **Step 7: Visit `/objekte` and test each filter chip**

- [ ] **Step 8: Commit**

  ```bash
  git add page-objekte.php assets/css/pages/objekte.css assets/js/filter.js tests/js/filter.test.js
  git commit -m "feat: add Objekte listing page with live category filter"
  ```

---

## Task 8: Objekt Detail Page

**Files:**
- Create: `single-objekt.php`
- Create: `assets/css/pages/objekt-detail.css`

- [ ] **Step 1: Create `assets/css/pages/objekt-detail.css`**

  ```css
  .detail-hero { height: 480px; position: relative; overflow: hidden; }
  .detail-hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .detail-hero__overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(8,35,18,0.85)); padding: 40px var(--space-lg) 36px; }
  .detail-badge { display: inline-block; background: rgba(13,61,34,0.9); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; font-family: var(--font-body); font-size: 8px; letter-spacing: 2.5px; color: white; text-transform: uppercase; margin-bottom: 14px; }
  .detail-title { font-family: var(--font-display); font-weight: 200; font-size: 44px; color: white; letter-spacing: 2px; line-height: 1.1; }
  .detail-sub { font-family: var(--font-body); font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; margin-top: 10px; }
  .detail-body { display: grid; grid-template-columns: 1fr 340px; background: var(--color-cream); }
  .detail-main { padding: var(--space-lg); border-right: 1px solid var(--color-border); }
  .detail-sidebar { padding: 40px 36px; background: white; }
  .detail-specs { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--color-border); margin-bottom: 40px; }
  .spec-item { padding: 18px 20px; border-right: 1px solid var(--color-border); text-align: center; }
  .spec-item:last-child { border-right: none; }
  .spec-val { font-family: var(--font-display); font-weight: 300; font-size: 24px; color: var(--color-charcoal); }
  .spec-key { font-family: var(--font-body); font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-top: 4px; }
  .detail-desc { font-family: var(--font-body); font-weight: 300; font-size: 14px; line-height: 1.9; color: #444; }
  .sidebar-contact { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
  .sidebar-avatar { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
  .sidebar-avatar img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .sidebar-name { font-family: var(--font-display); font-weight: 300; font-size: 17px; color: var(--color-charcoal); }
  .sidebar-role { font-family: var(--font-body); font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-top: 3px; }
  ```

- [ ] **Step 2: Create `single-objekt.php`**

  ```php
  <?php get_header(); ?>

  <?php
  wp_enqueue_style('lafayette-detail', get_template_directory_uri() . '/assets/css/pages/objekt-detail.css', ['lafayette-style'], wp_get_theme()->get('Version'));

  while (have_posts()): the_post();
    $location = get_field('objekt_location') ?: get_the_title();
    $type     = get_field('objekt_type') ?: '';
    $units    = get_field('objekt_units') ?: '—';
    $area     = get_field('objekt_area')  ?: '—';
    $terms    = get_the_terms(get_the_ID(), 'objekt-kategorie');
    $badge    = $terms && !is_wp_error($terms) ? esc_html($terms[0]->name) : '';
    $thumb    = get_the_post_thumbnail_url(get_the_ID(), 'full');
    $ludwig_img = get_template_directory_uri() . '/assets/images/ludwig_company.jpg';
  ?>

  <main>
    <div class="detail-hero">
      <?php if ($thumb): ?>
        <img src="<?php echo esc_url($thumb); ?>" alt="<?php echo esc_attr($location); ?>">
      <?php endif; ?>
      <div class="detail-hero__overlay">
        <?php if ($badge): ?>
          <div class="detail-badge"><?php echo $badge; ?></div>
        <?php endif; ?>
        <h1 class="detail-title"><?php echo esc_html($location); ?></h1>
        <div class="detail-sub"><?php echo esc_html($type); ?> · Auf Anfrage</div>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-main">
        <div class="detail-specs">
          <div class="spec-item"><div class="spec-val"><?php echo esc_html($units); ?></div><div class="spec-key">Einheiten</div></div>
          <div class="spec-item"><div class="spec-val"><?php echo esc_html($area); ?></div><div class="spec-key">Fläche</div></div>
          <div class="spec-item"><div class="spec-val">Auf Anfrage</div><div class="spec-key">Kaufpreis</div></div>
        </div>
        <div class="section-label" style="margin-bottom:14px">Objektbeschreibung</div>
        <div class="detail-desc"><?php the_content(); ?></div>
      </div>

      <div class="detail-sidebar">
        <div class="section-label" style="margin-bottom:20px">Anfrage stellen</div>
        <div class="sidebar-contact">
          <div class="sidebar-avatar">
            <img src="<?php echo esc_url($ludwig_img); ?>" alt="Ludwig Zoller">
          </div>
          <div>
            <div class="sidebar-name">Ludwig Zoller</div>
            <div class="sidebar-role">CEO &amp; Co-Founder</div>
          </div>
        </div>
        <?php get_template_part('template-parts/enquiry-form', null, ['object_title' => $location]); ?>
      </div>
    </div>
  </main>

  <?php endwhile; ?>
  <?php get_footer(); ?>
  ```

- [ ] **Step 3: Visit a property URL (e.g. `/objekte/muenchen-harlaching`) and verify layout**

- [ ] **Step 4: Commit**

  ```bash
  git add single-objekt.php assets/css/pages/objekt-detail.css
  git commit -m "feat: add property detail page with specs, description, and sidebar enquiry form"
  ```

---

## Task 9: Leistungen, Über Uns, Kontakt Pages

**Files:**
- Create: `page-leistungen.php`
- Create: `page-ueber-uns.php`
- Create: `page-kontakt.php`
- Create: `assets/css/pages/leistungen.css`
- Create: `assets/css/pages/ueber-uns.css`
- Create: `assets/css/pages/kontakt.css`

- [ ] **Step 1: Create `assets/css/pages/leistungen.css`**

  ```css
  .leist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--color-border); border: 1px solid var(--color-border); }
  .leist-item { background: var(--color-cream); padding: 52px 48px; transition: background var(--transition-base); }
  .leist-item:hover { background: white; }
  .leist-num { font-family: var(--font-display); font-weight: 200; font-size: 52px; color: rgba(13,61,34,.12); line-height: 1; margin-bottom: 20px; }
  .leist-name { font-family: var(--font-display); font-weight: 300; font-size: 26px; color: var(--color-charcoal); margin-bottom: 14px; }
  .leist-divider { width: 28px; height: 1px; background: var(--color-green); opacity: 0.3; margin-bottom: 18px; }
  .leist-desc { font-family: var(--font-body); font-weight: 300; font-size: 13px; color: var(--color-text-muted); line-height: 1.85; }
  .process-steps { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--color-border); background: white; margin-top: 52px; }
  .process-step { padding: 32px 28px; border-right: 1px solid var(--color-border); }
  .process-step:last-child { border-right: none; }
  .process-step__num { font-family: var(--font-display); font-weight: 200; font-size: 34px; color: rgba(13,61,34,.2); margin-bottom: 10px; }
  .process-step__name { font-family: var(--font-body); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--color-green); margin-bottom: 8px; }
  .process-step__desc { font-family: var(--font-body); font-weight: 300; font-size: 12px; color: var(--color-text-muted); line-height: 1.7; }
  ```

- [ ] **Step 2: Create `page-leistungen.php`**

  ```php
  <?php get_header(); ?>
  <?php wp_enqueue_style('lafayette-leistungen', get_template_directory_uri() . '/assets/css/pages/leistungen.css', ['lafayette-style'], wp_get_theme()->get('Version')); ?>

  <?php get_template_part('template-parts/page-hero', null, [
    'breadcrumb' => 'Lafayette Real Estate → Leistungen',
    'title'      => "Was wir für\nSie tun.",
    'subtitle'   => 'Kauf · Verkauf · Secret Sales',
  ]); ?>

  <main style="background:var(--color-cream);padding:var(--space-xl) var(--space-lg)">
    <div class="leist-grid">
      <?php
      $services = [
        ['01', 'Kauf &amp; Investition', 'Wir verschaffen Ihnen Zugang zu exklusiven, nicht-öffentlichen Immobilien. Basierend auf Ihren Anforderungen identifizieren wir gezielt Objekte aus unserem privaten Netzwerk — diskret, schnell und ohne öffentliche Ausschreibung.'],
        ['02', 'Verkauf &amp; Vermarktung', 'Ihre Immobilie verdient eine Vermarktung auf höchstem Niveau. Wir entwickeln eine individuelle Strategie, sprechen qualifizierte Interessenten direkt an und begleiten den gesamten Transaktionsprozess.'],
        ['03', 'Secret Sales', 'Kauf und Verkauf außerhalb des Marktes — ausschließlich für HNWIs, Family Offices, Fonds und CEOs im deutschsprachigen Raum. Keine öffentliche Bekanntmachung. Keine Kompromisse bei Diskretion.'],
        ['04', 'Beratung &amp; Netzwerk', 'Von der ersten Markteinschätzung bis zur notariellen Beurkundung stehen wir Ihnen als verlässlicher Partner zur Seite. Unser Netzwerk aus Rechtsanwälten, Notaren und Finanzierungspartnern ermöglicht ganzheitliche Begleitung.'],
      ];
      foreach ($services as [$num, $name, $desc]):
      ?>
      <div class="leist-item">
        <div class="leist-num"><?php echo $num; ?></div>
        <div class="leist-name"><?php echo $name; ?></div>
        <div class="leist-divider"></div>
        <div class="leist-desc"><?php echo $desc; ?></div>
      </div>
      <?php endforeach; ?>
    </div>

    <div class="process-steps">
      <?php
      $steps = [
        ['01', 'Erstkontakt',    'Vertrauliches Gespräch zur Klärung Ihrer Anforderungen und Ziele.'],
        ['02', 'Qualifizierung', 'Aufnahme in unser exklusives Netzwerk und Abstimmung der Suchkriterien.'],
        ['03', 'Matching',       'Gezielte Objektauswahl und diskrete Vorstellung passender Immobilien.'],
        ['04', 'Transaktion',    'Begleitung von Verhandlung, Due Diligence und Notartermin bis zum Abschluss.'],
      ];
      foreach ($steps as [$num, $name, $desc]):
      ?>
      <div class="process-step">
        <div class="process-step__num"><?php echo $num; ?></div>
        <div class="process-step__name"><?php echo $name; ?></div>
        <div class="process-step__desc"><?php echo $desc; ?></div>
      </div>
      <?php endforeach; ?>
    </div>
  </main>

  <?php get_footer(); ?>
  ```

- [ ] **Step 3: Create `assets/css/pages/ueber-uns.css`**

  ```css
  .about-intro { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; padding: var(--space-xl) var(--space-lg); background: var(--color-cream); }
  .about-img { position: relative; }
  .about-img img { width: 100%; height: 380px; object-fit: cover; object-position: top; display: block; }
  .about-img::after { content: ''; position: absolute; top: 20px; left: 20px; right: -20px; bottom: -20px; border: 1px solid rgba(13,61,34,.2); z-index: -1; }
  .about-title { font-family: var(--font-display); font-weight: 300; font-size: 36px; color: var(--color-charcoal); line-height: 1.2; letter-spacing: 1px; margin-bottom: 24px; }
  .about-body { font-family: var(--font-body); font-weight: 300; font-size: 14px; color: var(--color-text-muted); line-height: 1.9; margin-bottom: 14px; }
  .cred-list { display: flex; flex-direction: column; gap: 8px; margin-top: 28px; }
  .cred-item { display: flex; gap: 12px; align-items: flex-start; font-family: var(--font-body); font-size: 12px; color: var(--color-text-muted); font-weight: 300; }
  .cred-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--color-green); margin-top: 6px; flex-shrink: 0; }
  .network-strip { background: var(--color-green); padding: var(--space-xl) var(--space-lg); }
  .network-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid rgba(255,255,255,0.1); margin-top: 44px; }
  .network-item { padding: 32px 28px; border-right: 1px solid rgba(255,255,255,0.08); text-align: center; }
  .network-item:last-child { border-right: none; }
  .network-name { font-family: var(--font-display); font-weight: 300; font-size: 26px; color: rgba(255,255,255,.5); margin-bottom: 8px; }
  .network-label { font-family: var(--font-body); font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.3); }
  ```

- [ ] **Step 4: Create `page-ueber-uns.php`**

  ```php
  <?php get_header(); ?>
  <?php wp_enqueue_style('lafayette-ueber', get_template_directory_uri() . '/assets/css/pages/ueber-uns.css', ['lafayette-style'], wp_get_theme()->get('Version')); ?>

  <?php get_template_part('template-parts/page-hero', null, [
    'breadcrumb' => 'Lafayette Real Estate → Über uns',
    'title'      => "Diskret.\nExklusiv.\nVerlässlich.",
    'subtitle'   => 'Das Team hinter Lafayette',
  ]); ?>

  <main>
    <div class="about-intro">
      <div class="about-img">
        <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/ludwig_company.jpg'); ?>" alt="Ludwig Zoller">
      </div>
      <div>
        <div class="section-label">Ludwig Zoller</div>
        <div class="about-title">CEO &amp; Co-Founder<br>Lafayette Real Estate</div>
        <div class="about-body">Ludwig Zoller ist Gründer und Geschäftsführer von Lafayette Real Estate. Mit einem Master in Immobilienwirtschaft (M.Sc., Schwerpunkt Immobilienmanagement &amp; Investment) und langjähriger Erfahrung im Bereich exklusiver Immobilientransaktionen verfügt er über ein tiefes Verständnis für die Bedürfnisse anspruchsvoller Klienten.</div>
        <div class="about-body">Parallel zu Lafayette ist Ludwig Zoller als CEO von AEQUIFIN tätig, einem auf Litigation Finance spezialisierten Unternehmen in Grünwald bei München.</div>
        <div class="cred-list">
          <?php
          $creds = [
            'M.Sc. Immobilienwirtschaft — Schwerpunkt Immobilienmanagement & Investment',
            'B.Sc. Wirtschaftswissenschaften — Schwerpunkt Finance',
            'CEO AEQUIFIN — Litigation Finance, Grünwald',
            'Netzwerk: HNWIs, Family Offices, Fonds & CEOs (D-A-CH)',
          ];
          foreach ($creds as $c): ?>
          <div class="cred-item"><div class="cred-dot"></div><span><?php echo esc_html($c); ?></span></div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>

    <div class="network-strip">
      <div class="section-label section-label--light">Unser Netzwerk</div>
      <h2 style="font-family:var(--font-display);font-weight:200;font-size:34px;color:white">Wen wir erreichen.</h2>
      <div class="network-grid">
        <?php
        $net = [
          ['HNWIs', 'High Net Worth Individuals'],
          ['Family Offices', 'Vermögensverwaltung'],
          ['Fonds', 'Institutionelle Investoren'],
          ['CEOs', 'Führungskräfte D-A-CH'],
        ];
        foreach ($net as [$name, $label]): ?>
        <div class="network-item">
          <div class="network-name"><?php echo $name; ?></div>
          <div class="network-label"><?php echo $label; ?></div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </main>

  <?php get_footer(); ?>
  ```

- [ ] **Step 5: Create `assets/css/pages/kontakt.css`**

  ```css
  .kontakt-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 480px; }
  .kontakt-info { background: var(--color-green); padding: 60px var(--space-lg); display: flex; flex-direction: column; justify-content: space-between; }
  .kontakt-info__label { font-family: var(--font-body); font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 12px; }
  .kontakt-info__title { font-family: var(--font-display); font-weight: 200; font-size: 36px; color: white; line-height: 1.2; letter-spacing: 1px; margin-bottom: 40px; }
  .cd-type { font-family: var(--font-body); font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 4px; }
  .cd-val { font-family: var(--font-body); font-size: 13px; color: rgba(255,255,255,.7); font-weight: 300; }
  .contact-details { display: flex; flex-direction: column; gap: 18px; }
  .person-mini { display: flex; align-items: center; gap: 14px; margin-top: 36px; padding-top: 28px; border-top: 1px solid rgba(255,255,255,.08); }
  .person-mini__img { width: 52px; height: 52px; border-radius: 50%; overflow: hidden; }
  .person-mini__img img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
  .person-mini__name { font-family: var(--font-display); font-weight: 300; font-size: 17px; color: white; }
  .person-mini__role { font-family: var(--font-body); font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.35); margin-top: 3px; }
  .kontakt-form { background: var(--color-cream); padding: 60px var(--space-lg); }
  ```

- [ ] **Step 6: Create `page-kontakt.php`**

  ```php
  <?php get_header(); ?>
  <?php wp_enqueue_style('lafayette-kontakt', get_template_directory_uri() . '/assets/css/pages/kontakt.css', ['lafayette-style'], wp_get_theme()->get('Version')); ?>

  <?php get_template_part('template-parts/page-hero', null, [
    'breadcrumb' => 'Lafayette Real Estate → Kontakt',
    'title'      => 'Sprechen wir.',
    'subtitle'   => 'Vertraulich · Unverbindlich',
  ]); ?>

  <main>
    <div class="kontakt-grid">
      <div class="kontakt-info">
        <div>
          <div class="kontakt-info__label">Direktkontakt</div>
          <div class="kontakt-info__title">Wir freuen uns auf Ihre Nachricht.</div>
          <div class="contact-details">
            <div><div class="cd-type">Telefon</div><div class="cd-val">+49 151 40767073</div></div>
            <div><div class="cd-type">E-Mail</div><div class="cd-val">office@lafayette-real-estate.de</div></div>
            <div><div class="cd-type">Adresse</div><div class="cd-val">Margarethenstraße 8<br>82049 Pullach bei München</div></div>
          </div>
        </div>
        <div class="person-mini">
          <div class="person-mini__img">
            <img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/ludwig_company.jpg'); ?>" alt="Ludwig Zoller">
          </div>
          <div>
            <div class="person-mini__name">Ludwig Zoller</div>
            <div class="person-mini__role">CEO &amp; Co-Founder</div>
          </div>
        </div>
      </div>
      <div class="kontakt-form">
        <div class="section-label" style="margin-bottom:20px">Anfrage senden</div>
        <?php get_template_part('template-parts/enquiry-form'); ?>
      </div>
    </div>
  </main>

  <?php get_footer(); ?>
  ```

- [ ] **Step 7: Create WP pages for Leistungen, Über Uns, Kontakt in WP Admin, assign correct page templates**

- [ ] **Step 8: Commit**

  ```bash
  git add page-leistungen.php page-ueber-uns.php page-kontakt.php assets/css/pages/
  git commit -m "feat: add Leistungen, Über Uns, and Kontakt page templates"
  ```

---

## Task 10: Auth Page (Login / Register + Google OAuth)

**Files:**
- Create: `page-anmelden.php`
- Create: `assets/css/pages/auth.css`
- Create: `assets/js/auth.js`
- Create: `tests/js/auth.test.js`
- Create: `inc/auth.php`
- Create: `tests/php/test-auth.php`

**Prerequisites:** Install and activate **Ultimate Member** and **WP Google Login** plugins.

- [ ] **Step 1: Write failing JS test for tab switching**

  Create `tests/js/auth.test.js`:
  ```js
  import { initAuthTabs } from '../../assets/js/auth.js';

  describe('auth tab switching', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="auth-tab active" data-tab="login">Anmelden</div>
        <div class="auth-tab" data-tab="register">Registrieren</div>
        <form id="form-login"></form>
        <form id="form-register" class="hidden"></form>
      `;
    });

    test('clicking register tab hides login form', () => {
      initAuthTabs();
      document.querySelector('[data-tab="register"]').click();
      expect(document.getElementById('form-login').classList.contains('hidden')).toBe(true);
      expect(document.getElementById('form-register').classList.contains('hidden')).toBe(false);
    });

    test('clicking login tab hides register form', () => {
      initAuthTabs();
      document.querySelector('[data-tab="register"]').click();
      document.querySelector('[data-tab="login"]').click();
      expect(document.getElementById('form-login').classList.contains('hidden')).toBe(false);
      expect(document.getElementById('form-register').classList.contains('hidden')).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run test — confirm it fails**

  ```bash
  npx jest tests/js/auth.test.js
  ```
  Expected: FAIL

- [ ] **Step 3: Create `assets/js/auth.js`**

  ```js
  export function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        document.getElementById('form-login').classList.toggle('hidden', target !== 'login');
        document.getElementById('form-register').classList.toggle('hidden', target !== 'register');
      });
    });
  }

  if (typeof document !== 'undefined') initAuthTabs();
  ```

- [ ] **Step 4: Run test — confirm it passes**

  ```bash
  npx jest tests/js/auth.test.js
  ```
  Expected: PASS (2 tests)

- [ ] **Step 5: Write failing PHP test for manual approval hook**

  Create `tests/php/test-auth.php`:
  ```php
  <?php
  use PHPUnit\Framework\TestCase;

  class TestAuth extends TestCase {
    public function setUp(): void { WP_Mock::setUp(); }
    public function tearDown(): void { WP_Mock::tearDown(); }

    public function test_new_users_set_to_pending(): void {
      WP_Mock::expectActionAdded('user_register', 'lafayette_set_user_pending');
      require_once dirname(__DIR__, 2) . '/inc/auth.php';
      WP_Mock::assertActionsCalled();
      $this->assertTrue(true);
    }
  }
  ```

- [ ] **Step 6: Run PHP test — confirm it fails**

  ```bash
  ./vendor/bin/phpunit tests/php/test-auth.php
  ```
  Expected: FAIL

- [ ] **Step 7: Create `inc/auth.php`**

  ```php
  <?php
  /**
   * Set new registrations to "pending" status so the admin must approve them.
   * Compatible with Ultimate Member's pending approval workflow.
   */
  function lafayette_set_user_pending(int $user_id): void {
      update_user_meta($user_id, 'account_status', 'pending');
  }
  add_action('user_register', 'lafayette_set_user_pending');

  /**
   * Block login for pending users and show a German-language message.
   */
  function lafayette_block_pending_login(WP_User|WP_Error $user): WP_User|WP_Error {
      if (is_wp_error($user)) return $user;
      $status = get_user_meta($user->ID, 'account_status', true);
      if ($status === 'pending') {
          return new WP_Error(
              'pending_approval',
              __('Ihr Konto wird derzeit geprüft. Sie erhalten eine E-Mail, sobald Ihr Zugang freigeschaltet wurde.', 'lafayette')
          );
      }
      return $user;
  }
  add_filter('authenticate', 'lafayette_block_pending_login', 30);
  ```

- [ ] **Step 8: Run PHP test — confirm it passes**

  ```bash
  ./vendor/bin/phpunit tests/php/test-auth.php
  ```
  Expected: PASS

- [ ] **Step 9: Create `assets/css/pages/auth.css`**

  ```css
  .auth-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 68px); }
  .auth-left { position: relative; overflow: hidden; background: linear-gradient(160deg, rgba(8,35,18,0.88) 0%, rgba(8,35,18,0.4) 70%), url('') center/cover; display: flex; flex-direction: column; justify-content: flex-end; padding: 60px var(--space-lg); }
  .auth-left__eyebrow { font-family: var(--font-body); font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: 14px; }
  .auth-left__headline { font-family: var(--font-display); font-weight: 200; font-size: 44px; color: white; line-height: 1.1; letter-spacing: 2px; margin-bottom: 20px; }
  .auth-left__divider { width: 32px; height: 1px; background: rgba(255,255,255,.25); margin-bottom: 20px; }
  .auth-left__body { font-family: var(--font-body); font-weight: 300; font-size: 13px; color: rgba(255,255,255,.5); line-height: 1.85; max-width: 360px; }
  .auth-perks { margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }
  .auth-perk { display: flex; align-items: flex-start; gap: 12px; }
  .perk-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.3); margin-top: 5px; flex-shrink: 0; }
  .perk-text { font-family: var(--font-body); font-size: 12px; color: rgba(255,255,255,.5); font-weight: 300; }
  .auth-right { background: var(--color-cream); display: flex; flex-direction: column; justify-content: center; padding: 60px 64px; }
  .auth-tabs { display: flex; margin-bottom: 40px; border-bottom: 1px solid var(--color-border); }
  .auth-tab { padding: 12px 0; margin-right: 32px; font-family: var(--font-body); font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #aaa; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color var(--transition-base), border-color var(--transition-base); }
  .auth-tab.active { color: var(--color-green); border-bottom-color: var(--color-green); }
  .hidden { display: none !important; }
  .form-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .form-divider::before, .form-divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
  .form-divider span { font-family: var(--font-body); font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #bbb; }
  .btn-google { width: 100%; background: white; border: 1px solid var(--color-border); padding: 13px; font-family: var(--font-body); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .discretion-note { margin-top: 20px; padding: 14px 16px; background: rgba(13,61,34,.05); border-left: 2px solid rgba(13,61,34,.2); font-family: var(--font-body); font-size: 11px; color: #666; line-height: 1.65; }
  .form-forgot { font-family: var(--font-body); font-size: 9px; letter-spacing: 1px; color: var(--color-green); display: block; text-align: right; margin-top: 4px; }
  ```

- [ ] **Step 10: Create `page-anmelden.php`**

  ```php
  <?php
  get_header();
  wp_enqueue_style('lafayette-auth', get_template_directory_uri() . '/assets/css/pages/auth.css', ['lafayette-style'], wp_get_theme()->get('Version'));
  wp_enqueue_script('lafayette-auth', get_template_directory_uri() . '/assets/js/auth.js', [], wp_get_theme()->get('Version'), true);

  // Get a hero image from the first objekt
  $first = get_posts(['post_type' => 'objekt', 'numberposts' => 1]);
  $hero_img = $first ? get_the_post_thumbnail_url($first[0]->ID, 'full') : '';
  ?>

  <main>
    <div class="auth-layout">
      <div class="auth-left" style="background-image: linear-gradient(160deg, rgba(8,35,18,0.88) 0%, rgba(8,35,18,0.4) 70%), url('<?php echo esc_url($hero_img); ?>');">
        <div class="auth-left__eyebrow">Mitgliederbereich</div>
        <div class="auth-left__headline">Exklusiver<br>Zugang.</div>
        <div class="auth-left__divider"></div>
        <div class="auth-left__body">Als Mitglied des Lafayette-Netzwerks erhalten Sie Zugang zu nicht-öffentlichen Objekten, diskreten Angeboten und direktem Kontakt zu unserem Team.</div>
        <div class="auth-perks">
          <?php
          $perks = [
            'Zugang zu exklusiven Off-Market-Objekten',
            'Direkte Kommunikation mit Ludwig Zoller',
            'Frühzeitige Benachrichtigung bei neuen Referenzen',
            'Vollständig vertraulich — keine öffentliche Sichtbarkeit',
          ];
          foreach ($perks as $perk): ?>
          <div class="auth-perk"><div class="perk-dot"></div><div class="perk-text"><?php echo esc_html($perk); ?></div></div>
          <?php endforeach; ?>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-tabs">
          <div class="auth-tab active" data-tab="login">Anmelden</div>
          <div class="auth-tab" data-tab="register">Registrieren</div>
        </div>

        <!-- LOGIN -->
        <form id="form-login" method="post" action="<?php echo esc_url(wp_login_url(home_url('/'))); ?>">
          <?php wp_nonce_field('lafayette_login'); ?>
          <div class="form-group">
            <label class="form-label" for="user_login">E-Mail-Adresse</label>
            <input class="form-input" type="email" name="log" id="user_login" placeholder="ihre@email.de" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="user_pass">Passwort</label>
            <input class="form-input" type="password" name="pwd" id="user_pass" placeholder="••••••••" required>
            <a href="<?php echo esc_url(wp_lostpassword_url()); ?>" class="form-forgot">Passwort vergessen?</a>
          </div>
          <input type="hidden" name="redirect_to" value="<?php echo esc_url(home_url('/')); ?>">
          <button type="submit" class="btn-solid">Anmelden</button>

          <div class="form-divider"><span>oder</span></div>
          <?php if (function_exists('wpgl_login_button')): ?>
            <?php wpgl_login_button(); ?>
          <?php else: ?>
            <button type="button" class="btn-google" disabled>
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Mit Google anmelden
            </button>
          <?php endif; ?>

          <div class="discretion-note">Ihr Konto ist vollständig vertraulich. Ihre Daten werden nicht veröffentlicht.</div>
        </form>

        <!-- REGISTER -->
        <form id="form-register" class="hidden" method="post" action="<?php echo esc_url(home_url('/anmelden')); ?>">
          <?php wp_nonce_field('lafayette_register'); ?>
          <div class="form-group-row">
            <div>
              <label class="form-label" for="first_name">Vorname</label>
              <input class="form-input" type="text" name="first_name" id="first_name" placeholder="Max" required>
            </div>
            <div>
              <label class="form-label" for="last_name">Nachname</label>
              <input class="form-input" type="text" name="last_name" id="last_name" placeholder="Mustermann" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="user_email">E-Mail-Adresse</label>
            <input class="form-input" type="email" name="user_email" id="user_email" placeholder="ihre@email.de" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="user_password">Passwort</label>
            <input class="form-input" type="password" name="user_password" id="user_password" placeholder="Mindestens 8 Zeichen" minlength="8" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="interest">Ich bin interessiert als</label>
            <select class="form-select" name="interest" id="interest">
              <option value="">Bitte wählen…</option>
              <option value="buyer">Käufer</option>
              <option value="seller">Verkäufer</option>
              <option value="investor">Investor / Family Office</option>
              <option value="fund">Fonds / institutioneller Investor</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>
          <button type="submit" class="btn-solid">Konto erstellen</button>
          <div class="discretion-note">Ihre Registrierung wird manuell durch unser Team geprüft. Nach Freischaltung erhalten Sie Zugang zu exklusiven Inhalten.</div>
        </form>
      </div>
    </div>
  </main>

  <?php get_footer(); ?>
  ```

  > **WP Google Login setup:** Install WP Google Login → go to Settings → Google Login → add your Google OAuth Client ID and Secret (create at console.cloud.google.com, add `http://lafayette-dev.local/wp-login.php` as authorised redirect URI).

- [ ] **Step 11: Commit**

  ```bash
  git add page-anmelden.php assets/css/pages/auth.css assets/js/auth.js inc/auth.php tests/
  git commit -m "feat: add login/register page with Google OAuth and manual approval"
  ```

---

## Task 11: 404 Page & GDPR Legal Pages

**Files:**
- Create: `404.php`

- [ ] **Step 1: Create `404.php`**

  ```php
  <?php get_header(); ?>
  <main style="background:var(--color-green);min-height:80vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:var(--space-xl)">
    <div style="font-family:var(--font-display);font-weight:200;font-size:120px;color:rgba(255,255,255,0.1);line-height:1">404</div>
    <h1 style="font-family:var(--font-display);font-weight:200;font-size:42px;color:white;letter-spacing:2px;margin-top:-20px">Seite nicht gefunden.</h1>
    <p style="font-family:var(--font-body);font-size:13px;color:rgba(255,255,255,0.45);margin:16px 0 32px;letter-spacing:1px">Die angeforderte Seite existiert nicht.</p>
    <a href="<?php echo esc_url(home_url('/')); ?>" class="btn-ghost">Zurück zur Startseite</a>
  </main>
  <?php get_footer(); ?>
  ```

- [ ] **Step 2: Create Impressum and Datenschutz pages in WP Admin**

  Go to Pages → Add New. Create two pages:
  - **Impressum** (slug: `impressum`) — paste legal Impressum text provided by client
  - **Datenschutzerklärung** (slug: `datenschutz`) — paste GDPR privacy policy text provided by client

  > Client must supply both texts. German law (TMG §5, DSGVO) requires these to be present before launch.

- [ ] **Step 3: Install a GDPR cookie consent plugin**

  Install **Complianz – GDPR/CCPA Cookie Consent** (free). Run the setup wizard. Set language to German, region to EU/DSGVO.

- [ ] **Step 4: Commit**

  ```bash
  git add 404.php
  git commit -m "feat: add 404 page; Impressum and Datenschutz pages added in WP Admin"
  ```

---

## Task 12: Final QA & Launch Checklist

- [ ] **All pages load without PHP warnings** — check `WP_DEBUG` output
- [ ] **All 6 property cards appear on `/objekte` with correct photos and categories**
- [ ] **Filter chips correctly show/hide cards**
- [ ] **Property detail pages render with specs and sidebar form**
- [ ] **Navbar turns dark green on scroll on all pages**
- [ ] **Ludwig portrait loads on homepage philosophy strip, Über Uns, Kontakt, and auth page**
- [ ] **Contact Form 7 enquiry form sends email to `office@lafayette-real-estate.de`**
- [ ] **Login redirects to homepage on success**
- [ ] **Registration sets `account_status` to `pending` — user cannot log in until admin approves**
- [ ] **Google OAuth button visible and functional on login tab**
- [ ] **Auth tab switch (Anmelden ↔ Registrieren) works without page reload**
- [ ] **Impressum and Datenschutz links visible in footer**
- [ ] **GDPR cookie banner appears on first visit**
- [ ] **All Jest tests pass:** `npx jest`
- [ ] **All PHPUnit tests pass:** `./vendor/bin/phpunit tests/php/`

- [ ] **Final commit**

  ```bash
  git add -A
  git commit -m "feat: Lafayette Real Estate WordPress theme — complete v1.0"
  ```
