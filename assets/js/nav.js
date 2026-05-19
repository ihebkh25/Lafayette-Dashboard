(function() {
  var nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();
