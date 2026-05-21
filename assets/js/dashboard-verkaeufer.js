(function () {
  'use strict';

  var CONTACTS_KEY = 'lre_contacts';

  var PROPERTIES = [
    {
      name:    'Prestige Villa München-Harlaching',
      type:    'Residential',
      detail:  '480m² · 6 Einheiten',
      status:  'Aktiv',
      modifier: 'aktiv',
      days:    12
    },
    {
      name:    'Mehrfamilienhaus Oberhaching',
      type:    'Residential',
      detail:  '8 Einheiten',
      status:  'In Verhandlung',
      modifier: 'verhandlung',
      days:    28
    },
    {
      name:    'Residential Mallorca',
      type:    'Ausland',
      detail:  '320m² · Villa',
      status:  'Abgeschlossen',
      modifier: 'abgeschlossen',
      days:    45
    }
  ];

  var activeFilter = null;

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('de-DE', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (_) { return iso; }
  }

  function truncate(str, max) {
    if (!str || !str.trim()) return 'Kein Nachrichtentext';
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  function renderCards(contacts) {
    var grid = document.getElementById('dash-prop-grid');
    if (!grid) return;

    var html = '';
    PROPERTIES.forEach(function (prop) {
      var count = contacts.filter(function (r) {
        return r.property === prop.name;
      }).length;

      html +=
        '<div class="dash-prop-card" data-prop-name="' + prop.name + '">' +
          '<div class="dash-prop-top">' +
            '<div class="dash-prop-type">' + prop.type + '</div>' +
            '<span class="dash-prop-status dash-prop-status--' + prop.modifier + '">' + prop.status + '</span>' +
          '</div>' +
          '<div class="dash-prop-name">' + prop.name + '</div>' +
          '<div class="dash-prop-detail">' + prop.detail + '</div>' +
          '<div class="dash-prop-footer">' +
            '<div class="dash-prop-stat">' +
              '<div class="dash-prop-stat-num">' + count + '</div>' +
              '<div class="dash-prop-stat-lbl">Anfragen</div>' +
            '</div>' +
            '<div class="dash-prop-stat">' +
              '<div class="dash-prop-stat-num">' + prop.days + '</div>' +
              '<div class="dash-prop-stat-lbl">Tage aktiv</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.dash-prop-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var name = card.getAttribute('data-prop-name');
        applyFilter(activeFilter === name ? null : name);
      });
    });
  }

  function renderInquiries(contacts) {
    var listEl = document.getElementById('dash-inquiry-list');
    if (!listEl) return;

    if (!contacts.length) {
      listEl.innerHTML =
        '<div class="dash-empty"><p>Noch keine Anfragen eingegangen.</p></div>';
      return;
    }

    var html = '';
    contacts.forEach(function (r) {
      var sender  = r.name || 'Unbekannt';
      var prop    = r.property || 'Allgemeine Anfrage';
      var date    = formatDate(r.date);
      var preview = truncate(r.message, 40);
      html +=
        '<div class="dash-inquiry-row" data-prop-name="' + prop + '">' +
          '<div class="dash-inquiry-body">' +
            '<div class="dash-inquiry-sender">' + sender + '</div>' +
            '<div class="dash-inquiry-meta">' + prop + ' · ' + date + ' · &ldquo;' + preview + '&rdquo;</div>' +
          '</div>' +
          '<div class="dash-inquiry-tag">Neu</div>' +
        '</div>';
    });
    listEl.innerHTML = html;
  }

  function applyFilter(propName) {
    activeFilter = propName;

    /* Update card highlight */
    document.querySelectorAll('.dash-prop-card').forEach(function (card) {
      card.classList.toggle('active', card.getAttribute('data-prop-name') === activeFilter);
    });

    /* Show / hide filter bar */
    var bar   = document.getElementById('dash-filter-bar');
    var label = document.getElementById('dash-filter-label');
    if (bar) bar.classList.toggle('hidden', !activeFilter);
    if (label && activeFilter) label.textContent = 'Gefiltert: ' + activeFilter;

    /* Dim non-matching inquiry rows */
    document.querySelectorAll('#dash-inquiry-list .dash-inquiry-row').forEach(function (row) {
      var match = !activeFilter || row.getAttribute('data-prop-name') === activeFilter;
      row.classList.toggle('dash-inquiry-row--dimmed', !match);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* 1 — Auth guard */
    var session = window.LafayetteAuth && window.LafayetteAuth.getSession();
    if (!session || session.role !== 'verkaeufer') {
      window.location.href = 'anmelden.html';
      return;
    }

    /* 2 — Populate name */
    var nameEl = document.getElementById('dash-name');
    if (nameEl) nameEl.textContent = session.name;

    /* 3 — Load contacts */
    var contacts = [];
    try { contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY)) || []; } catch (_) {}

    /* 4 — Update inquiry count stat */
    var countEl = document.getElementById('dash-count-inquiries');
    if (countEl) countEl.textContent = String(contacts.length);

    /* 5 — Render property cards */
    renderCards(contacts);

    /* 6 — Render inquiry rows */
    renderInquiries(contacts);

    /* 7 — Filter bar clear button */
    var clearBtn = document.getElementById('dash-filter-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () { applyFilter(null); });

    /* 8 — Logout */
    var logoutBtn = document.getElementById('dash-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', function () {
      window.LafayetteAuth.logout();
    });

  });

})();
