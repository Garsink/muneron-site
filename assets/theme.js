/* Applied before paint; every route uses the same default and saved preference. */
(function () {
  var theme = 'light';
  try { var saved = localStorage.getItem('muneron-theme'); if (saved === 'dark' || saved === 'light') theme = saved; } catch (_) {}
  document.documentElement.dataset.theme = theme;
})();
