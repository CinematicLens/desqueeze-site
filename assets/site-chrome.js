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
      '</div>';

    var inner = footer.querySelector('.site-footer__inner');
    if (inner) {
      footer.insertBefore(trust, inner);
    } else {
      footer.appendChild(trust);
    }
  }

  /* -------- Regional languages (site-wide) --------
   * Translates every page into the visitor's language via Google Translate.
   * Preference is remembered; first visit follows the browser language.
   */
  var LANG_KEY = 'site-lang';
  var LANG_SOURCE = 'en';
  var RTL_LANGS = { ar: 1, fa: 1, he: 1, ur: 1, yi: 1, ps: 1 };
  var WORLD_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'it', name: 'Italiano' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'ru', name: 'Русский' },
    { code: 'uk', name: 'Українська' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ar', name: 'العربية' },
    { code: 'he', name: 'עברית' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'ur', name: 'اردو' },
    { code: 'zh-CN', name: '中文 (简体)' },
    { code: 'zh-TW', name: '中文 (繁體)' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'th', name: 'ไทย' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Bahasa Melayu' },
    { code: 'fil', name: 'Filipino' },
    { code: 'sv', name: 'Svenska' },
    { code: 'da', name: 'Dansk' },
    { code: 'no', name: 'Norsk' },
    { code: 'fi', name: 'Suomi' },
    { code: 'cs', name: 'Čeština' },
    { code: 'sk', name: 'Slovenčina' },
    { code: 'ro', name: 'Română' },
    { code: 'hu', name: 'Magyar' },
    { code: 'el', name: 'Ελληνικά' },
    { code: 'bg', name: 'Български' },
    { code: 'hr', name: 'Hrvatski' },
    { code: 'sr', name: 'Српски' },
    { code: 'sl', name: 'Slovenščina' },
    { code: 'lt', name: 'Lietuvių' },
    { code: 'lv', name: 'Latviešu' },
    { code: 'et', name: 'Eesti' },
    { code: 'ca', name: 'Català' },
    { code: 'eu', name: 'Euskara' },
    { code: 'gl', name: 'Galego' },
    { code: 'af', name: 'Afrikaans' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ne', name: 'नेपाली' },
    { code: 'si', name: 'සිංහල' },
    { code: 'my', name: 'မြန်မာ' },
    { code: 'km', name: 'ខ្មែរ' },
    { code: 'lo', name: 'ລາວ' },
    { code: 'ka', name: 'ქართული' },
    { code: 'hy', name: 'Հայերեն' },
    { code: 'az', name: 'Azərbaycan' },
    { code: 'kk', name: 'Қазақ' },
    { code: 'uz', name: 'Oʻzbek' },
    { code: 'mn', name: 'Монгол' },
    { code: 'is', name: 'Íslenska' },
    { code: 'ga', name: 'Gaeilge' },
    { code: 'cy', name: 'Cymraeg' },
    { code: 'mt', name: 'Malti' },
    { code: 'sq', name: 'Shqip' },
    { code: 'mk', name: 'Македонски' },
    { code: 'bs', name: 'Bosanski' },
    { code: 'be', name: 'Беларуская' }
  ];

  function langSupported(code) {
    for (var i = 0; i < WORLD_LANGUAGES.length; i++) {
      if (WORLD_LANGUAGES[i].code === code) {
        return true;
      }
    }
    return false;
  }

  function normalizeLang(raw) {
    if (!raw) {
      return LANG_SOURCE;
    }
    var value = String(raw).replace('_', '-');
    if (langSupported(value)) {
      return value;
    }
    var lower = value.toLowerCase();
    if (lower === 'zh' || lower.indexOf('zh-cn') === 0 || lower.indexOf('zh-hans') === 0) {
      return 'zh-CN';
    }
    if (lower.indexOf('zh-tw') === 0 || lower.indexOf('zh-hant') === 0 || lower === 'zh-hk') {
      return 'zh-TW';
    }
    if (lower.indexOf('pt') === 0) {
      return 'pt';
    }
    if (lower === 'nb' || lower === 'nn') {
      return 'no';
    }
    if (lower === 'tl') {
      return 'fil';
    }
    var base = lower.split('-')[0];
    if (langSupported(base)) {
      return base;
    }
    return LANG_SOURCE;
  }

  function readGoogTransCookie() {
    var match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
    if (!match) {
      return null;
    }
    try {
      var parts = decodeURIComponent(match[1]).split('/');
      return parts[2] || null;
    } catch (e) {
      return null;
    }
  }

  function readStoredLang() {
    try {
      var stored = localStorage.getItem(LANG_KEY);
      if (stored) {
        return normalizeLang(stored);
      }
    } catch (e) {}
    var fromCookie = readGoogTransCookie();
    if (fromCookie) {
      return normalizeLang(fromCookie);
    }
    return null;
  }

  function detectBrowserLang() {
    var list = [];
    if (navigator.languages && navigator.languages.length) {
      list = navigator.languages;
    } else if (navigator.language) {
      list = [navigator.language];
    }
    for (var i = 0; i < list.length; i++) {
      var code = normalizeLang(list[i]);
      if (code !== LANG_SOURCE) {
        return code;
      }
    }
    return LANG_SOURCE;
  }

  function setGoogTransCookie(lang) {
    var host = location.hostname;
    var expireClear = 'Thu, 01 Jan 1970 00:00:00 GMT';
    var expireSet = 'Sat, 01 Jan 2050 00:00:00 GMT';
    var paths = ['/', ''];
    var domains = ['', host, '.' + host];

    function writeCookie(value, expires) {
      for (var d = 0; d < domains.length; d++) {
        for (var p = 0; p < paths.length; p++) {
          var cookie = 'googtrans=' + value + '; expires=' + expires + '; path=' + (paths[p] || '/');
          if (domains[d]) {
            cookie += '; domain=' + domains[d];
          }
          document.cookie = cookie;
        }
      }
    }

    if (!lang || lang === LANG_SOURCE) {
      writeCookie('', expireClear);
      return;
    }
    writeCookie('/' + LANG_SOURCE + '/' + lang, expireSet);
  }

  function applyDocumentDirection(lang) {
    var rtl = !!RTL_LANGS[String(lang).split('-')[0]];
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang === LANG_SOURCE ? 'en' : lang);
  }

  function currentLang() {
    return readStoredLang() || detectBrowserLang();
  }

  function setLanguage(lang, reload) {
    var next = normalizeLang(lang);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch (e) {}
    setGoogTransCookie(next);
    applyDocumentDirection(next);
    if (reload !== false) {
      location.reload();
    }
  }

  function buildLanguageSwitcher() {
    if (document.querySelector('.lang-switcher')) {
      return;
    }

    var headerInner = document.querySelector('.site-header__inner');
    if (!headerInner) {
      return;
    }

    var active = currentLang();
    applyDocumentDirection(active);
    try {
      if (!localStorage.getItem(LANG_KEY)) {
        localStorage.setItem(LANG_KEY, active);
      }
    } catch (e) {}

    // First visit in a non-English locale: set cookie and reload once so translation applies.
    if (active !== LANG_SOURCE && !readGoogTransCookie()) {
      setGoogTransCookie(active);
      location.reload();
      return;
    }
    if (active === LANG_SOURCE && readGoogTransCookie()) {
      setGoogTransCookie(LANG_SOURCE);
    }

    var wrap = document.createElement('div');
    wrap.className = 'lang-switcher';

    var label = document.createElement('label');
    label.className = 'lang-switcher__label';
    label.setAttribute('for', 'site-lang-select');
    label.textContent = 'Language';

    var select = document.createElement('select');
    select.id = 'site-lang-select';
    select.className = 'lang-switcher__select';
    select.setAttribute('aria-label', 'Choose website language');

    for (var i = 0; i < WORLD_LANGUAGES.length; i++) {
      var opt = document.createElement('option');
      opt.value = WORLD_LANGUAGES[i].code;
      opt.textContent = WORLD_LANGUAGES[i].name;
      if (WORLD_LANGUAGES[i].code === active) {
        opt.selected = true;
      }
      select.appendChild(opt);
    }

    select.addEventListener('change', function () {
      setLanguage(select.value, true);
    });

    wrap.appendChild(label);
    wrap.appendChild(select);

    var buyCta = headerInner.querySelector('.header-buy-cta');
    if (buyCta) {
      headerInner.insertBefore(wrap, buyCta);
    } else {
      headerInner.appendChild(wrap);
    }

    // Hidden Google Translate host (required for page translation)
    if (!document.getElementById('google_translate_element')) {
      var host = document.createElement('div');
      host.id = 'google_translate_element';
      host.className = 'google-translate-host';
      host.setAttribute('aria-hidden', 'true');
      document.body.appendChild(host);
    }

    window.googleTranslateElementInit = function () {
      if (!(window.google && google.translate && google.translate.TranslateElement)) {
        return;
      }
      new google.translate.TranslateElement(
        {
          pageLanguage: LANG_SOURCE,
          autoDisplay: false,
          multilanguagePage: true
        },
        'google_translate_element'
      );
    };

    if (!document.getElementById('google-translate-script')) {
      var script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  function onDomReady() {
    buildAnamorphicPromoBanner();
    buildLanguageSwitcher();
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
