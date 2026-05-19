(function() {
  var chips = document.querySelectorAll('.filter-chip');
  var cards = document.querySelectorAll('.prop-card-wrap');
  if (!chips.length) return;
  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      chips.forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      var filter = chip.dataset.filter;
      cards.forEach(function(card) {
        var cats = card.dataset.categories || '';
        card.style.display = (filter === 'all' || cats.includes(filter)) ? '' : 'none';
      });
    });
  });
})();
