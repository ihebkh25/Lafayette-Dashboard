# Auth Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a localStorage-based mock auth system with two hardcoded demo accounts, a nav user-menu for logged-in users, and an updated auth page (simplified role dropdown + login/register form wiring).

**Architecture:** A single `auth.js` IIFE exposes `window.LafayetteAuth` and auto-runs `initNav()` + `initAuthForms()` on DOMContentLoaded. Every page already includes this script, so only `anmelden.html` needs HTML changes. Session is stored as JSON in `localStorage['lre_session']`.

**Tech Stack:** Vanilla JS (ES5-compatible IIFE for broad compat), CSS custom properties, localStorage API

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `assets/js/auth.js` | Full rewrite | Session module + nav injection + auth form handling |
| `assets/css/components/navbar.css` | Append | User menu + dropdown styles |
| `assets/css/pages/auth.css` | Append | Form error, demo strip, register notice styles |
| `anmelden.html` | Modify | Simplify role dropdown, add demo strip HTML |

---

## Task 1: Auth core module

**Files:**
- Rewrite: `assets/js/auth.js`

- [ ] **Step 1: Replace entire contents of `assets/js/auth.js`**

```js
(function () {
  'use strict';

  var DEMO_ACCOUNTS = [
    { email: 'kaeufer@demo.de',    password: 'demo1234', role: 'kaeufer',    name: 'Max Mustermann' },
    { email: 'verkaeufer@demo.de', password: 'demo1234', role: 'verkaeufer', name: 'Anna Müller' }
  ];

  var SESSION_KEY = 'lre_session';

  var DASHBOARD_URLS = {
    kaeufer:    'dashboard-kaeufer.html',
    verkaeufer: 'dashboard-verkaeufer.html'
  };

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch (_) {
      return null;
    }
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  function login(email, password) {
    var account = null;
    for (var i = 0; i < DEMO_ACCOUNTS.length; i++) {
      if (DEMO_ACCOUNTS[i].email === email.trim().toLowerCase() &&
          DEMO_ACCOUNTS[i].password === password) {
        account = DEMO_ACCOUNTS[i];
        break;
      }
    }
    if (!account) return { ok: false, error: 'E-Mail oder Passwort ungültig.' };
    var user = { email: account.email, role: account.role, name: account.name };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { ok: true, user: user };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }

  function requireAuth(returnUrl) {
    if (!isLoggedIn()) {
      window.location.href = 'anmelden.html?redirect=' + encodeURIComponent(returnUrl);
    }
  }

  function formatDisplayName(fullName) {
    var parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return parts[0] + ' ' + parts[parts.length - 1][0] + '.';
  }

  function initNav() {
    var session = getSession();
    if (!session) return;

    var ctaLink = document.querySelector('a.nav-links__cta[href="anmelden.html"]');
    if (!ctaLink) return;

    var dashboardUrl = DASHBOARD_URLS[session.role] || 'index.html';
    var displayName = formatDisplayName(session.name);

    var menu = document.createElement('div');
    menu.className = 'nav-user-menu';
    menu.id = 'nav-user-menu';
    menu.innerHTML =
      '<button class="nav-user-btn" aria-haspopup="true" aria-expanded="false">' +
        '<span class="nav-user-name">' + displayName + '</span>' +
        '<span class="nav-user-chevron" aria-hidden="true">▾</span>' +
      '</button>' +
      '<div class="nav-user-dropdown" role="menu">' +
        '<a href="' + dashboardUrl + '" class="nav-user-dropdown__item" role="menuitem">Dashboard</a>' +
        '<button class="nav-user-dropdown__item nav-logout-btn" role="menuitem">Abmelden</button>' +
      '</div>';

    ctaLink.replaceWith(menu);

    var btn = menu.querySelector('.nav-user-btn');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelector('.nav-logout-btn').addEventListener('click', logout);

    document.addEventListener('click', function () {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function initAuthForms() {
    var loginForm    = document.getElementById('form-login');
    var registerForm = document.getElementById('form-register');
    if (!loginForm && !registerForm) return;

    // Already logged in → go to dashboard
    var session = getSession();
    if (session) {
      window.location.href = DASHBOARD_URLS[session.role] || 'index.html';
      return;
    }

    // Tab switching
    var tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var target = tab.dataset.tab;
        if (loginForm)    loginForm.classList.toggle('hidden',    target !== 'login');
        if (registerForm) registerForm.classList.toggle('hidden', target !== 'register');
      });
    });

    // Login submit
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var existing = loginForm.querySelector('.form-error');
        if (existing) existing.remove();

        var email    = loginForm.querySelector('#login-email').value;
        var password = loginForm.querySelector('#login-password').value;
        var result   = login(email, password);

        if (!result.ok) {
          var err = document.createElement('p');
          err.className = 'form-error';
          err.textContent = result.error;
          loginForm.querySelector('.form-submit').insertAdjacentElement('afterend', err);
          return;
        }

        var params   = new URLSearchParams(window.location.search);
        var redirect = params.get('redirect');
        window.location.href = redirect
          ? decodeURIComponent(redirect)
          : DASHBOARD_URLS[result.user.role];
      });
    }

    // Register submit
    if (registerForm) {
      registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        registerForm.classList.add('hidden');

        var notice = document.createElement('div');
        notice.className = 'register-demo-notice';
        notice.innerHTML =
          '<p class="register-demo-notice__title">Anfrage übermittelt.</p>' +
          '<p class="register-demo-notice__body">Für den Demo-Zugang verwenden Sie bitte:<br>' +
          '<strong>kaeufer@demo.de</strong> oder <strong>verkaeufer@demo.de</strong><br>' +
          'Passwort: <strong>demo1234</strong></p>';
        registerForm.parentNode.insertBefore(notice, registerForm.nextSibling);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initAuthForms();
  });

  window.LafayetteAuth = {
    login:       login,
    logout:      logout,
    getSession:  getSession,
    isLoggedIn:  isLoggedIn,
    requireAuth: requireAuth
  };

})();
```

