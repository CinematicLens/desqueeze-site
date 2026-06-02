/**
 * Shared site chrome: consistent scroll position on page load.
 * If the URL has a hash (e.g. /index.html#anamorphic-flow), the browser scrolls to that section.
 * Otherwise, start at the top so each page feels consistent when using the main nav.
 */
(function () {
  'use strict';
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
