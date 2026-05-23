(function () {
  'use strict';

  var lightbox = null;
  var lbImages = [];
  var lbCurrent = 0;

  function initCarousels() {
    document.querySelectorAll('.prop-card__carousel').forEach(function (carousel) {
      var track   = carousel.querySelector('.prop-carousel-track');
      var slides  = carousel.querySelectorAll('.prop-carousel-slide');
      var dots    = carousel.querySelectorAll('.prop-carousel-dot');
      var total   = slides.length;
      var current = 0;

      function getSlideW() { return carousel.offsetWidth || 0; }

      function applyWidths() {
        var w = getSlideW();
        if (!w) return false;
        slides.forEach(function (s) { s.style.width = w + 'px'; });
        return true;
      }

      /* Apply now; if offsetWidth is still 0 (layout not ready), retry after paint */
      if (!applyWidths()) {
        requestAnimationFrame(function () {
          applyWidths();
        });
      }

      var slideW = function () { return getSlideW(); };

      function goTo(idx) {
        current = (idx + total) % total;
        track.style.transform = 'translateX(-' + (current * slideW()) + 'px)';
        dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
      }

      var prevBtn   = carousel.querySelector('.prop-carousel-prev');
      var nextBtn   = carousel.querySelector('.prop-carousel-next');
      var expandBtn = carousel.querySelector('.prop-carousel-expand');

      if (prevBtn) prevBtn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); goTo(current - 1);
      });
      if (nextBtn) nextBtn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); goTo(current + 1);
      });
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation(); goTo(i);
        });
      });

      if (expandBtn) {
        var images = [];
        slides.forEach(function (s) {
          var img = s.querySelector('img');
          if (img) images.push({ src: img.src, alt: img.alt });
        });
        expandBtn.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          openLightbox(images, current);
        });
      }
    });
  }

  function createLightbox() {
    var el = document.createElement('div');
    el.className = 'prop-lightbox';
    el.id = 'prop-lightbox';
    el.setAttribute('hidden', '');
    el.innerHTML =
      '<div class="prop-lightbox__overlay"></div>' +
      '<div class="prop-lightbox__inner">' +
        '<button class="prop-lightbox__nav prop-lightbox__prev" aria-label="Vorheriges Bild">&#8249;</button>' +
        '<div class="prop-lightbox__img-wrap">' +
          '<img class="prop-lightbox__img" src="" alt="">' +
          '<div class="prop-lightbox__counter"></div>' +
        '</div>' +
        '<button class="prop-lightbox__nav prop-lightbox__next" aria-label="N&auml;chstes Bild">&#8250;</button>' +
      '</div>' +
      '<button class="prop-lightbox__close" aria-label="Schlie&szlig;en">&times;</button>';
    document.body.appendChild(el);

    el.querySelector('.prop-lightbox__overlay').addEventListener('click', closeLightbox);
    el.querySelector('.prop-lightbox__close').addEventListener('click', closeLightbox);
    el.querySelector('.prop-lightbox__prev').addEventListener('click', function (e) {
      e.stopPropagation(); lbGoTo(lbCurrent - 1);
    });
    el.querySelector('.prop-lightbox__next').addEventListener('click', function (e) {
      e.stopPropagation(); lbGoTo(lbCurrent + 1);
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox || lightbox.hasAttribute('hidden')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   lbGoTo(lbCurrent - 1);
      if (e.key === 'ArrowRight')  lbGoTo(lbCurrent + 1);
    });

    return el;
  }

  function lbGoTo(idx) {
    lbCurrent = (idx + lbImages.length) % lbImages.length;
    var img     = lightbox.querySelector('.prop-lightbox__img');
    var counter = lightbox.querySelector('.prop-lightbox__counter');
    img.src = lbImages[lbCurrent].src;
    img.alt = lbImages[lbCurrent].alt;
    counter.textContent = (lbCurrent + 1) + ' / ' + lbImages.length;

    var showNav = lbImages.length > 1;
    lightbox.querySelector('.prop-lightbox__prev').style.visibility = showNav ? '' : 'hidden';
    lightbox.querySelector('.prop-lightbox__next').style.visibility = showNav ? '' : 'hidden';
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

  document.addEventListener('DOMContentLoaded', initCarousels);
})();