- [ ] **Step 2: Verify API is exposed**

Open browser DevTools console on any page of the site. Type:
```js
localStorage.setItem('lre_session', JSON.stringify({email:'kaeufer@demo.de',role:'kaeufer',name:'Max Mustermann'}));
location.reload();
```
Expected: the "Anmelden" nav button is replaced by "Max M. ▾" (the user menu). The dropdown won't style yet — that's Task 2.

Then clean up:
```js
localStorage.removeItem('lre_session');
location.reload();
```
Expected: "Anmelden" returns.

- [ ] **Step 3: Commit**

```bash
git add assets/js/auth.js
git commit -m "feat: implement LafayetteAuth mock session module with nav injection"
```

---

## Task 2: Navbar user menu CSS

**Files:**
- Modify: `assets/css/components/navbar.css` (append to end)

- [ ] **Step 1: Append user menu styles to `assets/css/components/navbar.css`**

```css
/* ============ USER MENU (logged-in state) ============ */
.nav-user-menu {
  position: relative;
  margin-left: 8px;
}

.nav-user-btn {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 9px 16px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: border-color var(--transition-base), background var(--transition-base);
  white-space: nowrap;
}
.nav-user-btn:hover {
  border-color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.07);
}

.nav-user-chevron {
  font-size: 7px;
  opacity: 0.55;
  transition: transform var(--transition-base);
  display: inline-block;
}
.nav-user-menu.open .nav-user-chevron { transform: rotate(180deg); }

.nav-user-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  z-index: 200;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.nav-user-menu.open .nav-user-dropdown { display: block; }

.nav-user-dropdown__item {
  display: block;
  width: 100%;
  padding: 13px 18px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-charcoal);
  text-decoration: none;
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
  transition: background var(--transition-base);
}
.nav-user-dropdown__item:last-child { border-bottom: none; }
.nav-user-dropdown__item:hover { background: var(--color-cream); }
.nav-logout-btn { color: var(--color-text-muted); }
```

- [ ] **Step 2: Verify user menu appearance**

In DevTools console on any page (e.g. `index.html`):
```js
localStorage.setItem('lre_session', JSON.stringify({email:'kaeufer@demo.de',role:'kaeufer',name:'Max Mustermann'}));
location.reload();
```
Expected:
- Nav shows "MAX M. ▾" button with the same border style as the old "Anmelden" button
- Clicking the button opens a dropdown with "Dashboard" and "Abmelden" items
- Clicking outside the dropdown closes it
- Chevron rotates when open

Clean up after verification:
```js
localStorage.removeItem('lre_session'); location.reload();
```

- [ ] **Step 3: Commit**

```bash
git add assets/css/components/navbar.css
git commit -m "feat: add nav user menu dropdown styles for logged-in state"
```

---

## Task 3: Auth page — CSS additions

**Files:**
- Modify: `assets/css/pages/auth.css` (append to end)

- [ ] **Step 1: Append auth state styles to `assets/css/pages/auth.css`**

