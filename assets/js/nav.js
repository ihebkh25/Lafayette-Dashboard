(function() {
  var nav = document.getElementById('main-nav');
  if (!nav) return;
  if (nav.hasAttribute('data-solid')) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();
