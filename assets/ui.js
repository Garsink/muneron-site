/* Mobile navigation. No other UI behaviour lives here. */
(() => {
  const header = document.querySelector('.site-header');
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!header || !btn || !menu) return;
  const set = open => {
    header.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  };
  btn.addEventListener('click', () => set(!header.classList.contains('is-open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) { set(false); btn.focus(); }
  });
  const wide = matchMedia('(min-width: 901px)');
  wide.addEventListener('change', e => { if (e.matches) set(false); });
})();