```css
/* ============ LOGIN ERROR ============ */
.form-error {
  font-family: var(--font-body);
  font-size: 11px;
  color: #c0392b;
  margin-top: 10px;
  padding: 10px 14px;
  background: rgba(192, 57, 43, 0.06);
  border-left: 2px solid rgba(192, 57, 43, 0.4);
}

/* ============ DEMO CREDENTIALS STRIP ============ */
.auth-demo-strip {
  margin-top: 24px;
  padding: 12px 16px;
  background: rgba(13, 61, 34, 0.04);
  border: 1px dashed rgba(13, 61, 34, 0.2);
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--color-text-muted);
  line-height: 1.75;
  text-align: center;
}
.auth-demo-strip strong {
  color: var(--color-green);
  font-weight: 500;
}

/* ============ REGISTER DEMO NOTICE ============ */
.register-demo-notice {
  padding: 32px 0;
}
.register-demo-notice__title {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 24px;
  color: var(--color-charcoal);
  letter-spacing: 1px;
  margin-bottom: 20px;
}
.register-demo-notice__body {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.9;
}
.register-demo-notice__body strong {
  color: var(--color-green);
  font-weight: 500;
}
```

- [ ] **Step 2: Commit**

```bash
git add assets/css/pages/auth.css
git commit -m "feat: add form error, demo strip, and register notice styles"
```

---

## Task 4: Auth page — HTML changes

**Files:**
- Modify: `anmelden.html`

- [ ] **Step 1: Simplify the role dropdown**

In `anmelden.html`, find the `<select>` with `id="reg-interesse"` (currently has 5 options). Replace its contents with exactly 2 options:

```html
        <div class="form-group">
          <label class="form-label" for="reg-interesse">Ich bin interessiert als</label>
          <select class="form-select" id="reg-interesse" name="interesse" required>
            <option value="" disabled selected>Bitte wählen…</option>
            <option value="kaeufer">Käufer</option>
            <option value="verkaeufer">Verkäufer</option>
          </select>
        </div>
```

- [ ] **Step 2: Add demo credentials strip**

In `anmelden.html`, find the closing `</div>` of `auth-right` (it comes right before `</div><!-- closes auth-layout -->`). Insert the demo strip just before that closing tag:

```html
      <!-- DEMO STRIP -->
      <div class="auth-demo-strip">
        Demo: <strong>kaeufer@demo.de</strong> oder <strong>verkaeufer@demo.de</strong> — Passwort: <strong>demo1234</strong>
      </div>

    </div><!-- closes auth-right -->
```

- [ ] **Step 3: Verify the full auth flow in browser**

Open `anmelden.html` directly.

**Test A — Demo strip visible:**
The demo credentials strip is visible below the login form tabs. It shows both email addresses and the password.

**Test B — Wrong credentials:**
Enter `wrong@email.de` / `wrongpass` → click Anmelden.
Expected: red error message "E-Mail oder Passwort ungültig." appears below the button. No page reload.

**Test C — Correct login (Käufer):**
Enter `kaeufer@demo.de` / `demo1234` → click Anmelden.
Expected: page redirects to `dashboard-kaeufer.html` (404 is fine — page doesn't exist yet).
After redirect attempt, check localStorage in DevTools: `JSON.parse(localStorage.getItem('lre_session'))` should return `{email: "kaeufer@demo.de", role: "kaeufer", name: "Max Mustermann"}`.

**Test D — Already logged in redirect:**
With the session still in localStorage, navigate to `anmelden.html`.
Expected: immediately redirected away to `dashboard-kaeufer.html`.

**Test E — Logout:**
From any page, open DevTools console and type `LafayetteAuth.logout()`.
Expected: session cleared, redirected to `index.html`, nav shows "Anmelden" again.

**Test F — Register form:**
Click "Registrieren" tab. Fill in the form. Submit.
Expected: form hides, "Anfrage übermittelt." notice appears with demo credentials.

**Test G — Redirect param:**
Navigate to `anmelden.html?redirect=objekte.html`.
Log in with `kaeufer@demo.de` / `demo1234`.
Expected: redirected to `objekte.html` (not the dashboard).

- [ ] **Step 4: Commit**

```bash
git add anmelden.html
git commit -m "feat: simplify registration roles to 2, add demo credentials strip"
```

---

## Self-review notes

- `window.LafayetteAuth` is set before `DOMContentLoaded` fires on sub-projects B–D that call `requireAuth` — safe because the IIFE runs synchronously, only the DOM init is deferred.
- `ctaLink.replaceWith(menu)` works in all modern browsers. IE11 not supported (acceptable for demo).
- `URLSearchParams` is used for redirect parsing — supported in all modern browsers.
- The tab switching logic from the old `auth.js` IIFE is replicated inside `initAuthForms()` — the old IIFE is gone, nothing is double-registered.
- `dashboard-kaeufer.html` and `dashboard-verkaeufer.html` don't exist yet — redirects to those pages will 404 until Sub-projects C and D are implemented. That is expected.
