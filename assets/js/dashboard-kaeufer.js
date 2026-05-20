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
                '<div class="dash-inquiry-meta">' + date + ' · "' + preview + '"</div>' +
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
