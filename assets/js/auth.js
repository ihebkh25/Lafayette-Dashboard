(function () {
  'use strict';

  var DEMO_ACCOUNTS = [
    { email: 'kaeufer@demo.de',    password: 'demo1234', role: 'kaeufer',    name: 'Max Mustermann' },
    { email: 'verkaeufer@demo.de', password: 'demo1234', role: 'verkaeufer', name: 'Anna Müller' }
  ];

  var SESSION_KEY = 'lre_session';

  var pathPrefix = (/[/\\]objekte[/\\]/i.test(window.location.href)) ? '../' : '';

  var DASHBOARD_URLS = {
    kaeufer:    pathPrefix + 'dashboard-kaeufer.html',
    verkaeufer: pathPrefix + 'dashboard-verkaeufer.html'
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
    window.location.href = pathPrefix + 'index.html';
  }

  function requireAuth(returnUrl) {
    if (!isLoggedIn()) {
      var qs = returnUrl ? '?redirect=' + encodeURIComponent(returnUrl) : '';
      window.location.href = pathPrefix + 'anmelden.html' + qs;
    }
  }

  function formatDisplayName(fullName) {
    if (!fullName || !fullName.trim()) return '';
    var parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return parts[0] + ' ' + parts[parts.length - 1][0] + '.';
  }

  function initNav() {
    var session = getSession();
    if (!session) return;

    var ctaLink = document.querySelector('a.nav-links__cta');
    if (!ctaLink) return;

    var dashboardUrl = DASHBOARD_URLS[session.role] || 'index.html';
    var displayName = formatDisplayName(session.name);

    var menu = document.createElement('div');
    menu.className = 'nav-user-menu';
    menu.id = 'nav-user-menu';

    var btn = document.createElement('button');
    btn.className = 'nav-user-btn';
    btn.setAttribute('aria-haspopup', 'menu');
    btn.setAttribute('aria-expanded', 'false');

    var nameSpan = document.createElement('span');
    nameSpan.className = 'nav-user-name';
    nameSpan.textContent = displayName;

    var chevron = document.createElement('span');
    chevron.className = 'nav-user-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '▾';

    btn.appendChild(nameSpan);
    btn.appendChild(chevron);

    var dropdown = document.createElement('div');
    dropdown.className = 'nav-user-dropdown';
    dropdown.setAttribute('role', 'menu');

    var dashLink = document.createElement('a');
    dashLink.href = dashboardUrl;
    dashLink.className = 'nav-user-dropdown__item';
    dashLink.setAttribute('role', 'menuitem');
    dashLink.textContent = 'Dashboard';

    var logoutBtn = document.createElement('button');
    logoutBtn.className = 'nav-user-dropdown__item nav-logout-btn';
    logoutBtn.setAttribute('role', 'menuitem');
    logoutBtn.textContent = 'Abmelden';

    dropdown.appendChild(dashLink);
    dropdown.appendChild(logoutBtn);
    menu.appendChild(btn);
    menu.appendChild(dropdown);

    ctaLink.replaceWith(menu);

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
          var submitBtn = loginForm.querySelector('.form-submit');
          if (submitBtn) submitBtn.insertAdjacentElement('afterend', err);
          return;
        }

        var params   = new URLSearchParams(window.location.search);
        var raw      = params.get('redirect');
        var firstSeg = raw ? raw.split('/')[0] : '';
        var safePath = (raw && firstSeg.indexOf(':') === -1 && firstSeg.indexOf('#') === -1) ? raw : null;
        window.location.href = safePath || DASHBOARD_URLS[result.user.role];
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
          '<p class="register-demo-notice__body">Ihre Registrierung wird von unserem Team geprüft. Sie erhalten eine Benachrichtigung per E-Mail, sobald Ihr Zugang freigeschaltet ist.</p>';
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
