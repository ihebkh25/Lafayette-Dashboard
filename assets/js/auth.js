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
