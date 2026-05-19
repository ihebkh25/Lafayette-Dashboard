(function() {
  var tabs = document.querySelectorAll('.auth-tab');
  if (!tabs.length) return;
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
      var loginForm = document.getElementById('form-login');
      var regForm = document.getElementById('form-register');
      if (loginForm) loginForm.classList.toggle('hidden', target !== 'login');
      if (regForm) regForm.classList.toggle('hidden', target !== 'register');
    });
  });
})();
