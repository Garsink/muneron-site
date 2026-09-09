(function () {
  function updateThemeLabels() {
    var dark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      button.textContent = dark ? 'Light theme' : 'Dark theme';
      button.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
    });
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem('muneron-theme', theme); } catch (_) {}
      updateThemeLabels();
    });
  });
  updateThemeLabels();
  var brake = document.getElementById('brake-button');
  if (brake) brake.addEventListener('click', function (event) {
    var panel = document.getElementById('brake-demo');
    var stopped = brake.getAttribute('aria-pressed') !== 'true';
    var lanes = panel.querySelector('.demo-lanes');
    lanes.style.transition = event.detail === 0 ? 'none' : '';
    panel.dataset.stopped = String(stopped);
    brake.setAttribute('aria-pressed', String(stopped));
    brake.textContent = stopped ? 'Resume this example' : 'Stop this example';
    document.getElementById('brake-status').textContent = stopped
      ? 'Example stopped. No real system or job was affected.'
      : 'Example ready. No real system or job is connected.';
  });
})();
