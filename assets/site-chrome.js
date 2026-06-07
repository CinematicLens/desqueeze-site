/**
 * Shared site chrome: consistent scroll position on page load.
 * If the URL has a hash (e.g. /index.html#anamorphic-flow), the browser scrolls to that section.
 * Otherwise, start at the top so each page feels consistent when using the main nav.
 */
(function () {
  'use strict';

  /* -------- Theme flag --------
   * DEFAULT_THEME is the site-wide flag: the theme used when a visitor
   * has no saved preference. Set it to 'dark' or 'light'.
   * A visitor's manual choice (via the toggle) is remembered in
   * localStorage and always wins over this default.
   */
  var DEFAULT_THEME = 'dark';
  var THEME_KEY = 'site-theme';
  var THEMES = ['light', 'dark'];

  function readStoredTheme() {
    try {
      var v = localStorage.getItem(THEME_KEY);
      return THEMES.indexOf(v) !== -1 ? v : null;
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  // Apply as early as possible to minimise the flash of the wrong theme.
  applyTheme(readStoredTheme() || DEFAULT_THEME);

  function buildThemeToggle() {
    if (document.querySelector('.theme-toggle')) {
      return;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';

    function render() {
      var dark = currentTheme() === 'dark';
      btn.textContent = dark ? 'Light mode' : 'Dark mode';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {}
      render();
    });

    render();
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildThemeToggle);
  } else {
    buildThemeToggle();
  }

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  function scrollOnLoad() {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollOnLoad);
  } else {
    scrollOnLoad();
  }
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
      scrollOnLoad();
    }
  });
})();
