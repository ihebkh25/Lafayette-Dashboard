(function () {
  'use strict';

  var CONTACTS_KEY = 'lre_contacts';

  var PROPERTIES = [
    {
      name:     'Prestige Villa München-Harlaching',
      type:     'Residential',
      location: 'München-Harlaching',
      detail:   '480 m² · 6 Einheiten',
      price:    'Auf Anfrage',
      status:   'Aktiv',
      modifier: 'aktiv',
      days:     12,
      images: [
        'assets/images/property_6_1.jpeg',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'
      ],
      href:     'objekte/musterhaus.html'
    },
    {
      name:     'Mehrfamilienhaus Oberhaching',
      type:     'Residential',
      location: 'Oberhaching, München',
      detail:   '8 Einheiten · ca. 650 m²',
      price:    'Auf Anfrage',
      status:   'In Verhandlung',
      modifier: 'verhandlung',
      days:     28,
      images: [
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80'
      ],
      href:     'objekte.html'
    },
    {
      name:     'Residential Mallorca',
      type:     'Ausland',
      location: 'Mallorca, Spanien',
      detail:   '320 m² · Villa',
      price:    'Auf Anfrage',
      status:   'Abgeschlossen',
      modifier: 'abgeschlossen',
      days:     45,
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80'
      ],
      href:     'objekte.html'
    }
  ];

  var activeFilter = null;

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

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

      var slides = '';
      prop.images.forEach(function (src) {
        slides += '<div class="dash-carousel-slide"><img src="' + src + '" alt="' + esc(prop.name) + '" loading="lazy"></div>';
      });
      var dotsHtml = '';
      prop.images.forEach(function (_, i) {
        dotsHtml += '<button class="dash-carousel-dot' + (i === 0 ? ' active' : '') + '" aria-label="Bild ' + (i + 1) + '"></button>';
      });

      html +=
        '<div class="dash-prop-card" data-prop-name="' + prop.name + '">' +
          '<div class="dash-prop-carousel">' +
            '<div class="dash-carousel-track">' + slides + '</div>' +
            '<button class="dash-carousel-btn dash-carousel-prev" aria-label="Vorheriges Bild">&#8249;</button>' +
            '<button class="dash-carousel-btn dash-carousel-next" aria-label="N&auml;chstes Bild">&#8250;</button>' +
            '<div class="dash-carousel-dots">' + dotsHtml + '</div>' +
          '</div>' +
          '<div class="dash-prop-body">' +
            '<div class="dash-prop-top">' +
              '<div class="dash-prop-type">' + prop.type + '</div>' +
              '<span class="dash-prop-status dash-prop-status--' + prop.modifier + '">' + prop.status + '</span>' +
            '</div>' +
            '<div class="dash-prop-name">' + prop.name + '</div>' +
            '<div class="dash-prop-location">' + esc(prop.location) + '</div>' +
            '<div class="dash-prop-detail">' + prop.detail + ' · ' + esc(prop.price) + '</div>' +
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
            '<a class="dash-prop-link" href="' + prop.href + '">Zum Objekt &rarr;</a>' +
          '</div>' +
        '</div>';
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.dash-prop-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var name = card.getAttribute('data-prop-name');
        applyFilter(activeFilter === name ? null : name);
      });
      var link = card.querySelector('.dash-prop-link');
      if (link) link.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    initCarousels(grid);
  }

  function initCarousels(grid) {
    grid.querySelectorAll('.dash-prop-carousel').forEach(function (carousel) {
      var track   = carousel.querySelector('.dash-carousel-track');
      var slides  = carousel.querySelectorAll('.dash-carousel-slide');
      var dots    = carousel.querySelectorAll('.dash-carousel-dot');
      var total   = slides.length;
      var current = 0;
      var slideW  = carousel.offsetWidth;

      slides.forEach(function (slide) { slide.style.width = slideW + 'px'; });

      function goTo(index) {
        current = (index + total) % total;
        track.style.transform = 'translateX(-' + (current * slideW) + 'px)';
        dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      }

      carousel.querySelector('.dash-carousel-prev').addEventListener('click', function (e) {
        e.stopPropagation(); goTo(current - 1);
      });
      carousel.querySelector('.dash-carousel-next').addEventListener('click', function (e) {
        e.stopPropagation(); goTo(current + 1);
      });
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function (e) { e.stopPropagation(); goTo(i); });
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
        '<div class="dash-inquiry-row" data-prop-name="' + esc(prop) + '">' +
          '<div class="dash-inquiry-body">' +
            '<div class="dash-inquiry-sender">' + esc(sender) + '</div>' +
            '<div class="dash-inquiry-meta">' + esc(prop) + ' · ' + esc(date) + ' · &ldquo;' + esc(preview) + '&rdquo;</div>' +
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
    if (label) label.textContent = activeFilter ? 'Gefiltert: ' + activeFilter : '';

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
