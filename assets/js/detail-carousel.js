(function () {
  'use strict';

  var lightbox = null;
  var lbImages = [];
  var lbCurrent = 0;

  function initHeroCarousel() {
    var hero = document.querySelector('.detail-hero');
    if (!hero) return;

    var track    = hero.querySelector('.detail-hero-track');
    if (!track) return;

    var slides   = hero.querySelectorAll('.detail-hero-slide');
    var dots     = hero.querySelectorAll('.detail-carousel-dot');
    var prevBtn  = hero.querySelector('.detail-carousel-prev');
    var nextBtn  = hero.querySelector('.detail-carousel-next');
    var expandBtn = hero.querySelector('.detail-carousel-expand');
    var total    = slides.length;
    var current  = 0;

    function getW() { return hero.offsetWidth || 0; }

    function applyWidths() {
      var w = getW();
      if (!w) return false;
      slides.forEach(function (s) { s.style.width = w + 'px'; });
      return true;
    }

    if (!applyWidths()) {
      requestAnimationFrame(function () { applyWidths(); });
    }

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = 'translateX(-' + (current * getW()) + 'px)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    window.addEventListener('resize', function () {
      var w = getW();
      slides.forEach(function (s) { s.style.width = w + 'px'; });
      track.style.transform = 'translateX(-' + (current * w) + 'px)';
    });

    if (expandBtn) {
      var images = Array.from(slides).map(function (s) {
        var img = s.querySelector('img');
        return img ? { src: img.src, alt: img.alt } : null;
      }).filter(Boolean);

      expandBtn.addEventListener('click', function () { openLightbox(images, current); });
    }
  }

  function createLightbox() {
    var el = document.createElement('div');
    el.className = 'detail-lightbox';
    el.id = 'detail-lightbox';
    el.setAttribute('hidden', '');
    el.innerHTML =
      '<div class="detail-lightbox__overlay"></div>' +
      '<div class="detail-lightbox__inner">' +
        '<button class="detail-lightbox__nav detail-lightbox__prev" aria-label="Vorheriges Bild">&#8249;</button>' +
        '<div class="detail-lightbox__img-wrap">' +
          '<img class="detail-lightbox__img" src="" alt="">' +
          '<div class="detail-lightbox__counter"></div>' +
        '</div>' +
        '<button class="detail-lightbox__nav detail-lightbox__next" aria-label="N&auml;chstes Bild">&#8250;</button>' +
      '</div>' +
      '<button class="detail-lightbox__close" aria-label="Schlie&szlig;en">&times;</button>';
    document.body.appendChild(el);

    el.querySelector('.detail-lightbox__overlay').addEventListener('click', closeLightbox);
    el.querySelector('.detail-lightbox__close').addEventListener('click', closeLightbox);
    el.querySelector('.detail-lightbox__prev').addEventListener('click', function (e) {
      e.stopPropagation(); lbGoTo(lbCurrent - 1);
    });
    el.querySelector('.detail-lightbox__next').addEventListener('click', function (e) {
      e.stopPropagation(); lbGoTo(lbCurrent + 1);
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox || lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  lbGoTo(lbCurrent - 1);
      if (e.key === 'ArrowRight') lbGoTo(lbCurrent + 1);
    });

    return el;
  }

  function lbGoTo(idx) {
    lbCurrent = (idx + lbImages.length) % lbImages.length;
    var img     = lightbox.querySelector('.detail-lightbox__img');
    var counter = lightbox.querySelector('.detail-lightbox__counter');
    img.src = lbImages[lbCurrent].src;
    img.alt = lbImages[lbCurrent].alt;
    counter.textContent = (lbCurrent + 1) + ' / ' + lbImages.length;

    var showNav = lbImages.length > 1;
    lightbox.querySelector('.detail-lightbox__prev').style.visibility = showNav ? '' : 'hidden';
    lightbox.querySelector('.detail-lightbox__next').style.visibility = showNav ? '' : 'hidden';
  }

  function openLightbox(images, startIndex) {
    if (!lightbox) lightbox = createLightbox();
    lbImages  = images;
    lbCurrent = startIndex || 0;
    lbGoTo(lbCurrent);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (lightbox) lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', initHeroCarousel);
})();
