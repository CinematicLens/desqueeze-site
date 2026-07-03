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

  var SOCIAL = {
    youtube: 'https://www.youtube.com/channel/UCRfqU-WJgQDfaQ2mJXFbhyg',
    facebook: 'https://www.facebook.com/profile.php?id=61582013559827'
  };
  var STORES = {
    apple: 'https://apps.apple.com/za/app/anamorphicdesqueezer/id6757354068',
    google: 'https://play.google.com/store/apps/details?id=com.squeezer.app'
  };
  var ANAMORPHIC_PROMO = {
    src: '/assets/anamorphic-desqueezer-iphone-hero.png?v=3',
    href: '/anamorphic-desqueeze-iphone.html',
    alt: 'AnamorphicDesqueezer — See Anamorphic. Correctly. For Mobile, iPad, iPhone, MacBook, and Windows.',
    width: 1024,
    height: 1024
  };

  var ANAMORPHIC_PROMO_SKIP_PAGES = [
    '/cinelutlivegrade.html',
    '/mediautility.html',
    '/document-management-system.html',
    '/photo-editing.html',
    '/windows-tools.html',
    '/cinema-monitors.html',
    '/virtual-monitors.html'
  ];

  function shouldShowAnamorphicPromo() {
    var path = (window.location.pathname || '').replace(/\/$/, '') || '/index.html';
    if (path === '/' || path === '/index') {
      path = '/index.html';
    }
    return ANAMORPHIC_PROMO_SKIP_PAGES.indexOf(path) === -1;
  }

  function buildAnamorphicPromoBanner() {
    if (!shouldShowAnamorphicPromo()) {
      return;
    }
    var header = document.querySelector('.site-header');
    if (!header) {
      return;
    }
    if (document.querySelector('.anamorphic-promo-banner')) {
      return;
    }
    if (document.querySelector('.hub-hero__visual img[src*="anamorphic-desqueezer"]')) {
      return;
    }

    var banner = document.createElement('div');
    banner.className = 'anamorphic-promo-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'AnamorphicDesqueezer for mobile');

    var inner = document.createElement('div');
    inner.className = 'anamorphic-promo-banner__inner';

    var link = document.createElement('a');
    link.className = 'anamorphic-promo-banner__link';
    link.href = ANAMORPHIC_PROMO.href;

    var frame = document.createElement('div');
    frame.className = 'anamorphic-promo-banner__frame';

    var img = document.createElement('img');
    img.className = 'anamorphic-promo-banner__art';
    img.src = ANAMORPHIC_PROMO.src;
    img.width = ANAMORPHIC_PROMO.width;
    img.height = ANAMORPHIC_PROMO.height;
    img.alt = ANAMORPHIC_PROMO.alt;
    img.loading = 'eager';
    img.decoding = 'async';

    frame.appendChild(img);
    link.appendChild(frame);
    inner.appendChild(link);
    banner.appendChild(inner);
    header.insertAdjacentElement('afterend', banner);
  }

  function buildFooterTrust() {
    var footer = document.querySelector('.site-footer');
    if (!footer || footer.querySelector('.site-footer__trust')) {
      return;
    }

    var trust = document.createElement('div');
    trust.className = 'site-footer__trust';
    trust.setAttribute('aria-label', 'Store reviews and community');

    trust.innerHTML =
      '<div class="store-trust">' +
        '<a class="store-trust__badge store-trust__badge--apple" href="' + STORES.apple + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="store-trust__label">App Store <span class="store-trust__sub">See ratings &amp; reviews</span></span>' +
        '</a>' +
        '<a class="store-trust__badge store-trust__badge--google" href="' + STORES.google + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="store-trust__label">Google Play <span class="store-trust__sub">See ratings &amp; reviews · 1K+ downloads</span></span>' +
        '</a>' +
      '</div>' +
      '<div class="social-trust" aria-label="Community links">' +
        '<a class="social-trust__link social-trust__link--youtube" href="' + SOCIAL.youtube + '" target="_blank" rel="noopener noreferrer">YouTube channel</a>' +
        '<a class="social-trust__link social-trust__link--facebook" href="' + SOCIAL.facebook + '" target="_blank" rel="noopener noreferrer">Facebook</a>' +
      '</div>';

    var inner = footer.querySelector('.site-footer__inner');
    if (inner) {
      footer.insertBefore(trust, inner);
    } else {
      footer.appendChild(trust);
    }
  }

  function onDomReady() {
    buildAnamorphicPromoBanner();
    buildThemeToggle();
    buildFooterTrust();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
  } else {
    onDomReady();
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
