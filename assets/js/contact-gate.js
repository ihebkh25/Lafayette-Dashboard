(function () {
  'use strict';

  var CONTACTS_KEY = 'lre_contacts';

  function getPathPrefix() {
    return (/[/\\]objekte[/\\]/i.test(window.location.href)) ? '../' : '';
  }

  /* ---- CTA gating ---- */
  function initGate() {
    var gates = document.querySelectorAll('[data-gate="contact"]');
    if (!gates.length) return;

    gates.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();

        if (!window.LafayetteAuth || !window.LafayetteAuth.isLoggedIn()) {
          window.LafayetteAuth.requireAuth(window.location.href);
          return;
        }

        // data-gate-follow: logged-in users follow the element's own href (e.g. WhatsApp)
        if (el.dataset.gateFollow === 'true') {
          window.open(el.href, '_blank', 'noopener,noreferrer');
          return;
        }

        var property = el.dataset.property || '';
        var prefix   = getPathPrefix();
        var dest     = prefix + 'kontakt.html';
        if (property) dest += '?property=' + encodeURIComponent(property);
        window.location.href = dest;
      });
    });
  }

  /* ---- Kontakt page ---- */
  function initKontakt() {
    var formWrap = document.getElementById('k-form-wrap');
    if (!formWrap) return;

    /* Logged out: replace form with login prompt */
    if (!window.LafayetteAuth || !window.LafayetteAuth.isLoggedIn()) {
      formWrap.innerHTML =
        '<div class="k-login-prompt">' +
          '<div class="k-login-prompt__title">Bitte melden Sie sich an.</div>' +
          '<p class="k-login-prompt__body">Als Mitglied des Lafayette-Netzwerks können Sie direkt und diskret Anfragen stellen.</p>' +
          '<a href="anmelden.html?redirect=kontakt.html" class="k-login-prompt__btn">Anmelden / Registrieren</a>' +
        '</div>';
      return;
    }

    /* Logged in: pre-fill name + email */
    var session  = window.LafayetteAuth.getSession();
    var parts    = session.name.trim().split(' ');
    var vorname  = parts[0] || '';
    var nachname = parts.slice(1).join(' ') || '';

    function prefill(id, value) {
      var el = document.getElementById(id);
      if (!el) return;
      el.value = value;
      el.setAttribute('readonly', '');
      el.classList.add('form-input--prefilled');
    }
    prefill('k-vorname',  vorname);
    prefill('k-nachname', nachname);
    prefill('k-email',    session.email);

    /* Pre-select property dropdown from ?property= URL param */
    var params   = new URLSearchParams(window.location.search);
    var property = params.get('property') || '';
    var sel      = document.getElementById('k-property');
    if (sel && property) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === property) {
          sel.selectedIndex = i;
          break;
        }
      }
    }

    /* Submit: save to localStorage, show success */
    var form = document.getElementById('k-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nachrEl  = document.getElementById('k-nachricht');
      var record   = {
        date:     new Date().toISOString(),
        name:     session.name || '',
        property: sel ? sel.value : '',
        message:  nachrEl ? nachrEl.value : '',
        role:     session.role
      };
      var contacts = [];
      try { contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; } catch (_) {}
      contacts.unshift(record);
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));

      formWrap.innerHTML =
        '<div class="k-success">' +
          '<div class="k-success__title">Anfrage gesendet.</div>' +
          '<p class="k-success__body">Wir melden uns in Kürze bei Ihnen. Ihre Anfrage wurde in Ihrem Dashboard gespeichert.</p>' +
          '<a href="index.html" class="k-success__link">Zur Startseite</a>' +
        '</div>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initGate();
    initKontakt();
  });

})();
