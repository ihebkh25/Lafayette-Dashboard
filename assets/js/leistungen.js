document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.leist-nav__item');
  const panels = document.querySelectorAll('.leist-panel');

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;

      navItems.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById('leist-' + target).classList.add('active');
    });
  });
});
